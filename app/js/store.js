// Offline localStorage state manager with JSON export, strict import validation, and reset.

const STORAGE_KEY = 'leonida_pixel_dusk_ledger_v1';

export function createDefaultState() {
  return {
    version: 1,
    earnedIds: [],
    counters: {},
    completedSteps: {},
    spoilerShield: false,
    revealedIds: [],
    selectedId: 28,
    activeTab: 'checklist',
  };
}

export function loadPersistedState() {
  const fallback = createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed, fallback);
  } catch {
    return fallback;
  }
}

export function savePersistedState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      earnedIds: state.earnedIds,
      counters: state.counters,
      completedSteps: state.completedSteps,
      spoilerShield: state.spoilerShield,
      revealedIds: state.revealedIds,
      selectedId: state.selectedId,
      activeTab: state.activeTab,
    }));
  } catch {
    // Ignore storage quota / private-mode write blocks gracefully
  }
}

export function sanitizeState(input, base = createDefaultState()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return base;

  const earnedIds = Array.isArray(input.earnedIds)
    ? [...new Set(input.earnedIds.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 55))]
    : base.earnedIds;

  const revealedIds = Array.isArray(input.revealedIds)
    ? [...new Set(input.revealedIds.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 55))]
    : base.revealedIds;

  const counters = {};
  if (input.counters && typeof input.counters === 'object' && !Array.isArray(input.counters)) {
    for (const [k, v] of Object.entries(input.counters)) {
      const id = Number(k);
      const val = Number(v);
      if (Number.isInteger(id) && id >= 1 && id <= 55 && Number.isFinite(val) && val >= 0) {
        counters[id] = Math.floor(val);
      }
    }
  }

  const completedSteps = {};
  if (input.completedSteps && typeof input.completedSteps === 'object' && !Array.isArray(input.completedSteps)) {
    for (const [k, v] of Object.entries(input.completedSteps)) {
      const id = Number(k);
      if (Number.isInteger(id) && id >= 1 && id <= 55 && Array.isArray(v)) {
        completedSteps[id] = [...new Set(v.map(Number).filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < 20))];
      }
    }
  }

  const selectedId = Number.isInteger(Number(input.selectedId)) && Number(input.selectedId) >= 1 && Number(input.selectedId) <= 55
    ? Number(input.selectedId)
    : base.selectedId;

  return {
    version: 1,
    earnedIds,
    counters,
    completedSteps,
    spoilerShield: Boolean(input.spoilerShield),
    revealedIds,
    selectedId,
    activeTab: input.activeTab === 'roadmap' ? 'roadmap' : 'checklist',
  };
}

export function exportProgressJson(state) {
  const payload = {
    app: 'Leonida Trophy Ledger',
    game: 'Grand Theft Auto VI (PS5)',
    exportedAt: new Date().toISOString(),
    version: 1,
    earnedIds: state.earnedIds,
    counters: state.counters,
    completedSteps: state.completedSteps,
    spoilerShield: state.spoilerShield,
    revealedIds: state.revealedIds,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-ledger-backup.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function validateImportPayload(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, reason: 'Invalid JSON syntax' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, reason: 'Backup must be a JSON object' };
  }
  if (!Array.isArray(parsed.earnedIds)) {
    return { ok: false, reason: 'Missing earnedIds array' };
  }
  const clean = sanitizeState(parsed, createDefaultState());
  return { ok: true, state: clean };
}
