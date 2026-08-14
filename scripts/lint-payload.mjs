/**
 * Payload lint — source-level checks on one client's content and config.
 *
 *   pnpm lint <slug>        lint clients/<slug>/
 *   pnpm lint --all         lint every client
 *
 * Complements, not repeats, the other gates: zod (content.config.ts) validates
 * shape at build; verify-dist checks the built site. This runs in a second with no
 * build and reports by source file — the authoring-time aid. Two severities:
 *
 *   errors    — will ship wrong (fact drift, dead asset path, missing alt).
 *               Exit 1.
 *   warnings  — probably wrong, human judgement call (thin metaDescription,
 *               near-duplicate copy). Reported, exit 0.
 *
 * THE DRIFT CHECK
 * intake.json is the honest record of client facts; site.config.ts is what the
 * site displays. Nothing else compares them — a phone number corrected in intake
 * but not config ships wrong on every page and passes every other gate. Rule:
 * a fact that is null in intake is *pending* (check-intake's job, skipped here);
 * a fact present in both files must agree exactly.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const slugArg = args.find((a) => !a.startsWith('-'));

if (!ALL && !slugArg) {
  console.error('Usage: pnpm lint <slug>  |  pnpm lint --all');
  process.exit(1);
}

/* ------------------------------------------------------------------ helpers */

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`  ✗ ${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`  ⚠ ${file}: ${msg}`);

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { data: parseYaml(m[1]), body: m[2] };
}

async function mdFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await mdFiles(full)));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const normalise = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/* -------------------------------------------------- drift: intake ↔ config */

/** intake path → config path, for every fact both files claim. */
const DRIFT_MAP = [
  ['business.name', 'brand.name'],
  ['business.tagline', 'brand.tagline'],
  ['business.blurb', 'brand.blurb'],
  ['business.footerNote', 'brand.footerNote'],
  ['business.websiteUrl', 'site.url'],
  ['business.category', 'seo.category'],
  ['business.region', 'seo.region'],
  ['business.priceRange', 'seo.priceRange'],
  ['contact.phone', 'contact.phone'],
  ['contact.phoneDisplay', 'contact.phoneDisplay'],
  ['contact.email', 'contact.email'],
  ['contact.address', 'contact.address'],
  ['serviceArea.baseCity', 'serviceArea.baseCity'],
  ['serviceArea.baseState', 'serviceArea.baseState'],
  ['serviceArea.radiusMiles', 'serviceArea.radiusMiles'],
  ['serviceArea.label', 'serviceArea.label'],
  ['hours', 'hours'],
  ['ghl.quoteUrl', 'ghl.quoteUrl'],
  ['tracking.gtmId', 'tracking.gtmId'],
  ['theme.accentColor', 'theme.accentColor'],
  ['theme.mode', 'theme.mode'],
  ['legal.effectiveDate', 'legal.effectiveDate'],
  ['legal.source', 'legal.source'],
];

const get = (obj, dotted) => dotted.split('.').reduce((o, k) => o?.[k], obj);

/**
 * Does config agree with intake everywhere intake actually states a fact?
 * null/undefined in intake means *pending* at any depth; DS_STRICT owns placeholder
 * enforcement, while every supplied fact must still match.
 */
function agrees(truth, shown) {
  if (truth === null || truth === undefined) return true;
  if (Array.isArray(truth)) {
    return (
      Array.isArray(shown) &&
      truth.length === shown.length &&
      truth.every((v, i) => agrees(v, shown[i]))
    );
  }
  if (typeof truth === 'object') {
    return (
      typeof shown === 'object' &&
      shown !== null &&
      Object.entries(truth).every(([k, v]) => agrees(v, shown[k]))
    );
  }
  return truth === shown;
}

function checkDrift(slug, intake, config) {
  const file = `clients/${slug}/site.config.ts`;

  for (const [intakePath, configPath] of DRIFT_MAP) {
    const truth = get(intake, intakePath);
    if (truth === null || truth === undefined) continue; // pending — check-intake's job
    const shown = get(config, configPath);
    // Decided-none: intake records "the client has none of these, by decision" as []
    // (hours) or false (quoteUrl), and the config expresses the same fact by omitting
    // the now-optional key. That is agreement, not drift.
    if ((truth === false || (Array.isArray(truth) && truth.length === 0)) && shown === undefined) {
      continue;
    }
    if (!agrees(truth, shown)) {
      err(
        file,
        `${configPath} disagrees with intake.json ${intakePath}:\n` +
          `      intake: ${JSON.stringify(truth)}\n` +
          `      config: ${JSON.stringify(shown)}`,
      );
    }
  }

  // socials: intake uses null for "none"; config omits the key. Compare non-null only.
  for (const [key, truth] of Object.entries(intake.socials ?? {})) {
    if (key === 'reviewUrl' || truth === null) continue;
    const shown = config.socials?.[key];
    if (truth !== shown) {
      err(file, `socials.${key} disagrees with intake.json: ${JSON.stringify(truth)} vs ${JSON.stringify(shown)}`);
    }
  }
}

/* ------------------------------------------------------------ content lint */

const META_MIN = 70; // below this a metaDescription wastes the SERP slot
const SHORT_DESC_RANGE = [40, 320];

function checkMeta(file, data, seen) {
  const meta = data.metaDescription;
  if (typeof meta !== 'string') return; // shape is zod's job
  if (meta.length < META_MIN) {
    warn(file, `metaDescription is ${meta.length} chars — thin for a SERP snippet (aim ${META_MIN}–160)`);
  }
  const owner = seen.get(normalise(meta));
  if (owner) err(file, `metaDescription duplicates ${owner}`);
  else seen.set(normalise(meta), file);
}

/**
 * Image slots the template renders as decoration, with a hardcoded `alt=""`.
 *
 * A CTA background sits behind its own heading; a screen reader announcing
 * "detailer washing a car" mid-sentence is noise, so the schema lets the alt be
 * empty there. Warning about it would be asking for text nothing will ever read.
 */
const DECORATIVE_ALT_SLOTS = [/(^|\.)cta\.image$/];

function checkAlts(file, data, brandName) {
  const walk = (node, trail) => {
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${trail}[${i}]`));
    if (node && typeof node === 'object') {
      if (typeof node.src === 'string' && 'alt' in node) {
        const alt = node.alt ?? '';
        const decorative = DECORATIVE_ALT_SLOTS.some((re) => re.test(trail));
        if (!decorative && alt.trim().length < 12) {
          warn(file, `${trail}.alt is "${alt}" — too thin to describe the image (spec: "{subject} — ${brandName} in {City}, {ST}" where sensible)`);
        }
      }
      for (const [k, v] of Object.entries(node)) walk(v, trail ? `${trail}.${k}` : k);
    }
  };
  walk(data, '');
}

/* -------------------------------------------- composition parity vs smoke */

/*
 * THE PARITY CHECK
 * zod enforces shape; this enforces completeness. The template's smoke payload
 * (clients/<x>-smoke, same template) exercises every slot the design fills, which
 * makes it an executable composition spec: any slot the smoke fills that a payload
 * leaves empty is a composition decision someone made silently — the exact class
 * of drift a schema full of optional fields cannot catch. One-directional: a
 * payload may be richer than the smoke, never quieter without sign-off.
 * Warnings, not errors: legitimate omissions exist, and a human owns the call.
 */

/** Slots that are client facts, not composition — absence is data, not drift. */
const PARITY_FACT_SLOTS = new Set(['title', 'state', 'shortName', 'quote.hours']);

/** Every dotted path the frontmatter fills. Arrays recurse via their first element as `path[]`. */
function slotPaths(value, prefix = '') {
  const paths = [];
  if (Array.isArray(value)) {
    if (prefix) paths.push(prefix);
    if (value.length && typeof value[0] === 'object' && value[0] !== null) {
      paths.push(...slotPaths(value[0], `${prefix}[]`));
    }
    return paths;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v === null || v === undefined || v === '') continue;
      if (typeof v === 'object') paths.push(...slotPaths(v, p));
      else paths.push(p);
    }
    return paths;
  }
  return prefix ? [prefix] : [];
}

/** Does the payload fill this path? `[]` segments mean every element must. */
function fillsSlot(data, path) {
  const [head, ...rest] = path.split('[]');
  const walk = (obj, dotted) => dotted.split('.').filter(Boolean).reduce((o, k) => o?.[k], obj);
  const base = walk(data, head.replace(/\.$/, ''));
  if (base === null || base === undefined || base === '') return false;
  if (!rest.length) return true;
  if (!Array.isArray(base) || !base.length) return false;
  return base.every((el) => fillsSlot(el, rest.join('[]').replace(/^\./, '')));
}

/** The smoke payload for this template, or null when the template has none yet. */
async function findSmoke(template, ownSlug) {
  for (const entry of await readdir('clients', { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === ownSlug || !entry.name.includes('smoke')) continue;
    const cfg = path.join('clients', entry.name, 'site.config.ts');
    if (!existsSync(cfg)) continue;
    const { siteConfig } = await import(path.resolve(cfg));
    if (siteConfig.template === template) return entry.name;
  }
  return null;
}

async function checkParity(slug, config) {
  if (slug.includes('smoke') || !config) return;
  const smoke = await findSmoke(config.template, slug);
  if (!smoke) return; // template has no smoke yet — nothing to compare against

  /** content-relative reference page → payload page(s) it specs. */
  const refFiles = (await mdFiles(path.join('clients', smoke, 'content'))).filter(
    (f) => !f.includes('/blog/') && !f.includes('/legal/'),
  );

  for (const refFile of refFiles) {
    const rel = path.relative(path.join('clients', smoke, 'content'), refFile);
    const refData = frontmatter(await readFile(refFile, 'utf8'))?.data;
    if (!refData) continue;
    const required = slotPaths(refData).filter(
      (p) =>
        !PARITY_FACT_SLOTS.has(p.split('.').pop()) &&
        ![...PARITY_FACT_SLOTS].some((f) => p === f || p.startsWith(`${f}.`) || p.startsWith(`${f}[]`)),
    );

    /** Singletons map by filename; collection dirs spec every payload file in them. */
    const dir = path.dirname(rel);
    const targets =
      dir === '.'
        ? [path.join('clients', slug, 'content', rel)]
        : await mdFiles(path.join('clients', slug, 'content', dir));

    for (const target of targets) {
      if (!existsSync(target)) {
        // A missing booking page is config, not drift, when the client opted out.
        if (rel === 'booking.md' && config.routes?.booking === false) continue;
        warn(target, `page missing — the ${smoke} reference publishes ${rel}`);
        continue;
      }
      const data = frontmatter(await readFile(target, 'utf8'))?.data;
      if (!data) continue;
      for (const p of required) {
        if (!fillsSlot(data, p)) {
          warn(target, `slot "${p}" empty — the ${smoke} reference fills it; omission needs sign-off`);
        }
      }
    }
  }
}

/* ------------------------------------------------------------------- runner */

async function lintClient(slug) {
  const clientDir = path.join('clients', slug);
  const before = errors.length + warnings.length;

  // Config + intake, for drift. Either missing → report and move on.
  const intakeFile = path.join(clientDir, 'source', 'intake.json');
  const configFile = path.join(clientDir, 'site.config.ts');
  const config = existsSync(configFile)
    ? (await import(path.resolve(configFile))).siteConfig
    : null;
  if (existsSync(intakeFile) && config) {
    const intake = JSON.parse(await readFile(intakeFile, 'utf8'));
    checkDrift(slug, intake, config);
  } else {
    warn(clientDir, `drift check skipped — missing ${existsSync(intakeFile) ? 'site.config.ts' : 'source/intake.json'}`);
  }

  await checkParity(slug, config);

  const brandName = '{Brand}';
  const seenMeta = new Map();
  for (const file of await mdFiles(path.join(clientDir, 'content'))) {
    const raw = await readFile(file, 'utf8');
    const parsed = frontmatter(raw);
    if (!parsed) {
      err(file, 'no frontmatter block');
      continue;
    }
    const { data, body } = parsed;

    checkMeta(file, data, seenMeta);
    checkAlts(file, data, brandName);

    if (typeof data.shortDescription === 'string') {
      const len = data.shortDescription.length;
      if (len < SHORT_DESC_RANGE[0] || len > SHORT_DESC_RANGE[1]) {
        warn(file, `shortDescription is ${len} chars — outside the ${SHORT_DESC_RANGE.join('–')} window grids are designed for`);
      }
    }

    if (body.trim()) {
      // Engine collections keep prose in frontmatter; a non-empty body is
      // authored content the build will silently ignore.
      err(file, 'non-empty markdown body — this collection reads frontmatter only, the body will not render');
    }
  }

  return errors.length + warnings.length - before;
}

const slugs = ALL
  ? (await readdir('clients', { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
  : [slugArg];

for (const slug of slugs) {
  if (!existsSync(path.join('clients', slug))) {
    console.error(`No such client: clients/${slug}`);
    process.exit(1);
  }
  const findings = await lintClient(slug);
  console.log(`${slug}: ${findings === 0 ? 'clean' : `${findings} finding(s)`}`);
}

if (errors.length) console.error(`\nerrors (must fix):\n${errors.join('\n')}`);
if (warnings.length) console.log(`\nwarnings (judgement calls):\n${warnings.join('\n')}`);
process.exit(errors.length ? 1 : 0);
