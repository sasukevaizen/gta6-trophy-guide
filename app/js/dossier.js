// Renders the Trophy Dossier detail panel with PSN counters, cited sources, guide, steps, and Spoiler Shield.

import { getEffectiveCounter, isTrophyShielded } from './filters.js';
import { getIconSvg, getMedalSvg, spawnSparkleBurst } from './sprites.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

let activeFillTimer = null;

export function renderDossier(container, trophy, state, callbacks, options = {}) {
  if (!container) return;
  if (activeFillTimer) {
    window.clearInterval(activeFillTimer);
    activeFillTimer = null;
  }

  if (!trophy) {
    container.innerHTML = '<p class="guide-text">Select any trophy from the checklist to open its walkthrough and cited sources.</p>';
    return;
  }

  const earned = state.earnedIds.includes(trophy.id);
  const shielded = isTrophyShielded(trophy, state);
  const currentCount = getEffectiveCounter(trophy, state);
  const targetCount = trophy.targetCount || 0;
  const pct = targetCount > 0 ? Math.min(100, Math.round((currentCount / targetCount) * 100)) : 0;
  const doneSteps = new Set(state.completedSteps[trophy.id] || []);

  const titleClass = shielded ? 'spoiler-blur' : (options.justRevealed ? 'is-just-revealed' : '');
  const medalHtml = getMedalSvg(trophy.grade, false, 46);
  const missableChip = trophy.missable
    ? `<span class="meta-chip is-warn"><span class="icon-slot">${getIconSvg('warning', 13)}</span>POSSIBLY MISSABLE</span>`
    : `<span class="meta-chip is-safe">${trophy.kind === 'story' ? 'STORY SAFE' : 'POST-STORY SAFE'}</span>`;

  const hiddenChip = trophy.hidden ? '<span class="meta-chip">HIDDEN ON PS5</span>' : '';
  const markBtnClass = earned ? 'px-btn px-btn-gold mark-earned-btn' : 'px-btn px-btn-primary mark-earned-btn';
  const markBtnLabel = earned ? 'Earned (Undo)' : 'Mark Earned';

  let bodyContent = '';

  if (shielded) {
    bodyContent = `
      <div class="shield-curtain">
        <span class="shield-sprite">${getIconSvg('shield', 62)}</span>
        <p><strong>Spoiler Shield is active</strong> for this unearned ${escapeHtml(trophy.kind)}/hidden trophy.<br>
        Reveal this trophy or turn Spoiler Shield OFF to read its walkthrough and cited sources.</p>
        <div class="shield-actions">
          <button type="button" class="px-btn px-btn-primary" id="revealSingleBtn">REVEAL THIS TROPHY</button>
          <button type="button" class="px-btn" id="disableShieldBtn">TURN SPOILER SHIELD OFF</button>
        </div>
      </div>
    `;
  } else {
    const alertHtml = trophy.missable
      ? `
        <div class="missable-alert-box">
          <span class="icon-slot">${getIconSvg('warning', 20)}</span>
          <div><strong>Missable Watch (Unconfirmed):</strong> ${escapeHtml(trophy.missableNote)}</div>
        </div>
      `
      : '';

    const isAutoPlatinum = trophy.id === 1;
    const psnHtml = targetCount > 0
      ? `
        <div class="psn-tracker">
          <div class="psn-top">
            <span id="psnLabelText">PSN Progress: ${formatNumber(currentCount)} / ${formatNumber(targetCount)} ${escapeHtml(trophy.targetUnit || '')}</span>
            ${isAutoPlatinum ? '<span class="kind-label">AUTO-TRACKED FROM CHECKLIST</span>' : `
              <span class="psn-steppers">
                <button type="button" class="stepper-btn" id="stepMinusBtn" aria-label="Decrease progress">&minus;1</button>
                <button type="button" class="stepper-btn" id="stepPlusBtn" aria-label="Increase progress">+1</button>
                <button type="button" class="stepper-btn is-max" id="stepMaxBtn" aria-label="Max progress">MAX</button>
              </span>
            `}
          </div>
          <div class="seg-bar gold-bar psn-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${targetCount}" aria-valuenow="${currentCount}">
            <span class="seg-fill" id="psnBarFill" style="width:${pct}%"></span>
          </div>
        </div>
      `
      : '';

    const citationsHtml = (trophy.citations || [])
      .map((src) => `
        <a class="source-link" href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(src.label)}</span>
          <span class="source-domain">${escapeHtml(src.domain)}</span>
        </a>
      `)
      .join('');

    const stepsHtml = (trophy.steps || [])
      .map((step, idx) => {
        const done = doneSteps.has(idx);
        return `
          <li class="step-item ${done ? 'is-done' : ''}" data-step-idx="${idx}" tabindex="0" role="checkbox" aria-checked="${done}">
            <span class="step-box" aria-hidden="true">${done ? getIconSvg('check', 11) : ''}</span>
            <span class="step-text">${escapeHtml(step)}</span>
          </li>
        `;
      })
      .join('');

    const guideParagraphsHtml = String(trophy.guide || '')
      .split(/\n\n+/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => `<p class="guide-text ${options.justRevealed ? 'is-just-revealed' : ''}">${escapeHtml(para)}</p>`)
      .join('');

    bodyContent = `
      ${alertHtml}
      ${psnHtml}
      <div class="dossier-section-label">CITED SOURCES</div>
      <div class="sources-list">${citationsHtml}</div>
      <div class="dossier-section-label">HOW TO UNLOCK &mdash; ORIGINAL GUIDE</div>
      ${guideParagraphsHtml}
      <p class="guide-when">TIMING: ${escapeHtml(trophy.when)}</p>
      <div class="dossier-section-label">STEP-BY-STEP CHECKLIST</div>
      <ul class="steps-list" id="dossierStepsList">${stepsHtml}</ul>
    `;
  }

  container.innerHTML = `
    <h2 class="dossier-title"><span class="${titleClass}">${escapeHtml(trophy.name)}</span></h2>
    <div class="dossier-quote"><span class="${titleClass}">&ldquo;${escapeHtml(trophy.description)}&rdquo;</span></div>
    <div class="dossier-chips">
      <span class="dossier-medal-wrap ${options.animateSwap ? 'is-shining' : ''}">
        <span class="medal-slot" style="width:46px;height:46px">${medalHtml}</span>
      </span>
      <span class="meta-chip">KIND: ${escapeHtml(trophy.kind.toUpperCase())}</span>
      <span class="meta-chip">STAGE ${trophy.roadmapStage}</span>
      ${hiddenChip}
      ${missableChip}
      <button type="button" class="${markBtnClass}" id="dossierMarkBtn">${markBtnLabel}</button>
    </div>
    ${bodyContent}
  `;

  if (options.animateSwap) {
    container.classList.remove('is-swapping');
    void container.offsetWidth;
    container.classList.add('is-swapping');
  }

  // Bind Dossier actions
  const markBtn = container.querySelector('#dossierMarkBtn');
  if (markBtn) {
    markBtn.addEventListener('click', (ev) => {
      const rect = markBtn.getBoundingClientRect();
      callbacks.onToggleEarned(trophy.id, rect.left + rect.width / 2, rect.top + rect.height / 2, ev);
    });
  }

  const revealBtn = container.querySelector('#revealSingleBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      const rect = revealBtn.getBoundingClientRect();
      spawnSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
      callbacks.onRevealSingle(trophy.id);
    });
  }

  const disableShieldBtn = container.querySelector('#disableShieldBtn');
  if (disableShieldBtn) {
    disableShieldBtn.addEventListener('click', () => callbacks.onDisableShield());
  }

  const minusBtn = container.querySelector('#stepMinusBtn');
  const plusBtn = container.querySelector('#stepPlusBtn');
  const maxBtn = container.querySelector('#stepMaxBtn');

  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      callbacks.onUpdateCounter(trophy.id, Math.max(0, currentCount - 1));
    });
  }
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      callbacks.onUpdateCounter(trophy.id, Math.min(targetCount, currentCount + 1));
    });
  }
  if (maxBtn) {
    maxBtn.addEventListener('click', () => {
      const bar = container.querySelector('#psnBarFill');
      const label = container.querySelector('#psnLabelText');
      if (currentCount >= targetCount) {
        callbacks.onUpdateCounter(trophy.id, targetCount);
        return;
      }
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !bar || !label) {
        callbacks.onUpdateCounter(trophy.id, targetCount);
        return;
      }
      let frameStep = 0;
      const totalSteps = 5;
      const startVal = currentCount;
      activeFillTimer = window.setInterval(() => {
        frameStep += 1;
        const val = Math.round(startVal + ((targetCount - startVal) * frameStep) / totalSteps);
        const stepPct = Math.min(100, Math.round((val / targetCount) * 100));
        bar.style.width = `${stepPct}%`;
        label.textContent = `PSN Progress: ${formatNumber(val)} / ${formatNumber(targetCount)} ${trophy.targetUnit || ''}`;
        if (frameStep >= totalSteps) {
          window.clearInterval(activeFillTimer);
          activeFillTimer = null;
          callbacks.onUpdateCounter(trophy.id, targetCount);
        }
      }, 55);
    });
  }

  container.querySelectorAll('.step-item').forEach((item) => {
    const toggle = () => {
      const idx = Number(item.dataset.stepIdx);
      callbacks.onToggleStep(trophy.id, idx);
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}
