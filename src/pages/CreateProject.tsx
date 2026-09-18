import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  BookOpen, 
  Sparkles, 
  Feather, 
  Compass, 
  Flame, 
  ShieldAlert, 
  Heart, 
  Rocket, 
  Search,
  Hourglass,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Info,
  X,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";

interface GenreTheme {
  name: string;
  icon: React.ElementType;
  tagline: string;
  bgGradient: string;
  spotlightGlow: string;
  accent: string;
  accentBorder: string;
  accentText: string;
  particleColor: string;
  cardBg: string;
  cardBorder: string;
  defaultBindingName: string;
}

const GENRE_THEMES: Record<string, GenreTheme> = {
  Fantasy: {
    name: "Fantasy",
    icon: Sparkles,
    tagline: "Ancient oaths, star-woven magic & forgotten realms",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #18112C 0%, #100C1F 45%, #08060E 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(168, 85, 247, 0.18), rgba(217, 119, 6, 0.12), transparent 75%)",
    accent: "bg-[#9353D3] hover:bg-[#7828C8]",
    accentBorder: "border-[#A855F7]/40 focus-within:border-[#C084FC]",
    accentText: "text-[#E9D5FF]",
    particleColor: "rgba(234, 179, 8, 0.75)",
    cardBg: "bg-[#140F24]/70 backdrop-blur-xl",
    cardBorder: "border-[#A855F7]/20",
    defaultBindingName: "Midnight",
  },
  "Sci-Fi": {
    name: "Sci-Fi",
    icon: Rocket,
    tagline: "Deep cosmos, synthetic minds & cybernetic frontiers",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #071927 0%, #06111C 45%, #03080E 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(6, 182, 212, 0.22), rgba(14, 116, 144, 0.12), transparent 75%)",
    accent: "bg-[#0EA5E9] hover:bg-[#0284C7]",
    accentBorder: "border-[#38BDF8]/40 focus-within:border-[#7DD3FC]",
    accentText: "text-[#BAE6FD]",
    particleColor: "rgba(56, 189, 248, 0.75)",
    cardBg: "bg-[#0A1622]/70 backdrop-blur-xl",
    cardBorder: "border-[#38BDF8]/20",
    defaultBindingName: "Obsidian",
  },
  Romance: {
    name: "Romance",
    icon: Heart,
    tagline: "Intimate whispers, longing hearts & unforgettable bonds",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #24111B 0%, #1A0B13 45%, #0C0509 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(244, 114, 182, 0.18), rgba(251, 146, 60, 0.1), transparent 75%)",
    accent: "bg-[#E11D48] hover:bg-[#BE123C]",
    accentBorder: "border-[#FB7185]/40 focus-within:border-[#FDA4AF]",
    accentText: "text-[#FFE4E6]",
    particleColor: "rgba(251, 113, 133, 0.75)",
    cardBg: "bg-[#1E0D16]/70 backdrop-blur-xl",
    cardBorder: "border-[#FB7185]/20",
    defaultBindingName: "Mahogany",
  },
  Thriller: {
    name: "Thriller",
    icon: Flame,
    tagline: "Relentless suspense, high stakes & pulse-racing twists",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #1C1316 0%, #141012 45%, #090708 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(239, 68, 68, 0.18), rgba(120, 113, 108, 0.1), transparent 75%)",
    accent: "bg-[#DC2626] hover:bg-[#B91C1C]",
    accentBorder: "border-[#EF4444]/40 focus-within:border-[#F87171]",
    accentText: "text-[#FEE2E2]",
    particleColor: "rgba(248, 113, 113, 0.75)",
    cardBg: "bg-[#160E11]/70 backdrop-blur-xl",
    cardBorder: "border-[#EF4444]/20",
    defaultBindingName: "Obsidian",
  },
  Mystery: {
    name: "Mystery",
    icon: Search,
    tagline: "Shadowed clues, fog-shrouded secrets & elusive truths",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #0E1A18 0%, #091312 45%, #040808 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(20, 184, 166, 0.18), rgba(217, 119, 6, 0.1), transparent 75%)",
    accent: "bg-[#0D9488] hover:bg-[#0F766E]",
    accentBorder: "border-[#2DD4BF]/40 focus-within:border-[#5EEAD4]",
    accentText: "text-[#CCFBF1]",
    particleColor: "rgba(45, 212, 191, 0.7)",
    cardBg: "bg-[#0B1514]/70 backdrop-blur-xl",
    cardBorder: "border-[#2DD4BF]/20",
    defaultBindingName: "Forest",
  },
  Historical: {
    name: "Historical",
    icon: Hourglass,
    tagline: "The patina of time, grand eras & legendary sagas",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #221811 0%, #18100B 45%, #0B0705 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(217, 119, 6, 0.2), rgba(180, 83, 9, 0.12), transparent 75%)",
    accent: "bg-[#B45309] hover:bg-[#92400E]",
    accentBorder: "border-[#F59E0B]/40 focus-within:border-[#FBBF24]",
    accentText: "text-[#FEF3C7]",
    particleColor: "rgba(245, 158, 11, 0.75)",
    cardBg: "bg-[#1A120D]/70 backdrop-blur-xl",
    cardBorder: "border-[#F59E0B]/20",
    defaultBindingName: "Parchment",
  },
  Contemporary: {
    name: "Contemporary",
    icon: Feather,
    tagline: "Real human resonance, modern lives & sharp prose",
    bgGradient: "radial-gradient(ellipse 90% 80% at 30% 45%, #181920 0%, #111216 45%, #08090B 100%)",
    spotlightGlow: "radial-gradient(circle 380px at 32% 48%, rgba(148, 163, 184, 0.18), rgba(99, 102, 241, 0.1), transparent 75%)",
    accent: "bg-[#64748B] hover:bg-[#475569]",
    accentBorder: "border-[#94A3B8]/40 focus-within:border-[#CBD5E1]",
    accentText: "text-[#F1F5F9]",
    particleColor: "rgba(148, 163, 184, 0.7)",
    cardBg: "bg-[#14151B]/70 backdrop-blur-xl",
    cardBorder: "border-[#94A3B8]/20",
    defaultBindingName: "Obsidian",
  },
};

const GENRES = Object.keys(GENRE_THEMES);
const AUDIENCES = ["Middle Grade", "Young Adult (YA)", "New Adult", "Adult"];

const COLORS = [
  {
    name: "Obsidian",
    bg: "bg-[#1E252B]",
    text: "text-[#E5E0D5]",
    accent: "bg-[#8C503C]",
    ribbon: "bg-rose-700",
  },
  {
    name: "Mahogany",
    bg: "bg-[#3D1F1F]",
    text: "text-[#E5E0D5]",
    accent: "bg-[#D3BFA9]",
    ribbon: "bg-amber-600",
  },
  {
    name: "Forest",
    bg: "bg-[#1B2F24]",
    text: "text-[#F4F1EA]",
    accent: "bg-[#E5E0D5]",
    ribbon: "bg-stone-300",
  },
  {
    name: "Midnight",
    bg: "bg-[#14142B]",
    text: "text-[#E5E0D5]",
    accent: "bg-[#5C7C8A]",
    ribbon: "bg-indigo-400",
  },
  {
    name: "Parchment",
    bg: "bg-[#C4AC93]",
    text: "text-[#2B231B]",
    accent: "bg-[#8C503C]",
    ribbon: "bg-rose-900",
  },
];

const NEW_MANUSCRIPT_ARCHITECT_PROMPT = `I want you to help me prepare the information needed to create a new novel project.

First, ask me to provide my NOVEL IDEA. You may also ask me for an Author / Pen Name if I have one. If I do not provide one, leave that field blank.

After I provide my novel idea, analyze it and generate ONLY the following information:

1. Manuscript Title
Create a suitable and memorable novel title based on my story idea.

2. Author / Pen Name
Keep exactly the Author / Pen Name I provide. If I do not provide one, leave it blank. Do not invent an author name.

3. Word Count Target
Recommend a reasonable total word count based on the story concept, genre, and target audience.

4. Logline / Central Premise
Write a concise 35–70 word premise describing the main story hook, central conflict, and stakes.

5. Primary Genre
Choose exactly ONE:
- FANTASY
- SCI-FI
- ROMANCE
- THRILLER
- MYSTERY
- HISTORICAL
- CONTEMPORARY

6. Target Audience
Choose exactly ONE:
- Middle Grade
- Young Adult (YA)
- New Adult
- Adult

7. Cover Theme
Choose exactly ONE:
- Forest
- Crimson
- Emerald
- Midnight
- Ivory

Do not generate characters, locations, worldbuilding, chapter outlines, scenes, or additional story content.

After I provide my novel idea, return the result in this format:

Manuscript Title: ...
Author / Pen Name: ...
Word Count Target: ...
Logline / Central Premise: ...
Primary Genre: ...
Target Audience: ...
Cover Theme: ...`;

// Floating Dust & Star Particles Component
function AmbientParticles({ color }: { color: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      driftX: (Math.random() - 0.5) * 40,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, p.driftX, 0],
            opacity: [0, 0.85, 0],
            scale: [0.8, 1.4, 0.6],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Fantasy Constellation Graphic
function ConstellationOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-5 opacity-40 mix-blend-screen transition-opacity duration-1000">
      {/* Top Right Constellation */}
      <svg
        className="absolute top-4 right-6 w-72 h-72 text-amber-200/30"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="40" r="2.5" fill="currentColor" />
        <circle cx="85" cy="25" r="2" fill="currentColor" />
        <circle cx="140" cy="55" r="3" fill="currentColor" />
        <circle cx="170" cy="115" r="2" fill="currentColor" />
        <circle cx="120" cy="160" r="2.5" fill="currentColor" />
        <circle cx="65" cy="130" r="2" fill="currentColor" />
        <line x1="30" y1="40" x2="85" y2="25" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
        <line x1="85" y1="25" x2="140" y2="55" stroke="currentColor" strokeWidth="0.6" />
        <line x1="140" y1="55" x2="170" y2="115" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" />
        <line x1="170" y1="115" x2="120" y2="160" stroke="currentColor" strokeWidth="0.6" />
        <line x1="120" y1="160" x2="65" y2="130" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
        <line x1="65" y1="130" x2="30" y2="40" stroke="currentColor" strokeWidth="0.6" />
        {/* Star glow */}
        <circle cx="140" cy="55" r="7" fill="currentColor" opacity="0.25" />
      </svg>

      {/* Bottom Left Celestial Arc */}
      <svg
        className="absolute bottom-6 left-12 w-64 h-64 text-indigo-200/20"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="150" r="2" fill="currentColor" />
        <circle cx="90" cy="110" r="2.5" fill="currentColor" />
        <circle cx="145" cy="95" r="2" fill="currentColor" />
        <circle cx="180" cy="60" r="3" fill="currentColor" />
        <line x1="50" y1="150" x2="90" y2="110" stroke="currentColor" strokeWidth="0.6" />
        <line x1="90" y1="110" x2="145" y2="95" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" />
        <line x1="145" y1="95" x2="180" y2="60" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="180" cy="60" r="8" fill="currentColor" opacity="0.3" />
      </svg>
    </div>
  );
}

// Vintage Corner Filigree Ornamental Borders
function CornerFiligree() {
  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      {/* Top-Left Corner */}
      <svg
        className="absolute top-3 left-3 w-14 h-14 text-amber-500/25 transition-all duration-700"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M5 45 V 10 C 5 7.2 7.2 5 10 5 H 45" strokeWidth="1.5" />
        <path d="M12 35 V 15 C 12 13.3 13.3 12 15 12 H 35" strokeWidth="0.75" strokeDasharray="2 2" />
        <circle cx="10" cy="10" r="3" fill="currentColor" />
        <circle cx="45" cy="5" r="2" fill="currentColor" />
        <circle cx="5" cy="45" r="2" fill="currentColor" />
      </svg>

      {/* Top-Right Corner */}
      <svg
        className="absolute top-3 right-3 w-14 h-14 text-amber-500/25 transition-all duration-700"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M95 45 V 10 C 95 7.2 92.8 5 90 5 H 55" strokeWidth="1.5" />
        <path d="M88 35 V 15 C 88 13.3 86.7 12 85 12 H 65" strokeWidth="0.75" strokeDasharray="2 2" />
        <circle cx="90" cy="10" r="3" fill="currentColor" />
        <circle cx="55" cy="5" r="2" fill="currentColor" />
        <circle cx="95" cy="45" r="2" fill="currentColor" />
      </svg>

      {/* Bottom-Left Corner */}
      <svg
        className="absolute bottom-3 left-3 w-14 h-14 text-amber-500/25 transition-all duration-700"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M5 55 V 90 C 5 92.8 7.2 95 10 95 H 45" strokeWidth="1.5" />
        <path d="M12 65 V 85 C 12 86.7 13.3 88 15 88 H 35" strokeWidth="0.75" strokeDasharray="2 2" />
        <circle cx="10" cy="90" r="3" fill="currentColor" />
        <circle cx="45" cy="95" r="2" fill="currentColor" />
        <circle cx="5" cy="55" r="2" fill="currentColor" />
      </svg>

      {/* Bottom-Right Corner */}
      <svg
        className="absolute bottom-3 right-3 w-14 h-14 text-amber-500/25 transition-all duration-700"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M95 55 V 90 C 95 92.8 92.8 95 90 95 H 55" strokeWidth="1.5" />
        <path d="M88 65 V 85 C 88 86.7 86.7 88 85 88 H 65" strokeWidth="0.75" strokeDasharray="2 2" />
        <circle cx="90" cy="90" r="3" fill="currentColor" />
        <circle cx="55" cy="95" r="2" fill="currentColor" />
        <circle cx="95" cy="55" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function CreateProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [logline, setLogline] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [audience, setAudience] = useState(AUDIENCES[1]);
  const [wordCount, setWordCount] = useState<number | string>(80000);
  const [colorStyle, setColorStyle] = useState(COLORS[3]); // Default Midnight
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  const handleCopyArchitectPrompt = async () => {
    try {
      await navigator.clipboard.writeText(NEW_MANUSCRIPT_ARCHITECT_PROMPT);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = NEW_MANUSCRIPT_ARCHITECT_PROMPT;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    }
  };

  // Active theme based on selected genre
  const currentTheme = GENRE_THEMES[genre] || GENRE_THEMES.Fantasy;

  // Auto-adapt default binding color when genre switches if user hasn't overridden
  const userChangedBindingRef = useRef(false);

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre);
    if (!userChangedBindingRef.current) {
      const theme = GENRE_THEMES[newGenre];
      if (theme) {
        const found = COLORS.find((c) => c.name === theme.defaultBindingName);
        if (found) setColorStyle(found);
      }
    }
  };

  const handleCreate = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newId = Date.now().toString();

      // Save project meta
      storage.saveProject({
        id: newId,
        title: title || "Whispers of the Astral Spire",
        author: author || "Unknown Chronicler",
        genre,
        audience,
        logline,
        wordGoal: wordCount ? Number(wordCount) : 50000,
        currentWords: 0,
        lastModified: Date.now(),
        themeColor: colorStyle.bg,
      });

      // Save initial project data with rich prologue structure
      storage.saveProjectData(newId, {
        manuscript: [
          {
            id: "part-1",
            type: "part",
            title: "Part I: The Inscription",
            children: [
              {
                id: "chap-1",
                type: "chapter",
                title: "Chapter 1: The First Omen",
                children: [
                  {
                    id: "scene-1",
                    type: "scene",
                    title: "Scene 1",
                    content: `<h1>Chapter 1: The First Omen</h1><p>The night air carried the chill of ancient stone and the metallic scent of pending lightning. Before ${title || "the spire"}, the chronicler paused...</p>`,
                  },
                ],
              },
            ],
          },
        ],
        characters: [],
        locations: [],
        storyBible: {
          title: title || "Whispers of the Astral Spire",
          genre,
          subgenre: genre === "Fantasy" ? "High Fantasy / Epic" : genre,
          targetAudience: audience,
          pov: "Third Person Limited",
          tone: genre === "Fantasy" ? "Mysterious, Epic & Poetic" : "Atmospheric, Immersive",
          premise: logline || "An epic journey unfolds into the unknown.",
          mainConflict: "A forgotten power awakens at the heart of the realm.",
          storyGoal: "Restore balance before the celestial alignments collapse.",
          themes: "Honor, sacrifice, destiny, forbidden knowledge.",
          timePeriod: "Age of Stars",
          primarySetting: "The Spire Observatory",
          worldDescription: "A world carved between luminous constellations and shifting tides.",
          importantRules: "Celestial oaths cannot be broken without heavy spiritual toll.",
          narrativeStyle: "Evocative, atmospheric prose with rich sensory imagery.",
          dialogueStyle: "Subtle, nuanced with resonant emotional subtext.",
          pacing: "Measured build-up leading to breathtaking climaxes.",
          aiInstructions: "Embody the chosen genre aesthetic faithfully. Enrich dialogue with psychological depth.",
        },
      });

      navigate(`/project/${newId}/workspace/studio`);
    }, 400);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex-1 h-[100dvh] w-full overflow-hidden flex flex-col relative font-sans selection:bg-amber-600 selection:text-white transition-colors duration-1000"
      style={{
        background: currentTheme.bgGradient,
      }}
    >
      {/* 1. Parchment Old Paper Texture (5-8% opacity for subtle classic library tactile feel) */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none z-1"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3CfeColorMatrix type=%22matrix%22 values=%221 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")',
        }}
      />

      {/* 2. Spotlight Glow Behind Book Preview */}
      <div
        className="absolute inset-0 pointer-events-none z-2 transition-all duration-1000 ease-out"
        style={{
          background: currentTheme.spotlightGlow,
        }}
      />

      {/* 3. Ambient Star / Embers Particles */}
      <AmbientParticles color={currentTheme.particleColor} />

      {/* 4. Constellation graphics when Fantasy or Sci-Fi is active */}
      {(genre === "Fantasy" || genre === "Sci-Fi") && <ConstellationOverlay />}

      {/* 5. Ornamental Corner Filigree for classic bookbinding atmosphere */}
      <CornerFiligree />

      {/* Top Header Bar */}
      <div className="relative z-20 px-6 py-4 lg:px-12 lg:py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2.5 text-stone-300/80 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4 text-stone-200 group-hover:text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-400 group-hover:text-stone-200">
                Back to Archives
              </span>
              <span className="text-[10px] text-stone-500 font-serif italic hidden sm:inline">
                Author Dashboard
              </span>
            </div>
          </button>

          {/* Guide / Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="w-7 h-7 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 hover:border-amber-400/60 text-amber-300 flex items-center justify-center transition-all shadow-sm group hover:scale-105"
            title="Manuscript Setup Guide & AI Prompt"
            aria-label="Manuscript Setup Guide & AI Prompt"
          >
            <HelpCircle className="w-4 h-4 transition-transform group-hover:rotate-12" />
          </button>
        </div>

        {/* Case File Metadata Stamp */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <span className="text-[9px] font-mono tracking-widest text-stone-300/80 uppercase">
            DOSSIER REGISTRY // FORM-7B
          </span>
        </div>
      </div>

      {/* Main Content: Split Screen Layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-[1440px] mx-auto w-full px-6 lg:px-14 gap-8 lg:gap-20 h-full min-h-0 pb-6 lg:pb-8 overflow-y-auto lg:overflow-visible">
        
        {/* LEFT COLUMN: 3D BOOK PREVIEW CANVAS */}
        <motion.div
          initial={{ opacity: 0, x: -40, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 flex flex-col justify-center items-center w-full max-w-[420px] lg:max-w-[480px] shrink-0"
        >
          {/* Spotlight Pedestal aura */}
          <div className="relative w-[210px] h-[300px] lg:w-[260px] lg:h-[380px] group [perspective:1400px]">
            {/* Soft shadow below book */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/60 blur-xl rounded-full transition-transform duration-700 group-hover:scale-105" />

            {/* 3D Book Container */}
            <div
              className={cn(
                "relative w-full h-full rounded-r-lg rounded-l-[4px] shadow-2xl transition-all duration-700 [transform-style:preserve-3d]",
                "rotate-y-[-14deg] rotate-x-[4deg] hover:rotate-y-[-4deg] hover:rotate-x-[1deg]",
                "border-r border-t border-b border-white/10",
                colorStyle.bg
              )}
            >
              {/* Gold Foil Embossed Corner Brackets on Book Cover */}
              <div className="absolute top-2 left-3 w-5 h-5 border-t border-l border-amber-300/40 pointer-events-none" />
              <div className="absolute top-2 right-3 w-5 h-5 border-t border-r border-amber-300/40 pointer-events-none" />
              <div className="absolute bottom-2 left-3 w-5 h-5 border-b border-l border-amber-300/40 pointer-events-none" />
              <div className="absolute bottom-2 right-3 w-5 h-5 border-b border-r border-amber-300/40 pointer-events-none" />

              {/* Book Paper Edges (3D Depth Stack) */}
              <div className="absolute inset-y-[3px] -right-[5px] lg:-right-[6px] w-[5px] lg:w-[6px] bg-[#E5E0D5] rounded-r-sm shadow-[inset_1px_0_3px_rgba(0,0,0,0.35)]" />
              <div className="absolute -bottom-[4px] lg:-bottom-[5px] inset-x-[3px] h-[4px] lg:h-[5px] bg-[#D8D2C5] rounded-b-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]" />

              {/* Cover Textured Overlay */}
              <div
                className="absolute inset-0 opacity-[0.22] mix-blend-overlay pointer-events-none rounded-r-lg rounded-l-[4px]"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
              />

              {/* Spine Crease & Shading */}
              <div className="absolute left-0 inset-y-0 w-5 lg:w-6 bg-gradient-to-r from-black/70 via-black/30 to-transparent rounded-l-[4px] mix-blend-multiply pointer-events-none" />
              <div className="absolute left-[1px] inset-y-0 w-px bg-white/20 pointer-events-none" />
              <div className="absolute left-4 lg:left-5 inset-y-0 w-px bg-black/15 pointer-events-none" />

              {/* Silk Ribbon Bookmark */}
              <div
                className={cn(
                  "absolute top-0 left-7 lg:left-9 w-4 lg:w-5 h-20 shadow-lg pointer-events-none transition-colors duration-500",
                  colorStyle.ribbon
                )}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
                }}
              />

              {/* Book Cover Typography & Layout */}
              <div className="absolute inset-0 flex flex-col p-6 lg:p-8 pt-10 lg:pt-14 z-10 pointer-events-none transition-colors duration-500">
                <div className="flex-1 flex flex-col items-center text-center h-full">
                  
                  {/* Genre Stamp Banner */}
                  <div className="flex items-center px-3 py-1 rounded-full bg-black/30 border border-white/20 backdrop-blur-xs mb-4 shrink-0 shadow-xs">
                    <span
                      className={cn(
                        "text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.25em]",
                        colorStyle.text
                      )}
                    >
                      {genre}
                    </span>
                  </div>

                  {/* Title Frame */}
                  <div className="w-full border-t border-b border-amber-300/30 py-4 lg:py-6 flex flex-col items-center justify-center shrink-0">
                    <h2
                      className={cn(
                        "text-xl lg:text-2xl font-serif font-bold leading-snug drop-shadow-md px-2 break-words max-w-full transition-colors duration-500 line-clamp-3 text-amber-100",
                        colorStyle.text
                      )}
                    >
                      {title || "Whispers of the Astral Spire"}
                    </h2>
                  </div>

                  <div className="flex-1 min-h-[1rem]"></div>

                  {/* Author Emblem Footer */}
                  <div
                    className={cn(
                      "mt-auto flex flex-col items-center opacity-90 transition-colors duration-500 shrink-0",
                      colorStyle.text
                    )}
                  >
                    <BookOpen className="w-4 h-4 mb-2 opacity-60 text-amber-200" />
                    <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.22em] px-2 line-clamp-1 text-stone-200">
                      {author || "Author Pen Name"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Genre Tagline under book */}
          <motion.div
            key={genre}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 text-center max-w-xs"
          >
            <p className="font-serif italic text-xs lg:text-sm text-stone-300/80 leading-relaxed">
              "{currentTheme.tagline}"
            </p>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: CASE FILE / DOSSIER FORM CONFIGURATION */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="flex-1 w-full max-w-[560px] flex flex-col justify-center"
        >
          {/* Dossier Card Container */}
          <div
            className={cn(
              "rounded-xl border p-6 lg:p-8 shadow-2xl transition-all duration-700 relative overflow-hidden",
              currentTheme.cardBg,
              currentTheme.cardBorder
            )}
          >
            {/* Header / Case Title */}
            <div className="mb-5 shrink-0 flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
                    PROJECT REGISTRATION
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase">
                    ARCHIVE INITIATION
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight">
                    New Manuscript
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="w-5 h-5 rounded-full bg-amber-400/10 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 flex items-center justify-center transition-all hover:scale-110"
                    title="View Setup Guide & AI Architect Prompt"
                    aria-label="View Setup Guide & AI Architect Prompt"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-300/80 shrink-0">
                <Feather className="w-5 h-5" />
              </div>
            </div>

            {/* Form Fields Stack */}
            <div className="space-y-4">
              {/* 1. Title Input */}
              <div>
                <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70 mb-1.5 flex items-center justify-between">
                  <span>Manuscript Title</span>
                  <span className="text-[8px] font-mono text-stone-500 lowercase">required</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Whispers of the Astral Spire..."
                  className="w-full bg-white/5 border border-white/15 focus:border-amber-400/70 focus:bg-white/10 rounded-md outline-none px-3.5 py-2.5 text-lg font-serif text-white placeholder:text-stone-500 transition-all shadow-inner"
                  autoFocus
                />
              </div>

              {/* 2. Row: Author & Word Count Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70 mb-1.5 block">
                    Author / Pen Name
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your writer name..."
                    className="w-full bg-white/5 border border-white/15 focus:border-amber-400/70 focus:bg-white/10 rounded-md outline-none px-3.5 py-2 text-sm font-serif text-stone-200 placeholder:text-stone-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70 mb-1.5 block">
                    Word Count Target
                  </label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/15 focus-within:border-amber-400/70 focus-within:bg-white/10 rounded-md px-3.5 py-2 transition-all">
                    <input
                      type="number"
                      value={wordCount}
                      onChange={(e) =>
                        setWordCount(e.target.value ? Number(e.target.value) : "")
                      }
                      step={5000}
                      className="w-full bg-transparent outline-none text-sm font-mono text-amber-200 text-left"
                    />
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">words</span>
                  </div>
                </div>
              </div>

              {/* 3. Logline / Premise */}
              <div>
                <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70 mb-1.5 block">
                  Logline / Central Premise
                </label>
                <textarea
                  value={logline}
                  onChange={(e) => setLogline(e.target.value)}
                  placeholder="In one or two sentences, what is the core conflict and mystery of your story?..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/15 focus:border-amber-400/70 focus:bg-white/10 rounded-md outline-none p-3 text-xs font-serif text-stone-200 placeholder:text-stone-500 transition-all resize-none shadow-inner leading-relaxed"
                />
              </div>

              {/* 4. Primary Genre Selector (Interactive Dynamic Mood Trigger) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70">
                    Primary Genre (Sets Atmosphere & Mood)
                  </label>
                  <span className="text-[9px] font-mono text-amber-300/90 font-medium">
                    {genre}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((g) => {
                    const isSelected = genre === g;

                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGenreChange(g)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all duration-300 border text-center",
                          isSelected
                            ? "bg-amber-500/20 text-amber-200 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.25)] scale-102"
                            : "bg-white/5 text-stone-400 border-white/10 hover:bg-white/10 hover:text-stone-200 hover:border-white/20"
                        )}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Audience & Cover Binding Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
                <div>
                  <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70 mb-2 block">
                    Target Audience
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {AUDIENCES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAudience(a)}
                        className={cn(
                          "px-2 py-1 rounded text-[9px] font-medium tracking-wide transition-all border",
                          audience === a
                            ? "bg-white/20 text-white border-white/40 shadow-xs"
                            : "bg-white/5 text-stone-400 border-white/10 hover:bg-white/10 hover:text-stone-200"
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300/70 mb-2 block">
                    Cover Binding
                  </label>
                  <div className="flex items-center gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          userChangedBindingRef.current = true;
                          setColorStyle(c);
                        }}
                        title={c.name}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center p-0.5",
                          colorStyle.name === c.name
                            ? "border-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                            : "border-transparent hover:scale-105 opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className={cn("w-full h-full rounded-full shadow-inner", c.bg)} />
                      </button>
                    ))}
                    <span className="text-[9px] font-mono text-stone-400 ml-1">
                      {colorStyle.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Submit Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmitting || !title.trim()}
                  className={cn(
                    "w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2.5",
                    "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-serif font-bold",
                    "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:shadow-amber-500/20 active:scale-[0.99]"
                  )}
                >
                  <Feather className="w-4 h-4" />
                  <span>{isSubmitting ? "Inscribing Manuscript..." : "Open Studio & Begin Writing"}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Guide & AI Prompt Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-[#14121a] border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      New Manuscript Setup Guide
                    </h2>
                    <p className="text-[11px] text-stone-400 font-sans">
                      Form requirements, best practices, and AI setup assistance
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-300">
                {/* Section 1: Form field descriptions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    What to fill out on this page?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-bold text-stone-200">1. Manuscript Title</span>
                      <p className="text-stone-400 leading-relaxed">
                        A memorable, evocative working title (2–7 words). Displayed prominently across your book cover, spines, and studio.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-bold text-stone-200">2. Author / Pen Name</span>
                      <p className="text-stone-400 leading-relaxed">
                        Author byline stamped on the book cover and title page (can be your real name or pen name).
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-bold text-stone-200">3. Genre & Audience</span>
                      <p className="text-stone-400 leading-relaxed">
                        Select the primary genre (Fantasy, Sci-Fi, Romance, Thriller, etc.) and reading maturity target (Middle Grade, YA, Adult).
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="font-bold text-stone-200">4. Central Logline & Word Target</span>
                      <p className="text-stone-400 leading-relaxed">
                        A concise 1–2 sentence premise hook (35–70 words) and your overall target word count milestone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: AI setup prompt suggestion */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                        <Feather className="w-3.5 h-3.5" />
                        Unsure what to write? Copy this AI Architect Prompt
                      </h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Send this prompt to ChatGPT, Claude, or Gemini along with your raw idea to generate a calibrated setup configuration:
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyArchitectPrompt}
                      className={cn(
                        "px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm",
                        isPromptCopied
                          ? "bg-emerald-600 text-white shadow-emerald-500/20"
                          : "bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold"
                      )}
                    >
                      {isPromptCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Prompt Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt to Clipboard</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Prompt Code Block Preview */}
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono leading-relaxed text-stone-300 max-h-60 overflow-y-auto whitespace-pre-wrap select-all selection:bg-amber-500/30">
{NEW_MANUSCRIPT_ARCHITECT_PROMPT}
                    </pre>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Tip:</strong> Once the AI responds with your details, copy and paste the generated title, logline, genre, and word count target into the form below, then click <em>"Open Studio & Begin Writing"</em> to start composing immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  Ocean Novel • Project Setup Architect
                </span>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors"
                >
                  Got it, return to form
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
