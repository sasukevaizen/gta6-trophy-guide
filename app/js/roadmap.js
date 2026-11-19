// Renders the 6-stage Platinum Roadmap & Missables view with animated pixel route & stage postcards.

import { computeStageProgress, isTrophyShielded } from './filters.js';
import { drawStageThumb, getIconSvg, getMedalSvg } from './sprites.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderRoadmap(container, dataset, state, onOpenTrophy, animateOpen = false) {
  if (!container) return;

  const trophyById = new Map(dataset.trophies.map((t) => [t.id, t]));
  const earnedSet = new Set(state.earnedIds);

  const stagesHtml = dataset.roadmap
    .map((stage, idx) => {
      const progress = computeStageProgress(dataset.trophies, stage.id, state.earnedIds);
      const featured = (stage.featuredIds || [])
        .map((id) => trophyById.get(id))
        .filter(Boolean);

      const chipsHtml = featured
        .map((trophy) => {
          const earned = earnedSet.has(trophy.id);
          const shielded = isTrophyShielded(trophy, state);
          const medalHtml = getMedalSvg(trophy.grade, !earned, 24);
          const warnHtml = trophy.missable ? `<span class="icon-slot">${getIconSvg('warning', 13)}</span>` : '';
          return `
            <button type="button" class="stage-trophy-btn" data-jump-trophy="${trophy.id}">
              <span class="medal-slot" style="width:24px;height:24px">${medalHtml}</span>
              <span class="stage-trophy-name ${shielded ? 'spoiler-blur' : ''}">${escapeHtml(trophy.name)}</span>
              ${warnHtml}
            </button>
          `;
        })
        .join('');

      const delayStyle = animateOpen ? `style="animation-delay:${idx * 70}ms"` : '';
      return `
        <article class="stage-row">
          <div class="stage-sign ${animateOpen ? 'is-popping' : ''}" ${delayStyle}>
            <small>STAGE</small>
            <strong>${stage.id}</strong>
          </div>
          <div class="stage-card">
            <canvas class="stage-thumb" width="88" height="50" data-stage-scene="${escapeHtml(stage.scene)}" aria-hidden="true"></canvas>
            <div class="stage-body">
              <h3>${escapeHtml(stage.title)}</h3>
              <p>${escapeHtml(stage.summary)}</p>
              <div class="stage-prog">
                <div class="seg-bar gold-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.done}">
                  <span class="seg-fill" data-target-pct="${progress.percent}" style="width:${animateOpen ? 0 : progress.percent}%"></span>
                </div>
                <span class="stage-prog-label">${progress.done}/${progress.total} &middot; ${progress.percent}%</span>
              </div>
            </div>
            <div class="stage-chips">${chipsHtml}</div>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="roadmap-alert">
      <span class="icon-slot" aria-hidden="true">${getIconSvg('warning', 26)}</span>
      <div>
        <h2>Early Missable Alert &mdash; Positive Mental Attitude (Possibly Missable &middot; Unconfirmed)</h2>
        <p>Only &lsquo;Positive Mental Attitude&rsquo; is flagged as possibly missable &mdash; unconfirmed (Chapter 1 balcony meditation at Jason&rsquo;s house after &lsquo;Down to Earth&rsquo;, since GTA VI has no mission replay; per PowerPyx &amp; GTABase). All other 54 trophies are earnable in post-story free roam. Zero online trophies are required.</p>
      </div>
    </div>

    <div class="roadmap-stats">
      <div class="stat-tile">
        <div class="stat-value">55</div>
        <span class="stat-label">1P &middot; 2G &middot; 6S &middot; 46B Official Trophies</span>
      </div>
      <div class="stat-tile">
        <div class="stat-value is-gold">1 <span class="icon-slot">${getIconSvg('star-gold', 18)}</span></div>
        <span class="stat-label">Possibly Missable (Ch. 1 Meditation)</span>
      </div>
      <div class="stat-tile">
        <div class="stat-value">28 / 27</div>
        <span class="stat-label">Hidden vs. Visible on PS5</span>
      </div>
      <div class="stat-tile">
        <div class="stat-value">0</div>
        <span class="stat-label">Online Trophies Required</span>
      </div>
    </div>

    <div class="roadmap-route">
      <div class="route-track ${animateOpen ? 'is-drawing' : ''}" aria-hidden="true"></div>
      ${stagesHtml}
    </div>
  `;

  // Paint initial pixel thumbnails
  container.querySelectorAll('canvas[data-stage-scene]').forEach((cv) => {
    drawStageThumb(cv, cv.dataset.stageScene, 0);
  });

  // Stepped bar fill on roadmap open
  if (animateOpen) {
    const fills = [...container.querySelectorAll('.stage-prog .seg-fill')];
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      fills.forEach((f) => { f.style.width = `${f.dataset.targetPct}%`; });
    } else {
      let step = 0;
      const timer = window.setInterval(() => {
        step += 1;
        fills.forEach((f) => {
          const target = Number(f.dataset.targetPct || 0);
          f.style.width = `${Math.round((target * step) / 4)}%`;
        });
        if (step >= 4) window.clearInterval(timer);
      }, 75);
    }
  }

  // Clickable trophy chips jump straight to Checklist + Dossier
  container.querySelectorAll('[data-jump-trophy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onOpenTrophy(Number(btn.dataset.jumpTrophy));
    });
  });
}

export function animateRoadmapThumbs(container, frame) {
  if (!container) return;
  container.querySelectorAll('canvas[data-stage-scene]').forEach((cv) => {
    drawStageThumb(cv, cv.dataset.stageScene, frame);
  });
}
