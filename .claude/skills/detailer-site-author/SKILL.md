---
name: detailer-site-author
description: Use when onboarding a new detailing client into this site engine — turning onboarding call transcripts, onboarding forms, or scraped legacy sites into a complete client payload (intake.json, site.config.ts, and detailers-guild content files). Triggers include new client onboarding, generating website content for a detailer, writing service/area/home/about pages, building a site map for a client, or converting onboarding documents into a buildable site.
compatibility: Claude Code, OpenCode, and Agent Skills-compatible agents
metadata:
  canonical: "true"
---

# Detailer Site Author

Turn a client's onboarding material into a complete, buildable payload for the
active template. The deliverable is not prose in a document — it is a
`clients/<slug>/` directory that passes `pnpm intake`, `pnpm lint <slug>`, and
`pnpm build` on the first attempt, with copy good enough to ship.

This skill replaces the old GHL/Notion pipeline (Website Builder skill →
Notion → GHL build team). There is no hand-off, no custom-value tokens, and no
layout to negotiate: the template owns composition, the engine renders facts
from config, and the zod contract in the template's `schema.ts` is the exact
shape of what you write.

## Repository Contract

For client `<slug>`, you produce:

```text
clients/<slug>/source/intake.json      # Layer 0 — facts + page inventory
clients/<slug>/site.config.ts          # Layer 1 — written FROM intake
clients/<slug>/content/*.md            # Layer 2 — one file per singleton page
clients/<slug>/content/services/*.md   # one per service
clients/<slug>/content/areas/*.md      # one per area
clients/<slug>/image-prompts.json      # image plan (site-image-generator owns format)
clients/<slug>/assets/                 # filled by generation or client photography
```

Before writing anything, read:

1. `src/templates/detailers-guild/schema.ts` — the authored contract. Field
   comments and array caps there are design decisions, not suggestions.
2. `clients/guild-smoke/content/` — the reference payload: exact frontmatter
   shape for every file type. Its *copy* is throwaway; only its structure is
   the reference.
3. `scripts/intake.template.json` and `scripts/intake-schema.mjs` — the intake
   contract and the `REQUIRED_BEFORE_BUILD` list.
4. `src/config-schema.ts` — what `site.config.ts` must satisfy.

Blog posts are out of scope — that is `detailer-seo-blog-writer`. Image
generation is out of scope — plan the slots here, then hand the manifest to
`site-image-generator`.

## The Two Rules That Invert the Old Pipeline

**1. Facts are config, never prose.** The old skill said "never hardcode the
phone number — use the token." Here the rule is stronger: never *write* the
phone number, email, hours, address, or brand socials into content at all. The
engine renders them from `site.config.ts` wherever they belong. A fact typed
into prose is a fact that drifts. The one sanctioned exception: naming the
business or city in copy where the sentence needs it ("Why Mobile Detailing in
Alexandria?") — names are copy, contact facts are config.

**2. Structure is the template, never a decision.** Do not author CTAs,
button labels, nav, footers, service grids, area tiles, heading levels, or
section order. Every schema deliberately omits them: the closing `cta` block
has no action because routes.ts supplies it; the home page has no service list
because the collection builds it. If you feel the urge to write "Call us today
at…" or restate the service menu in a body paragraph, stop — that instinct is
the old pipeline talking.

## Step 1 — Extract, Cross-Reference, Confirm

Input is whatever exists: onboarding call transcript, onboarding form, the
client's current website, GBP listing. Extract:

- Every service offered, and which add-ons fold into which parent service
- Every city/area served, and which one is home base (`isHeadquarters`)
- Differentiators, guarantees, certifications, products used (RUPES, IDA,
  Gtechniq, Ceramic Pro…), owner story, brand personality
- Service prerequisites (e.g. maintenance wash requires a prior full detail)
- Pricing — **internal reference only; it never appears on any page**
- Ideal customer profile and any recurring-revenue offers

Cross-reference sources against each other. Present every discrepancy
(service in the call but not the form, differing areas, conflicting prices)
and ask — never resolve one silently.

Then present for explicit confirmation, in one message:

1. The service list (one page each) and where each add-on lives
2. The area list, ordered, with the headquarters marked
3. Slugs for every page (lowercase-hyphenated; they are the live URLs, and
   `/{slug}` is shared between services and areas — no collisions, and none of
   the reserved routes: about, faqs, get-quote, booking, blog, post,
   privacy-policy, tos)
4. Whether the client publishes a `/booking` page (`routes.booking`) and, if
   so, the vehicle types and their scheduler URLs
5. Any facts still unknown — these become `null` in intake, not guesses

Do not write content before this checkpoint clears.

## Step 2 — Write intake.json, Then site.config.ts

Write `clients/<slug>/source/intake.json` against `intake-schema.mjs`. Every
unknown fact is `null` — never a plausible placeholder. An invented phone
number that passes validation is worse than a missing one that fails it.

Run `pnpm intake <slug>`. It reports what blocks the build vs. what can wait
for launch. Chase blockers with the user; proceed on content regardless —
copy does not depend on the GTM ID.

Then write `site.config.ts` **from** the intake. Every fact present in both
files must agree exactly — `pnpm lint <slug>` enforces this drift check.
Model the file on an existing client's config, not from memory. The client's
design input is two values: `theme.accentColor`, and `theme.mode` ('light' |
'dark') selecting which of the template's surface palettes renders. The
template owns both palettes and derives everything else, failing the build if
the accent cannot be made legible on the chosen surfaces.

## Step 3 — Author the Content

One file per page, all prose in frontmatter, **empty markdown body**. Match
`guild-smoke`'s YAML shape exactly; the schema names below are the contract.

**The template is the demand side; the source material is only supply.** The
schema and the smoke payload define what content is required, how much, and
where. Onboarding input supplies facts to pour into that structure — its
thinness must never thin the output. Every slot the template's smoke payload
fills, you fill; an empty slot requires either a client-confirmed fact ("we
take no bookings") or the user's explicit sign-off, never silence in the form.

Author **slot-for-slot against guild-smoke**, including its omissions: where
the smoke payload leaves an optional field empty (the area intro's image),
that omission is the proven composition, not an oversight. Filling an optional
slot the reference leaves empty is a layout decision you are not supposed to
be making — and `pnpm lint <slug>` enforces the other direction mechanically:
its composition parity check warns on every slot the smoke fills that your
payload leaves empty.

### Voice, for every field

- Confident, direct, second person. Match the personality extracted in Step 1
  — premium and polished, blue-collar and rugged, family-run and warm are
  three different sites. Mirror the client's own phrases from the transcript.
- Short paragraphs. The schema's caps are composition limits: a `section.body`
  allows 4 paragraphs but the proven payload never needed more than 3.
- Banned: "nestled in," "elevate your," "we understand that," "our team of
  experts," "look no further," "when it comes to," "in today's world."
  If a sentence could open any detailer's website, it is not this client's.
- No em dashes anywhere in authored client copy — restructure the sentence,
  or use a comma, period, or colon instead. Hyphens only where grammatically
  mandatory ("high-quality" is fine as a compound modifier). This applies to
  payload prose, not to engine code or its comments.
- No prices, tiers, or starting-at figures anywhere — pages describe what is
  included and direct visitors to quote or book.
- No unverifiable claims. "Fully insured" only if the intake says so. The
  engine removed hardcoded "100% mobile" claims for exactly this reason.

### home.md (`guildHomeSchema`)

- `hero.heading` is the H1: primary service keyword + city/region, written as
  a headline, not a keyword string.
- `hero.ticker`: 3–8 short proof phrases ("100% Mobile Service", "No Hidden
  Fees") — the client's real proof, not stock claims.
- `introduction`: the problem the business solves (the "No Shop. No Drop-Off.
  No Waiting." slot). `promise`: the differentiator, carrying the `stats` row
  — 2–4 stats, and each must be a real fact ("$0 / Hidden fees", "40 mi /
  Service radius"), not marketing math.
- `about`: who they are, one section. `areaSection.intro`: one paragraph of
  coverage framing — the tiles come from the areas collection.
- `servicesHeading` names the trade ("Our Mobile Detailing Services").

### services/<slug>.md (`guildServiceSchema`)

- `shortDescription`: one line, reused on every service card site-wide.
- `hero.heading`: "{Service} in {City}, {ST}". `intro` opens on the pain
  point the service solves; its heading is optional because the H1 carries it.
- `overview`: the educational "What Is X?" block.
- `included` (1–3 panels, 4–10 items) and `process` (3–6 steps): every service
  page carries both unless the *client confirmed* the service has no such
  structure. A thin onboarding form is not a reason for a thin page — the
  no-fabrication rule protects client FACTS (prices, insurance, credentials,
  what surfaces they coat, whether they do interiors), never trade-standard
  structure: how a ceramic coating is applied is true of every detailer and is
  domain knowledge you may author. When the intake lacks scope detail for a
  service the client definitely sells, write the trade-standard scope in the
  client's voice, keep every uncertain capability out of it, and record it in
  intake notes as a draft the client must confirm. Omission is a decision the
  user signs off on, never a silent default.
- `addOns` (max 4): clients list one add-on menu, not per-service menus —
  assign each add-on to every service page it plausibly pairs with (pet hair
  belongs on RV pages too), so no service page ships without the grid unless
  the user signs off on the omission.
- `why`: the stakes block — why this service matters for the vehicle, local
  conditions included. This is where in-prose internal links belong when a
  section supports `bodyHtml`; anchor text is descriptive, never "click here."
- `faqs`: 3–8 questions *specific to this service*, from real client answers.
  Site-wide questions go to faqs.md, not here.
- State prerequisites plainly on the page that carries them.

### areas/<slug>.md (`guildAreaSchema`)

Every area page must be genuinely local — the schema forces the shape but not
the honesty:

- `intro`: the "we come to you here" opener. `why`: the local-conditions
  argument (roads, weather, commuter patterns, parking realities).
- `neighborhoods`: required, and the acid test — real neighbourhood and
  landmark names for *this* city. If you cannot write it without the intake
  or a quick check of the area, the page is not ready.
- `guarantee`: the closing trust block tied to the brand.
- `state` only for US cities; omit for airports, ports, regions.

### about.md, faqs.md, get-quote.md, booking.md, blog.md

- `about.story`: the founder's actual story — background, why they started,
  their standard. Personal and specific; never "we are passionate about cars."
  `process`: how working with them goes, start to finish.
- `faqs.groups`: 1–6 groups (Booking & Policies, Services, Maintenance…),
  2–8 items each. Real questions customers ask, answered in 3–5 sentences.
  The `intro.bodyHtml` slot is where a phone link may go — as an inline link,
  the one sanctioned use.
- `get-quote`: prose around the contact panel only; details render from
  config. `quote.hours` only when booking hours differ from footer hours.
- `booking.md` only if `routes.booking` is true: one `vehicles` card per
  bookable type with its external scheduler URL (`z.url()` — off-site by
  design). The `cta.image` is a required owner portrait; get one or flag it.
- `blog.md` is just the index masthead; posts are the blog-writer's job.

### metaDescription, everywhere

≤160 characters, hand-tuned per page: primary keyword, location, and a reason
to click. The `title` override is optional — the SEO formula in `lib/seo.ts`
is usually right; override only when the formula reads wrong for this page.

### The prose-point convention

Inside multi-sentence prose fields, a run of two or more paragraphs opening
`**Label.** explanation` renders as a labelled point list (`lib/prose.ts`).
Use it where the copy is really a spec sheet; the label needs its terminating
period inside the bold. One such paragraph alone stays plain text — that is
emphasis, not a list.

## Step 4 — Images

Author every `image:` slot with a repo-relative `./assets/...` path and alt
text following "{subject} — {Brand} in {City}, {ST}" where sensible.
Decorative slots (`cta.image`) take `alt: ''`. Then:

1. Write the generation plan into `clients/<slug>/image-prompts.json` and
   hand off to `site-image-generator` — do not generate images here.
2. Until real assets exist, run `pnpm placeholders <slug>` so the build is
   never blocked on photography.

Budgets are enforced at build: 1536KB hero video, 600KB per image.

## Step 5 — Verify

The definition of done, in order:

```sh
pnpm intake <slug>        # no schema errors; blockers known and chased
pnpm lint <slug>          # drift, dead asset paths, alt text — must pass
pnpm use <slug>           # point the engine at this payload
pnpm check                # zod validates every file; fix what it names
pnpm build                # full build + verify-dist
```

Fix exactly what zod names and re-run; never loosen a schema to admit a
payload. If the contract is genuinely wrong for a legitimate client, that is
an engine change to raise with the user, not an authoring workaround.

Close with a report: pages written, facts still null (and who owes them),
image slots pending generation, and anything flagged rather than resolved.

## Reminders

- Never fabricate: facts, FAQ answers, neighbourhood names, review counts,
  founding years. A gap is a `null` plus a question to the user.
- Never resolve a source discrepancy silently.
- The old GHL skill's mechanics do not apply here: no `{{custom_values.*}}`
  tokens (the build rejects any `{{` in prose), no layout locks (the schema
  is the layout), no CTA quotas (routes.ts owns actions), no Notion.
- Finished clients are pinned at a git tag; authoring a new client must not
  touch engine files or other clients' payloads.
