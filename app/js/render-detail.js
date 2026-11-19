// Renders the selected trophy's full guide, steps, missable flag, PSN counter, and cited sources.

import { el, formatHost, gradeShortLabel } from './dom.js';
import { isTrophySpoiled } from './filters.js';

function renderCounterBox(trophy, state, handlers) {
  if (!trophy.targetCount) return null;
  const earned = state.earned.has(trophy.id);
  const current = earned ? trophy.targetCount : (state.counters[String(trophy.id)] ?? 0);
  const pct = Math.min(100, Math.round((current / trophy.targetCount) * 100));
  const step = trophy.targetCount >= 10000 ? 10000 : trophy.targetCount >= 100 ? 5 : 1;

  return el(
    'div',
    { className: 'counter-box' },
    el(
      'div',
      { className: 'counter-controls' },
      el('strong', { text: `PSN Progress: ${current.toLocaleString()} / ${trophy.targetCount.toLocaleString()} ${trophy.targetUnit || ''}` }),
      el(
        'div',
        { className: 'filter-row' },
        el('button', {
          className: 'btn',
          type: 'button',
          text: `-${step}`,
          onClick: () => handlers.onUpdateCounter(trophy, current - step),
        }),
        el('button', {
          className: 'btn',
          type: 'button',
          text: `+${step}`,
          onClick: () => handlers.onUpdateCounter(trophy, current + step),
        }),
        el('button', {
          className: 'btn btn-primary',
          type: 'button',
          text: 'Max',
          onClick: () => handlers.onUpdateCounter(trophy, trophy.targetCount),
        }),
      ),
    ),
    el('div', { className: 'counter-bar' }, el('div', { className: 'counter-bar-fill', style: `width: ${pct}%` })),
  );
}

function renderSources(sources) {
  return el(
    'div',
    { className: 'detail-section' },
    el('h3', { text: 'Cited Sources (Opens only when clicked)' }),
    el(
      'div',
      { className: 'source-list' },
      ...(sources || []).map((src) =>
        el(
          'div',
          { className: 'source-card' },
          el('a', {
            href: src.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            text: src.title,
          }),
          el('span', { className: 'source-host', text: formatHost(src.url) }),
        ),
      ),
    ),
  );
}

export function renderTrophyDetail(trophy, state, handlers) {
  const host = document.getElementById('trophy-detail');
  if (!trophy) {
    host.replaceChildren(el('div', { className: 'empty-state', text: 'Select any trophy to view its guide and sources.' }));
    return;
  }

  const earned = state.earned.has(trophy.id);
  const spoiled = isTrophySpoiled(trophy, state);

  const headerLeft = el(
    'div',
    {},
    el('h2', { className: `detail-title${spoiled ? ' spoiler-blur' : ''}`, text: trophy.name }),
    el('p', { className: `detail-official-desc${spoiled ? ' spoiler-blur' : ''}`, text: `“${trophy.description}”` }),
    el(
      'div',
      { className: 'detail-badges' },
      el('span', { className: `grade-badge ${trophy.grade}`, text: gradeShortLabel(trophy.grade) }),
      el('span', { className: 'tag tag-kind', text: `Kind: ${trophy.kind}` }),
      el('span', { className: 'tag tag-kind', text: `Roadmap Stage ${trophy.roadmapStage}` }),
      trophy.hidden ? el('span', { className: 'tag tag-hidden', text: 'Hidden on PS5' }) : null,
      trophy.missable
        ? el('span', { className: 'tag tag-missable', text: trophy.missableStatus })
        : el('span', { className: 'tag tag-safe', text: 'Post-Story Safe' }),
    ),
  );

  const earnBtn = el('button', {
    className: `btn ${earned ? 'btn-spoiler-off' : 'btn-primary'}`,
    type: 'button',
    text: earned ? 'Earned ✓' : 'Mark Earned',
    onClick: () => handlers.onToggleEarned(trophy.id),
  });

  if (spoiled) {
    host.replaceChildren(
      el('div', { className: 'detail-header' }, headerLeft, earnBtn),
      el(
        'div',
        { className: 'empty-state', style: 'margin-top: 14px;' },
        el('p', {
          text: 'Spoiler Shield is active for this unearned story/hidden trophy. Reveal this trophy or turn Spoiler Shield OFF to read its walkthrough.',
        }),
        el(
          'div',
          { className: 'filter-row', style: 'justify-content: center;' },
          el('button', {
            className: 'btn btn-primary',
            type: 'button',
            text: 'Reveal This Trophy',
            onClick: () => handlers.onPeek(trophy.id),
          }),
          el('button', {
            className: 'btn',
            type: 'button',
            text: 'Turn Spoiler Shield OFF',
            onClick: handlers.onDisableSpoiler,
          }),
        ),
      ),
    );
    return;
  }

  const missableBox = el(
    'div',
    { className: `missable-box ${trophy.missable ? 'is-missable' : 'is-safe'}` },
    el('strong', { text: trophy.missable ? 'Missable Watch: ' : 'Missable Status: ' }),
    trophy.missableNote,
  );

  const whenSection = el(
    'div',
    { className: 'detail-section' },
    el('h3', { text: 'When to Earn' }),
    el('p', { className: 'detail-guide-text', text: trophy.when }),
  );

  const guideSection = el(
    'div',
    { className: 'detail-section' },
    el('h3', { text: 'How to Unlock (Original Guide)' }),
    el('p', { className: 'detail-guide-text', text: trophy.guide }),
  );

  const stepsSection =
    Array.isArray(trophy.steps) && trophy.steps.length > 0
      ? el(
          'div',
          { className: 'detail-section' },
          el('h3', { text: 'Step-by-Step Checklist' }),
          el('ol', { className: 'detail-steps' }, ...trophy.steps.map((s) => el('li', { text: s }))),
        )
      : null;

  host.replaceChildren(
    el('div', { className: 'detail-header' }, headerLeft, earnBtn),
    missableBox,
    renderCounterBox(trophy, state, handlers),
    renderSources(trophy.sources),
    guideSection,
    whenSection,
    stepsSection,
  );
}
