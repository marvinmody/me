/**
 * Starfield Animation (Grey-proof)
 * - Hard-clears to pure black each frame (no trail haze).
 * - DPR-aware sizing to avoid blur/ghosting.
 * - Neutralizes parent opacity/blend that can introduce grey.
 */

"use strict";

// --- Controls ---
const ENABLE_TRAILS = false;   // true = ghost trails (reintroduces haze)
const TRAIL_ALPHA   = 0.08;    // only used when ENABLE_TRAILS = true

// Canvas + state
let starfieldCanvas;
let starfieldCtx;
let stars = [];
let starfieldMouseX = 0;
const numStars = 500;

// Name display variables (optional)
let nameElement;
let nameSpeed = 1;
let baseSpeed = 1;
let maxSpeed = 5;
let mouseDistance = 0;
let nameRect = null;
let animationSpeed = 1;

// Cache logical (CSS pixel) size each frame
let viewW = 0, viewH = 0;

// ---------- Math / Types ----------
class Vector {
  constructor(x, y) { this.x = x; this.y = y; }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
}

class Star {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.prevPos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.ang = Math.atan2(y - (viewH / 2), x - (viewW / 2));
  }
  isActive() { return onScreen(this.prevPos.x, this.prevPos.y); }
  update(acc) {
    this.vel.x += Math.cos(this.ang) * acc;
    this.vel.y += Math.sin(this.ang) * acc;
    this.prevPos.x = this.pos.x; this.prevPos.y = this.pos.y;
    this.pos.x += this.vel.x; this.pos.y += this.vel.y;
  }
  draw() {
    const alpha = map(this.vel.mag(), 0, 3, 0, 1);
    starfieldCtx.shadowBlur = 0;                 // ensure no canvas shadow "glow"
    starfieldCtx.shadowColor = 'transparent';
    starfieldCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    starfieldCtx.lineWidth = 2;
    starfieldCtx.beginPath();
    starfieldCtx.moveTo(this.pos.x, this.pos.y);
    starfieldCtx.lineTo(this.prevPos.x, this.prevPos.y);
    starfieldCtx.stroke();
  }
}

// ---------- Utils ----------
function random(min, max) {
  if (max === undefined) { max = min; min = 0; }
  return Math.random() * (max - min) + min;
}
function map(value, a1, a2, b1, b2) { return b1 + (b2 - b1) * ((value - a1) / (a2 - a1)); }
function onScreen(x, y) { return x >= 0 && x <= viewW && y >= 0 && y <= viewH; }

function getViewSize(el) {
  const r = el.getBoundingClientRect();
  return { w: Math.max(1, Math.floor(r.width)), h: Math.max(1, Math.floor(r.height)) };
}

function createStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star(random(viewW), random(viewH)));
  }
}

function updateNameSpeed() {
  if (nameElement) {
    const duration = 2 / animationSpeed;
    nameElement.style.animationDuration = `${duration}s`;
  }
}

// ---------- Draw ----------
function drawStarfield() {
  // 1) Hard clear
  if (ENABLE_TRAILS) {
    starfieldCtx.globalCompositeOperation = 'source-over';
    starfieldCtx.fillStyle = `rgba(0,0,0,${TRAIL_ALPHA})`; // soft fade (will look hazy)
    starfieldCtx.fillRect(0, 0, viewW, viewH);
  } else {
    // 'copy' fully replaces previous pixels regardless of alpha — guarantees pure black base
    starfieldCtx.globalCompositeOperation = 'copy';
    starfieldCtx.fillStyle = '#000';
    starfieldCtx.fillRect(0, 0, viewW, viewH);
    starfieldCtx.globalCompositeOperation = 'source-over';
  }

  // 2) Stars
  const acc = map(starfieldMouseX, 0, viewW, 0.005, 0.2) * animationSpeed;
  stars = stars.filter(star => {
    star.draw();
    star.update(acc);
    return star.isActive();
  });
  while (stars.length < numStars) stars.push(new Star(random(viewW), random(viewH)));

  // 3) Bottom fade to black (drawn on top, but over black so no grey)
  const fadeHeight = Math.min(viewH * 0.35, 380);
  const y0 = viewH - fadeHeight;
  const grad = starfieldCtx.createLinearGradient(0, y0, 0, viewH);
  grad.addColorStop(0.00, 'rgba(0,0,0,0.00)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.45)');
  grad.addColorStop(1.00, 'rgba(0,0,0,1.00)');
  starfieldCtx.fillStyle = grad;
  starfieldCtx.fillRect(0, y0, viewW, fadeHeight);
}

// ---------- Init / Resize ----------
function initStarfield() {
  const heroSection = document.querySelector('#home');
  if (!heroSection) return;

  // Ensure hero is a proper stacking context; kill blend/opacity that can add grey
  const style = document.createElement('style');
  style.textContent = `
    #home { position: relative; isolation: isolate; }
    #home.starfield-force-black,
    #home.starfield-force-black::before,
    #home.starfield-force-black::after {
      background: #000 !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
      backdrop-filter: none !important;
    }
    #about, .about { background: #000; }
    canvas.starfield-canvas { display:block; }
  `;
  document.head.appendChild(style);
  heroSection.classList.add('starfield-force-black');

  // Optional name element
  nameElement = document.querySelector('.hero h1');

  // Create canvas
  starfieldCanvas = document.createElement('canvas');
  starfieldCanvas.className = 'starfield-canvas';
  Object.assign(starfieldCanvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '0',
    backgroundColor: '#000',
    pointerEvents: 'none',
    mixBlendMode: 'normal',
    opacity: '1',
  });
  heroSection.insertBefore(starfieldCanvas, heroSection.firstChild);
  starfieldCtx = starfieldCanvas.getContext('2d', { alpha: true, desynchronized: true });

  // Size + stars
  resizeStarfield();

  // Animate
  requestAnimationFrame(animateStarfield);

  // Events
  window.addEventListener('resize', debounceStarfield(resizeStarfield, 200));
  heroSection.addEventListener('pointermove', (e) => {
    const rect = starfieldCanvas.getBoundingClientRect();
    starfieldMouseX = e.clientX - rect.left;

    if (nameElement) {
      nameRect = nameElement.getBoundingClientRect();
      const nameCenterX = nameRect.left + nameRect.width / 2 - rect.left;
      const nameCenterY = nameRect.top + nameRect.height / 2 - rect.top;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      mouseDistance = Math.hypot(mouseX - nameCenterX, mouseY - nameCenterY);
      const maxDistance = 200;
      animationSpeed = (mouseDistance < maxDistance)
        ? baseSpeed + (1 - mouseDistance / maxDistance) * (maxSpeed - baseSpeed)
        : baseSpeed;

      updateNameSpeed();
    }
  });

  // Default mouse center
  starfieldMouseX = (getViewSize(heroSection).w) / 2;

  // Debug: warn if any ancestor has opacity/filter/blend that could cause grey
  debugAncestorVisuals(heroSection);
}

function resizeStarfield() {
  const heroSection = document.querySelector('#home');
  if (!heroSection || !starfieldCanvas) return;

  // Logical CSS size
  const { w, h } = getViewSize(heroSection);
  viewW = w; viewH = h;

  // DPR-aware backing store
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  starfieldCanvas.width = w * dpr;
  starfieldCanvas.height = h * dpr;
  starfieldCanvas.style.width = w + 'px';
  starfieldCanvas.style.height = h + 'px';

  // Reset transform then scale so we draw in CSS pixels
  starfieldCtx.setTransform(1, 0, 0, 1, 0, 0);
  starfieldCtx.scale(dpr, dpr);

  // Recreate stars for new size
  createStars();
}

// ---------- Loop ----------
function animateStarfield() {
  if (!starfieldCanvas) return;
  drawStarfield();
  requestAnimationFrame(animateStarfield);
}

// ---------- Debounce ----------
function debounceStarfield(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); };
}

// ---------- Diagnostics ----------
function debugAncestorVisuals(el) {
  let p = el;
  while (p) {
    const cs = getComputedStyle(p);
    const bad =
      (parseFloat(cs.opacity) < 1) ||
      (cs.filter && cs.filter !== 'none') ||
      (cs.backdropFilter && cs.backdropFilter !== 'none') ||
      (cs.mixBlendMode && cs.mixBlendMode !== 'normal');
    if (bad) {
      console.warn('[Starfield] Potential grey source on element:', p, {
        opacity: cs.opacity,
        filter: cs.filter,
        backdropFilter: cs.backdropFilter,
        mixBlendMode: cs.mixBlendMode
      });
    }
    p = p.parentElement;
  }
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', initStarfield);
