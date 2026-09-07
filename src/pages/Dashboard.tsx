import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  BookOpen,
  PenTool,
  ArrowRight,
  TrendingUp,
  Flame,
  Coffee,
  Type,
  Sparkles,
} from "lucide-react";
import {
  MOCK_PROJECTS,
  MOCK_MANUSCRIPT,
  MOCK_CHARACTERS,
  ManuscriptItem,
} from "@/mockData";
import { cn } from "@/lib/utils";

import { useProject } from "@/context/ProjectContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { project } = useProject();

  // Mock To-Do Tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Finish drafting Chapter 3",
      type: "writing",
      completed: false,
      urgency: "high",
    },
    {
      id: 2,
      title: "Add motivation for character 'Eleanor'",
      type: "worldbuilding",
      completed: false,
      urgency: "medium",
    },
    {
      id: 3,
      title: "Review plot hole in 'The Letter' scene",
      type: "editing",
      completed: false,
      urgency: "high",
    },
    {
      id: 4,
      title: "Research 1990s coastal town weather",
      type: "research",
      completed: true,
      urgency: "low",
    },
    {
      id: 5,
      title: "Write dialogue for Daniel's introduction",
      type: "writing",
      completed: true,
      urgency: "medium",
    },
  ]);

  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const mentionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalMentions = 0;
    const traverse = (items: ManuscriptItem[]) => {
      items.forEach((item) => {
        if (item.type === "scene" && item.content) {
          const regex = /data-id="([^"]+)" data-type="character"/g;
          let match;
          while ((match = regex.exec(item.content)) !== null) {
            counts[match[1]] = (counts[match[1]] || 0) + 1;
            totalMentions++;
          }
        }
        if (item.children) traverse(item.children);
      });
    };
    traverse(MOCK_MANUSCRIPT);

    const sortedMentions = Object.entries(counts)
      .map(([id, count]) => {
        const char = MOCK_CHARACTERS.find((c) => c.id === id);
        return { id, name: char ? char.name : "Unknown", count };
      })
      .sort((a, b) => b.count - a.count);

    return { totalMentions, sortedMentions };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 h-[100dvh] w-full overflow-hidden bg-[#3d261d] flex flex-col relative font-sans selection:bg-[#965A5A] selection:text-white"
    >
      {/* Immersive Vintage Wallpaper Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236e4b3b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#8c503c] rounded-full mix-blend-color-dodge blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[#d49a89] rounded-full mix-blend-overlay blur-[120px] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-4 lg:py-6 h-full relative z-10 flex flex-col gap-4">
        {/* SECTION 1: THE MANUSCRIPTS */}
        <section className="shrink-0 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfaf5] p-4 lg:p-6 rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.2)] border border-[#e5e0d5] relative">
            {/* Archive Folder Tab Decoration */}
            <div
              className="absolute -top-4 left-4 w-32 h-5 bg-[#e5e0d5]"
              style={{ clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)" }}
            />
            <div className="absolute -top-1 left-4 right-4 h-2 bg-[#fcfaf5] rounded-t-sm z-0" />
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6 relative z-10">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#4a3225] tracking-tight leading-none uppercase">
                Archive Projects
              </h1>

              {/* AUTHOR STATS STRIP */}
              <div className="flex items-center gap-3 sm:gap-6 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/60 shadow-sm shrink-0 w-max">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                    <Flame className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Streak
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-stone-800 leading-none">
                      5 Days
                    </p>
                  </div>
                </div>

                <div className="w-px h-4 lg:h-5 bg-stone-300/50" />

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                    <Type className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  </div>
                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      This Week
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-stone-800 leading-none">
                      12,450 W
                    </p>
                  </div>
                </div>

                <div className="w-px h-4 lg:h-5 bg-stone-300/50" />

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8c503c] border border-[#e5e0d5]">
                    <Coffee className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  </div>
                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Session
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-[#4a3225] leading-none">
                      14h 20m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/create")}
              className="flex items-center justify-center gap-2 bg-[#8c503c] text-[#fcfaf5] px-4 py-2 rounded-sm text-[10px] lg:text-xs font-bold tracking-widest uppercase hover:bg-[#b8785e] transition-colors shadow-sm hover:shadow-md w-full sm:w-auto shrink-0 border border-[#4a3225] relative z-10"
            >
              <Plus className="w-3.5 h-3.5" />
              New Archive
            </button>
          </div>

          <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-6 pt-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth custom-scrollbar relative z-10">
            {/* Render the single project from context */}
            {[project].map((proj) => {
              const covers = [
                {
                  bg: "bg-[#2a1a14]",
                  text: "text-[#e5e0d5]",
                  accent: "bg-[#b8785e]",
                  ribbon: "bg-[#8c503c]",
                },
              ];
              const style = covers[0];
              const progress = Math.round(
                (proj.stats.totalWords / proj.stats.targetWords) * 100,
              );

              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/project/${proj.id}`)}
                  className="snap-center sm:snap-start shrink-0 group cursor-pointer"
                >
                  <div
                    className={cn(
                      "relative w-[130px] h-[180px] lg:w-[170px] lg:h-[230px] rounded-r-md rounded-l-sm shadow-[4px_8px_16px_rgba(0,0,0,0.4)] transition-all duration-300",
                      "group-hover:-translate-y-2 group-hover:shadow-[6px_12px_24px_rgba(0,0,0,0.5)] border border-[#5d3f32]",
                      style.bg,
                    )}
                  >
                    {/* Spine Binding */}
                    <div className="absolute left-0 top-0 bottom-0 w-[12px] lg:w-[16px] bg-black/40 border-r border-[#5d3f32] rounded-l-sm shadow-inner" />

                    {/* Cover Texture */}
                    <div
                      className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none rounded-r-md rounded-l-[3px]"
                      style={{
                        backgroundImage:
                          'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                      }}
                    ></div>

                    {/* Book Cover Content */}
                    <div className="absolute inset-0 flex flex-col p-3 lg:p-4 pt-6 lg:pt-8 z-10 pointer-events-none ml-[12px] lg:ml-[16px]">
                      <div className="flex-1 flex flex-col items-center text-center mt-2">
                        {/* Tape */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/40 rotate-2 opacity-50" />
                        
                        <div className="w-[80%] bg-[#fcfaf5] p-2 border border-[#e5e0d5] shadow-sm transform -rotate-1">
                          <span
                            className={cn(
                              "block text-[6px] lg:text-[7px] font-bold uppercase tracking-[0.2em] mb-1 text-[#8c503c]",
                            )}
                          >
                            Case File
                          </span>
                          <h2
                            className={cn(
                              "text-xs lg:text-sm font-serif font-bold leading-tight text-[#4a3225] line-clamp-3",
                            )}
                          >
                            {proj.title}
                          </h2>
                        </div>

                        <div className="mt-2 lg:mt-4 opacity-40">
                          <BookOpen
                            className={cn(
                              "w-3 h-3 lg:w-3.5 lg:h-3.5",
                              style.text,
                            )}
                          />
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-auto pl-1 lg:pl-2">
                        <div className="flex justify-between items-end mb-1 lg:mb-1.5 px-0.5">
                          <span
                            className={cn(
                              "text-[6px] lg:text-[7px] uppercase tracking-widest font-bold opacity-60",
                              style.text,
                            )}
                          >
                            Words
                          </span>
                          <span
                            className={cn(
                              "text-[7px] lg:text-[8px] font-serif font-bold opacity-90",
                              style.text,
                            )}
                          >
                            {proj.stats.totalWords.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-black/40 h-[2px] lg:h-[3px] rounded-full overflow-hidden shadow-inner">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              style.accent,
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}
        <section className="flex-1 flex flex-col min-h-0 pb-2">
          <div className="mb-2 shrink-0">
            <h2 className="text-lg lg:text-xl font-serif font-bold text-[#fcfaf5] tracking-tight uppercase">
              Investigation Board
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0">
            {/* AI Editorial Tasks (Left Col) */}
            <div className="lg:col-span-8 bg-[#fcfaf5] rounded-sm p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden group min-h-0 h-full">
              {/* Paper texture overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="flex justify-between items-end mb-3 lg:mb-4 relative z-10 shrink-0 border-b border-[#e5e0d5] pb-2">
                <div>
                  <h3 className="font-serif text-base lg:text-lg font-bold text-[#4a3225] uppercase tracking-wide">
                    Task Notes
                  </h3>
                </div>
                <div className="bg-[#8c503c] text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-sm text-[9px] lg:text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {tasks.filter((t) => !t.completed).length} Pending
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar relative z-10 min-h-0">
                <div className="space-y-2">
                  {tasks
                    .sort((a, b) => Number(a.completed) - Number(b.completed))
                    .map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-sm border transition-all cursor-pointer relative",
                          task.completed
                            ? "bg-transparent border-transparent opacity-50"
                            : "bg-[#fcfaf5] border-[#e5e0d5] hover:border-[#d49a89] hover:shadow-sm"
                        )}
                        onClick={() => toggleTask(task.id)}
                      >
                        {!task.completed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8c503c] rounded-l-sm opacity-20" />
                        )}
                        <button className="shrink-0 focus:outline-none ml-1">
                          {task.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#8c503c]/70" />
                          ) : (
                            <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-sm border-2 border-[#d49a89] hover:border-[#8c503c] transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2 lg:gap-4">
                          <p
                            className={cn(
                              "text-xs lg:text-sm font-serif transition-colors truncate",
                              task.completed
                                ? "text-stone-400 line-through"
                                : "text-[#4a3225] font-medium"
                            )}
                          >
                            {task.title}
                          </p>

                          {!task.completed && (
                            <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                              {task.urgency === "high" && (
                                <span className="flex items-center gap-1 text-[8px] lg:text-[9px] uppercase tracking-widest font-bold text-[#c17a7a]">
                                  <AlertCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                </span>
                              )}
                              <span
                                className={cn(
                                  "text-[8px] lg:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-sm border",
                                  task.type === "writing"
                                    ? "bg-[#f4efe6] text-[#8c503c] border-[#e5e0d5]"
                                    : "bg-stone-100 text-stone-600 border-stone-200"
                                )}
                              >
                                {task.type}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column (Stacked on small, flex col on large) */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 lg:gap-4 min-h-[140px] lg:min-h-0 h-full">
              {/* Quick Jump (Vintage Journal style) */}
              <div
                className="bg-[#2a1a14] text-[#fcfaf5] rounded-sm p-4 lg:p-5 shadow-[4px_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none border border-[#5d3f32]"
                onClick={() => navigate(`/project/${project.id}/studio`)}
              >
                {/* Journal texture */}
                <div 
                  className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                  }}
                />
                {/* Leather binding */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/50 border-r border-[#5d3f32]" />
                
                <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 text-[#d49a89]">
                  <PenTool className="w-10 h-10 lg:w-16 lg:h-16" />
                </div>
                <div className="relative z-10 ml-2">
                  <p className="text-[7px] lg:text-[9px] uppercase tracking-widest font-bold text-[#d49a89]/70 mb-1">
                    Resume Drafting
                  </p>
                  <h3 className="font-serif text-sm lg:text-lg font-bold line-clamp-1 text-[#fcfaf5]">
                    {project.title}
                  </h3>
                  <p className="text-[#fcfaf5]/60 text-[10px] lg:text-xs mt-0.5 lg:mt-1 font-serif italic">
                    Chapter {project.stats.chapters} • Last updated {project.lastModified}
                  </p>
                </div>
                <div className="relative z-10 mt-2 lg:mt-4 flex items-center justify-between ml-2">
                  <div className="flex items-center gap-1 lg:gap-1.5 bg-[#fcfaf5]/10 px-1.5 py-1 lg:px-2 lg:py-1 rounded-sm text-[8px] lg:text-[10px] font-bold tracking-widest uppercase border border-[#fcfaf5]/20">
                    <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-[#d49a89]" />
                    +500 words
                  </div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-sm bg-[#8c503c] border border-[#b8785e] flex items-center justify-center group-hover:bg-[#b8785e] transition-colors shadow-sm text-white">
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                </div>
              </div>

              {/* World Radar (Polaroid style mini grid) */}
              <div className="bg-[#fcfaf5] rounded-sm p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex-1 flex flex-col min-h-0 relative">
                {/* Tape decoration */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 rotate-1 opacity-70 shadow-sm" />
                
                <div className="flex justify-between items-end mb-2 lg:mb-4 shrink-0 border-b border-[#e5e0d5] pb-2 mt-1">
                  <h3 className="font-serif text-sm lg:text-lg font-bold text-[#4a3225] uppercase tracking-wide">
                    World Radar
                  </h3>
                  <span className="text-[8px] lg:text-[9px] font-bold text-[#8c503c] tracking-widest uppercase hidden lg:block">
                    Mentions
                  </span>
                </div>

                {mentionStats.sortedMentions.length > 0 ? (
                  <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar min-h-0">
                    <div className="flex flex-col justify-start space-y-2 lg:space-y-4">
                      {mentionStats.sortedMentions.map((item, i) => {
                        const maxCount = mentionStats.sortedMentions[0].count;
                        const percentage = Math.max(
                          15,
                          (item.count / maxCount) * 100,
                        );

                        return (
                          <div
                            key={item.id}
                            className="relative group shrink-0"
                          >
                            <div className="flex justify-between items-end mb-1 lg:mb-1.5">
                              <span className="text-[10px] lg:text-xs font-serif font-bold text-[#4a3225] group-hover:text-[#8c503c] transition-colors truncate pr-2 lg:pr-4">
                                {item.name}
                              </span>
                              <span className="text-[#8c503c] font-sans text-[8px] lg:text-[10px] font-bold">
                                {item.count}
                              </span>
                            </div>
                            <div className="h-1 lg:h-1.5 w-full bg-[#e5e0d5] rounded-sm overflow-hidden border border-[#d49a89]/20">
                              <div
                                className="h-full bg-gradient-to-r from-[#d49a89] to-[#8c503c] rounded-sm transition-all duration-1000 relative"
                                style={{ width: `${percentage}%` }}
                              >
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
                    <p className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5 lg:mb-1 text-center">
                      No Entities
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
