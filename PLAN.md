# Leonida Trophy Ledger — Pixel Dusk Build Plan

Competition: `gta6-trophy-guide-01` ("Build the best GTA 6 trophy guide")  
Design System: **LEONIDA PIXEL DUSK** (retro pixel-art game UI, zero external assets, zero build step)

## Phase 0 — Plan
- [x] Inspect workspace, starter trophy list, competition rules, and approved Leonida Pixel Dusk design references
- [x] Author this phased checkbox plan (`PLAN.md`) before writing application code

## Phase 1 — Data (`app/data/trophies.json`)
- [x] Cross-check all 55 official GTA VI PS5 trophies against kit starter, PSNProfiles, Exophase, PowerPyx, and GTABase
- [x] Write original walkthroughs (what to do, where/how, when, step-by-step checklists) and clickable source citations for all 55 trophies in `app/data/trophies.json`
- [x] Flag ONLY `Positive Mental Attitude` as `POSSIBLY MISSABLE — UNCONFIRMED` (Chapter 1 balcony meditation at Jason's house, no mission replay) and mark all other 54 trophies earnable in post-story free roam
- [x] Hard-verify dataset counts: 55 total = 1 Platinum (`Vice Got a Price!`), 2 Gold, 6 Silver, 46 Bronze; 28 hidden / 27 visible; 0 online; 6 roadmap stages

## Phase 2 — App Features (`app/`)
- [x] Replace `app/` wholesale with static offline HTML + ES modules (`index.html`, `styles/`, `js/`, `data/trophies.json`) with zero external requests and no build step
- [x] Implement `localStorage` persistence for earned trophies, PSN progress counters, dossier checklist steps, spoiler settings, and per-trophy reveals
- [x] Implement full checklist & filter suite: grade, status, kind (`story`/`side`/`secret`/`misc`), focus (`missable`, `collectibles`, `activities`, `strangers`, `heists`, `online`), hidden-only toggle, and instant full-text search
- [x] Implement Spoiler Shield (ON blurs unearned story/hidden names & descriptions + blocks dossier walkthrough until earned or individually revealed; OFF reveals all)
- [x] Implement Trophy Dossier detail panel: official quote, pixel medal, metadata chips, missable alert banner, PSN counter (`-1`, `+1`, `MAX`, segmented bar), clickable cited sources, original guide, step-by-step pixel checklist, Mark Earned
- [x] Implement 6-stage Platinum Roadmap & Missables view with early missable alert banner, stat summary, per-stage progress, and clickable trophy chips
- [x] Implement Export JSON, Import JSON with validation, and inline 2-click 3-second Reset (no native `confirm()`)

## Phase 3 — Design: "LEONIDA PIXEL DUSK"
- [x] Implement palette (`#0a0918` indigo dither, `#100d29` panels, `#372d75` violet borders, `#ff5e7a`/`#ff8a3c`/`#ffd23c` flat sunset accents, warm gold earned, amber missables, zero teal/turquoise, zero smooth UI gradients, zero border-radius, stair-stepped pixel corners)
- [x] Draw pixel-art hero sunset scene (`256x46`), 5x7 bitmap pixel title `"LEONIDA TROPHY LEDGER"`, tilted `"GREETINGS FROM LEONIDA"` postcard (`320x88`), and 6 stage postcard thumbnails (`88x50`) on canvas
- [x] Draw 24x24 pixel coin medal sprites (platinum, gold, silver, bronze, dimmed unearned) and pixel UI sprites (purple/gold spoiler shield, warning triangle, checkmark, star) with `shape-rendering="crispEdges"` and zero emoji
- [x] Build small states: empty-results pixel panel with clear button, pixel toast band under toolbar, dossier step checkboxes, 55/55 Platinum Claimed gold banner, and single-line mono footer with sources + unofficial disclaimer
- [x] Add frame-stepped retro animations (`steps()` / 8–12 fps JS cadence) across boot, hero scene, checklist, dossier, tabs, roadmap, spoiler shield, toasts, and Platinum celebration while respecting `prefers-reduced-motion`
- [x] Add responsive stacking breakpoints (`<=1100px`, `<=640px`, >=44px tap targets) without altering the primary desktop layout

## Phase 4 — Package & Screenshots
- [x] Author/refresh `main.ts` (Node 22 stdlib only) and `serve.ts`; verify `vendor/makefun-frontend.ts` stays byte-for-byte identical to the kit
- [x] Update `README.md` (preserving the 3 live make.fun badges at top) and verify MIT `LICENSE` stays intact
- [x] Run local server and capture 4 real desktop Chrome screenshots in `screenshots/` (`1-overview-guide.jpg`, `2-roadmap-missables.jpg`, `3-spoiler-shield.jpg`, `4-filters-cited-guide.jpg`), each <= 256 KiB and <= 1280px long side
- [x] Build `out/` via `MAKEFUN_OUTPUT_DIR=out node main.ts`

## Phase 5 — Verify & Commit
- [x] Verify `trophies.json` hard counts (55 / 1P / 2G / 6S / 46B / 28 hidden / 0 online / 1 possibly missable)
- [x] Verify offline load in Chrome: zero console errors, zero external network requests
- [x] Run automated interactive click-through verification (earn/reset, counters, every filter, search, spoiler on/off + per-trophy reveal, export/import, roadmap, 55/55 state)
- [x] Run `node /tmp/gta6-kit-tools/cli/makefun.mjs check` and confirm 4/4 PASS
- [x] Commit all changes cleanly and pause for user to run `git push origin master:main`

## Phase 6 — Submit (after user push confirmation)
- [ ] Seal recording and submit ONCE through `/tmp/gta6-kit-tools/cli/makefun.mjs`
- [ ] Report submission ID and status
