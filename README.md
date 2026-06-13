# Learn Manoonchai v2

A browser typing trainer for the **Manoonchai** Thai keyboard layout. It maps
physical key positions to Manoonchai characters in-app, so you can practice the
layout without reconfiguring your OS. A full rewrite of v1 on a modern stack.

- **Domain language**: [CONTEXT.md](./CONTEXT.md) (lesson, drill, raw/net WPM, …)
- **Product brief**: [PRODUCT.md](./PRODUCT.md)
- **Key decisions**: [docs/adr/](./docs/adr/)

## Stack

SvelteKit 2 · Svelte 5 (runes) · Tailwind v4 · TypeScript · Bun workspace ·
Oxlint + Oxfmt · Vite+ (Vitest) · self-hosted Sarabun · LayerChart.

## What it does

- **Lessons** introduce characters in a deliberate order; pick any of 30+ freely.
- A **drill** is a timed run of 10/25/50 words sampled from the active lesson.
- Live feedback: next-key keymap glow, per-character correctness, prefix check.
- Honest end-of-drill stats: raw WPM, net WPM, accuracy, and a raw/net chart with
  error markers (see [ADR 0001](./docs/adr/0001-honest-stats-engine.md)).
- Light/dark themes (system default), full keyboard operability, reduced-motion.

`Tab` restarts a drill · `Esc` opens settings.

## Getting started

```bash
bun install
bun run dev          # → http://localhost:5173
```

## Project structure

```
.
├── apps/web/
│   └── src/lib/
│       ├── engine/      # pure domain logic (layout, drill, stats, …) + unit tests
│       ├── components/  # UI + component tests
│       ├── state/       # runes-backed, persisted settings
│       └── data/        # ported Manoonchai layout + lesson word pools
├── packages/            # shared env + tsconfig
└── v1/                  # the previous app, archived
```

## Scripts (run inside `apps/web`)

- `bun run dev` / `bun run build` / `bun run preview`
- `bun run check` — `svelte-check` type checking
- `bun run test` — Vitest unit + component tests
- `bun run test:e2e` — Playwright end-to-end (drives a full drill)

Repo-wide lint/format from the `v2/` root: `bun run lint`, `bun run format`.
