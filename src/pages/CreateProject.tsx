import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Romance",
  "Historical",
  "Thriller",
  "Contemporary",
];
const AUDIENCES = ["Middle Grade", "Young Adult (YA)", "New Adult", "Adult"];

const COLORS = [
  {
    name: "Obsidian",
    bg: "bg-[#2B3A42]",
    text: "text-[#E5E0D5]",
    accent: "bg-[#965A5A]",
    ribbon: "bg-rose-700",
  },
  {
    name: "Mahogany",
    bg: "bg-[#4A2C2C]",
    text: "text-[#E5E0D5]",
    accent: "bg-[#D3BFA9]",
    ribbon: "bg-amber-600",
  },
  {
    name: "Forest",
    bg: "bg-[#2F4538]",
    text: "text-[#F4F1EA]",
    accent: "bg-[#E5E0D5]",
    ribbon: "bg-stone-300",
  },
  {
    name: "Midnight",
    bg: "bg-[#1A1A24]",
    text: "text-[#E5E0D5]",
    accent: "bg-[#5C7C8A]",
    ribbon: "bg-indigo-400",
  },
  {
    name: "Parchment",
    bg: "bg-[#D3BFA9]",
    text: "text-[#3A3532]",
    accent: "bg-[#965A5A]",
    ribbon: "bg-rose-800",
  },
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [logline, setLogline] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [audience, setAudience] = useState(AUDIENCES[1]);
  const [wordCount, setWordCount] = useState<number | string>(80000);
  const [colorStyle, setColorStyle] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setIsSubmitting(true);
    // Simulate creation delay
    setTimeout(() => {
      navigate("/project/1");
    }, 300);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 h-[100dvh] w-full overflow-hidden bg-[#F4F1EA] flex flex-col relative font-sans selection:bg-[#965A5A] selection:text-white"
    >
      {/* Abstract Artistic Background - Matches Dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[#E8E3D7] rounded-full mix-blend-multiply blur-[60px] lg:blur-[100px] opacity-70" />
        <div className="absolute top-[30%] -left-20 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#E2D9C8] rounded-full mix-blend-multiply blur-[60px] lg:blur-[120px] opacity-50" />
      </div>

      {/* Header */}
      <div className="relative z-20 px-6 py-4 lg:px-12 lg:py-6 flex items-center justify-between shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/50 border border-stone-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Back to Studio
          </span>
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-[1400px] mx-auto w-full px-6 lg:px-16 gap-12 lg:gap-32 h-full min-h-0 pb-12">
        {/* Left: 3D Book Preview Canvas */}
        <motion.div
          initial={{ opacity: 0, x: -40, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className="flex-1 flex justify-center items-center w-full"
        >
          <div className="relative w-[180px] h-[260px] lg:w-[240px] lg:h-[350px] group [perspective:1200px]">
            <div
              className={cn(
                "relative w-full h-full rounded-r-lg rounded-l-[4px] shadow-2xl transition-all duration-700 [transform-style:preserve-3d]",
                "rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[2deg] shadow-[20px_20px_40px_rgba(0,0,0,0.15)]",
                colorStyle.bg,
              )}
            >
              {/* Paper Edges (3D depth simulation) */}
              <div className="absolute inset-y-[3px] -right-[4px] lg:-right-[5px] w-[4px] lg:w-[5px] bg-[#E8E3D7] rounded-r-sm shadow-[inset_1px_0_2px_rgba(0,0,0,0.2)]" />
              <div className="absolute -bottom-[3px] lg:-bottom-[4px] inset-x-[3px] h-[3px] lg:h-[4px] bg-[#E8E3D7] rounded-b-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />

              {/* Cover Texture */}
              <div
                className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none rounded-r-lg rounded-l-[4px]"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
              ></div>

              {/* Spine Crease */}
              <div className="absolute left-0 inset-y-0 w-4 lg:w-5 bg-gradient-to-r from-black/60 via-black/20 to-transparent rounded-l-[4px] mix-blend-multiply pointer-events-none" />
              <div className="absolute left-[1px] inset-y-0 w-px bg-white/20 pointer-events-none" />
              <div className="absolute left-3 lg:left-4 inset-y-0 w-px bg-black/10 pointer-events-none" />

              {/* Bookmark Ribbon */}
              <div
                className={cn(
                  "absolute top-0 left-6 lg:left-8 w-4 lg:w-5 h-16 lg:h-16 shadow-md pointer-events-none transition-colors duration-500",
                  colorStyle.ribbon,
                )}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
                }}
              />

              {/* Book Cover Content */}
              <div className="absolute inset-0 flex flex-col p-5 lg:p-8 pt-10 lg:pt-14 z-10 pointer-events-none transition-colors duration-500">
                <div className="flex-1 flex flex-col items-center text-center h-full">
                  <span
                    className={cn(
                      "text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.25em] mb-4 lg:mb-6 opacity-70 transition-colors duration-500 shrink-0",
                      colorStyle.text,
                    )}
                  >
                    {genre}
                  </span>

                  <div className="w-full border-t border-b border-current opacity-30 py-4 lg:py-6 flex flex-col items-center justify-center shrink-0">
                    <h2
                      className={cn(
                        "text-xl lg:text-2xl font-serif font-bold leading-snug drop-shadow-md px-2 break-words max-w-full transition-colors duration-500 line-clamp-3",
                        colorStyle.text,
                      )}
                    >
                      {title || "Untitled"}
                    </h2>
                  </div>

                  <div className="flex-1 min-h-[1rem]"></div>

                  <div
                    className={cn(
                      "mt-auto flex flex-col items-center opacity-90 transition-colors duration-500 shrink-0",
                      colorStyle.text,
                    )}
                  >
                    <BookOpen className="w-4 h-4 mb-2 lg:mb-3 opacity-50" />
                    <span className="text-[7px] lg:text-[8px] font-bold uppercase tracking-[0.2em] px-2 line-clamp-1">
                      {author || "Author Name"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Form Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="flex-1 w-full max-w-[520px] flex flex-col justify-center"
        >
          <div className="mb-5 lg:mb-6 shrink-0">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 tracking-tight mb-1">
              Create Project
            </h1>
            <p className="text-stone-500 text-xs">
              Define the foundation of your next masterpiece.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-5">
            {/* Title Input */}
            <div>
              <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-1.5 block">
                Manuscript Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full bg-transparent border-b-2 border-stone-200 focus:border-[#965A5A] outline-none py-1.5 text-xl lg:text-2xl font-serif text-stone-800 placeholder:text-stone-300 transition-colors"
                autoFocus
              />
            </div>

            {/* Row 2: Author & Word Count */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-[3]">
                <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-1.5 block">
                  Author / Pen Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="How shall you be known?"
                  className="w-full bg-transparent border-b border-stone-200 focus:border-[#965A5A] outline-none py-1.5 text-base font-serif text-stone-700 placeholder:text-stone-300 transition-colors"
                />
              </div>
              <div className="flex-[2]">
                <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-1.5 block">
                  Word Goal
                </label>
                <div className="flex items-center gap-2 border-b border-stone-200 focus-within:border-[#965A5A] transition-colors py-1.5">
                  <input
                    type="number"
                    value={wordCount}
                    onChange={(e) =>
                      setWordCount(e.target.value ? Number(e.target.value) : "")
                    }
                    step={5000}
                    className="w-full bg-transparent outline-none text-base font-mono text-stone-800 text-right"
                  />
                  <span className="text-[10px] text-stone-500 font-medium">
                    words
                  </span>
                </div>
              </div>
            </div>

            {/* Logline Textarea */}
            <div>
              <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-1.5 block">
                Logline / Premise
              </label>
              <textarea
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                placeholder="In one or two sentences, what is this story about?..."
                rows={2}
                className="w-full bg-white/40 border border-stone-200 focus:border-[#965A5A] focus:bg-white rounded-lg outline-none p-2.5 text-xs font-serif text-stone-700 placeholder:text-stone-400 transition-colors resize-none shadow-sm"
              />
            </div>

            {/* Genre Selection */}
            <div>
              <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2 block">
                Primary Genre
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all duration-300 border",
                      genre === g
                        ? "bg-[#965A5A] text-white border-[#965A5A] shadow-md"
                        : "bg-white/50 text-stone-500 border-stone-200 hover:bg-white hover:border-stone-300 hover:shadow-sm",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Audience & Cover Binding */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end">
              <div className="flex-[3]">
                <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2 block">
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AUDIENCES.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAudience(a)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all duration-300 border",
                        audience === a
                          ? "bg-stone-700 text-white border-stone-700 shadow-md"
                          : "bg-white/50 text-stone-500 border-stone-200 hover:bg-white hover:border-stone-300 hover:shadow-sm",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-[2]">
                <label className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2 block">
                  Binding
                </label>
                <div className="flex gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColorStyle(c)}
                      className={cn(
                        "w-6 h-6 rounded-full shadow-inner border-2 transition-all duration-300 flex items-center justify-center",
                        colorStyle.name === c.name
                          ? "border-[#965A5A] scale-110"
                          : "border-transparent hover:scale-105",
                      )}
                    >
                      <div
                        className={cn("w-4 h-4 rounded-full shadow-sm", c.bg)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !title.trim()}
                className="w-full relative overflow-hidden group bg-stone-900 text-white py-3.5 rounded-xl text-sm font-medium tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Create Manuscript</>
                  )}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
