import { STICKER_IMAGES } from './stickerData.js';

let highestStickerZIndex = 300;
let isDraggingSticker = false;
let currentSticker = null;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;
let currentView = 'home';

// Page-specific layout configurations matching the 3 user reference images
const PAGE_STICKER_LAYOUTS = {
  // IMAGE 1: HOME PAGE
  home: [
    { id: 'stk-dino', name: 'dino', xVw: 12.5, yVh: 27, rotate: -12, width: 78, alt: 'Pixel Dino' },
    { id: 'stk-ipod', name: 'ipod_classic', xVw: 24, yVh: 19, rotate: -6, width: 66, alt: 'iPod Classic' },
    { id: 'stk-camera', name: 'camera', xVw: 90, yVh: 16, rotate: -8, width: 72, alt: 'Digital Camera' },
    { id: 'stk-hourglass', name: 'hourglass', xVw: 77, yVh: 19, rotate: -12, width: 64, alt: 'Hourglass' },
    { id: 'stk-check', name: 'clipboard_check', xVw: 4.5, yVh: 42, rotate: -5, width: 68, alt: 'Checklist Clipboard' },
    { id: 'stk-alien', name: 'alien', xVw: 18, yVh: 47, rotate: 8, width: 70, alt: 'Pixel Alien' },
    { id: 'stk-star', name: 'star', xVw: 75, yVh: 47, rotate: 15, width: 66, alt: 'Pixel Star' },
    { id: 'stk-audit', name: 'clipboard_audit', xVw: 91, yVh: 60, rotate: 8, width: 68, alt: 'Audit Clipboard' },
    { id: 'stk-cd', name: 'cd_rom', xVw: 4, yVh: 63, rotate: -12, width: 78, alt: 'Holo CD' },
    { id: 'stk-mp3', name: 'mp3_player', xVw: 23, yVh: 73, rotate: 10, width: 62, alt: 'MP3 Player' },
    { id: 'stk-headphones', name: 'headphones', xVw: 62, yVh: 77, rotate: 6, width: 72, alt: 'Headphones' },
    { id: 'stk-start', name: 'start_button', xVw: 6, yVh: 78, rotate: -2, width: 92, alt: 'Start Button' },
    { id: 'stk-bubble', name: 'speech_bubble', xVw: 80, yVh: 79, rotate: 2, width: 88, alt: 'Speech Bubble' }
  ],

  // IMAGE 2: ABOUT PAGE
  about: [
    { id: 'stk-ipod', name: 'ipod_classic', xVw: 3.5, yVh: 8, rotate: -8, width: 66, alt: 'iPod Classic' },
    { id: 'stk-star', name: 'star', xVw: 15, yVh: 18, rotate: 15, width: 66, alt: 'Pixel Star' },
    { id: 'stk-camera', name: 'camera', xVw: 90, yVh: 16, rotate: -8, width: 72, alt: 'Digital Camera' },
    { id: 'stk-alien', name: 'alien', xVw: 16, yVh: 51, rotate: 8, width: 70, alt: 'Pixel Alien' },
    { id: 'stk-dino', name: 'dino', xVw: 80.5, yVh: 47, rotate: -10, width: 78, alt: 'Pixel Dino' },
    { id: 'stk-audit', name: 'clipboard_audit', xVw: 91, yVh: 60, rotate: 8, width: 68, alt: 'Audit Clipboard' },
    { id: 'stk-hourglass', name: 'hourglass', xVw: 39, yVh: 63, rotate: -12, width: 64, alt: 'Hourglass' },
    { id: 'stk-check', name: 'clipboard_check', xVw: 2.5, yVh: 77, rotate: -5, width: 68, alt: 'Checklist Clipboard' },
    { id: 'stk-mp3', name: 'mp3_player', xVw: 19, yVh: 73, rotate: 10, width: 62, alt: 'MP3 Player' },
    { id: 'stk-headphones', name: 'headphones', xVw: 62, yVh: 76, rotate: 6, width: 72, alt: 'Headphones' },
    { id: 'stk-bubble', name: 'speech_bubble', xVw: 85, yVh: 81, rotate: 2, width: 88, alt: 'Speech Bubble' },
    { id: 'stk-cd', name: 'cd_rom', xVw: 3.5, yVh: 64, rotate: -12, width: 78, alt: 'Holo CD' },
    { id: 'stk-start', name: 'start_button', xVw: 6, yVh: 86, rotate: -2, width: 92, alt: 'Start Button' }
  ],

  // IMAGE 3: DOSSIER FOLDERS PAGE
  folders: [
    { id: 'stk-ipod', name: 'ipod_classic', xVw: 1.5, yVh: 9, rotate: -8, width: 66, alt: 'iPod Classic' },
    { id: 'stk-audit', name: 'clipboard_audit', xVw: 90, yVh: 17, rotate: 8, width: 68, alt: 'Audit Clipboard' },
    { id: 'stk-bubble', name: 'speech_bubble', xVw: 80.5, yVh: 23.5, rotate: 2, width: 88, alt: 'Speech Bubble' },
    { id: 'stk-star', name: 'star', xVw: 7, yVh: 39, rotate: 16, width: 66, alt: 'Pixel Star' },
    { id: 'stk-headphones', name: 'headphones', xVw: 90.5, yVh: 48, rotate: 6, width: 72, alt: 'Headphones' },
    { id: 'stk-alien', name: 'alien', xVw: 13, yVh: 68, rotate: 8, width: 70, alt: 'Pixel Alien' },
    { id: 'stk-hourglass', name: 'hourglass', xVw: 41, yVh: 67, rotate: -12, width: 64, alt: 'Hourglass' },
    { id: 'stk-dino', name: 'dino', xVw: 72, yVh: 71, rotate: -12, width: 78, alt: 'Pixel Dino' },
    { id: 'stk-check', name: 'clipboard_check', xVw: 2.5, yVh: 77, rotate: -5, width: 68, alt: 'Checklist Clipboard' },
    { id: 'stk-mp3', name: 'mp3_player', xVw: 22, yVh: 75, rotate: 10, width: 62, alt: 'MP3 Player' },
    { id: 'stk-camera', name: 'camera', xVw: 88, yVh: 78, rotate: -8, width: 72, alt: 'Digital Camera' },
    { id: 'stk-cd', name: 'cd_rom', xVw: 4, yVh: 60, rotate: -12, width: 78, alt: 'Holo CD' },
    { id: 'stk-start', name: 'start_button', xVw: 6, yVh: 88, rotate: -2, width: 92, alt: 'Start Button' }
  ]
};

export function initInteractiveStickers() {
  const container = document.getElementById('interactive-stickers-layer') || createStickersLayer();
  container.innerHTML = '';

  const initialLayout = PAGE_STICKER_LAYOUTS.home;

  initialLayout.forEach((cfg, idx) => {
    const imgUrl = STICKER_IMAGES[cfg.name];
    if (!imgUrl) return;

    const stickerEl = document.createElement('div');
    stickerEl.id = cfg.id;
    stickerEl.className = 'draggable-pixel-sticker select-none pointer-events-auto';
    stickerEl.setAttribute('role', 'img');
    stickerEl.setAttribute('aria-label', cfg.alt);
    stickerEl.title = `Drag me anywhere! (${cfg.alt})`;

    stickerEl.innerHTML = `
      <img src="${imgUrl}" alt="${cfg.alt}" 
           style="image-rendering: pixelated; width: 100%; height: auto; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); pointer-events: none;" />
    `;

    attachStickerDrag(stickerEl);
    container.appendChild(stickerEl);
  });

  // Get current view from hash or default to home
  const initialHash = window.location.hash.replace('#', '') || 'home';
  currentView = initialHash;

  // Position elements for home view
  applyStickerLayout('home', false);

  if (currentView === 'home') {
    showStickers();
  } else {
    hideStickers();
  }

  // Window resize handler
  window.addEventListener('resize', () => {
    if (currentView === 'home') {
      applyStickerLayout('home', false);
    }
  });

  // Global window listeners for drag movement
  window.addEventListener('mousemove', handleStickerMouseMove);
  window.addEventListener('touchmove', handleStickerTouchMove, { passive: false });
  window.addEventListener('mouseup', handleStickerDragEnd);
  window.addEventListener('touchend', handleStickerDragEnd);
}

export function updateStickersForView(viewId) {
  currentView = viewId;
  if (viewId === 'home') {
    showStickers();
    applyStickerLayout('home', true);
  } else {
    hideStickers();
  }
}
window.updateStickersForView = updateStickersForView;

// Mobile-specific layout configurations matching user reference image
const MOBILE_STICKER_LAYOUTS = {
  home: [
    { id: 'stk-dino', name: 'dino', xVw: 6, yVh: 22, rotate: -12, width: 50, alt: 'Pixel Dino' },
    { id: 'stk-hourglass', name: 'hourglass', xVw: 35, yVh: 20, rotate: -10, width: 44, alt: 'Hourglass' },
    { id: 'stk-star', name: 'star', xVw: 65, yVh: 19, rotate: 18, width: 46, alt: 'Pixel Star' },
    { id: 'stk-headphones', name: 'headphones', xVw: 30, yVh: 82, rotate: 6, width: 48, alt: 'Headphones' },
    { id: 'stk-start', name: 'start_button', xVw: 12, yVh: 91, rotate: -2, width: 58, alt: 'Start Button' },
    { id: 'stk-check', name: 'clipboard_check', xVw: 60, yVh: 87, rotate: -6, width: 48, alt: 'Checklist Clipboard' }
  ]
};

function applyStickerLayout(viewId, animate = true) {
  const desktopLayout = PAGE_STICKER_LAYOUTS.home;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 768;

  if (isMobile) {
    // Hide all stickers completely on mobile devices
    desktopLayout.forEach((cfg) => {
      const el = document.getElementById(cfg.id);
      if (el) el.style.display = 'none';
    });
  } else {
    // Desktop layout (100% original, untouched)
    desktopLayout.forEach((cfg, idx) => {
      const el = document.getElementById(cfg.id);
      if (!el) return;

      el.style.display = 'block';
      const stickerWidth = cfg.width;
      const posX = (cfg.xVw / 100) * vw;
      const posY = (cfg.yVh / 100) * vh;

      el.dataset.baseRotate = cfg.rotate;
      el.style.position = 'fixed';
      el.style.width = `${stickerWidth}px`;
      el.style.height = 'auto';
      el.style.zIndex = 220 + idx;
      el.style.cursor = 'grab';
      el.style.touchAction = 'none';

      if (animate) {
        el.style.transition = 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s ease';
      } else {
        el.style.transition = 'transform 0.15s ease';
      }

      el.style.left = `${Math.round(posX)}px`;
      el.style.top = `${Math.round(posY)}px`;
      el.style.transform = `rotate(${cfg.rotate}deg)`;
    });
  }
}

function createStickersLayer() {
  const layer = document.createElement('div');
  layer.id = 'interactive-stickers-layer';
  layer.className = 'fixed inset-0 pointer-events-none overflow-hidden';
  layer.style.zIndex = '200';
  document.body.appendChild(layer);
  return layer;
}

function attachStickerDrag(el) {
  el.addEventListener('mousedown', (e) => startStickerDrag(e, el));
  el.addEventListener('touchstart', (e) => startStickerDrag(e, el), { passive: false });
}

function startStickerDrag(e, el) {
  if (['A', 'BUTTON', 'INPUT'].includes(e.target.tagName)) return;

  isDraggingSticker = true;
  currentSticker = el;
  highestStickerZIndex += 2;
  currentSticker.style.zIndex = highestStickerZIndex;
  currentSticker.style.cursor = 'grabbing';
  currentSticker.style.transition = 'none'; // Instant drag tracking

  const baseRotate = parseFloat(el.dataset.baseRotate) || 0;
  currentSticker.style.transform = `rotate(${baseRotate}deg) scale(1.15)`;
  const img = currentSticker.querySelector('img');
  if (img) img.style.filter = 'drop-shadow(0 18px 28px rgba(0,0,0,0.38))';

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  startX = clientX;
  startY = clientY;
  
  initialLeft = parseInt(el.style.left, 10) || el.getBoundingClientRect().left;
  initialTop = parseInt(el.style.top, 10) || el.getBoundingClientRect().top;
}

function handleStickerMouseMove(e) {
  if (!isDraggingSticker || !currentSticker) return;
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  currentSticker.style.left = `${initialLeft + deltaX}px`;
  currentSticker.style.top = `${initialTop + deltaY}px`;
}

function handleStickerTouchMove(e) {
  if (!isDraggingSticker || !currentSticker) return;
  e.preventDefault();
  const touch = e.touches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;
  currentSticker.style.left = `${initialLeft + deltaX}px`;
  currentSticker.style.top = `${initialTop + deltaY}px`;
}

function handleStickerDragEnd() {
  if (isDraggingSticker && currentSticker) {
    const baseRotate = parseFloat(currentSticker.dataset.baseRotate) || 0;
    currentSticker.style.cursor = 'grab';
    currentSticker.style.transition = 'transform 0.15s ease';
    currentSticker.style.transform = `rotate(${baseRotate}deg) scale(1.0)`;
    const img = currentSticker.querySelector('img');
    if (img) {
      img.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';
    }
  }
  isDraggingSticker = false;
  currentSticker = null;
}

export function hideStickers() {
  const layer = document.getElementById('interactive-stickers-layer');
  if (layer) layer.style.display = 'none';
}

export function showStickers() {
  const layer = document.getElementById('interactive-stickers-layer');
  if (layer) layer.style.display = '';
}

window.hideStickers = hideStickers;
window.showStickers = showStickers;
