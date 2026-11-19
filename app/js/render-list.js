// Renders the filtered trophy checklist rows with grade badges, tags, counters, and spoiler blur.

import { el, gradeShortLabel } from './dom.js';
import { isTrophySpoiled } from './filters.js';

function createTrophyRow(trophy, state, handlers) {
  const earned = state.earned.has(trophy.id);
  const spoiled = isTrophySpoiled(trophy, state);
  const selected = state.selectedId === trophy.id;
  const counterVal = state.counters[String(trophy.id)] ?? 0;

  const checkbox = el('input', {
    type: 'checkbox',
    className: 'trophy-check',
    checked: earned,
    'aria-label': `Mark ${trophy.name} earned`,
    onClick: (e) => e.stopPropagation(),
    onChange: () => handlers.onToggleEarned(trophy.id),
  });

  const nameSpan = el('span', {
    className: `trophy-name${spoiled ? ' spoiler-blur' : ''}`,
    text: trophy.name,
  });

  const descP = el('p', {
    className: `trophy-desc${spoiled ? ' spoiler-blur' : ''}`,
    text: trophy.description,
  });

  const mainCol = el(
    'div',
    { className: 'trophy-main' },
    el(
      'div',
      { className: 'trophy-name-line' },
      nameSpan,
      trophy.missable ? el('span', { className: 'tag tag-missable', text: 'Possibly Missable' }) : null,
      trophy.hidden ? el('span', { className: 'tag tag-hidden', text: spoiled ? 'Hidden · Spoiled' : 'Hidden' }) : null,
    ),
    descP,
  );

  const tagCol = el(
    'div',
    { className: 'trophy-tags' },
    el('span', { className: 'tag tag-kind', text: trophy.kind }),
    trophy.targetCount
      ? el('span', {
          className: 'tag tag-counter',
          text: `${earned ? trophy.targetCount : counterVal}/${trophy.targetCount}`,
        })
      : null,
  );

  const rowClasses = ['trophy-row'];
  if (selected) rowClasses.push('is-selected');
  if (earned) rowClasses.push('is-earned');

  return el(
    'article',
    {
      className: rowClasses.join(' '),
      role: 'listitem',
      tabindex: '0',
      dataset: { trophyId: String(trophy.id), kind: trophy.kind, hidden: String(trophy.hidden) },
      onClick: () => handlers.onSelect(trophy.id),
      onKeydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlers.onSelect(trophy.id);
        }
      },
    },
    checkbox,
    el('span', { className: `grade-badge ${trophy.grade}`, text: gradeShortLabel(trophy.grade) }),
    mainCol,
    tagCol,
  );
}

export function renderTrophyList(filtered, totalCount, state, handlers) {
  const listHost = document.getElementById('trophy-list');
  const countEl = document.getElementById('results-count');
  countEl.textContent = `Showing ${filtered.length} of ${totalCount} trophies`;

  if (filtered.length === 0) {
    const emptyMsg =
      state.filters.category === 'online'
        ? '0 online trophies — all 55 official GTA VI PS5 trophies are single-player and earnable offline.'
        : 'No trophies match your active filters. Try clearing filters or broadening your search.';
    listHost.replaceChildren(
      el(
        'div',
        { className: 'empty-state' },
        el('p', { text: emptyMsg }),
        el('button', {
          className: 'btn',
          type: 'button',
          text: 'Reset Filters',
          onClick: handlers.onClearFilters,
        }),
      ),
    );
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const trophy of filtered) {
    fragment.append(createTrophyRow(trophy, state, handlers));
  }
  listHost.replaceChildren(fragment);
}
