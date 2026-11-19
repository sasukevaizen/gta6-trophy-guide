// Renders the ordered 6-stage Platinum Roadmap and early Chapter 1 missable warning.

import { el } from './dom.js';
import { computeStageProgress, isTrophySpoiled } from './filters.js';

function createStageCard(stage, trophyMap, state, onJumpToTrophy) {
  const progress = computeStageProgress(stage, state.earned);
  const pct = Math.round((progress.earned / Math.max(progress.total, 1)) * 100);

  const pills = stage.trophyIds
    .map((id) => trophyMap.get(id))
    .filter(Boolean)
    .map((trophy) => {
      const earned = state.earned.has(trophy.id);
      const spoiled = isTrophySpoiled(trophy, state);
      const cls = ['stage-pill'];
      if (earned) cls.push('is-earned');
      if (trophy.missable) cls.push('is-missable');

      return el(
        'button',
        {
          className: cls.join(' '),
          type: 'button',
          onClick: () => onJumpToTrophy(trophy.id),
        },
        el('span', { className: `grade-dot ${trophy.grade}` }),
        el('span', {
          className: spoiled ? 'spoiler-blur' : '',
          text: trophy.name,
        }),
        trophy.missable ? el('span', { text: '⚠' }) : null,
        earned ? el('span', { text: '✓' }) : null,
      );
    });

  return el(
    'article',
    { className: 'stage-card' },
    el(
      'div',
      { className: 'stage-head' },
      el(
        'div',
        {},
        el('span', { className: 'stage-num', text: `Stage ${stage.stage} of 6` }),
        el('h3', { text: stage.title }),
        el('p', { className: 'stage-sub', text: stage.subtitle }),
      ),
      el('span', { className: 'stage-count', text: `${progress.earned}/${progress.total} (${pct}%)` }),
    ),
    el('div', { className: 'counter-bar' }, el('div', { className: 'counter-bar-fill', style: `width: ${pct}%` })),
    el('p', { className: 'detail-guide-text', text: stage.orderNote }),
    stage.stage === 1
      ? el('div', { className: 'missable-box is-missable', style: 'margin-top: 0;', text: stage.warning })
      : el('div', { className: 'missable-box is-safe', style: 'margin-top: 0;', text: stage.warning }),
    el('ul', { className: 'stage-tips' }, ...(stage.tips || []).map((tip) => el('li', { text: tip }))),
    el('div', { className: 'stage-trophies' }, ...pills),
  );
}

export function renderRoadmap(data, state, onJumpToTrophy) {
  const host = document.getElementById('view-roadmap');
  const trophyMap = new Map(data.trophies.map((t) => [t.id, t]));

  const alertBanner = el(
    'div',
    { className: 'roadmap-banner' },
    el('h2', { text: 'Early Missable Alert — Positive Mental Attitude (Possibly Missable · Unconfirmed)' }),
    el('p', { text: data.summary.missableSummary }),
  );

  const statsStrip = el(
    'div',
    { className: 'roadmap-stats' },
    el('div', { className: 'stat-card' }, el('div', { className: 'stat-value', text: '55' }), el('div', { className: 'stat-label', text: '1P · 2G · 6S · 46B Official Trophies' })),
    el('div', { className: 'stat-card' }, el('div', { className: 'stat-value', text: '1*' }), el('div', { className: 'stat-label', text: 'Possibly Missable (Ch. 1 Meditation)' })),
    el('div', { className: 'stat-card' }, el('div', { className: 'stat-value', text: '28 / 27' }), el('div', { className: 'stat-label', text: 'Hidden vs. Visible on PS5' })),
    el('div', { className: 'stat-card' }, el('div', { className: 'stat-value', text: '0' }), el('div', { className: 'stat-label', text: 'Online Trophies Required' })),
  );

  const grid = el(
    'div',
    { className: 'roadmap-grid' },
    ...data.roadmap.map((stage) => createStageCard(stage, trophyMap, state, onJumpToTrophy)),
  );

  host.replaceChildren(alertBanner, statsStrip, grid);
}
