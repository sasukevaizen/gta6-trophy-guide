// Main application entrypoint: loads trophies.json, wires events, and coordinates views.

import { filterTrophies } from './filters.js';
import { renderTrophyDetail } from './render-detail.js';
import { renderHeader } from './render-header.js';
import { renderTrophyList } from './render-list.js';
import { renderRoadmap } from './render-roadmap.js';
import {
  applyImportedPayload,
  buildExportPayload,
  loadPersistedState,
  persistState,
  resetAllProgress,
  setTrophyCounter,
  toggleTrophyEarned,
} from './state.js';

let dataset = null;
const state = loadPersistedState();
let toastTimer = null;

function showToast(message) {
  const el = document.getElementById('status-toast');
  el.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.textContent = '';
  }, 4000);
}

function syncFilterControls() {
  document.getElementById('search-input').value = state.filters.search;
  document.getElementById('filter-grade').value = state.filters.grade;
  document.getElementById('filter-status').value = state.filters.status;

  for (const btn of document.querySelectorAll('#kind-chips [data-kind]')) {
    btn.classList.toggle('is-active', btn.dataset.kind === state.filters.kind);
  }
  for (const btn of document.querySelectorAll('#category-chips [data-category]')) {
    btn.classList.toggle('is-active', btn.dataset.category === state.filters.category);
  }
  const hiddenBtn = document.getElementById('btn-hidden-only');
  hiddenBtn.classList.toggle('is-active', state.filters.hiddenOnly);
  hiddenBtn.setAttribute('aria-pressed', String(state.filters.hiddenOnly));
}

function syncTabs() {
  const isChecklist = state.activeTab === 'checklist';
  document.getElementById('tab-checklist').classList.toggle('is-active', isChecklist);
  document.getElementById('tab-checklist').setAttribute('aria-selected', String(isChecklist));
  document.getElementById('tab-roadmap').classList.toggle('is-active', !isChecklist);
  document.getElementById('tab-roadmap').setAttribute('aria-selected', String(!isChecklist));
  document.getElementById('view-checklist').classList.toggle('is-hidden', !isChecklist);
  document.getElementById('view-roadmap').classList.toggle('is-hidden', isChecklist);
}

function clearAllFilters() {
  state.filters = {
    grade: 'all',
    kind: 'all',
    category: 'all',
    hiddenOnly: false,
    status: 'all',
    search: '',
  };
  renderAll();
}

function renderAll() {
  if (!dataset) return;
  syncTabs();
  syncFilterControls();
  renderHeader(dataset.trophies, state);

  const filtered = filterTrophies(dataset.trophies, state);
  const selectedTrophy =
    dataset.trophies.find((t) => t.id === state.selectedId) || filtered[0] || dataset.trophies[0];

  renderTrophyList(filtered, dataset.trophies.length, state, {
    onToggleEarned: (id) => {
      toggleTrophyEarned(state, id);
      renderAll();
    },
    onSelect: (id) => {
      state.selectedId = id;
      persistState(state);
      renderAll();
    },
    onClearFilters: clearAllFilters,
  });

  renderTrophyDetail(selectedTrophy, state, {
    onToggleEarned: (id) => {
      toggleTrophyEarned(state, id);
      renderAll();
    },
    onUpdateCounter: (trophy, value) => {
      setTrophyCounter(state, trophy, value);
      renderAll();
    },
    onPeek: (id) => {
      state.peekedIds.add(id);
      renderAll();
    },
    onDisableSpoiler: () => {
      state.spoilerShield = false;
      persistState(state);
      renderAll();
      showToast('Spoiler Shield turned OFF');
    },
  });

  renderRoadmap(dataset, state, (trophyId) => {
    state.activeTab = 'checklist';
    state.selectedId = trophyId;
    clearAllFilters();
    persistState(state);
    renderAll();
    const row = document.querySelector(`[data-trophy-id="${trophyId}"]`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function triggerExport() {
  const payload = buildExportPayload(state, dataset.trophies);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Exported ${state.earned.size} earned trophies to JSON`);
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const count = applyImportedPayload(state, await file.text(), dataset.trophies);
    renderAll();
    showToast(`Imported progress (${count} earned trophies restored)`);
  } catch (err) {
    showToast(`Import failed: ${err instanceof Error ? err.message : 'invalid JSON'}`);
  } finally {
    event.target.value = '';
  }
}

function bindStaticEvents() {
  document.getElementById('tab-checklist').addEventListener('click', () => {
    state.activeTab = 'checklist';
    renderAll();
  });
  document.getElementById('tab-roadmap').addEventListener('click', () => {
    state.activeTab = 'roadmap';
    renderAll();
  });
  document.getElementById('btn-spoiler').addEventListener('click', () => {
    state.spoilerShield = !state.spoilerShield;
    if (state.spoilerShield) state.peekedIds.clear();
    persistState(state);
    renderAll();
    showToast(`Spoiler Shield ${state.spoilerShield ? 'ON' : 'OFF'}`);
  });
  document.getElementById('btn-export').addEventListener('click', triggerExport);
  document.getElementById('input-import').addEventListener('change', handleImportFile);
  document.getElementById('btn-reset').addEventListener('click', () => {
    resetAllProgress(state);
    renderAll();
    showToast('Progress reset to 0/55');
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderAll();
  });
  document.getElementById('filter-grade').addEventListener('change', (e) => {
    state.filters.grade = e.target.value;
    renderAll();
  });
  document.getElementById('filter-status').addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderAll();
  });
  document.getElementById('btn-clear-filters').addEventListener('click', clearAllFilters);

  document.getElementById('kind-chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-kind]');
    if (!btn) return;
    state.filters.kind = btn.dataset.kind;
    renderAll();
  });
  document.getElementById('category-chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    state.filters.category = btn.dataset.category;
    renderAll();
  });
  document.getElementById('btn-hidden-only').addEventListener('click', () => {
    state.filters.hiddenOnly = !state.filters.hiddenOnly;
    renderAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      state.activeTab = 'checklist';
      renderAll();
      document.getElementById('search-input').focus();
    }
  });
}

async function boot() {
  bindStaticEvents();
  const response = await fetch('./data/trophies.json');
  if (!response.ok) {
    showToast('Failed to load trophies.json');
    return;
  }
  dataset = await response.json();
  renderAll();
}

boot();
