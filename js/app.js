import { PORTFOLIO_DATA } from './data.js?v=99';
import { initDossier, openFolderDossier } from './dossier.js?v=95';
import { initInteractiveStickers } from './stickers.js?v=71';
import { initKoiPond, pauseKoiPond, resumeKoiPond } from './koiPond.js?v=3';
import { initMathMotion } from './mathMotion.js?v=5';

window.pauseKoiPond = pauseKoiPond;
window.resumeKoiPond = resumeKoiPond;

function initApp() {
  initKoiPond('koi-canvas', 'koi-hint');
  initMathMotion();
  initRoleToolbar();
  initNavbar();
  initScrapbook();
  renderFolderCabinet();
  initDossier();
  initInteractiveStickers();
  initDirectContactForm();
  initISTClock();
}

/* ============================================================ */
/* INTERACTIVE ROLE BADGE & MICRO-TOOLBAR (shwn.design style)   */
/* ============================================================ */
function initRoleToolbar() {
  const rolePill = document.getElementById('role-pill');
  const roleText = document.getElementById('role-text');
  const fontLabel = document.getElementById('role-font-label');
  const btnBold = document.getElementById('role-btn-bold');
  const btnItalic = document.getElementById('role-btn-italic');
  const toolbar = document.getElementById('role-toolbar');
  if (!rolePill || !roleText) return;

  const fontOptions = [
    { name: 'Caveat ▾', familyClass: 'font-handwriting', sizeClass: 'text-2xl sm:text-3xl' },
    { name: 'Newsreader ▾', familyClass: 'font-serif', sizeClass: 'text-xl sm:text-2xl italic' },
    { name: 'Space Mono ▾', familyClass: 'font-mono', sizeClass: 'text-lg sm:text-xl' },
    { name: 'Plus Jakarta ▾', familyClass: 'font-sans', sizeClass: 'text-xl sm:text-2xl' }
  ];

  const roleTitles = [
    'software engineer',
    'design engineer',
    'full-stack engineer'
  ];

  let currentFontIdx = 0;
  let currentRoleIdx = 0;
  let isBold = true;
  let isItalic = false;

  function applyStyles() {
    const font = fontOptions[currentFontIdx];
    roleText.className = `${font.familyClass} ${font.sizeClass} ${isBold ? 'font-bold' : 'font-normal'} ${isItalic ? 'italic' : ''}`;
    if (fontLabel) fontLabel.textContent = font.name;
    if (btnBold) {
      btnBold.className = `px-1.5 py-0.5 rounded cursor-pointer ${isBold ? 'bg-zinc-900 text-white font-bold' : 'hover:bg-zinc-100 text-zinc-700'}`;
    }
    if (btnItalic) {
      btnItalic.className = `px-1.5 py-0.5 rounded cursor-pointer italic ${isItalic ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100 text-zinc-700'}`;
    }
  }

  // Click font label to cycle font family
  if (fontLabel) {
    fontLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      currentFontIdx = (currentFontIdx + 1) % fontOptions.length;
      applyStyles();
    });
  }

  // Click role text to cycle title
  roleText.addEventListener('click', (e) => {
    e.stopPropagation();
    currentRoleIdx = (currentRoleIdx + 1) % roleTitles.length;
    roleText.textContent = roleTitles[currentRoleIdx];
  });

  // Toggle Bold
  if (btnBold) {
    btnBold.addEventListener('click', (e) => {
      e.stopPropagation();
      isBold = !isBold;
      applyStyles();
    });
  }

  // Toggle Italic
  if (btnItalic) {
    btnItalic.addEventListener('click', (e) => {
      e.stopPropagation();
      isItalic = !isItalic;
      applyStyles();
    });
  }

  // Click role pill itself to toggle toolbar visibility on touch devices
  rolePill.addEventListener('click', () => {
    if (toolbar) toolbar.classList.toggle('is-open');
  });

  applyStyles();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export function switchView(targetView) {
  const validViews = ['home', 'about', 'folders'];
  const viewId = validViews.includes(targetView) ? targetView : 'home';

  // 1. Move and manage WebGL Koi Pond simulation: active on both home and about
  const koiCard = document.getElementById('koi-pond-card');
  const homeSlot = document.getElementById('koi-card-container');
  const aboutSlot = document.getElementById('koi-card-contact-container');

  if (viewId === 'home') {
    if (koiCard && homeSlot && koiCard.parentElement !== homeSlot) {
      homeSlot.appendChild(koiCard);
      window.dispatchEvent(new Event('resize'));
    }
    resumeKoiPond();
  } else if (viewId === 'about') {
    if (koiCard && aboutSlot && koiCard.parentElement !== aboutSlot) {
      aboutSlot.appendChild(koiCard);
      window.dispatchEvent(new Event('resize'));
    }
    resumeKoiPond();
  } else {
    pauseKoiPond();
  }

  // 2. Hide all views, display the selected view
  validViews.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewId) {
        el.classList.remove('hidden');
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // 3. Highlight active tab button in navbar
  const navBtns = document.querySelectorAll('#top-navbar-links a');
  navBtns.forEach(btn => {
    const href = btn.getAttribute('href')?.replace('#', '') || '';
    if (href === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 4. Keep URL hash in sync for clean refresh/bookmarking
  if (window.location.hash !== `#${viewId}`) {
    history.replaceState(null, '', `#${viewId}`);
  }

  // 5. Update sticker layout for this specific page
  if (typeof window.updateStickersForView === 'function') {
    window.updateStickersForView(viewId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach globally for inline HTML button triggers
window.switchView = switchView;

function initNavbar() {
  const navLinks = document.querySelectorAll('#top-navbar-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        switchView(targetId);
      });
    }
  });

  // Load initial view based on URL parameter or hash (default to 'home')
  const urlParams = new URLSearchParams(window.location.search);
  const paramView = urlParams.get('view');
  const initialHash = (paramView && ['home', 'about', 'folders'].includes(paramView))
    ? paramView
    : window.location.hash.replace('#', '');

  if (['home', 'about', 'folders'].includes(initialHash)) {
    switchView(initialHash);
  } else {
    switchView('home');
  }

  // Handle browser back / forward navigation
  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '');
    if (['home', 'about', 'folders'].includes(currentHash)) {
      switchView(currentHash);
    }
  });
}

function initScrapbook() {
  const { profile, links } = PORTFOLIO_DATA;

  // Populate Name, Bio, Headline
  const heroNameEl = document.getElementById('hero-name');
  const headlineEl = document.getElementById('hero-headline');
  const bioEl = document.getElementById('bio-text');
  const skillsContainer = document.getElementById('skills-container');

  if (heroNameEl) heroNameEl.textContent = profile.name;
  if (headlineEl) headlineEl.textContent = profile.headline;
  if (bioEl) bioEl.textContent = profile.bio;

  // Populate Links & Contact details
  const navLinkedin = document.getElementById('nav-link-linkedin');
  const navGithub = document.getElementById('nav-link-github');
  const navInstagram = document.getElementById('nav-link-instagram');
  const navContact = document.getElementById('nav-contact-btn');
  const aboutEmail = document.getElementById('about-email-link');
  const aboutLocation = document.getElementById('about-location-pill');

  if (navLinkedin && links?.linkedin) {
    navLinkedin.href = links.linkedin;
    navLinkedin.target = '_blank';
    navLinkedin.rel = 'noopener noreferrer';
  }
  if (navGithub && links?.github) {
    navGithub.href = links.github;
    navGithub.target = '_blank';
    navGithub.rel = 'noopener noreferrer';
  }
  if (navInstagram && links?.instagram) {
    navInstagram.href = links.instagram;
    navInstagram.target = '_blank';
    navInstagram.rel = 'noopener noreferrer';
  }
  if (navContact) {
    if (links?.email) {
      navContact.href = `mailto:${links.email}`;
    }
    navContact.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('folders');
      setTimeout(() => {
        const contactSection = document.getElementById('contact-editorial-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.getElementById('contact-name')?.focus();
        }
      }, 150);
    });
  }

  if (aboutEmail && links?.email) {
    aboutEmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(links.email)}`;
    aboutEmail.target = '_blank';
    aboutEmail.rel = 'noopener noreferrer';
    aboutEmail.textContent = links.email;
  }
  if (aboutLocation && profile?.location) {
    aboutLocation.innerHTML = `📍 ${profile.location}`;
  }

  // Render Skill Tags
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    profile.skills.forEach(skill => {
      const tag = document.createElement('div');
      tag.className = `px-3.5 py-1.5 rounded-md font-sans text-xs font-bold shadow-sm border ${skill.color} transform hover:-translate-y-0.5 hover:rotate-1 transition-all cursor-pointer select-none flex items-center gap-1.5`;
      tag.innerHTML = `<span>${skill.name}</span> <span class="text-sm">✨</span>`;
      skillsContainer.appendChild(tag);
    });
  }
}

function renderFolderCabinet() {
  const cabinetContainer = document.getElementById('folder-cabinet-tabs');
  if (!cabinetContainer) return;

  cabinetContainer.innerHTML = '';

  // Render staggered tab layout (inspired by video Phase 1)
  PORTFOLIO_DATA.folders.forEach((folder, idx) => {
    const isLight = folder.textColor !== '#FFFFFF';
    const tabWrapper = document.createElement('div');
    tabWrapper.className = `folder-tab-wrapper group relative mb-3 transition-all duration-300 rounded-lg overflow-hidden border ${
      isLight ? 'border-zinc-800/20 shadow-md' : 'border-white/10 shadow-lg'
    }`;
    tabWrapper.style.backgroundColor = folder.color;

    const chamferClass = isLight 
      ? 'bg-black/10 text-zinc-900 border border-black/10' 
      : 'bg-white/20 text-white border border-white/10';
    
    const btnClass = isLight 
      ? 'border border-zinc-900/40 text-zinc-900 hover:bg-zinc-900 hover:text-white' 
      : 'border border-white/30 text-white hover:bg-white hover:text-black';

    const drawerClass = isLight 
      ? 'border-t border-zinc-900/10 bg-black/5' 
      : 'border-t border-white/15 bg-black/20';

    const codeColor = isLight ? (folder.accentColor || '#7F011F') : '#FCD34D';

    tabWrapper.innerHTML = `
      <!-- Tab Header Bar -->
      <div class="folder-tab-header flex items-center justify-between p-3 sm:p-4 gap-2 sm:gap-3 cursor-pointer select-none transition-colors group-hover:brightness-105">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <span class="folder-tab-chamfer font-mono text-[10px] sm:text-xs font-bold pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1 rounded-t-sm uppercase tracking-wider shrink-0 whitespace-nowrap ${chamferClass}">
            ${folder.badge}
          </span>
          <h3 class="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-wide whitespace-nowrap truncate" style="color: ${folder.textColor}">
            ${folder.mobileName ? `<span class="sm:hidden">${folder.mobileName}</span><span class="hidden sm:inline">${folder.name}</span>` : folder.name}
          </h3>
        </div>

        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <span class="font-mono text-xs opacity-80 hidden sm:inline font-medium" style="color: ${folder.textColor}">
            ${folder.metadata.date}
          </span>
          <button class="open-folder-btn px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono font-bold rounded uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${btnClass}">
            OPEN FOLDER ↗
          </button>
        </div>
      </div>

      <!-- Accordion Drawer on Hover/Expand (Typewriter / Monospace metadata) -->
      <div class="folder-accordion-drawer max-h-0 opacity-0 group-hover:max-h-60 group-hover:opacity-100 transition-all duration-300 ease-in-out px-5 py-0 group-hover:py-4 ${drawerClass}">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono" style="color: ${folder.textColor}">
          <div>
            <span class="opacity-60 block uppercase text-[10px]">Classification / Index:</span>
            <span class="font-bold" style="color: ${codeColor}">${folder.metadata.code}</span>
          </div>
          <div>
            <span class="opacity-60 block uppercase text-[10px]">Contents:</span>
            <span>${folder.metadata.itemsCount}</span>
          </div>
          <div>
            <span class="opacity-60 block uppercase text-[10px]">Status:</span>
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'} animate-pulse"></span>
              ${folder.metadata.status}
            </span>
          </div>
        </div>

        <p class="mt-3 text-xs font-sans opacity-90 leading-relaxed" style="color: ${folder.textColor}">
          ${folder.metadata.summary}
        </p>
      </div>
    `;

    // Click anywhere on header to open dossier
    tabWrapper.querySelector('.folder-tab-header').addEventListener('click', () => {
      openFolderDossier(folder.id);
    });

    cabinetContainer.appendChild(tabWrapper);
  });
}

function initDirectContactForm() {
  const form = document.getElementById('direct-email-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('contact-btn-text');
  const btnArrow = document.getElementById('contact-btn-arrow');
  const statusMsg = document.getElementById('contact-status-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) return;

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'SENDING...';
    if (btnArrow) btnArrow.textContent = '';
    if (statusMsg) {
      statusMsg.className = 'hidden';
      statusMsg.textContent = '';
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/nikhilv129@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: `New Portfolio Message from ${name}`,
          _template: 'table',
          _captcha: 'false'
        })
      });

      const data = await response.json();

      if (response.ok && (data.success === 'true' || data.success === true || response.status === 200)) {
        if (statusMsg) {
          statusMsg.className = 'p-2.5 rounded-md font-mono text-xs text-center bg-emerald-50 text-emerald-800 border border-emerald-300 block';
          statusMsg.innerHTML = '✓ Message sent directly to Nikhil! I will get back to you soon.';
        }
        form.reset();
        if (btnText) btnText.textContent = 'SENT SUCCESSFULLY';
        if (btnArrow) btnArrow.textContent = '✓';
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      if (statusMsg) {
        statusMsg.className = 'p-2.5 rounded-md font-mono text-xs text-center bg-red-50 text-red-800 border border-red-300 block';
        statusMsg.innerHTML = '⚠️ Could not send message. Please email directly at <a href="mailto:nikhilv129@gmail.com" class="underline font-bold">nikhilv129@gmail.com</a>';
      }
      if (btnText) btnText.textContent = 'TRY AGAIN';
      if (btnArrow) btnArrow.textContent = '→';
    } finally {
      setTimeout(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'SEND MESSAGE';
        if (btnArrow) btnArrow.textContent = '→';
      }, 4000);
    }
  });
}

/* ============================================================ */
/* LIVE IST CLOCK (shwn.design footer style)                     */
/* ============================================================ */
function initISTClock() {
  const clockEl = document.getElementById('contact-ist-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  update();
  setInterval(update, 1000);
}

