import { PORTFOLIO_DATA } from './data.js';

let activeFolderId = null;
let highestZIndex = 100;
let dossierContainer = null;
let workspaceCanvas = null;
let sideTabsContainer = null;

// Project detail modal elements
let projectDetailModal = null;
let projectDetailContent = null;
let projectDetailBadge = null;
let projectDetailDate = null;
let isDetailModalOpen = false;

export function initDossier() {
  dossierContainer = document.getElementById('dossier-workspace-modal');
  workspaceCanvas = document.getElementById('dossier-canvas');
  sideTabsContainer = document.getElementById('dossier-docked-tabs');
  
  projectDetailModal = document.getElementById('project-detail-modal');
  projectDetailContent = document.getElementById('project-detail-content');
  projectDetailBadge = document.getElementById('project-detail-folder-badge');
  projectDetailDate = document.getElementById('project-detail-date');

  // Close buttons & ESC key listener
  document.getElementById('close-dossier-btn')?.addEventListener('click', closeDossier);
  document.getElementById('back-to-projects-btn')?.addEventListener('click', closeProjectDetail);
  document.getElementById('close-project-detail-btn')?.addEventListener('click', closeProjectDetail);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isDetailModalOpen) {
        closeProjectDetail();
      } else if (activeFolderId) {
        closeDossier();
      }
    }
  });

  // Global mouse/touch release for dragging (when in draggable documents mode)
  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchend', handleDragEnd);
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('touchmove', handleDragMove, { passive: false });
}

export function openFolderDossier(folderId) {
  const folder = PORTFOLIO_DATA.folders.find(f => f.id === folderId);
  if (!folder) return;

  activeFolderId = folderId;
  document.body.style.overflow = 'hidden';

  // Hide stickers layer when opening folder workspace
  if (typeof window.hideStickers === 'function') {
    window.hideStickers();
  }

  // Render docked sidebar tabs
  renderDockedTabs();

  // Render header info
  const titleEl = document.getElementById('dossier-header-title');
  const badgeEl = document.getElementById('dossier-header-badge');
  const dateEl = document.getElementById('dossier-header-date');
  const metaEl = document.getElementById('dossier-header-meta');

  if (titleEl) titleEl.textContent = folder.name;
  if (badgeEl) badgeEl.textContent = folder.badge;
  if (dateEl) dateEl.textContent = folder.metadata.date;
  if (metaEl) metaEl.textContent = `${folder.metadata.code} // ${folder.metadata.itemsCount}`;

  // Render folder items (either project folder boxes or draggable document sheets)
  renderFolderDocuments(folder);

  // Show modal with animation
  dossierContainer.classList.remove('hidden');
  dossierContainer.classList.add('flex');
  setTimeout(() => {
    dossierContainer.classList.remove('opacity-0', 'scale-95');
    dossierContainer.classList.add('opacity-100', 'scale-100');
  }, 10);
}

export function closeDossier() {
  if (!dossierContainer) return;
  if (isDetailModalOpen) {
    closeProjectDetail();
  }
  
  dossierContainer.classList.remove('opacity-100', 'scale-100');
  dossierContainer.classList.add('opacity-0', 'scale-95');
  setTimeout(() => {
    dossierContainer.classList.remove('flex');
    dossierContainer.classList.add('hidden');
    document.body.style.overflow = '';
    activeFolderId = null;

    // Show stickers again ONLY if currently on home landing view
    const currentHash = window.location.hash.replace('#', '') || 'home';
    if (currentHash === 'home' && typeof window.showStickers === 'function') {
      window.showStickers();
    }
  }, 250);
}

function renderDockedTabs() {
  if (!sideTabsContainer) return;
  sideTabsContainer.innerHTML = '';

  PORTFOLIO_DATA.folders.forEach((folder) => {
    const isActive = folder.id === activeFolderId;
    const tab = document.createElement('button');
    tab.className = `group relative px-2.5 py-6 rounded-l-lg transition-all duration-200 flex items-center justify-center border-l-2 border-t border-b ${
      isActive 
        ? 'shadow-[-6px_0_15px_rgba(0,0,0,0.3)] z-20 scale-105' 
        : 'opacity-70 hover:opacity-100 hover:translate-x-[-4px] z-10'
    }`;
    tab.style.backgroundColor = folder.color;
    tab.style.borderColor = folder.accentColor || '#ffffff33';
    tab.style.color = folder.textColor || '#ffffff';

    tab.innerHTML = `
      <div class="vertical-text font-serif text-xs font-semibold tracking-wider uppercase select-none flex items-center gap-2">
        <span class="font-mono text-[10px] opacity-80">${folder.badge}</span>
        <span>${folder.name.split('&')[0]}</span>
      </div>
    `;

    tab.addEventListener('click', () => {
      if (activeFolderId !== folder.id) {
        if (isDetailModalOpen) {
          closeProjectDetail();
        }
        openFolderDossier(folder.id);
      }
    });

    sideTabsContainer.appendChild(tab);
  });
}

function renderFolderDocuments(folder) {
  if (!workspaceCanvas) return;
  workspaceCanvas.innerHTML = '';
  highestZIndex = 100;

  // Case 1: Folder contains structured projects (e.g. Tec Projects, Editing Projects)
  // Display small colorful project folder boxes matching user reference
  if (folder.projects && folder.projects.length > 0) {
    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'w-full max-w-5xl mx-auto py-6 px-2 sm:px-4';

    gridWrapper.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-700/60 pb-4">
        <div>
          <h3 class="text-white font-serif text-xl sm:text-2xl font-bold tracking-tight">${folder.name}</h3>
          <p class="text-zinc-400 text-xs sm:text-sm font-sans mt-0.5">${folder.metadata.summary || 'Click any project folder below to open full details & case study.'}</p>
        </div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs">
          <span>📁</span>
          <span>${folder.projects.length} PROJECTS AVAILABLE</span>
        </div>
      </div>
      <div id="project-folders-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"></div>
    `;

    workspaceCanvas.appendChild(gridWrapper);
    const grid = gridWrapper.querySelector('#project-folders-grid');

    folder.projects.forEach((proj) => {
      const card = document.createElement('div');
      card.className = 'group relative rounded-xl p-5 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden border border-black/10';
      card.style.backgroundColor = proj.color || '#E76239';
      card.style.color = proj.textColor || '#FFFFFF';
      card.style.minHeight = '180px';

      card.innerHTML = `
        <!-- Top Folder Tab Notch and Indicator -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-sm border-2 border-current/70 flex items-center justify-center text-[10px] font-mono">▫</span>
            <span class="font-mono text-[10px] uppercase font-bold tracking-wider opacity-85 px-2 py-0.5 rounded bg-black/15">
              ${proj.tags && proj.tags[0] ? proj.tags[0] : 'PROJECT'}
            </span>
          </div>
          <span class="font-mono text-[11px] opacity-75 font-semibold">${proj.date || '2026'}</span>
        </div>

        <!-- Project Titles -->
        <div class="my-auto py-1">
          <h4 class="font-serif text-lg sm:text-xl font-bold leading-snug tracking-tight group-hover:underline decoration-1 underline-offset-2">
            ${proj.title}
          </h4>
          ${proj.subtitle ? `
            <p class="font-sans text-xs opacity-85 mt-1.5 line-clamp-2 leading-relaxed">
              ${proj.subtitle}
            </p>
          ` : ''}
        </div>

        <!-- Bottom Row: Date / Tags & Arrow -->
        <div class="mt-4 pt-3 border-t border-current/15 flex items-center justify-between">
          <div class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider opacity-80">
            <span>OPEN FOLDER</span>
          </div>
          <div class="w-7 h-7 rounded-full bg-black/15 group-hover:bg-black/30 transition-colors flex items-center justify-center font-bold text-sm transform group-hover:translate-x-1 transition-transform">
            →
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProjectDetail(proj, folder);
      });

      grid.appendChild(card);
    });

    return;
  }

  // Case 2: Standard folder with draggable documents (e.g. Resume)
  if (folder.documents && folder.documents.length > 0) {
    folder.documents.forEach((doc, idx) => {
      const card = document.createElement('div');
      const zIdx = 100 + idx * 5;
      card.id = `card-${doc.id}`;
      card.className = `draggable-card absolute rounded-md p-5 shadow-xl border select-none transition-shadow ${
        doc.type === 'receipt' ? 'perforated-edge-top' : ''
      }`;
      
      // Style card
      const isMobile = window.innerWidth < 640;
      card.style.backgroundColor = doc.color;
      card.style.color = doc.textColor;
      card.style.borderColor = 'rgba(0,0,0,0.15)';
      card.style.width = isMobile ? `${Math.min(window.innerWidth - 72, 400)}px` : (doc.width || '450px');
      card.style.zIndex = zIdx;
      
      // Calculate safe responsive bounds
      let initialX, initialY;
      if (isMobile) {
        initialX = 12;
        initialY = 16 + idx * 340;
      } else {
        initialX = Math.min(doc.initialPosition.x, Math.max(30, window.innerWidth - 540));
        initialY = doc.initialPosition.y;
      }
      card.style.left = `${Math.max(10, initialX)}px`;
      card.style.top = `${Math.max(10, initialY)}px`;

      // Internal HTML
      card.innerHTML = `
        <!-- Card Washi Tape / Header -->
        <div class="flex items-start justify-between mb-3 cursor-grab">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-black/10 text-current">
                ${doc.tags ? doc.tags.join(' • ') : doc.type.toUpperCase()}
              </span>
              <span class="font-mono text-[11px] opacity-70">${doc.date}</span>
            </div>
            <h3 class="font-serif text-xl font-bold mt-1.5 tracking-tight">${doc.title}</h3>
            ${doc.subtitle ? `<p class="font-sans text-xs opacity-80 mt-0.5">${doc.subtitle}</p>` : ''}
          </div>

          ${doc.stamp ? `
            <div class="rubber-stamp text-xs transform rotate-[-8deg]" style="color: ${doc.stampColor}; border-color: ${doc.stampColor}">
              ${doc.stamp}
            </div>
          ` : ''}
        </div>

        <!-- Content Area -->
        <div class="mt-4">
          ${doc.content}
        </div>

        <!-- Drag Indicator Footer -->
        <div class="mt-4 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-mono opacity-60">
          <span>PRESS & DRAG TO REARRANGE</span>
          <span>${doc.id}</span>
        </div>
      `;

      // Setup Drag listeners
      attachDragEvents(card);
      workspaceCanvas.appendChild(card);
    });
  }
}

/**
 * Opens detailed project modal styled on notebook paper background
 */
export function openProjectDetail(project, folder) {
  if (!projectDetailModal || !projectDetailContent) return;

  isDetailModalOpen = true;

  if (projectDetailBadge) {
    projectDetailBadge.textContent = folder ? folder.name : 'PROJECT';
    projectDetailBadge.style.backgroundColor = project.color || '#E76239';
    projectDetailBadge.style.color = project.textColor || '#FFFFFF';
  }

  if (projectDetailDate) {
    projectDetailDate.textContent = project.date || '2026';
  }

  // Render project content
  let sectionsHtml = '';
  if (project.sections && project.sections.length > 0) {
    sectionsHtml = project.sections.map((sec, sIdx) => `
      <div class="pt-4 border-t border-dashed border-zinc-300">
        <h3 class="font-serif text-lg sm:text-xl font-bold text-zinc-900 mb-2 flex items-center gap-2">
          <span class="font-mono text-xs px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-normal">#0${sIdx + 1}</span>
          <span>${sec.heading}</span>
        </h3>
        ${sec.text ? `<p class="font-sans text-sm sm:text-base text-zinc-700 leading-relaxed">${sec.text}</p>` : ''}
        ${sec.items && sec.items.length > 0 ? `
          <ul class="mt-3 space-y-2">
            ${sec.items.map(item => `
              <li class="flex items-start gap-2.5 text-sm sm:text-base text-zinc-700">
                <span class="text-zinc-500 font-bold mt-1 text-xs">▫</span>
                <span class="leading-relaxed">${item}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');
  }

  let tagsHtml = '';
  if (project.tags && project.tags.length > 0) {
    tagsHtml = `
      <div class="flex flex-wrap gap-2 pt-2">
        ${project.tags.map(t => `
          <span class="px-3 py-1 rounded-full bg-white border border-zinc-300 text-zinc-800 font-mono text-xs font-semibold shadow-xs">
            #${t}
          </span>
        `).join('')}
      </div>
    `;
  }

  projectDetailContent.innerHTML = `
    <!-- Top Header -->
    <div class="space-y-3 pb-6 border-b-2 border-zinc-900">
      <div class="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest">
        <span>PROJECT DOSSIER</span>
        <span>•</span>
        <span>REF: ${project.id || 'PRJ-2026'}</span>
      </div>
      
      <h1 class="font-serif text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
        ${project.title}
      </h1>

      ${project.subtitle ? `
        <p class="font-serif italic text-lg sm:text-xl text-zinc-600">
          ${project.subtitle}
        </p>
      ` : ''}

      ${tagsHtml}

      ${project.githubUrl ? `
        <div class="pt-2">
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181717] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>VIEW ON GITHUB ↗</span>
          </a>
        </div>
      ` : ''}

      ${project.linkUrl ? `
        <div class="pt-2">
          <a href="${project.linkUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all border border-zinc-800">
            <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span>${project.linkLabel || 'WATCH ON INSTAGRAM ↗'}</span>
          </a>
        </div>
      ` : ''}
    </div>

    <!-- Media Image Preview -->
    ${project.image ? `
      <div class="overflow-hidden rounded-xl border border-zinc-300 shadow-md bg-zinc-900">
        <img src="${project.image}" alt="${project.title}" class="w-full h-auto object-cover max-h-[460px]" />
      </div>
    ` : ''}

    <!-- Description / Narrative Paragraph -->
    ${project.description ? `
      <div class="space-y-2">
        <h3 class="font-serif text-xl font-bold text-zinc-900">Story & Creative Vision</h3>
        <p class="font-sans text-sm sm:text-base text-zinc-700 leading-relaxed">
          ${project.description}
        </p>
      </div>
    ` : ''}

    <!-- Structured Sections -->
    <div class="space-y-6">
      ${sectionsHtml}
    </div>

    <!-- Bottom Return CTA -->
    <div class="pt-8 pb-4 border-t border-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <p class="font-mono text-xs text-zinc-500">
          Classification: Confidential / Portfolio Record
        </p>
        ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="font-mono text-xs font-bold text-zinc-800 hover:underline">
            GitHub Repository ↗
          </a>
        ` : ''}
        ${project.linkUrl ? `
          <a href="${project.linkUrl}" target="_blank" rel="noopener noreferrer" class="font-mono text-xs font-bold text-zinc-900 hover:underline">
            ${project.linkLabel || 'Watch on Instagram ↗'}
          </a>
        ` : ''}
      </div>
      <button onclick="document.getElementById('back-to-projects-btn').click()" class="px-5 py-2 rounded-lg bg-zinc-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all cursor-pointer">
        ← Return to Folder Grid
      </button>
    </div>
  `;

  // Show modal with animation
  projectDetailModal.classList.remove('hidden');
  projectDetailModal.classList.add('flex');
  projectDetailModal.scrollTop = 0;

  setTimeout(() => {
    projectDetailModal.classList.remove('opacity-0', 'scale-95');
    projectDetailModal.classList.add('opacity-100', 'scale-100');
  }, 10);
}

export function closeProjectDetail() {
  if (!projectDetailModal) return;
  projectDetailModal.classList.remove('opacity-100', 'scale-100');
  projectDetailModal.classList.add('opacity-0', 'scale-95');
  setTimeout(() => {
    projectDetailModal.classList.remove('flex');
    projectDetailModal.classList.add('hidden');
    isDetailModalOpen = false;
  }, 200);
}

// Drag Physics Engine (for document sheets in resume folder)
let currentDraggingEl = null;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;

function attachDragEvents(element) {
  element.addEventListener('mousedown', (e) => startDrag(e, element));
  element.addEventListener('touchstart', (e) => startDrag(e, element), { passive: false });
}

function startDrag(e, element) {
  // Ignore clicks on buttons/links inside card
  if (['BUTTON', 'A', 'INPUT'].includes(e.target.tagName)) return;

  currentDraggingEl = element;
  highestZIndex += 1;
  currentDraggingEl.style.zIndex = highestZIndex;
  currentDraggingEl.classList.add('is-dragging');

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  startX = clientX;
  startY = clientY;
  initialLeft = parseInt(element.style.left, 10) || 0;
  initialTop = parseInt(element.style.top, 10) || 0;
}

function handleDragMove(e) {
  if (!currentDraggingEl) return;
  e.preventDefault();

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  currentDraggingEl.style.left = `${initialLeft + deltaX}px`;
  currentDraggingEl.style.top = `${initialTop + deltaY}px`;
}

function handleDragEnd() {
  if (currentDraggingEl) {
    currentDraggingEl.classList.remove('is-dragging');
    currentDraggingEl = null;
  }
}

