# gta6-trophy-guide — Leonida Trophy Ledger

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sasukevaizen/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sasukevaizen/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Offline static web app, walkthrough guide, Platinum roadmap, and progress tracker covering all **55 official PlayStation 5 trophies** of *Grand Theft Auto VI* (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden, 27 visible; 0 online). Built for the [make.fun "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## Features

- **Complete 55-Trophy Official Dataset (`app/data/trophies.json`)** — Cross-checked against PSNProfiles and Exophase (exact official names, descriptions, grades, hidden flags, and PSN progress targets).
- **Original Cited Walkthroughs** — Every trophy includes an original guide (what to do, where/how, when), step-by-step checklist, interactive PSN counter stepper where applicable, missable status, and clickable source citations.
- **Missable Alert** — Flags **Positive Mental Attitude** as *possibly missable — unconfirmed* (Chapter 1 balcony meditation at Jason's house, per PowerPyx and GTABase), while marking all other 54 trophies as earnable in post-story free roam.
- **6-Stage Platinum Roadmap** — Ordered path from Chapter 1 story + early missable watch through Strangers & Freaks, collectibles/meditations, activities/ranges/races, heists/secrets/economy, and 100% completion (`A Long Road`) to the Platinum (`Vice Got a Price!`).
- **Spoiler Shield** — When ON, blurs unearned story and hidden trophy names/descriptions until marked earned or explicitly peeked; when OFF, reveals all 55 entries cleanly.
- **Rich Filtering & Search** — Filter by grade, kind (`story`, `side`, `secret`, `misc`), focus category (`missable`, `collectibles`, `activities`, `strangers`, `heists`, `online`), hidden-only toggle, earned status, and instant full-text search.
- **Offline Persistence + Backup** — Saves earned checkmarks, PSN counters, and spoiler settings in `localStorage`, with one-click **Export JSON**, **Import JSON**, and **Reset**.
- **100% Offline, Zero External Requests** — Plain HTML/CSS/ES modules inside `app/` (~16 KB gzipped first load), no build step, no CDN, no external fonts, no analytics, no Rockstar logos or official artwork.

## Data Sources

- **PSNProfiles** — Official PS5 trophy list & progress targets: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- **Exophase** — Official PS5 trophy list & hidden flags: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- **PowerPyx** — Trophy guide, 100% completion checklist, and Chapter 1 meditation missable alert: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- **GTABase** — Trophy guide & achievements reference: https://www.gtabase.com/grand-theft-auto-vi/guides/gta-6-trophy-guide-achievements-list

## How to Run

Requires **Node.js 22.18+** (standard library only, no `npm install`).

### Run the offline app locally

```sh
node serve.ts
```

Then open `http://127.0.0.1:8080` in desktop Chrome (works with the network completely off).

### Build the submission output (`out/`)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` using the unmodified `vendor/makefun-frontend.ts`.

## License

MIT — see [LICENSE](./LICENSE).
