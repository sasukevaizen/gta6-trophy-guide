// Leonida Trophy Ledger — make.fun entry program (Node 22, standard library only).
// Copies the offline static app/ and real browser screenshots/ to MAKEFUN_OUTPUT_DIR (default /output)
// and emits a deterministic dossier.json via the unmodified vendored makefun-frontend library.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

function copyCleanDirectory(sourceDir: string, targetDir: string): void {
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }
  mkdirSync(targetDir, { recursive: true });
  if (existsSync(sourceDir)) {
    cpSync(sourceDir, targetDir, { recursive: true });
  }
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyCleanDirectory(join(REPO_ROOT, 'app'), join(OUTPUT_DIR, 'app'));
  copyCleanDirectory(join(REPO_ROOT, 'screenshots'), join(OUTPUT_DIR, 'screenshots'));

  const dossierJson = buildDossier(OUTPUT_DIR, DOSSIER_LIMITS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossierJson);
}

main();
