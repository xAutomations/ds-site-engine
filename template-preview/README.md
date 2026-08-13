# Template preview

This is an isolated Astro harness for templates that do not have a client payload or
content schema yet. It does not load `client/`, `src/content.config.ts`, or production
routes.

The Detailers Guild preview currently exposes only the two supplied reference pages:

- `/` — Landing
- `/about/` — About

Run `pnpm template:dev` for the local preview or `pnpm template:build` to verify the
standalone harness. Fixture copy lives in `src/fixtures/detailers-guild.ts`; preview
assets live under `public/assets/`.
