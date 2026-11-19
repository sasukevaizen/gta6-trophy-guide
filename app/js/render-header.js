// Header renderer: SVG completion ring, per-grade counters, and spoiler toggle button state.

import { el } from './dom.js';
import { computeGradeCounts } from './filters.js';

const RING_CIRCUMFERENCE = 2 * Math.PI * 28;

export function renderHeader(trophies, state) {
  const total = trophies.length;
  const earnedCount = state.earned.size;
  const pct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

  const arc = document.getElementById('progress-ring-arc');
  const offset = RING_CIRCUMFERENCE * (1 - earnedCount / Math.max(total, 1));
  arc.setAttribute('stroke-dasharray', RING_CIRCUMFERENCE.toFixed(2));
  arc.setAttribute('stroke-dashoffset', offset.toFixed(2));

  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-frac').textContent = `${earnedCount}/${total}`;

  const gradeCounts = computeGradeCounts(trophies, state.earned);
  const summaryHost = document.getElementById('grade-summary');
  const shortMap = { platinum: 'PLT', gold: 'GLD', silver: 'SLV', bronze: 'BRZ' };
  summaryHost.replaceChildren(
    ...(['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
      const stats = gradeCounts[grade];
      const fullLabel = grade.charAt(0).toUpperCase() + grade.slice(1);
      return el(
        'span',
        { className: 'grade-pill', title: `${fullLabel}: ${stats.earned} of ${stats.total} earned` },
        el('span', { className: `grade-dot ${grade}` }),
        el('span', { text: `${shortMap[grade]} ${stats.earned}/${stats.total}` }),
      );
    })),
  );

  const spoilerBtn = document.getElementById('btn-spoiler');
  spoilerBtn.textContent = state.spoilerShield ? 'Spoiler Shield: ON' : 'Spoiler Shield: OFF';
  spoilerBtn.setAttribute('aria-pressed', String(state.spoilerShield));
  spoilerBtn.className = `btn ${state.spoilerShield ? 'btn-spoiler-on' : 'btn-spoiler-off'}`;

  const spoilerHint = document.getElementById('spoiler-hint');
  spoilerHint.textContent = state.spoilerShield
    ? 'Spoiler Shield ON · Unearned story & hidden trophies blurred'
    : 'Spoiler Shield OFF · All 55 official names & descriptions visible';
}
