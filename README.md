# gta6-trophy-guide — Leonida Trophy Ledger (Pixel Dusk Edition)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sasukevaizen/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sasukevaizen/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01/reward?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Offline static retro pixel-art trophy guide, Platinum roadmap, and progress ledger covering all **55 official PlayStation 5 trophies** of *Grand Theft Auto VI* (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden, 27 visible; 0 online). Built from scratch for the [make.fun "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## Leonida Pixel Dusk Design

- **100% Procedural Pixel Art** — Zero external assets, zero webfonts, zero Rockstar logos or official artwork, and zero emoji. Every visual is drawn directly in code via HTML5 Canvas (`image-rendering: pixelated`) and crisp pixel-grid inline SVG (`shape-rendering="crispEdges"`).
- **Animated Sunset Hero & Postcard** — Stepped purple-to-orange sunset sky bands, retro cut sun, twinkling stars, drifting clouds, flickering skyline windows, shimmering water, 2-frame swaying palms, custom 5x7 bitmap pixel title (`LEONIDA TROPHY LEDGER`), and a tilted `"GREETINGS FROM LEONIDA"` postcard.
- **24x24 Pixel Coin Medals & Sprites** — Custom bronze, silver, gold, platinum, and dimmed unearned pixel coins alongside a purple-and-gold pixel spoiler shield, pixel warning triangle sign, pixel checkmark, and 6 unique animated pixel stage postcards (beach, skyline, swamp, highway, midnight heist, golden finale).
- **Retro Frame-Stepped Motion** — All animations use `steps()` CSS cadence and an 8 fps canvas loop (transform/opacity only, respecting `prefers-reduced-motion`).
- **Stepped Pixel Chrome** — Deep dusk indigo `#0a0918` checker-dither backdrop, `#100d29` panels with `#372d75` violet borders, stair-stepped `clip-path` pixel corners (zero `border-radius`), flat sunset coral/orange/gold accents, segmented progress bars, and responsive stacking below `1100px` and `640px`.

## Features

- **All 55 Official PS5 Trophies (`app/data/trophies.json`)** — Cross-checked against PSNProfiles and Exophase (exact official names, descriptions, grades, hidden flags, and PSN progress targets).
- **Original Cited Walkthroughs** — Every trophy includes an original walkthrough in fresh words, clickable source citations, timing notes, interactive step-by-step pixel checklists, and live PSN progress steppers (`-1`, `+1`, `MAX`) wherever the trophy tracks a count.
- **Early Missable Watch** — Flags only **Positive Mental Attitude** as *POSSIBLY MISSABLE — UNCONFIRMED* (Chapter 1 balcony meditation at Jason's house after *Down to Earth*, per PowerPyx & GTABase); all other 54 trophies are earnable in post-story free roam.
- **6-Stage Platinum Roadmap & Missables View** — Numbered pixel route stops from Story & Chapter 1 Missable Watch through Strangers & Freaks, Collectibles & Meditations, Activities/Ranges/Races, Heists/Secrets/Economy, and 100% Completion (`A Long Road`) to the Platinum (`Vice Got a Price!`).
- **Spoiler Shield** — Blurs unearned story & hidden trophy names/descriptions and curtains the dossier walkthrough until marked earned, individually revealed, or toggled OFF.
- **Full Filter & Search Suite** — Filter by grade, earned status, kind (`story`, `side`, `secret`, `misc`), focus (`missable`, `collectibles`, `activities`, `strangers`, `heists`, `online`), hidden-only toggle, and instant full-text search.
- **Offline Persistence & JSON Backup** — Persists earned trophies, counters, step checklists, and spoiler settings in `localStorage`, with Export JSON, validated Import JSON (pixel toast feedback), and a safe inline 2-click Reset confirmation.
- **Zero External Requests** — Plain HTML, CSS, and ES modules in `app/` with no build step; works completely offline in desktop Chrome.

## Data Sources

- **PSNProfiles** — Official PS5 trophy list & progress targets: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- **Exophase** — Official PS5 trophy list & hidden flags: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- **PowerPyx** — Trophy guide, 100% completion checklist, and Chapter 1 meditation alert: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- **GTABase** — Trophy guide & achievements reference: https://www.gtabase.com/grand-theft-auto-vi/guides/gta-6-trophy-guide-achievements-list

## How to Run

Requires **Node.js 22.18+** (standard library only, no `npm install`).

### Preview locally

```sh
node serve.ts
```

Open `http://127.0.0.1:8080` in desktop Chrome (works with network completely disabled).

### Build the make.fun output (`out/`)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Copies `app/` and `screenshots/` to `out/` and builds `out/dossier.json` via the unmodified `vendor/makefun-frontend.ts`.

## License

MIT — see [LICENSE](./LICENSE).
