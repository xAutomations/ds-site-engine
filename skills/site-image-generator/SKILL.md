---
name: site-image-generator
description: Use when planning, generating, replacing, or wiring client website images through image-prompts.json and scripts/generate-images.mjs in this site engine.
compatibility: Claude Code, OpenCode, and Agent Skills-compatible agents
metadata:
  canonical: "true"
---

# Site Image Generator

Plan and generate client imagery through the repository's versioned prompt
manifest. Keep prompts reviewable, limit paid API calls to the intended image
IDs, verify generated files, and wire content only after generation succeeds.

## Repository Contract

For client `<slug>`, use:

```text
clients/<slug>/image-prompts.json
clients/<slug>/assets/
scripts/generate-images.mjs
```

`clients/<slug>/image-prompts.json` is the source of truth. The script is only
the executor. Never generate an image from a prompt that exists only in chat or
in a temporary file.

The standard commands are:

```sh
pnpm run images <slug> --only=<id,id> --dry-run
pnpm run images <slug> --only=<id,id>
```

The script supports Kie (`KIE_API_KEY`) and OpenAI (`OPENAI_API_KEY`). Provider,
model, aspect ratio, resolution, and default resize width come from the
manifest unless command flags override them.

## Workflow

### 1. Determine the Requested Scope

Identify the client slug and the exact content slots that need images. Ask one
short question only when the client or requested slots cannot be inferred.

Before editing, read:

1. The client's `image-prompts.json`.
2. The content files that will use the images.
3. The relevant existing assets.
4. Existing nearby manifest entries for naming and visual style.

Prefer reusing approved client photography when it accurately depicts the
subject. Create a resized or cropped derivative when that satisfies the slot;
do not spend generation credits merely to produce another version of an
existing suitable image.

### 2. Add or Update Manifest Entries

Every generated image entry must include:

- A unique, stable `id`
- An `out` path relative to `clients/<slug>/assets/`, ending in `.webp`
- A concrete, provider-independent `prompt`
- Descriptive `alt` text
- At least one `usedBy` reference when the destination is known

Set per-image values such as `aspectRatio`, `resolution`, or `resizeWidth` only
when the slot differs from manifest defaults. Blog-specific outputs belong
under `blog/` and should normally use `resizeWidth: 600`.

Prompts should describe subject, action, setting, composition, lighting, and
material details. Include relevant exclusions such as no text, no logos, and
no visible registration. Do not invent client facilities, uniforms, equipment,
certifications, or service methods.

Keep filenames and IDs semantic. Do not overwrite a different image's output
path or repurpose an existing ID for an unrelated subject.

### 3. Review With a Targeted Dry Run

Always run a targeted dry run before paid generation:

```sh
pnpm run images <slug> --only=<id,id> --dry-run
```

Review the printed output paths, prompts, provider, model, and queue size.
Resolve malformed manifest data, duplicate IDs, accidental broad scope, and
incorrect content references before continuing.

Never omit `--only` unless the user explicitly requested every missing image
in the manifest. A broad run may generate unrelated assets and spend
unexpected credits.

### 4. Get Approval for Paid Generation

A direct request to generate the specified images counts as approval. If the
user asked only to plan prompts, edit the manifest, inspect assets, or prepare
a dry run, stop after the dry run and ask before making provider API calls.

State the provider and number of queued images when asking. Never expose,
print, copy, or commit API keys or `.env` contents.

### 5. Generate Safely

After approval, run:

```sh
pnpm run images <slug> --only=<id,id>
```

Do not use `--force` unless the user explicitly requested replacement of
existing outputs. Existing files are skipped by default. Prefer the manifest's
provider and model; override them only for a stated reason.

If one image fails, preserve successful outputs and diagnose the failed ID.
Do not repeatedly submit a rejected prompt or bad request because retries can
spend credits without changing the outcome.

### 6. Verify Every Output

For each generated image:

1. Confirm the expected `.webp` file exists.
2. Confirm its width and aspect ratio suit the intended slot.
3. Confirm it is at or below the 600 KB asset budget.
4. Visually inspect subject accuracy, crop, artifacts, text, logos, and any
   accidental registration or brand marks.
5. Confirm the alt text describes the resulting image, not merely the prompt.

Reject and revise materially inaccurate images. Do not wire an image into
content solely because the API call succeeded.

### 7. Wire Content After Verification

Only after an output passes review, update the referenced content field to:

```yaml
src: "./assets/<out>"
alt: "Verified description of the generated image"
```

Follow the active collection schema and existing client conventions. Check
that every `usedBy` reference and content path points to the intended file.

## Completion Checklist

Before finishing, verify:

- Existing approved assets were considered before paid generation
- All generated prompts are recorded in the client manifest
- The dry run targeted only the intended IDs
- Paid generation had explicit or direct-request approval
- `--force` was not used without explicit replacement intent
- Outputs are WebP files with appropriate dimensions and file sizes
- Generated images passed visual inspection
- Content paths and alt text match the verified outputs
- Provider, model, success/failure count, and reported credits are summarized
- No secrets or `.env` content were exposed or committed

Run repository tests or builds only when relevant and not prohibited. Never
start, stop, or restart a development server without permission.
