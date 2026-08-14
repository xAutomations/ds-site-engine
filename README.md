# ds-site-engine

One Astro engine, many client sites. The engine is `src/`; each client is a payload
directory under `clients/`. No client's words live in engine files — if a string is
visible on a page, it comes from the payload's markdown or `site.config.ts`.

## Selecting a client

`client/` is a **symlink**, not a directory. It points at whichever payload is active:

```
pnpm use jetspa       # repoint client/ → clients/jetspa
pnpm use              # re-link from DS_CLIENT, or keep the current link
```

`dev`, `build`, `preview` and `check` all re-establish the link first (the
`pre*` scripts in package.json), so a stale link cannot silently build the wrong
client. In CI, set `DS_CLIENT` instead of running `pnpm use`:

```
DS_CLIENT=jetspa pnpm build
```

Why a symlink rather than an env-driven path: thirty engine files import the payload
by relative path, and three `import.meta.glob` calls hardcode `client/assets/**`.
Vite requires those glob patterns to be static literals, so the mount point has to
stay put — the link moves instead.

> **Moving the link restarts a running dev server**, on purpose. The content glob
> resolves *through* the symlink, so Vite's watcher and Astro's content store key on
> `clients/<slug>/…`; repointing the link changes what the pattern resolves to without
> touching a watched file, nothing invalidates, and the next request throws
> `Missing payload file` for a file that is plainly on disk.
>
> This matters because the link also moves as a **side effect** — `DS_CLIENT=jetspa pnpm
> build` in another terminal repoints the shared link, so the dev server you are
> looking at can go stale from a command you did not run. Set
> `DS_NO_DEV_RESTART=1` to be warned instead of restarted.
>
> Two hard-won details of *how* it restarts (scripts/dev-server.mjs):
>
> - **Deferred past the build.** Under `prebuild` the restart waits for the
>   matching `post*` hook — a dev server booting while an `astro build` runs in the same
>   directory races it over `.astro/` and comes up corrupted.
> - **Clean-slate, never `--force`.** `.astro/data-store.json` is deleted between stop
>   and start. Astro 7.1.5's clear-then-resync path (what `--force` requests, and what
>   fires by itself when the store file was last written by a build, whose config digest
>   never matches dev's) leaves every collection an empty Map. A missing file has no
>   digest to mismatch, so boot-from-nothing takes the genuine full-load path.
>
> Both details depend on **undocumented Astro internals**, and the failure mode of an
> upgrade shifting them is silent (a dev server that renders from empty collections).
> After every Astro upgrade, run `pnpm smoke` — it boots dev from a cold store and
> asserts the collections actually populated.

## Adding a client

```
clients/<slug>/
  source/
    intake.json         # THE INPUT — every fact the site needs, in one file
    Website Pages/      # the content export, where one exists
  site.config.ts        # generated from intake.json; plain data, imports nothing
  _redirects            # optional 301s, staged into public/ by pnpm use
  assets/               # logo, hero video + poster, social image, page images
  content/
    home.md  about.md  faqs.md  get-quote.md
    services/*.md  areas/*.md
    legal/              # optional authored Privacy/ToS; empty = generated template
```

**1. Fill the intake.** Copy `scripts/intake.template.json` to
`clients/<slug>/source/intake.json`. It covers business facts, contact and NAP, service
area, hours, socials, GHL forms, tracking, theme, legal, the full page
inventory, and the site-level assets — everything `site.config.ts` and the merge-field
resolver need. Field docs live in `scripts/intake-schema.mjs`.

Anything not yet known is `null` — never a guess, and never a placeholder that looks
real. An invented phone number passes validation and ships; a null one fails the build
until someone chases it.

**2. Check it.**

```
pnpm run intake <slug>      # or --all
```

Separates three things: schema errors (the file is wrong), facts still needed before the
site can build, and optional fields deliberately left empty.

**3. Import the content**, where it arrived as an export:

```
pnpm run import <slug>              # dry run: reports what will not map
pnpm run import <slug> -- --write   # emit the reviewed intermediate to .import/
```

It resolves `{{custom_values.*}}` merge fields from the same intake file, rewrites Notion
links to site paths, and reports what a human still has to place. It does **not** guess
how prose maps onto `packages` / `addons` / `processSteps` — that is authored, not
inferred, because a wrong guess there builds cleanly and reads like nonsense.

**4. Author the payload**, drop the assets in (budgets are enforced at build: 1536KB
hero video, 600KB per image), then `pnpm use <slug> && pnpm build`. Every missing or
malformed field fails the build by name.

Engine collections are frontmatter-only; a markdown body is silently ignored by Astro,
so `pnpm lint` rejects one. Optional booking and blog features belong to the selected
template rather than the shared engine collection layer.

**5. Lint it.**

```
pnpm lint <slug>            # or --all
```

Source-level checks the schema cannot make: fact drift between intake.json and
site.config.ts, duplicate or thin metaDescriptions, dead asset paths, and prose in a
body that will not render. Errors fail; judgement calls warn. (The built site gets its
own pass — scripts/verify-dist.mjs runs on every build: dead internal links, duplicate
titles, missing alt, merge fields, sitemap agreement.)

### Building before the facts arrive

Onboarding rarely completes before someone wants to see the site. Two supports for that:

```
pnpm run placeholders <slug>   # generate stand-in logo, hero video, poster, images
```

and stand-in values in `site.config.ts` containing the string `PLACEHOLDER`. Both are
deliberately, visibly fake — flat grey images, an `example.com` quote URL, a footer
that reads `PLACEHOLDER, NJ 00000`. A plausible stand-in survives review and reaches
production; an ugly one cannot.

Every placeholder is listed on each build, and **`DS_STRICT=1` turns that warning into
a build failure** — set it in any deploy pipeline. `intake.json` stays the honest
record: a field that is null there has not been supplied, whatever the config says.

## Deploying

Each client is a separate application on the host (Dokploy), all pointing at **the same
repo**, differing only by `DS_CLIENT`, git ref, and domain. The build is fully static, so
`DS_CLIENT` must be set at **build time** — a runtime env var does nothing.

### One engine, but a live site never moves on its own

A shipped site is a static `dist/` on the server. An engine change cannot alter it; only
a rebuild can. So the isolation between clients lives in **what each application builds
from**, and each one is pinned to a tag rather than tracking a branch head:

```
git tag jetspa/v1        # cut when the site goes live
```

- Each Dokploy application's ref is that tag. **Auto-deploy stays off.**
- Push whatever you like to `master`; JetSpa keeps building `jetspa/v1` indefinitely.
- Updating a client is a deliberate act: cut `jetspa/v2`, bump that one application's
  ref. One client at a time, on your schedule — never as a side effect of an engine
  commit.

A finished site is therefore frozen by the ref, not by convention.

### Build in CI, serve from Dokploy

The server never builds. GitHub Actions (Blacksmith runners) runs the
multi-stage `Dockerfile` — a Node stage builds `dist/`, an nginx stage serves it
(config in `deploy/nginx.conf`) — and pushes the image to GHCR. Dokploy
applications use the **Docker** provider and just pull:

- **Release** (`.github/workflows/release.yml`): pushing a tag like `jetspa/v2`
  builds that one client at that commit, strict mode on, and pushes
  `ghcr.io/xautomations/ds-site-jetspa:v2`. Branch pushes build nothing.
- **Preview** (`.github/workflows/preview.yml`): manual dispatch
  (`gh workflow run preview.yml -f client=jetspa`) builds current `master` with
  `DS_STRICT=0` and overwrites `ds-site-jetspa:preview`, then pings the preview
  app's Dokploy webhook so it redeploys itself. **Not wired up yet:** the repo
  secret `DOKPLOY_PREVIEW_WEBHOOKS` (a JSON map of slug → the app's deploy
  webhook URL from its Dokploy settings) doesn't exist, so the step skips and
  previews need a manual Deploy press in Dokploy after each build. Create the
  secret to make `gh workflow run preview.yml -f client=<slug>` fully
  hands-off.

Each Dokploy application: Docker provider, image `ds-site-<slug>:<tag>`,
container port `80`, HTTPS off (Cloudflare terminates TLS; traffic arrives via
the tunnel). Production apps pin a version tag and are redeployed by hand —
bumping `:v1` to `:v2` in the image field *is* the pin bump. Preview apps track
`:preview` via the webhook.

Migration 301s: `clients/<slug>/_redirects` is translated into real nginx rules
at image build time by `scripts/redirects-to-nginx.mjs`, so the Netlify-format
file is honoured even though nginx serves the site. Unsupported redirect syntax
fails the build rather than shipping a rule that does nothing.

### Why not a copy of the engine per client

Because every fix would need making N times, and would get made once. Concrete case: a
bulleted `Prose` block inside a copy-only `SplitSection` inherited `text-align: center`,
which stranded the list markers away from their text. One fix in `src/components/Prose.astro`
covers every client. Forked, it would be live on four sites nobody looked at again.

Divergence that is genuinely per-client belongs in the payload — preset, accent, config,
content already cover most of it. If a client ever needs a bespoke section, add
`clients/<slug>/overrides/Foo.astro`, resolved ahead of `src/components/Foo.astro`, rather
than branching the engine. One mechanism, one place to look. (Not built yet — no client
has needed it.)

### Bumping a pin safely

Pinned deploys have exactly one failure mode: nobody dares bump the pin, and clients rot
on a months-old engine, missing accessibility, contrast, and SEO fixes. The answer is to
make *"what would change if I bumped this?"* a command rather than a guess.

**Not built yet — `scripts/release-diff.mjs`:** build a client at its pinned tag and at
`HEAD`, then diff the extracted visible text per route plus page and asset weight, and
print which pages would move. Empty output means the bump is mechanically safe; anything
else gets read before promoting. This generalises the text-diff used as the regression
check while making the engine client-shape-agnostic — comparing rendered text rather than
bytes, since markup and hashed filenames churn for reasons that do not reach the page.
`pnpm build` covers schema validation, accent contrast, asset budgets, and (via
verify-dist) internal links. Worth writing before the second client goes live, which is
the first time a pin bump has stakes.

### Also before the first deploy

- **`DS_STRICT=1` is baked into the Dockerfile**, so a payload still carrying
  `PLACEHOLDER` values fails the image build instead of shipping.
- **`_redirects` is a Netlify/Cloudflare format** that nginx ignores — the Dockerfile
  translates it into real nginx rules via `scripts/redirects-to-nginx.mjs`. If a client
  is ever deployed some other way, that translation must come along.
- **Path filtering is not a substitute for pinning.** Restricting an application to
  `src/**` plus its own `clients/<slug>/**` still rebuilds every client on any `src/`
  commit — which is the thing being avoided here.

## Theme

A client's whole design decision is `theme.accentColor` — one hex value. Everything
else (palette, type, radii, dividers, card and button treatment, hero composition,
motion) belongs to the **template**, in its own `styles/global.css`. A template is a
content contract and a design language together; a client picks a template, not a skin.

> There used to be a `theme.preset` field naming one of five skins (`fresh`, `stealth`,
> `chrome`, `bold`, `noir`) with structural motifs applied as data attributes. None of
> it was ever wired — both templates read `accentColor` straight into their own custom
> property — so it was removed rather than left as a field every payload filled in and
> no page reflected. `src/styles/contrast.ts` is what remains, and it is the part that
> was doing real work.

**The accent is validated, not trusted.** Each template checks the client's colour
against its *own* surfaces at build time:

- **The label is derived, not assumed.** `pickOnAccent` flips text on an accent fill to
  dark when white cannot clear 4.5:1. A light brand colour (brass, champagne) moves the
  *label* rather than being rejected — telling a client their brand is wrong is a bad
  answer when the label can change instead.
- **Accent-as-text is derived too.** `deriveTextSafe` darkens or lightens the accent
  until it clears AA on the template's paper, instead of a fixed mix that is a guess in
  both directions.
- **The build fails for what derivation cannot fix.** An accent within 3:1 of the page
  makes every fill on the site invisible, and no label colour changes that. The error
  carries the arithmetic and the ratio it needed.
pnpm build                 # schema validation, accent contrast, asset budgets,
                           #   missing assets, then verify-dist for internal links
pnpm lint                  # payload shape
pnpm test                  # unit tests
```

A client's `theme.accentColor` is validated against the active template's own surfaces
at build time (`styles/contrast.ts`). The label colour on an accent fill is derived
rather than assumed, so a light brand colour moves the *label* instead of being
rejected; the build fails only when the accent is too close to the page for any fill to
be visible.
