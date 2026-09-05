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
      className="flex-1 h-[100dvh] w-full overflow-hidden bg-[#F4F1EA] flex flex-col relative font-sans selection:bg-[#965A5A] selection:text-white"
    >
      {/* Abstract Artistic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[#E8E3D7] rounded-full mix-blend-multiply blur-[60px] lg:blur-[100px] opacity-70" />
        <div className="absolute top-[30%] -left-20 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#E2D9C8] rounded-full mix-blend-multiply blur-[60px] lg:blur-[120px] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-4 lg:py-6 h-full relative z-10 flex flex-col gap-4">
        {/* SECTION 1: THE MANUSCRIPTS */}
        <section className="shrink-0 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 tracking-tight leading-none">
                Active Projects
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
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#E5E0D5] flex items-center justify-center text-stone-700 shadow-inner">
                    <Coffee className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  </div>
                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Session
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-stone-800 leading-none">
                      14h 20m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/create")}
              className="flex items-center justify-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-full text-[10px] lg:text-xs font-medium hover:bg-stone-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>

          <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 pt-2 snap-x -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth custom-scrollbar">
            {/* Render the single project from context */}
            {[project].map((proj) => {
              const covers = [
                {
                  bg: "bg-[#2B3A42]",
                  text: "text-[#E5E0D5]",
                  accent: "bg-[#965A5A]",
                  ribbon: "bg-rose-700",
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
                  className="snap-center sm:snap-start shrink-0 group [perspective:1000px] cursor-pointer"
                >
                  <div
                    className={cn(
                      "relative w-[130px] h-[180px] lg:w-[170px] lg:h-[230px] rounded-r-md rounded-l-[3px] shadow-lg transition-all duration-500 [transform-style:preserve-3d]",
                      "group-hover:-translate-y-1 lg:group-hover:-translate-y-2 group-hover:rotate-y-[-10deg] group-hover:rotate-x-[2deg] group-hover:shadow-[10px_10px_20px_rgba(0,0,0,0.25)]",
                      style.bg,
                    )}
                  >
                    {/* Paper Edges (3D depth simulation) */}
                    <div className="absolute inset-y-[2px] -right-[2px] lg:-right-[3px] w-[2px] lg:w-[3px] bg-[#E8E3D7] rounded-r-sm shadow-[inset_1px_0_2px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:w-[4px] lg:group-hover:w-[6px] group-hover:-right-[4px] lg:group-hover:-right-[6px]" />
                    <div className="absolute -bottom-[2px] lg:-bottom-[3px] inset-x-[2px] h-[2px] lg:h-[3px] bg-[#E8E3D7] rounded-b-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:h-[4px] lg:group-hover:h-[6px] group-hover:-bottom-[4px] lg:group-hover:-bottom-[6px]" />

                    {/* Cover Texture */}
                    <div
                      className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none rounded-r-md rounded-l-[3px]"
                      style={{
                        backgroundImage:
                          'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                      }}
                    ></div>

                    {/* Spine Crease */}
                    <div className="absolute left-0 inset-y-0 w-2 lg:w-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent rounded-l-[3px] mix-blend-multiply pointer-events-none" />
                    <div className="absolute left-[1px] inset-y-0 w-px bg-white/20 pointer-events-none" />
                    <div className="absolute left-2 lg:left-3 inset-y-0 w-px bg-black/10 pointer-events-none" />

                    {/* Bookmark Ribbon */}
                    <div
                      className={cn(
                        "absolute top-0 left-4 lg:left-6 w-2 lg:w-3 h-8 lg:h-10 shadow-sm pointer-events-none",
                        style.ribbon,
                      )}
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
                      }}
                    />

                    {/* Book Cover Content */}
                    <div className="absolute inset-0 flex flex-col p-3 lg:p-4 pt-6 lg:pt-8 z-10 pointer-events-none">
                      <div className="flex-1 flex flex-col items-center text-center">
                        <span
                          className={cn(
                            "text-[6px] lg:text-[7px] font-bold uppercase tracking-[0.2em] mb-2 lg:mb-4 opacity-70",
                            style.text,
                          )}
                        >
                          {proj.tags[0]}
                        </span>

                        <div className="w-full border-t border-b border-white/10 py-2 lg:py-4 flex flex-col items-center justify-center">
                          <h2
                            className={cn(
                              "text-sm lg:text-lg font-serif font-bold leading-tight drop-shadow-md px-1",
                              style.text,
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
            <h2 className="text-lg lg:text-xl font-serif font-bold text-stone-800 tracking-tight">
              Studio Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0">
            {/* AI Editorial Tasks (Left Col) */}
            <div className="lg:col-span-8 bg-white/60 backdrop-blur-md rounded-2xl p-4 lg:p-5 border border-white shadow-xl flex flex-col relative overflow-hidden group min-h-0 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 lg:w-64 lg:h-64 bg-[#965A5A]/5 rounded-full blur-[40px] lg:blur-[80px] pointer-events-none group-hover:bg-[#965A5A]/10 transition-colors duration-1000" />

              <div className="flex justify-between items-end mb-3 lg:mb-4 relative z-10 shrink-0">
                <div>
                  <h3 className="font-serif text-base lg:text-lg font-bold text-stone-800">
                    Editorial Assistant
                  </h3>
                </div>
                <div className="bg-[#965A5A]/10 text-[#965A5A] px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-[9px] lg:text-[10px] font-bold tracking-widest uppercase">
                  {tasks.filter((t) => !t.completed).length} Tasks
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
                          "flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl border transition-all cursor-pointer",
                          task.completed
                            ? "bg-transparent border-transparent opacity-50"
                            : "bg-white border-[#E5E0D5] hover:border-[#D3BFA9] hover:shadow-sm",
                        )}
                        onClick={() => toggleTask(task.id)}
                      >
                        <button className="shrink-0 focus:outline-none">
                          {task.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600/70" />
                          ) : (
                            <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border-2 border-stone-300 hover:border-[#965A5A] transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2 lg:gap-4">
                          <p
                            className={cn(
                              "text-xs lg:text-sm font-serif transition-colors truncate",
                              task.completed
                                ? "text-stone-400 line-through"
                                : "text-stone-800",
                            )}
                          >
                            {task.title}
                          </p>

                          {!task.completed && (
                            <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                              {task.urgency === "high" && (
                                <span className="flex items-center gap-1 text-[8px] lg:text-[9px] uppercase tracking-widest font-bold text-rose-600">
                                  <AlertCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                </span>
                              )}
                              <span
                                className={cn(
                                  "text-[8px] lg:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md",
                                  task.type === "writing"
                                    ? "bg-amber-100/50 text-amber-800"
                                    : task.type === "worldbuilding"
                                      ? "bg-indigo-100/50 text-indigo-800"
                                      : task.type === "editing"
                                        ? "bg-rose-100/50 text-rose-800"
                                        : "bg-stone-100 text-stone-600",
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
              {/* Quick Jump */}
              <div
                className="bg-[#3A3532] text-[#F9F6ED] rounded-2xl p-4 lg:p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none"
                onClick={() => navigate(`/project/${project.id}/studio`)}
              >
                <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                  <PenTool className="w-10 h-10 lg:w-16 lg:h-16" />
                </div>
                <div className="relative z-10">
                  <p className="text-[7px] lg:text-[9px] uppercase tracking-widest font-bold text-white/50 mb-1">
                    Pick up where you left off
                  </p>
                  <h3 className="font-serif text-sm lg:text-lg font-bold line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-white/70 text-[10px] lg:text-xs mt-0.5 lg:mt-1">
                    Chapter {project.stats.chapters} • Last modified {project.lastModified}
                  </p>
                </div>
                <div className="relative z-10 mt-2 lg:mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 lg:gap-1.5 bg-white/10 px-1.5 py-1 lg:px-2 lg:py-1 rounded-full text-[8px] lg:text-[10px] font-medium backdrop-blur-sm">
                    <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-emerald-400" />
                    +500 words
                  </div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-[#3A3532] transition-colors">
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                </div>
              </div>

              {/* World Radar */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 lg:p-5 border border-white shadow-xl flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-end mb-2 lg:mb-4 shrink-0">
                  <h3 className="font-serif text-sm lg:text-lg font-bold text-stone-800">
                    World Radar
                  </h3>
                  <span className="text-[8px] lg:text-[9px] font-bold text-stone-400 tracking-widest uppercase hidden lg:block">
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
                              <span className="text-[10px] lg:text-xs font-serif font-medium text-stone-700 group-hover:text-[#965A5A] transition-colors truncate pr-2 lg:pr-4">
                                {item.name}
                              </span>
                              <span className="text-stone-400 font-sans text-[8px] lg:text-[10px] font-bold">
                                {item.count}
                              </span>
                            </div>
                            <div className="h-1 lg:h-1.5 w-full bg-stone-200/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#965A5A]/80 to-[#965A5A] rounded-full transition-all duration-1000 relative"
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
