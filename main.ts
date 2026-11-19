// Leonida Trophy Ledger (Pixel Dusk Edition) — make.fun entry builder.
// Runs on Node 22+ standard library only; produces deterministic out/ + dossier.json.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const TARGET_OUT = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const GATE_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

function mirrorDirectory(src: string, dest: string): void {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dest, { recursive: true });
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true });
  }
}

function buildEntry(): void {
  mkdirSync(TARGET_OUT, { recursive: true });
  mirrorDirectory(join(ROOT_DIR, 'app'), join(TARGET_OUT, 'app'));
  mirrorDirectory(join(ROOT_DIR, 'screenshots'), join(TARGET_OUT, 'screenshots'));

  const dossierPayload = buildDossier(TARGET_OUT, GATE_LIMITS);
  writeFileSync(join(TARGET_OUT, 'dossier.json'), dossierPayload);
}

buildEntry();
