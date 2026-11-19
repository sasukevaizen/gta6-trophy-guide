// Pure filter, search, spoiler-shield, and progress aggregation utilities.

export function isTrophyShielded(trophy, state) {
  if (!state.spoilerShield) return false;
  if (state.earnedIds.includes(trophy.id)) return false;
  if (state.revealedIds.includes(trophy.id)) return false;
  return trophy.kind === 'story' || trophy.hidden === true;
}

export function getEffectiveCounter(trophy, state) {
  if (!trophy.targetCount) return 0;
  if (trophy.id === 1) {
    // Platinum tracks all 54 other trophies live
    return state.earnedIds.filter((id) => id !== 1).length;
  }
  if (state.earnedIds.includes(trophy.id)) {
    return trophy.targetCount;
  }
  const saved = Number(state.counters[trophy.id] || 0);
  return Math.max(0, Math.min(trophy.targetCount, saved));
}

export function filterTrophies(trophies, filters, state) {
  const query = (filters.search || '').trim().toLowerCase();

  return trophies.filter((trophy) => {
    const earned = state.earnedIds.includes(trophy.id);

    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !earned) return false;
    if (filters.status === 'unearned' && earned) return false;
    if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
    if (filters.hiddenOnly && !trophy.hidden) return false;

    if (filters.focus !== 'all') {
      if (filters.focus === 'missable') {
        if (!trophy.missable) return false;
      } else if (filters.focus === 'online') {
        if (!trophy.online) return false;
      } else if (!Array.isArray(trophy.focus) || !trophy.focus.includes(filters.focus)) {
        return false;
      }
    }

    if (query) {
      const shielded = isTrophyShielded(trophy, state);
      const haystack = shielded
        ? `${trophy.kind} ${trophy.grade} hidden stage ${trophy.roadmapStage}`
        : `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind} ${trophy.grade} ${(trophy.focus || []).join(' ')}`;
      if (!haystack.toLowerCase().includes(query)) return false;
    }

    return true;
  });
}

export function countProgressByGrade(trophies, earnedIds) {
  const earnedSet = new Set(earnedIds);
  const totals = {
    platinum: { earned: 0, total: 0 },
    gold: { earned: 0, total: 0 },
    silver: { earned: 0, total: 0 },
    bronze: { earned: 0, total: 0 },
  };
  for (const t of trophies) {
    if (!totals[t.grade]) continue;
    totals[t.grade].total += 1;
    if (earnedSet.has(t.id)) totals[t.grade].earned += 1;
  }
  return totals;
}

export function computeStageProgress(trophies, stageId, earnedIds) {
  const earnedSet = new Set(earnedIds);
  const stageTrophies = trophies.filter((t) => t.roadmapStage === stageId);
  const done = stageTrophies.filter((t) => earnedSet.has(t.id)).length;
  const total = stageTrophies.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent, trophies: stageTrophies };
}
