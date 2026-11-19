# PLAN.md — GTA VI Trophy Guide & Offline Tracker (`gta6-trophy-guide-01`)

Target bounty: **Build the best GTA 6 trophy guide** (`https://make.fun/bounty/gta6-trophy-guide-01`)
Deadline: `2026-11-21T11:00:00Z` (Sat Nov 21, 2026, 11:00 AM UTC)

## 1. Deliverables List

1. **Public GitHub repository** (under entrant account, created after competition opening) carrying:
   - `LICENSE` — OSI-approved MIT license (with `SPDX-License-Identifier: MIT`).
   - `main.ts` — Node 22 entrypoint (stdlib only) that copies `app/` and `screenshots/` to `MAKEFUN_OUTPUT_DIR` (default `/output`) and writes deterministic `dossier.json` via `buildDossier`.
   - `serve.ts` — Node 22 local static file server for `app/` (dev/testing convenience).
   - `vendor/makefun-frontend.ts` — byte-for-byte unmodified copy from kit `starter/vendor/makefun-frontend.ts`.
   - `app/` — static offline web app (zero external requests, zero build step, desktop Chrome):
     - `app/index.html`
     - `app/styles/theme.css`, `app/styles/layout.css`, `app/styles/components.css`
     - `app/js/state.js` (localStorage persistence, earned set, spoiler toggle, filters, export/import)
     - `app/js/filters.js` (grade, kind, category/quick filters, hidden-only, earned status, search)
     - `app/js/render-header.js` (SVG progress ring, per-grade counters, spoiler toggle, export/import)
     - `app/js/render-list.js` (trophy rows, grade colors, spoiler blur/reveal, checkboxes)
     - `app/js/render-detail.js` (trophy detail drawer: full guide, step list, missable banner, named source links)
     - `app/js/render-roadmap.js` (ordered Platinum roadmap stages, Chapter 1 missable warning, completion stats)
     - `app/js/app.js` (boot, data load, event wiring)
     - `app/data/trophies.json` (all 55 official PS5 trophies, verified against Exophase & PSNProfiles, original cited guides)
   - `screenshots/` — 4 real desktop Chrome screenshots (`1280×800`, JPEG ≤ 256 KiB each, cover first by name).
   - `README.md` — app overview, features, data sources, run instructions, and live make.fun badges (if GitHub submission).
   - `.makefun/owner.json` (if needed for GitHub owner verification).
2. **Verified output** (`out/dossier.json`, `out/app/`, `out/screenshots/`).
3. **Single submission** via `makefun.mjs` after all Phase 4 checks pass.

## 2. Target Repository File Tree

```text
.
├── LICENSE
├── PLAN.md
├── README.md
├── main.ts
├── serve.ts
├── vendor/
│   └── makefun-frontend.ts          # byte-for-byte copy from starter/vendor/makefun-frontend.ts
├── screenshots/
│   ├── 1-overview-guide.jpg         # Cover: progress ring, checklist, filters, open cited guide
│   ├── 2-roadmap-missables.jpg      # Ordered Platinum roadmap + Chapter 1 missable callout
│   ├── 3-spoiler-shield.jpg         # Spoiler Shield ON blurring unearned story/hidden trophies
│   └── 4-collectibles-filter.jpg    # Filtered view + secondary cited guide + export/import state
└── app/
    ├── index.html
    ├── data/
    │   └── trophies.json
    ├── styles/
    │   ├── theme.css
    │   ├── layout.css
    │   └── components.css
    └── js/
        ├── app.js
        ├── state.js
        ├── filters.js
        ├── render-header.js
        ├── render-list.js
        ├── render-detail.js
        └── render-roadmap.js
```

> Note: Before final commit/submission, pre-existing kit files (`RULES.txt`, `cli/`, `competition.yaml`, `harness/`, `kit.json`, `starter/`) must be removed from the submitted git tree so `transcripts_witnessed` and size checks pass cleanly.

## 3. Data Model (`app/data/trophies.json`)

Top-level JSON object:

```json
{
  "game": "Grand Theft Auto VI",
  "platform": "PlayStation 5",
  "version": "1.0",
  "summary": {
    "total": 55,
    "platinum": 1,
    "gold": 2,
    "silver": 6,
    "bronze": 46,
    "hidden": 28,
    "visible": 27,
    "online": 0,
    "missableNote": "Only 'Positive Mental Attitude' is flagged as possibly missable (unconfirmed; Chapter 1 meditation). All other 54 trophies are earnable in post-story free roam."
  },
  "roadmap": [
    {
      "stage": 1,
      "title": "Stage 1 — Story Campaign (Chapters 1–5) & Early Missable Watch",
      "goal": "...",
      "warning": "...",
      "trophyIds": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28]
    }
  ],
  "trophies": [
    {
      "id": 1,
      "name": "Vice Got a Price!",
      "description": "Congratulations! You're a Leonida Legend.",
      "grade": "platinum",
      "hidden": false,
      "kind": "misc",
      "categories": ["completion"],
      "targetCount": 54,
      "roadmapStage": 6,
      "missable": false,
      "missableStatus": "earnable-post-story",
      "missableNote": "Earnable in post-story free roam once all 54 other trophies are unlocked.",
      "when": "After completing all 54 other trophies",
      "guide": "Original multi-sentence walkthrough covering what to do, where/how, and when...",
      "steps": ["Step 1...", "Step 2..."],
      "sources": [
        { "title": "PSNProfiles — Grand Theft Auto VI Trophies", "url": "https://psnprofiles.com/..." },
        { "title": "Exophase — Grand Theft Auto VI Trophies", "url": "https://www.exophase.com/..." }
      ]
    }
  ]
}
```

### Hard Data Constraints
- Total trophies: **55** (`1` Platinum, `2` Gold, `6` Silver, `46` Bronze)
- Visibility split: **28** `hidden: true`, **27** `hidden: false`
- Known anchors:
  - Platinum: `"Vice Got a Price!"` (visible)
  - Gold: `"A Long Road"` (visible), `"You Gotta Know When to Get Off"` (hidden)
  - Silver: `"Cunning Stunts"`, `"The Shootist"`, `"Strangers & Freaks"`, `"Don't Touch My Deck"`, `"You WAiNKer!"`, `"Maximum Withdrawal"`
- Missable flag: ONLY `"Positive Mental Attitude"` flagged as `"possibly missable — unconfirmed"` (Chapter 1 meditation, per PowerPyx/GTABase). All other 54 trophies marked earnable in post-story free roam.
- Guide text: 100% original wording, never copied from any guide site; every trophy cites verified source URLs.

## 4. Phase Checklist

### Phase 0 — PLAN
- [x] Read the bounty brief twice (`RULES.txt` & `requirements.json`).
- [x] Create `PLAN.md` with deliverables list, file tree, data model, and checkbox steps.

### Phase 1 — DATA (`app/data/trophies.json`)
- [x] Cross-check all 55 official GTA VI PS5 trophies against Exophase and PSNProfiles (trusting PSNProfiles on any discrepancy), including exact hidden flags (`28 hidden`, `27 visible`) and target counts.
- [x] Research PowerPyx, GTABase, and other public guides for verified source URLs and facts (including the Chapter 1 meditation missable note for *Positive Mental Attitude*).
- [x] Author `app/data/trophies.json` with original guides (what to do, where/how, when), cited source URLs per trophy, roadmap stages, and exact missable flags.
- [x] Run hard validation check: 55 entries = 1P / 2G / 6S / 46B, 28 hidden / 27 visible, all anchors exact, zero blank guides, every trophy has source citations.

### Phase 2 — APP (`app/`)
- [x] Build static offline web app inside `app/` with ZERO external requests (no CDN, no external fonts, no analytics).
- [x] Implement trophy list (all 55, grade colors, hidden trophies obscured/indicated until revealed).
- [x] Implement trophy detail panel (click a trophy -> guide, steps, sources, missable flag).
- [x] Implement checklist (mark earned, localStorage persistence, progress % and per-grade counts, Export JSON, Import JSON, Reset).
- [x] Implement filters (by grade, by kind `story/side/secret/misc`, by category `missable/collectibles/activities`, hidden only, earned/not earned, plus text search).
- [x] Implement Spoiler Shield setting (ON = story & hidden trophies' names/descriptions blurred until earned; OFF = all readable).
- [x] Implement Platinum Roadmap section (ordered stages: story first, early Chapter 1 missable warning, side/collectibles/activities, 100% completion last).
- [x] Design custom clean dark UI with big readable rows and one SVG progress ring on the first screen (NO Rockstar logo, NO official artwork, NO game screenshots).
- [x] Keep code clean and modular (data in `trophies.json` only, small single-purpose JS functions, no duplicated logic, no dead code, no TODO stubs).

### Phase 3 — PACKAGE (repo root)
- [x] Copy `vendor/makefun-frontend.ts` byte-for-byte from `starter/vendor/makefun-frontend.ts` (do not edit).
- [x] Author `main.ts` (Node 22, stdlib only) at repo root writing `out/` (`app/`, `screenshots/`, `dossier.json`).
- [x] Add OSI-approved `LICENSE` (MIT) and `serve.ts`.
- [x] Capture 3–4 real desktop Chrome screenshots of the running app into `screenshots/` (≤ 256 KiB each, 1280×800).
- [x] Write `README.md` explaining the app, features, data sources, run instructions, and live make.fun badges.
- [x] Clean pre-existing kit files out of the repo tree and publish to a public GitHub repo under entrant account (`https://github.com/sasukevaizen/gta6-trophy-guide`).

### Phase 4 — VERIFY (all must pass before submitting)
- [x] Check 1: `app/data/trophies.json` parses; counts = 55 / 1P / 2G / 6S / 46B / 28 hidden / 27 visible.
- [x] Check 2: App opened from a fresh browser profile with network OFF: list renders, zero failed requests.
- [x] Check 3: Mark 3 trophies earned, reload: still marked. Export, reset, Import: marks restored.
- [x] Check 4: Spoiler ON: story trophies blurred; OFF: readable.
- [x] Check 5: Every filter returns sensible results; search finds `"Vice Got a Price!"`.
- [x] Check 6: `node main.ts` runs deterministically and produces `out/` without errors.
- [x] Check 7: `vendor/makefun-frontend.ts` unchanged (diff against kit copy is empty).
- [ ] Run `makefun.mjs check` against repo.

### Phase 5 — SUBMIT
- [ ] Seal recording and submit the entry through the kit ONCE (only after all Phase 4 checks PASS).
- [ ] Report back: repo URL, submission confirmation, and Phase 4 checklist results.
