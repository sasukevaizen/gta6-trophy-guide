// Filtering, spoiler visibility rules, search matching, and progress aggregations.

export function isTrophySpoiled(trophy, state) {
  if (!state.spoilerShield) return false;
  if (state.earned.has(trophy.id)) return false;
  if (state.peekedIds.has(trophy.id)) return false;
  return trophy.kind === 'story' || trophy.hidden;
}

export function matchesFilters(trophy, state) {
  const { grade, kind, category, hiddenOnly, status, search } = state.filters;

  if (grade !== 'all' && trophy.grade !== grade) return false;
  if (kind !== 'all' && trophy.kind !== kind) return false;
  if (hiddenOnly && !trophy.hidden) return false;

  const earned = state.earned.has(trophy.id);
  if (status === 'earned' && !earned) return false;
  if (status === 'unearned' && earned) return false;

  if (category !== 'all') {
    if (category === 'missable' && !trophy.missable) return false;
    else if (category === 'online') return false;
    else if (category !== 'missable' && !(trophy.categories || []).includes(category)) return false;
  }

  const query = search.trim().toLowerCase();
  if (query) {
    const haystack = [
      trophy.name,
      trophy.description,
      trophy.guide,
      trophy.kind,
      trophy.grade,
      ...(trophy.categories || []),
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
}

export function filterTrophies(trophies, state) {
  return trophies.filter((trophy) => matchesFilters(trophy, state));
}

export function computeGradeCounts(trophies, earnedSet) {
  const counts = {
    platinum: { earned: 0, total: 0 },
    gold: { earned: 0, total: 0 },
    silver: { earned: 0, total: 0 },
    bronze: { earned: 0, total: 0 },
  };
  for (const t of trophies) {
    if (!counts[t.grade]) continue;
    counts[t.grade].total += 1;
    if (earnedSet.has(t.id)) counts[t.grade].earned += 1;
  }
  return counts;
}

export function computeStageProgress(stage, earnedSet) {
  const uniqueIds = [...new Set(stage.trophyIds)];
  const earned = uniqueIds.filter((id) => earnedSet.has(id)).length;
  return { earned, total: uniqueIds.length };
}
