// Leonida Trophy Ledger — Main Application Bootstrap, Checklist, Boot & Retro Animation Loop

import { renderDossier } from './dossier.js';
import { countProgressByGrade, filterTrophies, getEffectiveCounter, isTrophyShielded } from './filters.js';
import { animateRoadmapThumbs, renderRoadmap } from './roadmap.js';
import {
  drawHeroScene,
  drawPixelText,
  drawPostcardScene,
  getIconSvg,
  getMedalSvg,
  paintPanelHeadings,
  paintStaticSprites,
  spawnSparkleBurst,
} from './sprites.js';
import {
  createDefaultState,
  exportProgressJson,
  loadPersistedState,
  savePersistedState,
  validateImportPayload,
} from './store.js';

const HERO_TITLE_TEXT = 'LEONIDA TROPHY LEDGER';

const filters = {
  search: '',
  grade: 'all',
  status: 'all',
  kind: 'all',
  focus: 'all',
  hiddenOnly: false,
};

let dataset = null;
let state = loadPersistedState();
let prevGradeCounts = null;
let resetArmedTimer = null;
let toastTimer = null;
let animFrame = 0;
let bootDone = false;

const els = {
  heroBanner: document.getElementById('heroBanner'),
  heroScene: document.getElementById('heroScene'),
  heroTitle: document.getElementById('heroTitle'),
  postcardCanvas: document.getElementById('postcardCanvas'),
  heroProgress: document.getElementById('heroProgress'),
  heroCount: document.getElementById('heroCount'),
  heroPercent: document.getElementById('heroPercent'),
  heroBarWrap: document.getElementById('heroBarWrap'),
  heroBarFill: document.getElementById('heroBarFill'),
  gradeStrip: document.getElementById('gradeStrip'),
  platinumBand: document.getElementById('platinumBand'),
  spoilerToggleBtn: document.getElementById('spoilerToggleBtn'),
  spoilerBtnIcon: document.getElementById('spoilerBtnIcon'),
  spoilerBtnLabel: document.getElementById('spoilerBtnLabel'),
  spoilerStatusFlag: document.getElementById('spoilerStatusFlag'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFileInput: document.getElementById('importFileInput'),
  resetBtn: document.getElementById('resetBtn'),
  toastBand: document.getElementById('toastBand'),
  tabChecklist: document.getElementById('tabChecklist'),
  tabRoadmap: document.getElementById('tabRoadmap'),
  viewChecklist: document.getElementById('viewChecklist'),
  viewRoadmap: document.getElementById('viewRoadmap'),
  roadmapRoot: document.getElementById('roadmapRoot'),
  checklistCountMeta: document.getElementById('checklistCountMeta'),
  searchInput: document.getElementById('searchInput'),
  gradeSelect: document.getElementById('gradeSelect'),
  statusSelect: document.getElementById('statusSelect'),
  kindChipBar: document.getElementById('kindChipBar'),
  focusChipBar: document.getElementById('focusChipBar'),
  hiddenOnlyChip: document.getElementById('hiddenOnlyChip'),
  showingCountText: document.getElementById('showingCountText'),
  spoilerHintText: document.getElementById('spoilerHintText'),
  trophyList: document.getElementById('trophyList'),
  dossierBody: document.getElementById('dossierBody'),
};

function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, isError = false) {
  if (toastTimer) window.clearTimeout(toastTimer);
  els.toastBand.textContent = message;
  els.toastBand.className = `toast-band is-entering${isError ? ' is-error' : ''}`;
  els.toastBand.hidden = false;
  toastTimer = window.setTimeout(() => {
    els.toastBand.hidden = true;
    toastTimer = null;
  }, 4500);
}

function triggerPlatinumCelebration() {
  els.platinumBand.classList.add('is-live');
  const chips = [...els.gradeStrip.querySelectorAll('.grade-chip')];
  chips.forEach((chip, idx) => {
    window.setTimeout(() => {
      chip.classList.remove('is-bouncing');
      void chip.offsetWidth;
      chip.classList.add('is-bouncing');
    }, idx * 80);
  });
  const rect = els.heroBanner.getBoundingClientRect();
  spawnSparkleBurst(rect.left + rect.width * 0.25, rect.top + rect.height * 0.5, 12);
  spawnSparkleBurst(rect.left + rect.width * 0.65, rect.top + rect.height * 0.45, 12);
}

function renderHeroProgress(animateCountUp = false) {
  const earnedCount = state.earnedIds.length;
  const total = dataset.trophies.length;
  const pct = Math.round((earnedCount / total) * 100);
  const byGrade = countProgressByGrade(dataset.trophies, state.earnedIds);

  const isComplete = earnedCount === total;
  els.heroProgress.classList.toggle('is-complete', isComplete);
  els.heroBarWrap.setAttribute('aria-valuenow', String(earnedCount));
  els.heroBarFill.style.width = `${pct}%`;

  const wasHidden = els.platinumBand.hidden;
  els.platinumBand.hidden = !isComplete;
  if (isComplete && wasHidden && bootDone) {
    triggerPlatinumCelebration();
  } else if (isComplete) {
    els.platinumBand.classList.add('is-live');
  }

  if (animateCountUp && earnedCount > 0 && !prefersReducedMotion()) {
    let step = 0;
    const totalSteps = 6;
    const timer = window.setInterval(() => {
      step += 1;
      const cur = Math.round((earnedCount * step) / totalSteps);
      const curPct = Math.round((cur / total) * 100);
      els.heroCount.textContent = `${cur}/${total}`;
      els.heroPercent.textContent = `${curPct}% OF LEONIDA CLAIMED`;
      if (step >= totalSteps) window.clearInterval(timer);
    }, 65);
  } else {
    els.heroCount.textContent = `${earnedCount}/${total}`;
    els.heroPercent.textContent = `${pct}% OF LEONIDA CLAIMED`;
  }

  const labelMap = {
    platinum: `PLT ${byGrade.platinum.earned}/${byGrade.platinum.total}`,
    gold: `GLD ${byGrade.gold.earned}/${byGrade.gold.total}`,
    silver: `SLV ${byGrade.silver.earned}/${byGrade.silver.total}`,
    bronze: `BRZ ${byGrade.bronze.earned}/${byGrade.bronze.total}`,
  };

  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const chip = els.gradeStrip.querySelector(`.grade-chip[data-grade="${grade}"]`);
    if (!chip) continue;
    const textEl = chip.querySelector('.grade-text');
    if (textEl) textEl.textContent = labelMap[grade];

    if (prevGradeCounts && prevGradeCounts[grade] !== byGrade[grade].earned) {
      chip.classList.remove('is-bouncing');
      void chip.offsetWidth;
      chip.classList.add('is-bouncing');
    }
  }
  prevGradeCounts = {
    platinum: byGrade.platinum.earned,
    gold: byGrade.gold.earned,
    silver: byGrade.silver.earned,
    bronze: byGrade.bronze.earned,
  };
}

function renderSpoilerControls() {
  const on = state.spoilerShield;
  els.spoilerToggleBtn.classList.toggle('is-on', on);
  els.spoilerToggleBtn.setAttribute('aria-pressed', String(on));
  els.spoilerBtnLabel.textContent = on ? 'SPOILER SHIELD: ON' : 'SPOILER SHIELD: OFF';
  els.spoilerBtnIcon.innerHTML = on ? getIconSvg('shield', 15) : '';
  els.spoilerStatusFlag.hidden = !on || state.activeTab !== 'checklist';
  els.spoilerHintText.textContent = on
    ? 'Spoiler Shield ON · unearned story & hidden blurred'
    : 'Spoiler Shield OFF · all names visible';
}

function renderFilterChipsState() {
  els.kindChipBar.querySelectorAll('[data-kind]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.kind === filters.kind && filters.focus !== 'missable');
  });
  const missableShortcut = els.kindChipBar.querySelector('[data-focus-shortcut="missable"]');
  if (missableShortcut) {
    missableShortcut.classList.toggle('is-active', filters.focus === 'missable');
  }
  els.hiddenOnlyChip.classList.toggle('is-active', filters.hiddenOnly);
  els.hiddenOnlyChip.setAttribute('aria-pressed', String(filters.hiddenOnly));

  els.focusChipBar.querySelectorAll('[data-focus]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.focus === filters.focus);
  });
}

function renderChecklist(options = {}) {
  const matched = filterTrophies(dataset.trophies, filters, state);
  els.showingCountText.textContent = `Showing ${matched.length} of ${dataset.trophies.length} trophies`;
  els.checklistCountMeta.textContent = `${matched.length} ${matched.length === 1 ? 'entry' : 'entries'}`;

  if (matched.length === 0) {
    const onlineNote = filters.focus === 'online'
      ? '<p class="empty-sub">Grand Theft Auto VI has 0 online trophies &mdash; all 55 are single-player.</p>'
      : '';
    els.trophyList.innerHTML = `
      <div class="empty-state">
        <span class="medal-slot empty-medal" style="width:46px;height:46px">${getMedalSvg('platinum', true, 46)}</span>
        <p>No trophies match &mdash; try clearing the search or filters</p>
        ${onlineNote}
        <button type="button" class="px-btn px-btn-primary" id="clearFiltersBtn">Clear filters</button>
      </div>
    `;
    const clearBtn = els.trophyList.querySelector('#clearFiltersBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);
    return;
  }

  const earnedSet = new Set(state.earnedIds);
  const rowsHtml = matched
    .map((trophy, idx) => {
      const earned = earnedSet.has(trophy.id);
      const selected = trophy.id === state.selectedId;
      const shielded = isTrophyShielded(trophy, state);
      const countVal = getEffectiveCounter(trophy, state);
      const medalHtml = getMedalSvg(trophy.grade, !earned, 46);
      const checkHtml = earned ? getIconSvg('check', 12) : '';

      const hiddenTag = trophy.hidden
        ? `<span class="hidden-badge">${shielded ? 'HIDDEN &middot; SPOILED' : 'HIDDEN'}</span>`
        : '';
      const missableTag = trophy.missable && !shielded
        ? `<span class="icon-slot" title="Possibly Missable — Unconfirmed">${getIconSvg('warning', 14)}</span>`
        : '';
      const progChip = trophy.targetCount
        ? `<span class="prog-chip">${countVal.toLocaleString('en-US')} / ${trophy.targetCount.toLocaleString('en-US')}</span>`
        : '';

      const popClass = options.toggledId === trophy.id
        ? (earned ? 'is-earn-pop' : 'is-unearn-pop')
        : '';
      const staggerClass = options.animateRows && idx < 12 ? 'is-stagger' : '';
      const delayStyle = options.animateRows && idx < 12 ? `style="animation-delay:${idx * 28}ms"` : '';

      return `
        <div class="trophy-row ${earned ? 'is-earned' : ''} ${selected ? 'is-selected' : ''} ${shielded ? 'is-shielded' : ''} ${staggerClass}"
             role="listitem" tabindex="0" data-trophy-id="${trophy.id}" ${delayStyle}>
          <button type="button" class="row-check" data-toggle-id="${trophy.id}"
                  aria-label="Mark ${escapeHtml(trophy.name)} ${earned ? 'unearned' : 'earned'}"
                  aria-pressed="${earned}">${checkHtml}</button>
          <span class="medal-slot ${popClass}" style="width:46px;height:46px">${medalHtml}</span>
          <div class="row-copy">
            <h3 class="row-title">
              <span class="${shielded ? 'spoiler-blur' : ''}">${escapeHtml(trophy.name)}</span>
              ${hiddenTag}
              ${missableTag}
            </h3>
            <p class="row-desc"><span class="${shielded ? 'spoiler-blur' : ''}">${escapeHtml(trophy.description)}</span></p>
          </div>
          <div class="row-meta">
            <div class="kind-label">${escapeHtml(trophy.kind.toUpperCase())}</div>
            ${progChip}
          </div>
        </div>
      `;
    })
    .join('');

  els.trophyList.innerHTML = rowsHtml;

  els.trophyList.querySelectorAll('.trophy-row').forEach((row) => {
    const id = Number(row.dataset.trophyId);
    row.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-toggle-id]')) return;
      selectTrophy(id);
    });
    row.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        selectTrophy(id);
      }
    });
  });

  els.trophyList.querySelectorAll('[data-toggle-id]').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const id = Number(btn.dataset.toggleId);
      const rect = btn.getBoundingClientRect();
      toggleEarned(id, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  });
}

function renderActiveDossier(options = {}) {
  const selected = dataset.trophies.find((t) => t.id === state.selectedId) || dataset.trophies[0];
  renderDossier(
    els.dossierBody,
    selected,
    state,
    {
      onToggleEarned: (id, x, y) => toggleEarned(id, x, y),
      onRevealSingle: (id) => revealSingleTrophy(id),
      onDisableShield: () => setSpoilerShield(false),
      onUpdateCounter: (id, val) => updateCounter(id, val),
      onToggleStep: (id, idx) => toggleDossierStep(id, idx),
    },
    options,
  );
}

function selectTrophy(id) {
  if (state.selectedId === id) return;
  state.selectedId = id;
  savePersistedState(state);
  renderChecklist();
  renderActiveDossier({ animateSwap: true });
}

function syncPlatinumAutoUnlock() {
  const othersEarned = state.earnedIds.filter((id) => id !== 1).length;
  if (othersEarned === 54 && !state.earnedIds.includes(1)) {
    state.earnedIds.push(1);
  } else if (othersEarned < 54 && state.earnedIds.includes(1)) {
    state.earnedIds = state.earnedIds.filter((id) => id !== 1);
  }
}

function toggleEarned(id, x = 0, y = 0) {
  const trophy = dataset.trophies.find((t) => t.id === id);
  if (!trophy) return;

  const already = state.earnedIds.includes(id);
  if (already) {
    state.earnedIds = state.earnedIds.filter((item) => item !== id);
    if (trophy.targetCount && state.counters[id] === trophy.targetCount) {
      state.counters[id] = Math.max(0, trophy.targetCount - 1);
    }
  } else {
    state.earnedIds.push(id);
    if (trophy.targetCount) state.counters[id] = trophy.targetCount;
    if (x && y) spawnSparkleBurst(x, y, 8);
  }

  if (id !== 1) syncPlatinumAutoUnlock();
  savePersistedState(state);
  renderHeroProgress();
  renderChecklist({ toggledId: id });
  renderActiveDossier();
  if (state.activeTab === 'roadmap') {
    renderRoadmap(els.roadmapRoot, dataset, state, jumpToTrophy, false);
  }
}

function updateCounter(id, newVal) {
  const trophy = dataset.trophies.find((t) => t.id === id);
  if (!trophy || !trophy.targetCount) return;

  const clamped = Math.max(0, Math.min(trophy.targetCount, newVal));
  state.counters[id] = clamped;

  if (clamped >= trophy.targetCount && !state.earnedIds.includes(id)) {
    state.earnedIds.push(id);
    syncPlatinumAutoUnlock();
  } else if (clamped < trophy.targetCount && state.earnedIds.includes(id)) {
    state.earnedIds = state.earnedIds.filter((item) => item !== id);
    syncPlatinumAutoUnlock();
  }

  savePersistedState(state);
  renderHeroProgress();
  renderChecklist();
  renderActiveDossier();
}

function toggleDossierStep(trophyId, stepIdx) {
  const existing = new Set(state.completedSteps[trophyId] || []);
  if (existing.has(stepIdx)) existing.delete(stepIdx);
  else existing.add(stepIdx);
  state.completedSteps[trophyId] = [...existing].sort((a, b) => a - b);
  savePersistedState(state);
  renderActiveDossier();
}

function revealSingleTrophy(id) {
  if (!state.revealedIds.includes(id)) {
    state.revealedIds.push(id);
    savePersistedState(state);
  }
  renderChecklist();
  renderActiveDossier({ justRevealed: true });
}

function setSpoilerShield(nextVal) {
  state.spoilerShield = Boolean(nextVal);
  savePersistedState(state);
  renderSpoilerControls();
  renderChecklist({ animateRows: true });
  renderActiveDossier({ animateSwap: true });
  if (state.activeTab === 'roadmap') {
    renderRoadmap(els.roadmapRoot, dataset, state, jumpToTrophy, false);
  }
}

function clearAllFilters() {
  filters.search = '';
  filters.grade = 'all';
  filters.status = 'all';
  filters.kind = 'all';
  filters.focus = 'all';
  filters.hiddenOnly = false;
  els.searchInput.value = '';
  els.gradeSelect.value = 'all';
  els.statusSelect.value = 'all';
  renderFilterChipsState();
  renderChecklist({ animateRows: true });
}

function switchTab(tabName, animate = true) {
  state.activeTab = tabName === 'roadmap' ? 'roadmap' : 'checklist';
  savePersistedState(state);

  const isChecklist = state.activeTab === 'checklist';
  els.tabChecklist.classList.toggle('is-active', isChecklist);
  els.tabChecklist.setAttribute('aria-selected', String(isChecklist));
  els.tabRoadmap.classList.toggle('is-active', !isChecklist);
  els.tabRoadmap.setAttribute('aria-selected', String(!isChecklist));

  if (animate) {
    const activeTabBtn = isChecklist ? els.tabChecklist : els.tabRoadmap;
    activeTabBtn.classList.remove('is-popping');
    void activeTabBtn.offsetWidth;
    activeTabBtn.classList.add('is-popping');
  }

  els.viewChecklist.hidden = !isChecklist;
  els.viewRoadmap.hidden = isChecklist;
  const activePane = isChecklist ? els.viewChecklist : els.viewRoadmap;
  if (animate) {
    activePane.classList.remove('is-swapping');
    void activePane.offsetWidth;
    activePane.classList.add('is-swapping');
  }

  renderSpoilerControls();
  if (!isChecklist) {
    renderRoadmap(els.roadmapRoot, dataset, state, jumpToTrophy, animate);
  }
}

function jumpToTrophy(id) {
  clearAllFilters();
  state.selectedId = id;
  savePersistedState(state);
  switchTab('checklist', true);
  renderChecklist();
  renderActiveDossier({ animateSwap: true });
  const row = els.trophyList.querySelector(`[data-trophy-id="${id}"]`);
  if (row) row.scrollIntoView({ block: 'nearest' });
}

function disarmResetButton() {
  if (resetArmedTimer) {
    window.clearTimeout(resetArmedTimer);
    resetArmedTimer = null;
  }
  els.resetBtn.classList.remove('is-confirming');
  els.resetBtn.textContent = 'RESET';
}

function handleResetClick() {
  if (!els.resetBtn.classList.contains('is-confirming')) {
    els.resetBtn.classList.add('is-confirming');
    els.resetBtn.textContent = 'Click again to confirm reset';
    resetArmedTimer = window.setTimeout(disarmResetButton, 3000);
    return;
  }
  disarmResetButton();
  const prevTab = state.activeTab;
  state = createDefaultState();
  state.activeTab = prevTab;
  savePersistedState(state);
  renderHeroProgress();
  renderSpoilerControls();
  renderChecklist({ animateRows: true });
  renderActiveDossier({ animateSwap: true });
  if (state.activeTab === 'roadmap') {
    renderRoadmap(els.roadmapRoot, dataset, state, jumpToTrophy, false);
  }
  showToast('Progress reset · 0/55 earned');
}

function bindEvents() {
  els.spoilerToggleBtn.addEventListener('click', () => setSpoilerShield(!state.spoilerShield));

  els.exportBtn.addEventListener('click', () => {
    exportProgressJson(state);
    showToast(`Progress exported · ${state.earnedIds.length}/55 earned`);
  });

  els.importBtn.addEventListener('click', () => {
    els.importFileInput.value = '';
    els.importFileInput.click();
  });

  els.importFileInput.addEventListener('change', async () => {
    const file = els.importFileInput.files && els.importFileInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = validateImportPayload(text);
      if (!result.ok) {
        showToast(`Import failed · ${result.reason}`, true);
        return;
      }
      state = result.state;
      savePersistedState(state);
      renderHeroProgress();
      renderSpoilerControls();
      renderChecklist({ animateRows: true });
      renderActiveDossier({ animateSwap: true });
      if (state.activeTab === 'roadmap') {
        renderRoadmap(els.roadmapRoot, dataset, state, jumpToTrophy, false);
      }
      showToast(`Progress imported · ${state.earnedIds.length}/55 earned`);
    } catch {
      showToast('Import failed · could not read file', true);
    }
  });

  els.resetBtn.addEventListener('click', handleResetClick);

  els.tabChecklist.addEventListener('click', () => switchTab('checklist', true));
  els.tabRoadmap.addEventListener('click', () => switchTab('roadmap', true));

  els.searchInput.addEventListener('input', () => {
    filters.search = els.searchInput.value;
    renderChecklist({ animateRows: true });
  });

  els.gradeSelect.addEventListener('change', () => {
    filters.grade = els.gradeSelect.value;
    renderChecklist({ animateRows: true });
  });

  els.statusSelect.addEventListener('change', () => {
    filters.status = els.statusSelect.value;
    renderChecklist({ animateRows: true });
  });

  els.kindChipBar.addEventListener('click', (ev) => {
    const kindBtn = ev.target.closest('[data-kind]');
    if (kindBtn) {
      filters.kind = kindBtn.dataset.kind;
      if (filters.focus === 'missable') filters.focus = 'all';
      renderFilterChipsState();
      renderChecklist({ animateRows: true });
      return;
    }
    const missShortcut = ev.target.closest('[data-focus-shortcut="missable"]');
    if (missShortcut) {
      filters.focus = filters.focus === 'missable' ? 'all' : 'missable';
      if (filters.focus === 'missable') filters.kind = 'all';
      renderFilterChipsState();
      renderChecklist({ animateRows: true });
    }
  });

  els.hiddenOnlyChip.addEventListener('click', () => {
    filters.hiddenOnly = !filters.hiddenOnly;
    renderFilterChipsState();
    renderChecklist({ animateRows: true });
  });

  els.focusChipBar.addEventListener('click', (ev) => {
    const focusBtn = ev.target.closest('[data-focus]');
    if (!focusBtn) return;
    filters.focus = focusBtn.dataset.focus;
    renderFilterChipsState();
    renderChecklist({ animateRows: true });
  });
}

function runBootSequence() {
  const reduced = prefersReducedMotion();
  drawPostcardScene(els.postcardCanvas, 0);

  if (reduced) {
    drawHeroScene(els.heroScene, 0, 10);
    drawPixelText(els.heroTitle, HERO_TITLE_TEXT, {
      scale: 5,
      face: '#ffffff',
      shadow: '#2a0a44',
      shadowX: 3,
      shadowY: 4,
    });
    bootDone = true;
    return;
  }

  // Stepped sky bands sweep + letter-by-letter title with blinking cursor
  let band = 2;
  let chars = 0;
  els.heroBanner.classList.add('boot-enter');
  document.querySelectorAll('.px-panel').forEach((panel, i) => {
    panel.classList.add('boot-enter', i === 0 ? 'boot-delay-1' : 'boot-delay-2');
  });

  const bootTimer = window.setInterval(() => {
    band = Math.min(10, band + 1);
    chars = Math.min(HERO_TITLE_TEXT.length, chars + 2);
    drawHeroScene(els.heroScene, 0, band);
    drawPixelText(els.heroTitle, HERO_TITLE_TEXT, {
      scale: 5,
      face: '#ffffff',
      shadow: '#2a0a44',
      shadowX: 3,
      shadowY: 4,
      visibleChars: chars,
      cursor: chars < HERO_TITLE_TEXT.length,
    });
    if (band >= 10 && chars >= HERO_TITLE_TEXT.length) {
      window.clearInterval(bootTimer);
      drawPixelText(els.heroTitle, HERO_TITLE_TEXT, {
        scale: 5,
        face: '#ffffff',
        shadow: '#2a0a44',
        shadowX: 3,
        shadowY: 4,
      });
      bootDone = true;
      startRetroAnimationLoop();
    }
  }, 55);
}

function startRetroAnimationLoop() {
  if (prefersReducedMotion()) return;
  window.setInterval(() => {
    animFrame = (animFrame + 1) % 240;
    drawHeroScene(els.heroScene, animFrame, 10);
    drawPostcardScene(els.postcardCanvas, animFrame);
    if (state.activeTab === 'roadmap') {
      animateRoadmapThumbs(els.roadmapRoot, animFrame);
    }
  }, 125); // 8 fps retro pixel cadence
}

async function init() {
  paintStaticSprites(document);
  paintPanelHeadings(document);

  const response = await fetch('./data/trophies.json');
  if (!response.ok) {
    throw new Error(`Failed to load trophies.json (${response.status})`);
  }
  dataset = await response.json();

  bindEvents();
  renderFilterChipsState();
  renderSpoilerControls();
  renderHeroProgress(true);
  renderChecklist({ animateRows: true });
  renderActiveDossier();
  switchTab(state.activeTab, false);
  runBootSequence();
}

init().catch((err) => {
  console.error(err);
  showToast('Could not load local trophy dataset.', true);
});
