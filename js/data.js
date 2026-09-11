export const PORTFOLIO_DATA = {
  profile: {
    name: "NIKHIL",
    subtitle: "my name is",
    headline: "I build scalable full stack systems and agentic software.",
    status: "OPEN TO NEW WORK AND GOOD PROBLEMS",
    location: "Bengaluru, Karnataka",
    bio: "4th-year Engineering student with hands-on experience in end-to-end software development, distributed ML architectures/models, and web design. Actively developing my understanding of agentic workflows and RAG pipelines to design autonomous, context-aware Generative AI systems. Alongside that, I love spending my time doing graphic design and video editing.",
    skills: [
      { name: "Java", color: "bg-[#FED7AA] text-[#9A3412] border-[#F97316]" },
      { name: "JavaScript", color: "bg-[#FEF08A] text-[#854D0E] border-[#EAB308]" },
      { name: "React.js / Next.js", color: "bg-[#93C5FD] text-[#1E3A8A] border-[#3B82F6]" },
      { name: "Python", color: "bg-[#FFE866] text-[#6B5200] border-[#E6CD33]" },
      { name: "FastAPI", color: "bg-[#34D399] text-[#065F46] border-[#059669]" },
      { name: "LangChain / LangGraph", color: "bg-[#F472B6] text-[#831843] border-[#DB2777]" },
      { name: "PyTorch / ML", color: "bg-[#FECDD3] text-[#9F1239] border-[#F43F5E]" },
      { name: "SQL / MongoDB", color: "bg-[#A7F3D0] text-[#065F46] border-[#10B981]" },
      { name: "Tailwind CSS", color: "bg-[#CFFAFE] text-[#155E75] border-[#06B6D4]" }
    ]
  },
  
  links: {
    email: "nikssvermaaa@gmail.com",
    linkedin: "https://www.linkedin.com/in/nikhil-verma-29746928a",
    github: "https://github.com/nikvermaaa",
    instagram: "https://www.instagram.com/nikvermaaa"
  },
  
  folders: [
    {
      id: "tec-projects",
      name: "Tec Projects",
      badge: "FILE #01",
      color: "#18181B", // Black/Charcoal
      accentColor: "#F59E0B",
      textColor: "#FFFFFF",
      tabTitle: "TECHNICAL PROJECTS",
      metadata: {
        code: "TEC-PRJ-2026-PRESENT",
        date: "2026 – PRESENT",
        itemsCount: "6 Project Folders",
        status: "Production Ready",
        summary: "full stack - agentic ai - machine learning"
      },
      projects: [
        {
          id: "proj-video-scene-segmentation",
          title: "Video Scene Segmentation using Optimum N-Means Clustering",
          subtitle: "what's right now • Video scene-segmentation pipeline using ONM clustering",
          date: "July/2026 – Present",
          color: "#E76239", // Warm Terracotta
          textColor: "#FFFFFF",
          tags: ["WHAT'S RIGHT NOW", "Python", "OpenCV", "NumPy", "SciPy", "scikit-image", "scikit-learn"],
          overview: "Created a video scene-segmentation pipeline using ONM (Optimum N-Means) clustering, which determines cluster count by counting recurring objects instead of searching over k.",
          description: "Researched and developed an unsupervised video scene-segmentation framework that eliminates heuristic parameter tuning by mathematically deriving optimal cluster counts from recurring visual objects across multi-modal frame feature representations.",
          sections: [
            {
              heading: "Feature Engineering & Preprocessing",
              items: [
                "Extracted 379 per-frame features from CLAHE-enhanced frames, then reduced via PCA to 95% variance for clustering."
              ]
            },
            {
              heading: "Optimum N-Means (ONM) & Centroid Selection",
              items: [
                "Built an ONM clustering engine that dynamically calculates cluster count by counting recurring visual objects rather than exhaustive search over k.",
                "Implemented SDCO centroid selection and ECVM validation for rigorous cluster quality assessment."
              ]
            },
            {
              heading: "Temporal Smoothing & Boundary Detection",
              items: [
                "Extended pipeline with temporal smoothing and spike-based boundary detection to reach up to 97% intra-cluster association on benchmark video datasets."
              ]
            }
          ]
        },
        {
          id: "proj-latent-diffusion-tumor",
          title: "Addressing Data Scarcity in Medical Imaging: A Latent Diffusion Approach",
          subtitle: "Generative AI pipeline synthesizing tumor-bearing brain MRI slices using Latent Diffusion Models (LDM)",
          date: "Feb/2026 – Mar/2026",
          color: "#4CA664", // Emerald Green
          textColor: "#FFFFFF",
          githubUrl: "https://github.com/nikvermaaa/latent-diffusion-tumor-synthesis",
          tags: ["Python", "PyTorch", "TensorFlow", "LDMs", "U-Net", "KL-Autoencoder", "MS-SSIM"],
          overview: "Engineered a generative AI pipeline using a Latent Diffusion Model (LDM) to synthesize highly realistic, tumor-bearing brain MRI slices to augment limited clinical medical imaging datasets.",
          description: "Addresses the critical bottleneck of data scarcity in medical AI diagnostics by developing a high-fidelity latent diffusion architecture capable of generating paired synthetic MRI scans and segmentation masks.",
          sections: [
            {
              heading: "Dataset Engineering & Preprocessing",
              items: [
                "Preprocessed the BraTS 2020 dataset (369 patients), extracting and normalizing 24,354 cross-sectional tumor slices into a 2-channel format (MRI and Tumor Mask).",
                "Stored data as Float16 tensors for maximum VRAM throughput and compute efficiency during high-batch training."
              ]
            },
            {
              heading: "Architecture & Latent Diffusion Pipeline",
              items: [
                "Implemented a split-architecture generation process: first encoding images into a compressed latent space using a pre-trained AutoencoderKL (VAE).",
                "Trained a custom UNet with spatial self-attention and cross-attention mechanisms to denoise latents via a DDPM scheduler."
              ]
            },
            {
              heading: "Validation & Generation Fidelity",
              items: [
                "Achieved high-fidelity synthetic generation by optimizing a Mean-Squared Error (MSE) objective over 1,000 diffusion timesteps.",
                "Validated generative output and anatomical consistency against a 2,436-slice holdout validation set using MS-SSIM and perceptual loss metrics."
              ]
            }
          ]
        },
        {
          id: "proj-subgate",
          title: "SubGate — Industrial IoT Protocol Gateway & Normalizer",
          subtitle: "High-performance IIoT gateway bridging Modbus TCP, JSON HTTP, PostgreSQL, and MQTT",
          date: "AUG – SEP 2026",
          color: "#B893B3", // Lavender / Mauve
          textColor: "#18181B",
          githubUrl: "https://github.com/nikvermaaa/SubGate",
          tags: ["Java 21", "Spring Boot", "PostgreSQL", "MQTT", "Modbus TCP", "Hexagonal Architecture", "HiveMQ"],
          overview: "A high-performance, modular Industrial IoT (IIoT) protocol converter and data normalizer designed to bridge the gap between legacy Operational Technology (OT) fieldbuses and modern Information Technology (IT) / Cloud infrastructure.",
          description: "Architected a resilient Industrial IoT gateway service that ingests telemetry from heterogeneous protocols (Modbus TCP PLCs, power meters, and JSON HTTP edge sensors), normalizes readings into a unified schema, persists records in PostgreSQL, and broadcasts real-time streams across MQTT brokers.",
          sections: [
            {
              heading: "Heterogeneous Protocol Ingestion & Adapters",
              items: [
                "Built dedicated protocol adapters (ModbusClientPoller via Digitalpetri Netty Modbus and IngestionController for JSON HTTP).",
                "Polls binary register-based fieldbus devices (Modbus TCP) and receives semi-structured JSON telemetry over Spring REST endpoints."
              ]
            },
            {
              heading: "Hexagonal Architecture & Data Normalization",
              items: [
                "Engineered a decoupled Hexagonal (Ports & Adapters) pipeline converting raw sensor inputs into a unified 'NormalizedReading' schema with standardized engineering units.",
                "Implemented thread-safe pipeline orchestration with configurable polling intervals and fault-tolerant reconnection logic."
              ]
            },
            {
              heading: "Dual Persistence & Real-Time MQTT Dispatch",
              items: [
                "Persists time-series records into PostgreSQL with indexed timestamps and device lookups for historical auditing.",
                "Publishes real-time telemetry streams to enterprise MQTT brokers (HiveMQ Cloud / Mosquitto) on dedicated per-device topics for SCADA dashboards and cloud consumers."
              ]
            }
          ]
        },
        {
          id: "proj-complaint-management",
          title: "AI-Powered Customer Complaint Management System",
          subtitle: "Intelligent QA platform converting unstructured feedback into structured records via LangGraph, FastAPI & Groq",
          date: "JAN 2026 – FEB 2026",
          color: "#F09A52", // Tangerine / Peach
          textColor: "#18181B",
          githubUrl: "https://github.com/nikvermaaa/AI-Powered-Customer-Complaint-Management-System",
          tags: ["FastAPI", "React", "LangGraph", "Groq LPU", "Python", "MySQL", "Redux Toolkit", "Pydantic"],
          overview: "An intelligent, state-driven Quality Assurance platform that transforms unstructured customer feedback (emails, PDFs, DOCX, text) into structured, actionable database records with real-time extraction and non-destructive form updates.",
          description: "Engineered an end-to-end full-stack platform pairing FastAPI and LangGraph with Groq's high-speed LPU inference (llama-3.1-8b-instant) to perform sub-second data mapping from complex documents directly into type-safe database schemas.",
          sections: [
            {
              heading: "Multi-Format In-Memory Ingestion",
              items: [
                "Directly parses raw PDFs, DOCX, and EML files in-memory using io.BytesIO buffers, eliminating disk I/O bottlenecks.",
                "Extracts and normalizes multi-format unstructured complaints for instantaneous downstream AI extraction."
              ]
            },
            {
              heading: "State-Driven Agentic AI (LangGraph + Groq)",
              items: [
                "Utilizes Groq's LPUs and llama-3.1-8b-instant for sub-second, high-accuracy data mapping from messy unstructured text.",
                "Engineered stateful context management with LangGraph that understands active form state, enabling conversational corrections (e.g., 'Change priority to urgent') without overwriting existing fields.",
                "Enforced type-safe outputs via Pydantic schemas, guaranteeing structural JSON generation and preventing database hallucinations."
              ]
            },
            {
              heading: "Full-Stack Architecture & Cloud Persistence",
              items: [
                "Built a dynamic two-column React frontend with Redux Toolkit for seamless bidirectional synchronization between manual typing and AI form fills.",
                "Developed asynchronous FastAPI backend integrated with SQLAlchemy ORM and Aiven cloud-hosted MySQL for persistent complaint storage and dashboard analytics."
              ]
            }
          ]
        },
        {
          id: "proj-ghosla",
          title: "Ghosla — AI Voice Agent & Autonomous Rental Discovery",
          subtitle: "Conversational voice agent + concurrent browser automation scanning 3 rental portals live",
          date: "APR – MAY 2026",
          color: "#F4C74E", // Golden Yellow
          textColor: "#18181B",
          githubUrl: "https://github.com/nikvermaaa/ghosla",
          tags: ["Next.js", "FastAPI", "Pipecat", "Deepgram STT", "OpenAI GPT-4", "Cartesia TTS", "Browser Automation"],
          overview: "An autonomous AI voice assistant and multi-platform real estate search engine that conducts interactive discovery calls in Hindi/English, concurrently scrapes rental portals, and ranks shortlists based on match, vibe, and locality intelligence.",
          description: "Engineered an end-to-end conversational voice pipeline using Pipecat, Deepgram, Cartesia, and GPT-4 paired with an autonomous browser worker engine that searches NoBroker, 99acres, and MagicBricks in parallel to eliminate rental discovery friction.",
          sections: [
            {
              heading: "Real-Time Multilingual Voice AI Pipeline",
              items: [
                "Architected an ultra-low-latency voice pipeline integrating Pipecat, Deepgram Speech-to-Text (Hindi/Hinglish/English), Silero VAD, and Cartesia TTS.",
                "Conducts dynamic preference extraction calls (commute, budget, amenities, water supply, AQI thresholds) with conversational state memory."
              ]
            },
            {
              heading: "Concurrent Autonomous Browser Automation",
              items: [
                "Spawns asynchronous headless browser workers to query and scrape NoBroker, 99acres, and MagicBricks simultaneously based on extracted criteria.",
                "Aggregates, dedupes, and filters real-time rental listings across platforms in under 2 minutes."
              ]
            },
            {
              heading: "AI Scoring & Locality Intelligence",
              items: [
                "Ranks shortlisted properties with multi-dimensional scoring: Match Score, Vibe Score, and Fraud/Fake Post Risk Index.",
                "Enriches recommendations with locality intelligence including AQI data, metro connectivity, commute time estimates, and water supply reliability."
              ]
            }
          ]
        },
        {
          id: "proj-ml-monitoring-dashboard",
          title: "End-to-End ML Model Monitoring & Drift Detection Pipeline",
          subtitle: "Real-time data drift & model degradation engine using Evidently AI, Streamlit, and SQLite",
          date: "JUN – JUL 2026",
          color: "#56A5B2", // Teal / Cyan
          textColor: "#FFFFFF",
          githubUrl: "https://github.com/nikvermaaa/machine-learning-model-monitoring-dashboard",
          tags: ["Evidently AI", "Streamlit", "Scikit-learn", "Plotly", "Python", "SQLite", "Data Drift"],
          overview: "An automated machine learning observability and monitoring pipeline that detects data drift and model degradation in real-time, executing continuous statistical evaluations and interactive visualization dashboards.",
          description: "Engineered a plug-and-play ML monitoring framework utilizing Evidently AI and Scikit-learn to continuously assess baseline vs. production feature distributions, logging drift metrics into SQLite and rendering live interactive telemetry dashboards via Streamlit and Plotly.",
          sections: [
            {
              heading: "Automated Statistical Drift Detection",
              items: [
                "Utilizes Evidently AI and Scikit-learn statistical tests (KS-test, PSI, Wasserstein distance) to detect covariate shift and concept drift between reference and production inferences.",
                "Calculates dataset drift shares, target drift metrics, and per-feature distribution shifts automatically."
              ]
            },
            {
              heading: "Telemetry Logging & SQLite Persistence",
              items: [
                "Streams and persists continuous statistical drift metrics, timestamps, and model performance indicators into an optimized SQLite schema.",
                "Provides modular connectors to plug directly into live production inference databases or event streams."
              ]
            },
            {
              heading: "Interactive Observability Dashboard (Streamlit + Plotly)",
              items: [
                "Interactive UI built with Streamlit and Plotly rendering real-time drift heatmaps, time-series degradation charts, and feature drift distributions.",
                "Enables rapid diagnostic filtering and alert thresholds for proactive model retraining."
              ]
            }
          ]
        }
      ]
    },
    {
      id: "editing-projects",
      name: "Editing Projects",
      badge: "FILE #02",
      color: "#BE185D", // Magenta / Deep Pink
      accentColor: "#F472B6",
      textColor: "#FFFFFF",
      tabTitle: "VIDEO EDITING & MOTION",
      metadata: {
        code: "EDIT-2025-PRESENT",
        date: "2025 – PRESENT",
        itemsCount: "4 Project Folders",
        status: "Show Ready",
        summary: "visual storytelling and different art forms"
      },
      projects: [
        {
          id: "proj-about-artistic-side",
          title: "Who I Am & What I Do Except Tech",
          subtitle: "A personal look into my creative passion for cinema, editing, poetry, and graphic design",
          date: "2025 – Present",
          color: "#F4C74E", // Golden Yellow
          textColor: "#18181B",
          linkUrl: "https://www.instagram.com/storyybookkkk",
          linkLabel: "Visit @storyybookkkk on Instagram ↗",
          tags: ["ABOUT ME", "Visual Storytelling", "Cinema", "Graphic Design", "Poetry"],
          overview: "An introduction to my creative identity and the passion that drives my visual storytelling across film editing, graphic design, and artistic writing.",
          description: "You might have already explored my technical and engineering projects, but now I want to introduce you to my creative side. My name is Nikhil. Every medium of art has always held a special place in my heart, but video editing and visual storytelling captivate me the most. I am someone who deeply loves watching cinema, drawing inspiration from films, and translating those sparks into my own unique ideas and stories. Over the years, I have also explored other creative outlets like poetry and graphic design. To share these visual experiments and creative pieces, I run an art page on Instagram (@storyybookkkk)."
        },
        {
          id: "proj-going-through-something",
          title: "I've Been Going Through Something",
          subtitle: "A short film about burnout, lost childhood dreams, and rediscovering inner peace",
          date: "2025",
          color: "#E76239", // Terracotta
          textColor: "#FFFFFF",
          image: "assets/projects/going-through-something.jpg",
          linkUrl: "https://www.instagram.com/reel/DSP1lObie7h/",
          linkLabel: "Watch Film on Instagram ↗",
          tags: ["Short Film", "Cinematography", "Narrative Editing", "Color Grading", "Sound Design"],
          overview: "A narrative short film following a young woman consumed by relentless work routines who slowly rediscovers her forgotten childhood aspirations.",
          description: "This project tells the story of a young woman consumed by relentless work, slowly losing touch with her identity as each passing day begins to feel bleak and overwhelming. We often forget the dreams we held as children and the people we once aspired to become. As she navigates through echoes of her past memories, she begins to reflect deeply on those forgotten dreams, ultimately rediscovering her sense of self and finding lasting inner peace.",
          sections: [
            {
              heading: "Narrative & Visual Themes",
              items: [
                "Explores the isolation of modern burnout through layered framing and desaturated classroom perspectives.",
                "Uses introspective memory motifs to contrast cold daily routines with warm nostalgic recollections.",
                "Presents an emotional journey of self-reflection, acceptance, and healing."
              ]
            },
            {
              heading: "Editing & Post-Production Craft",
              items: [
                "Pacing structured around deliberate silence, emotional pauses, and contemplative breathing room.",
                "Custom color grading designed to transition from desolate, muted tones into warm, peaceful highlights.",
                "Subtle audio layering combining environmental acoustics with an evocative, introspective score."
              ]
            }
          ]
        },
        {
          id: "proj-promo-contest",
          title: "Promo for Contest",
          subtitle: "Fast paced college event promotional film following a campus scavenger hunt",
          date: "2026",
          color: "#4CA664", // Emerald Green
          textColor: "#FFFFFF",
          image: "assets/projects/promo-contest.jpg",
          linkUrl: "https://www.instagram.com/reel/DWqwjQNDAhz/",
          linkLabel: "Watch Reel on Instagram ↗",
          tags: ["Event Promo", "Fast Paced Editing", "Sound Design", "Motion Pacing", "Color Grading"],
          overview: "A fast paced promotional video created for a college filmmaking contest, capturing two students racing across campus to uncover a hidden event poster.",
          description: "Created as an official promotional film for a college video making contest, this high energy, fast paced project follows two students who receive a mysterious message about the event. The storyline captures their thrilling race across campus hallways and stairwells in search of the hidden contest poster, which ultimately reveals the event details and competition guidelines.",
          sections: [
            {
              heading: "Concept & Narrative Structure",
              items: [
                "Builds anticipation through a fast paced campus hunt narrative leading up to the final event reveal.",
                "Combines dynamic handheld framing with purposeful tracking shots to convey urgency and excitement.",
                "Integrates real world student perspectives with the official competition announcement."
              ]
            },
            {
              heading: "Editing Craft & Sound Design",
              items: [
                "High tempo cuts, rhythmic speed transitions, and beat synchronized edits that maintain constant momentum.",
                "Immersive sound design utilizing punchy whooshes, footsteps, foley impacts, and an energetic musical backdrop.",
                "Vibrant color grading emphasizing campus atmosphere and spotlighting the final poster artwork."
              ]
            }
          ]
        },
        {
          id: "proj-burnout-short-film",
          title: "Burnout",
          subtitle: "A short film about heartbreak, exhaustion, and navigating life's heaviest moments",
          date: "2025",
          color: "#B893B3", // Lavender / Mauve
          textColor: "#18181B",
          image: "assets/projects/burnout-short-film.jpg",
          linkUrl: "https://www.instagram.com/reel/DRZniGdCakC/",
          linkLabel: "Watch Film on Instagram ↗",
          tags: ["Short Film", "Cinematic Narrative", "Visual Metaphor", "Color Grading", "Sound Design"],
          overview: "An introspective character study exploring the emotional weight of burnout, heartbreak, and resilience through raw cinematic imagery.",
          description: "This short film tells the story of a young man navigating a life that mirrors the disillusionment of BoJack Horseman. After his partner leaves and every effort seems to unravel, he finds himself emotionally depleted having given everything he had. The film captures his quiet struggle to endure the weight of grief and burnout, portraying the raw reality of pushing through profound emotional pain.",
          sections: [
            {
              heading: "Character Study & Narrative Metaphor",
              items: [
                "Draws inspiration from melancholic character arcs to portray existential fatigue, heartbreak, and resilience.",
                "Uses abstract, textured visual layers and gritty mixed media textures to mirror psychological turbulence.",
                "Frames quiet, solitary moments that capture the unspoken heaviness of emotional burnout."
              ]
            },
            {
              heading: "Visual Style & Atmospheric Soundscape",
              items: [
                "Moody, muted monochromatic palette with subtle warm accents highlighting key visual anchors.",
                "Deliberate, contemplative cutting pace that gives emotional weight to every gesture and pause.",
                "Atmospheric sound design blending ambient city textures with a deeply emotive musical score."
              ]
            }
          ]
        }
      ]
    }
  ]
};
