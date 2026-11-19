// LocalStorage state management, progress counters, spoiler setting, and JSON export/import.

export const STORAGE_KEY = 'gta6-leonida-trophy-tracker-v1';

export function createDefaultState() {
  return {
    earned: new Set(),
    counters: {},
    spoilerShield: true,
    peekedIds: new Set(),
    activeTab: 'checklist',
    selectedId: 28,
    filters: {
      grade: 'all',
      kind: 'all',
      category: 'all',
      hiddenOnly: false,
      status: 'all',
      search: '',
    },
  };
}

export function loadPersistedState() {
  const state = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.earned)) {
      state.earned = new Set(parsed.earned.filter((id) => Number.isInteger(id)));
    }
    if (parsed.counters && typeof parsed.counters === 'object') {
      for (const [k, v] of Object.entries(parsed.counters)) {
        if (Number.isFinite(v) && v >= 0) state.counters[k] = Math.floor(v);
      }
    }
    if (typeof parsed.spoilerShield === 'boolean') {
      state.spoilerShield = parsed.spoilerShield;
    }
    if (Number.isInteger(parsed.selectedId)) {
      state.selectedId = parsed.selectedId;
    }
  } catch {
    return createDefaultState();
  }
  return state;
}

export function persistState(state) {
  const payload = {
    version: 1,
    earned: [...state.earned].sort((a, b) => a - b),
    counters: state.counters,
    spoilerShield: state.spoilerShield,
    selectedId: state.selectedId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function toggleTrophyEarned(state, trophyId) {
  if (state.earned.has(trophyId)) {
    state.earned.delete(trophyId);
  } else {
    state.earned.add(trophyId);
  }
  persistState(state);
}

export function setTrophyCounter(state, trophy, value) {
  const clamped = Math.max(0, Math.min(trophy.targetCount ?? value, Math.floor(value)));
  state.counters[String(trophy.id)] = clamped;
  if (trophy.targetCount && clamped >= trophy.targetCount) {
    state.earned.add(trophy.id);
  }
  persistState(state);
}

export function resetAllProgress(state) {
  state.earned.clear();
  state.counters = {};
  state.peekedIds.clear();
  persistState(state);
}

export function buildExportPayload(state, trophies) {
  const earnedNames = trophies
    .filter((t) => state.earned.has(t.id))
    .map((t) => t.name);
  return {
    app: 'leonida-trophy-ledger',
    version: 1,
    exportedAt: new Date().toISOString(),
    earnedIds: [...state.earned].sort((a, b) => a - b),
    earnedNames,
    counters: state.counters,
    spoilerShield: state.spoilerShield,
  };
}

export function applyImportedPayload(state, rawJson, trophies) {
  const parsed = JSON.parse(rawJson);
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const byName = new Map(trophies.map((t) => [t.name.toLowerCase(), t]));
  const nextEarned = new Set();

  if (Array.isArray(parsed)) {
    for (const entry of parsed) {
      if (typeof entry === 'number' && byId.has(entry)) nextEarned.add(entry);
      else if (typeof entry === 'string') {
        const match = byName.get(entry.toLowerCase());
        if (match) nextEarned.add(match.id);
      }
    }
  } else if (parsed && typeof parsed === 'object') {
    const idList = Array.isArray(parsed.earnedIds) ? parsed.earnedIds : Array.isArray(parsed.earned) ? parsed.earned : [];
    for (const id of idList) {
      if (Number.isInteger(id) && byId.has(id)) nextEarned.add(id);
    }
    if (Array.isArray(parsed.earnedNames)) {
      for (const name of parsed.earnedNames) {
        const match = byName.get(String(name).toLowerCase());
        if (match) nextEarned.add(match.id);
      }
    }
    if (parsed.counters && typeof parsed.counters === 'object') {
      const nextCounters = {};
      for (const [k, v] of Object.entries(parsed.counters)) {
        if (byId.has(Number(k)) && Number.isFinite(v) && v >= 0) {
          nextCounters[k] = Math.floor(v);
        }
      }
      state.counters = nextCounters;
    }
    if (typeof parsed.spoilerShield === 'boolean') {
      state.spoilerShield = parsed.spoilerShield;
    }
  } else {
    throw new Error('Unsupported JSON structure');
  }

  state.earned = nextEarned;
  persistState(state);
  return nextEarned.size;
}
