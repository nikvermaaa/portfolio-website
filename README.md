# Nikhil Verma — Interactive Portfolio & Dossier

> **Personal portfolio website designed with an interactive notebook aesthetic, realistic folder workspace dossiers, draggable retro pixel art stickers, and in-depth project case studies.**

---

##  Overview

This portfolio combines creative design with high-performance front-end architecture. Built using **Vanilla JavaScript (ES Modules)** and **Tailwind CSS**, it delivers an engaging experience featuring:
- A lined notebook paper landing experience with tape accents and interactive stickers.
- A **Classified Dossier Cabinet** with expandable project folders.
- A **Full-Screen Archival Modal** that displays detailed case studies and technical architectures.
- An **Editorial Contact & Collaboration Section** for full-stack, machine learning, and agentic AI inquiries.

---

## Key Features

- ** Realistic Notebook & Paper Theme**: Ruled line backgrounds, washi tape components, textured cards, and rubber stamp badges.
- ** Classified Project Cabinet**: Staggered folder tabs with accordion hover previews for quick project index inspection.
- ** Full-Screen Archival Workspace**: Dedicated case study reading modals rendered on notebook ruled stationery with tags, metrics, and GitHub / Instagram links.
- ** Draggable Retro Pixel Stickers**: Interactive physics engine supporting smooth desktop mouse and mobile touch drag-and-drop interactions.
- **⚡Lightweight & Fast**: Zero heavy framework overhead; fast load times and clean DOM manipulation.
- ** Fully Responsive**: Tailored layouts optimized for mobile, tablet, and widescreen desktop displays.

---

##  Projects Showcased

### 💻 Technical Projects (`FILE #01`)
1. **Video Scene Segmentation using Optimum N-Means Clustering** — Unsupervised computer vision segmentation pipeline mathematically deriving cluster counts without heuristic search over $k$.
2. **Addressing Data Scarcity in Medical Imaging: Latent Diffusion** — Generative Latent Diffusion Model (LDM) with U-Net architecture synthesizing high-fidelity chest X-rays.
3. **SubGate — Industrial IoT Protocol Gateway & Normalizer** — High-throughput telemetry pipeline normalizing MQTT, Modbus, and OPC-UA streams with Redis caching.
4. **AI-Powered Customer Complaint Management System** — In-memory document ingestion engine with stateful LangGraph agents and Groq LPU sub-second extraction.
5. **Ghosla — AI Voice Agent & Autonomous Rental Discovery** — Multilingual conversational voice pipeline (Pipecat, Deepgram, GPT-4) with parallel browser scrapers.
6. **End-to-End ML Model Monitoring & Drift Detection Pipeline** — Real-time Kolmogorov-Smirnov and PSI feature drift detector with an interactive Streamlit observability dashboard.

### 🎬 Video Editing & Motion Art (`FILE #02`)
1. **Who I Am & What I Do Except Tech** — Personal narrative on cinema, poetry, and graphic design ([@storyybookkkk](https://www.instagram.com/storyybookkkk)).
2. **I've Been Going Through Something** — Narrative short film exploring burnout, lost childhood aspirations, and inner peace.
3. **Promo for Contest** — Fast-paced promotional film capturing a dynamic campus scavenger hunt for a filmmaking competition.
4. **Burnout** — Cinematic character study depicting resilience through heartbreak and emotional exhaustion.

---

## 🛠️ Tech Stack

- **Markup & Structure**: HTML5 Semantic Markup
- **Styling**: Tailwind CSS (v3.4), Custom CSS Variables, Keyframe Animations
- **Logic & Interactions**: Modern JavaScript (ES6+ Modules, Touch & Mouse Physics)
- **Typography**: Newsreader (Editorial Serif), Space Mono (Monospace), Silkscreen (Pixel Art), Caveat (Handwriting), Plus Jakarta Sans (Modern Sans)

---

##  Project Structure

```text
porfolio/
├── assets/
│   ├── projects/          # High-resolution film and project cover stills
│   └── stickers/          # Retro pixel art PNG assets for canvas interactions
├── js/
│   ├── app.js             # Navigation controller, hash router, and app initialization
│   ├── data.js            # Single source of truth for projects, bio, and social data
│   ├── dossier.js         # Full-screen folder workspace and case study modal reader
│   ├── stickerData.js     # Sticker asset coordinates, dimensions, and initial positions
│   └── stickers.js        # Mouse & touch drag-and-drop physics engine
├── styles/
│   └── main.css           # Notebook ruled lines, washi tape, stamps, and animations
├── index.html             # Main single-page application entry point
├── .gitignore             # Git ignore rules for caches, media dumps, and temp files
└── README.md              # Project documentation
```

---

##  Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone git@github.com:nikvermaaa/portfolio-website.git
   cd portfolio-website
   ```

2. **Run with any static HTTP server**:
   - Using Python:
     ```bash
     python3 -m http.server 8000
     ```
   - Using Node (`serve` or `http-server`):
     ```bash
     npx serve .
     ```
   - Or open `index.html` directly in your browser.
