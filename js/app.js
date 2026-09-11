import { PORTFOLIO_DATA } from './data.js';
import { initDossier, openFolderDossier } from './dossier.js';
import { initInteractiveStickers } from './stickers.js';

function initApp() {
  initIntroSplash();
  initNavbar();
  initScrapbook();
  renderFolderCabinet();
  initDossier();
  initInteractiveStickers();
}

let splashInitialized = false;

function initIntroSplash() {
  if (splashInitialized) return;
  splashInitialized = true;

  const splash = document.getElementById('intro-splash');
  const bubble = document.getElementById('intro-bubble');
  const textEl = document.getElementById('intro-text');
  if (!splash || !bubble || !textEl) return;

  // 1. Initial State: Display "Oh, hello there!"
  textEl.textContent = "Oh, hello there!";
  setTimeout(() => {
    bubble.classList.remove('scale-95', 'opacity-0');
    bubble.classList.add('scale-100', 'opacity-100');
  }, 50);

  // 2. Smoothly transition to "You found me!"
  setTimeout(() => {
    textEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(-3px)';
    
    setTimeout(() => {
      textEl.textContent = "You found me!";
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
    }, 200);
  }, 1100);

  // 3. Smoothly fade out splash screen
  const dismissSplash = () => {
    splash.style.opacity = '0';
    splash.style.transform = 'scale(1.02)';
    splash.style.pointerEvents = 'none';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 600);
  };

  setTimeout(dismissSplash, 2600);
  splash.addEventListener('click', dismissSplash);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export function switchView(targetView) {
  const validViews = ['home', 'about', 'folders'];
  const viewId = validViews.includes(targetView) ? targetView : 'home';

  // 1. Hide all views, display the selected view
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

  // 2. Highlight active tab pill in navbar
  const navLinks = document.querySelectorAll('#top-navbar-links .nav-item');
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '') || '';
    if (href === viewId) {
      link.className = 'nav-item active-nav-pill px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-300 text-zinc-900 font-bold shadow-sm flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer';
      if (href === 'home') {
        link.innerHTML = '★ HOME';
      }
    } else {
      link.className = 'nav-item px-2 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-zinc-200 text-zinc-700 font-medium transition-all cursor-pointer';
      if (href === 'home') {
        link.innerHTML = 'HOME';
      }
    }
  });

  // 3. Keep URL hash in sync for clean refresh/bookmarking
  if (window.location.hash !== `#${viewId}`) {
    history.replaceState(null, '', `#${viewId}`);
  }

  // 4. Update sticker layout for this specific page
  if (typeof window.updateStickersForView === 'function') {
    window.updateStickersForView(viewId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach globally for inline HTML button triggers
window.switchView = switchView;

function initNavbar() {
  const navLinks = document.querySelectorAll('#top-navbar-links .nav-item');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      switchView(targetId);
    });
  });

  // Load initial view based on URL hash (default to 'home')
  const initialHash = window.location.hash.replace('#', '');
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
        }
      }, 150);
    });
  }

  if (aboutEmail && links?.email) {
    aboutEmail.href = `mailto:${links.email}`;
    aboutEmail.innerHTML = `✉️ ${links.email}`;
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
          <span class="folder-tab-chamfer font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-t-sm uppercase tracking-wider shrink-0 whitespace-nowrap ${chamferClass}">
            ${folder.badge}
          </span>
          <h3 class="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-wide whitespace-nowrap truncate" style="color: ${folder.textColor}">
            ${folder.name}
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
