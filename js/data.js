export const PORTFOLIO_DATA = {
  profile: {
    name: "NIKHIL",
    subtitle: "my name is",
    headline: "I build scalable full stack systems and agentic software.",
    status: "OPEN TO NEW WORK AND SOLVING PROBLEMS",
    location: "Bengaluru, Karnataka",
    bio: "I'm Nikhil, a developer who learns mostly through the projects I work on, which are usually related to problems I face or see people & businesses facing in their work. These days, I spend most of my time working on full-stack projects and playing with machine learning models. I have a great interest in agentic AI software, which is something I'm currently trying to understand more and striving to get a better grasp on. In my free time, I mostly watch movies or try to capture my thoughts through storytelling visuals.",
    skills: [
      { name: "Java", color: "bg-[#FED7AA] text-[#9A3412] border-[#F97316]" },
      { name: "SQL", color: "bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]" },
      { name: "C", color: "bg-[#E4E4E7] text-[#18181B] border-[#71717A]" },
      { name: "JavaScript", color: "bg-[#FEF08A] text-[#854D0E] border-[#EAB308]" },
      { name: "Python", color: "bg-[#FFE866] text-[#6B5200] border-[#E6CD33]" },
      { name: "FastAPI", color: "bg-[#D1FAE5] text-[#065F46] border-[#10B981]" },
      { name: "React.js", color: "bg-[#BAE6FD] text-[#0369A1] border-[#0EA5E9]" },
      { name: "Redux Toolkit", color: "bg-[#F3E8FF] text-[#6B21A8] border-[#A855F7]" },
      { name: "Tailwind CSS", color: "bg-[#CFFAFE] text-[#155E75] border-[#06B6D4]" },
      { name: "HTML5 / CSS3", color: "bg-[#FFEDD5] text-[#9A3412] border-[#F97316]" },
      { name: "RDBMS / MongoDB", color: "bg-[#CCFBF1] text-[#115E59] border-[#14B8A6]" },
      { name: "SQLAlchemy ORM", color: "bg-[#FFE4E6] text-[#9F1239] border-[#F43F5E]" },
      { name: "MQTT", color: "bg-[#EDE9FE] text-[#5B21B6] border-[#8B5CF6]" },
      { name: "REST APIs", color: "bg-[#E0E7FF] text-[#3730A3] border-[#6366F1]" },
      { name: "NumPy", color: "bg-[#E0F2FE] text-[#0369A1] border-[#38BDF8]" },
      { name: "Pandas", color: "bg-[#EDE9FE] text-[#5B21B6] border-[#8B5CF6]" },
      { name: "Scikit-learn", color: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]" },
      { name: "PyTorch", color: "bg-[#FFE4E6] text-[#9F1239] border-[#F43F5E]" },
      { name: "OpenCV", color: "bg-[#D1FAE5] text-[#065F46] border-[#10B981]" }
    ]
  },
  
  links: {
    email: "nikhilv129@gmail.com",
    linkedin: "https://www.linkedin.com/in/nikhil-verma-29746928a",
    github: "https://github.com/nikvermaaa",
    instagram: "https://www.instagram.com/nikvermaaa"
  },
  
  folders: [
    {
      id: "tec-projects",
      name: "Project",
      mobileName: "Project",
      badge: "FILE #01",
      color: "#18181B", // Black/Charcoal
      accentColor: "#F59E0B",
      textColor: "#FFFFFF",
      tabTitle: "PROJECTS",
      metadata: {
        code: "TEC-PRJ-2026",
        date: "2026",
        itemsCount: "5 Projects",
        status: "Production Ready",
        summary: "full stack - agentic ai - machine learning"
      },
      projects: [
        {
          id: "proj-quickdrop",
          title: "QuickDrop",
          date: "Oct 2026 – Nov 2026",
          githubUrl: "https://github.com/nikvermaaa/Quickdrop",
          stack: "FastAPI, PostgreSQL, SQLAlchemy, Docker, Python",
          oneLiner: "An automated dispute resolution desk that handles driver payout issues and complaints via Telegram and WhatsApp, validates claims against company policies, automates settlements, and escalates complex cases to managers.",
          iconBg: "transparent",
          iconColor: "transparent",
          iconImage: "assets/projects/quickdrop-scooter.png",
          iconType: "standalone-image"
        },
        {
          id: "proj-video-scene-segmentation",
          title: "Video Scene Segmentation Pipeline",
          date: "Aug 2026 – Sep 2026",
          githubUrl: "https://github.com/nikvermaaa/video-segmentation.",
          stack: "Python, OpenCV, NumPy, SciPy, scikit-image, scikit-learn",
          oneLiner: "An unsupervised machine learning pipeline that automates video segmentation by detecting scene transitions and dividing videos into meaningful segments, reducing manual effort for video editors.",
          iconBg: "transparent",
          iconColor: "transparent",
          iconImage: "assets/projects/video-segmentation-camcorder.png",
          iconType: "standalone-image"
        },
        {
          id: "proj-bharat-bazaar",
          title: "Bharat Bazaar",
          date: "Sep 2026 – Oct 2026",
          githubUrl: "https://github.com/nikvermaaa/BharatBazaar",
          stack: "FastAPI, Python, ChromaDB, Groq LPU, Apache Parquet, Scikit-learn",
          oneLiner: "An intelligent equity research terminal for NSE and BSE listed companies, combining code calculated technical analysis, citation grounded financial RAG, and deduplicated news intelligence into an interactive, SEBI compliant dashboard.",
          iconBg: "transparent",
          iconColor: "transparent",
          iconImage: "assets/projects/bharat-bazaar-bull-bear.png",
          iconType: "standalone-image"
        },
        {
          id: "proj-latent-diffusion-tumor",
          title: "Latent Diffusion for Medical Imaging",
          date: "Feb 2026 – Mar 2026",
          githubUrl: "https://github.com/nikvermaaa/latent-diffusion-tumor-synthesis",
          stack: "Python, PyTorch, TensorFlow, LDMs, U-Net, KL-Autoencoder",
          oneLiner: "Addressing the scarcity of medical imaging datasets through a generative machine learning pipeline that synthesizes tumor-bearing brain MRI slices using Latent Diffusion Models.",
          iconBg: "transparent",
          iconColor: "transparent",
          iconImage: "assets/projects/latent-diffusion-mri.png",
          iconType: "standalone-image"
        },
        {
          id: "proj-subgate",
          title: "SubGate",
          date: "Jul 2026 – Aug 2026",
          githubUrl: "https://github.com/nikvermaaa/SubGate",
          stack: "Java, Spring Boot, Modbus TCP, MQTT, PostgreSQL, REST APIs",
          oneLiner: "SubGate bridges the OT-IT gap by integrating industrial protocols, normalizing telemetry, and streaming real-time data to PostgreSQL and MQTT for cloud and SCADA integration.",
          iconBg: "transparent",
          iconColor: "transparent",
          iconImage: "assets/projects/subgate-arduino.png",
          iconType: "standalone-image"
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
