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
  const isSingleSource = (trophy.citations || []).length === 1;
  const singleSourceChip = isSingleSource ? '<span class="meta-chip is-warn">SINGLE-SOURCE</span>' : '';
  const markBtnClass = earned ? 'px-btn px-btn-gold mark-earned-btn' : 'px-btn px-btn-primary mark-earned-btn';
  const markBtnLabel = earned ? 'Earned (Undo)' : 'Mark Earned';

  const registrySources = Array.isArray(options.sources) ? options.sources : [];
  const sourceByNum = new Map(registrySources.map((s) => [s.num, s]));
  const citedByNum = new Map((trophy.citations || []).map((c) => [c.sourceNum, c]));

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

    const activeFlags = [...(trophy.honestyFlags || [])];
    if (isSingleSource) {
      const onlyCite = trophy.citations[0];
      activeFlags.push({
        kind: 'single-source',
        title: 'SINGLE-SOURCE GUIDE',
        detail: `Current walkthrough rests on a single cited source (${onlyCite?.domain || 'listed source'}).`,
        cites: onlyCite?.sourceNum ? [onlyCite.sourceNum] : [],
      });
    }

    const honestyHtml = activeFlags.length > 0
      ? `
        <div class="honesty-flags-box" role="note" aria-label="Source honesty and discrepancy audit">
          <div class="honesty-head">
            <span class="icon-slot">${getIconSvg('warning', 14)}</span>
            <span>HONESTY &amp; SOURCE AUDIT</span>
          </div>
          <ul class="honesty-list">
            ${activeFlags.map((flag) => {
              const flagCites = (flag.cites || [])
                .map((n) => {
                  const reg = sourceByNum.get(n);
                  const tip = reg ? `[${n}] ${reg.name} (${reg.domain}, ${reg.readDate})` : `[${n}]`;
                  return `<span class="cite-chip" title="${escapeHtml(tip)}">[${n}]</span>`;
                })
                .join('');
              return `
                <li class="honesty-item">
                  <div class="honesty-item-head">
                    <strong>${escapeHtml(flag.title)}</strong>
                    ${flagCites ? `<span class="step-cites">${flagCites}</span>` : ''}
                  </div>
                  <p>${escapeHtml(flag.detail)}</p>
                </li>
              `;
            }).join('')}
          </ul>
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

    const matrixRows = registrySources.length > 0
      ? registrySources
      : (trophy.citations || []).map((c, idx) => ({
          num: c.sourceNum || idx + 1,
          name: c.label,
          domain: c.domain,
          url: c.url,
          readDate: c.readDate || 'read 19 Nov 2026',
        }));

    const sourceMatrixHtml = matrixRows
      .map((reg) => {
        const cite = citedByNum.get(reg.num);
        const isCited = Boolean(cite);
        const titleAttr = cite
          ? `${cite.label} (${reg.readDate})`
          : `${reg.name} — Source Registry (${reg.readDate})`;
        return `
          <a class="source-matrix-card ${isCited ? 'is-cited' : 'is-ref'}" href="${escapeHtml(cite?.url || reg.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(titleAttr)}">
            <div class="sm-top">
              <span class="sm-num">[${reg.num}]</span>
              <span class="sm-name">${escapeHtml(reg.name)}</span>
              <span class="sm-tag">${isCited ? 'CITED' : 'REF'}</span>
            </div>
            <div class="sm-meta">
              <span class="sm-domain">${escapeHtml(reg.domain)}</span>
              <span class="sm-date">${escapeHtml(reg.readDate || '')}</span>
            </div>
          </a>
        `;
      })
      .join('');

    const stepsHtml = (trophy.steps || [])
      .map((step, idx) => {
        const done = doneSteps.has(idx);
        const stepText = typeof step === 'string' ? step : step.text;
        const stepCites = typeof step === 'string' ? [] : (step.cites || []);
        const citesHtml = stepCites
          .map((n) => {
            const reg = sourceByNum.get(n);
            const tip = reg ? `[${n}] ${reg.name} (${reg.domain}, ${reg.readDate})` : `Source [${n}]`;
            return `<span class="cite-chip" title="${escapeHtml(tip)}">[${n}]</span>`;
          })
          .join('');
        return `
          <li class="step-item ${done ? 'is-done' : ''}" data-step-idx="${idx}" tabindex="0" role="checkbox" aria-checked="${done}">
            <span class="step-box" aria-hidden="true">${done ? getIconSvg('check', 11) : ''}</span>
            <span class="step-text">${escapeHtml(stepText)}</span>
            ${citesHtml ? `<span class="step-cites" aria-label="Step citations">${citesHtml}</span>` : ''}
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
      ${honestyHtml}
      ${psnHtml}
      <div class="dossier-section-label">SOURCE MATRIX</div>
      <div class="source-matrix">${sourceMatrixHtml}</div>
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
      ${singleSourceChip}
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
