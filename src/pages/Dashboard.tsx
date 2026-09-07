import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
  Trash2,
  X,
  Users,
} from "lucide-react";
import {
  MOCK_PROJECT,
  MOCK_PROJECTS,
  MOCK_MANUSCRIPT,
  MOCK_CHARACTERS,
  MOCK_LOCATIONS,
  ManuscriptItem,
} from "@/mockData";
import { cn } from "@/lib/utils";
import { storage, ProjectMeta, StudioTask } from "@/lib/storage";
import { useProject } from "@/context/ProjectContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { project } = useProject();

  const [savedProjects, setSavedProjects] = useState<ProjectMeta[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Real Tasks State (synced with LocalStorage)
  const [tasks, setTasks] = useState<StudioTask[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<StudioTask['type']>("writing");
  const [newTaskUrgency, setNewTaskUrgency] = useState<StudioTask['urgency']>("medium");

  useEffect(() => {
    let projects = storage.getProjects();

    // Seed sample project on first load if empty
    if (projects.length === 0) {
      const sampleId = 'sample-' + Date.now();

      storage.saveProject({
        id: sampleId,
        title: MOCK_PROJECT.title,
        author: 'Sarah Cole',
        genre: MOCK_PROJECT.genre,
        audience: 'Adult',
        logline: MOCK_PROJECT.premise,
        wordGoal: MOCK_PROJECT.targetWords,
        currentWords: MOCK_PROJECT.currentWords,
        lastModified: Date.now(),
        themeColor: 'bg-[#2a1a14]'
      });

      storage.saveProjectData(sampleId, {
        manuscript: MOCK_MANUSCRIPT,
        characters: MOCK_CHARACTERS,
        locations: MOCK_LOCATIONS
      });

      projects = storage.getProjects();
    }

    const sorted = projects.sort((a, b) => b.lastModified - a.lastModified);
    setSavedProjects(sorted);
    if (sorted.length > 0) {
      setSelectedProjectId(sorted[0].id);
    }

    // Load real tasks from storage
    setTasks(storage.getTasks());
  }, []);

  // Real Task Handlers
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    storage.saveAllTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: StudioTask = {
      id: `task-${Date.now()}`,
      projectId: selectedProjectId || savedProjects[0]?.id,
      title: newTaskTitle.trim(),
      type: newTaskType,
      completed: false,
      urgency: newTaskUrgency,
      createdAt: Date.now(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveTask(newTask);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    storage.deleteTask(taskId);
  };

  // Active / Most recent project
  const activeProject = useMemo(() => {
    if (selectedProjectId) {
      const found = savedProjects.find(p => p.id === selectedProjectId);
      if (found) return found;
    }
    return savedProjects.length > 0 ? savedProjects[0] : null;
  }, [savedProjects, selectedProjectId]);

  // Project Data for active project (for actual manuscript & entities)
  const activeProjectData = useMemo(() => {
    if (!activeProject) return null;
    return storage.getProjectData(activeProject.id);
  }, [activeProject?.id, activeProject?.lastModified]);

  // Real Resume Drafting Stats
  const resumeStats = useMemo(() => {
    if (!activeProject) {
      return {
        chapters: 0,
        scenes: 0,
        currentSceneTitle: "No scenes yet",
        timeAgo: "Recently",
      };
    }

    const manuscript = activeProjectData?.manuscript || [];
    let chaptersCount = 0;
    let scenesCount = 0;
    let firstSceneTitle = "";

    const scanManuscript = (items: ManuscriptItem[]) => {
      for (const item of items) {
        if (item.type === "chapter") chaptersCount++;
        if (item.type === "scene") {
          scenesCount++;
          if (!firstSceneTitle) firstSceneTitle = item.title;
        }
        if (item.children) scanManuscript(item.children);
      }
    };
    scanManuscript(manuscript);

    // Calculate time ago
    const diffMs = Date.now() - (activeProject.lastModified || Date.now());
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    let timeAgo = "Just now";
    if (days > 0) timeAgo = `${days}d ago`;
    else if (hours > 0) timeAgo = `${hours}h ago`;
    else if (mins > 1) timeAgo = `${mins}m ago`;

    return {
      chapters: chaptersCount || 1,
      scenes: scenesCount || 1,
      currentSceneTitle: firstSceneTitle || "Chapter 1",
      timeAgo,
    };
  }, [activeProject, activeProjectData]);

  // Real World Radar Stats computed from the actual project manuscript & character roster
  const worldRadarStats = useMemo(() => {
    if (!activeProject) return { totalMentions: 0, sortedMentions: [] };

    const manuscript = activeProjectData?.manuscript || [];
    const rawCharacters = activeProjectData?.characters && activeProjectData.characters.length > 0
      ? activeProjectData.characters
      : MOCK_CHARACTERS;

    const charMap: Record<string, { id: string; name: string; count: number; role: string }> = {};

    // Register known characters
    rawCharacters.forEach((c: any) => {
      const name = c.name?.trim() || "";
      if (name) {
        charMap[name.toLowerCase()] = {
          id: c.id || name,
          name: name,
          count: 0,
          role: c.role || "Character",
        };
      }
    });

    let totalMentions = 0;

    const scanForMentions = (items: ManuscriptItem[]) => {
      for (const item of items) {
        if (item.type === "scene" && item.content) {
          const content = item.content;
          const plain = content.replace(/<[^>]*>?/gm, " ");

          // 1. TipTap Mention tags: data-label="..."
          const labelRegex = /data-label="([^"]+)"/gi;
          let labelMatch;
          while ((labelMatch = labelRegex.exec(content)) !== null) {
            const label = labelMatch[1].trim();
            const lower = label.toLowerCase();
            if (!charMap[lower]) {
              charMap[lower] = { id: label, name: label, count: 0, role: "Character" };
            }
            charMap[lower].count++;
            totalMentions++;
          }

          // 2. Also check @Name pattern in plain text
          const atRegex = /@([A-Z][a-zA-Z0-9_]+(?:\s+[A-Z][a-zA-Z0-9_]+)?)/g;
          let atMatch;
          while ((atMatch = atRegex.exec(plain)) !== null) {
            const name = atMatch[1].trim();
            const lower = name.toLowerCase();
            if (charMap[lower] && charMap[lower].count === 0) {
              charMap[lower].count++;
              totalMentions++;
            }
          }

          // 3. Check direct character name references in narrative
          Object.values(charMap).forEach((char) => {
            if (char.name && char.name.length >= 3) {
              const escaped = char.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const regex = new RegExp(`\\b${escaped}\\b`, "gi");
              const occurrences = (plain.match(regex) || []).length;
              if (occurrences > char.count) {
                totalMentions += occurrences - char.count;
                char.count = occurrences;
              }
            }
          });
        }
        if (item.children) scanForMentions(item.children);
      }
    };

    scanForMentions(manuscript);

    const sortedMentions = Object.values(charMap)
      .sort((a, b) => b.count - a.count);

    return { totalMentions, sortedMentions };
  }, [activeProject, activeProjectData]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (taskFilter === "pending") return !t.completed;
        if (taskFilter === "completed") return t.completed;
        return true;
      })
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [tasks, taskFilter]);

  // Real word stats across all user projects
  const totalWordsAcrossAll = useMemo(() => {
    return savedProjects.reduce((acc, p) => acc + (p.currentWords || 0), 0);
  }, [savedProjects]);

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
                      Total Words
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-stone-800 leading-none">
                      {totalWordsAcrossAll.toLocaleString()} W
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
                      Writing Time
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-[#4a3225] leading-none">
                      {Math.max(1, Math.round(totalWordsAcrossAll / 450))}h {Math.round((totalWordsAcrossAll % 450) / 10)}m
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
            {/* Render all projects from local storage */}
            {savedProjects.length === 0 && (
               <div className="flex items-center justify-center w-full h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50">
                 <p className="text-stone-500 text-sm font-medium">No archives found. Start a new project.</p>
               </div>
            )}
            {savedProjects.map((proj) => {
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
                ((proj.currentWords || 0) / proj.wordGoal) * 100,
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
                            {(proj.currentWords || 0).toLocaleString()}
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
          <div className="mb-2 shrink-0 flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-serif font-bold text-[#fcfaf5] tracking-tight uppercase">
              Investigation Board
            </h2>
            {savedProjects.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-300 text-[10px] uppercase tracking-wider font-bold">Focus:</span>
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-[#2a1a14] text-[#fcfaf5] text-[11px] font-serif border border-[#5d3f32] rounded-sm px-2 py-0.5 focus:outline-none focus:border-[#d49a89]"
                >
                  {savedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0">
            {/* Task Notes (Left Col) */}
            <div className="lg:col-span-8 bg-[#fcfaf5] rounded-sm p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden group min-h-0 h-full">
              {/* Paper texture overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 relative z-10 shrink-0 border-b border-[#e5e0d5] pb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-base lg:text-lg font-bold text-[#4a3225] uppercase tracking-wide">
                    Task Notes
                  </h3>
                  {/* Status filter pills */}
                  <div className="flex items-center gap-1 bg-[#ede8dc] p-0.5 rounded-sm">
                    <button
                      onClick={() => setTaskFilter("all")}
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors",
                        taskFilter === "all" ? "bg-[#8c503c] text-white" : "text-[#5d3f32] hover:text-[#8c503c]"
                      )}
                    >
                      All ({tasks.length})
                    </button>
                    <button
                      onClick={() => setTaskFilter("pending")}
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors",
                        taskFilter === "pending" ? "bg-[#8c503c] text-white" : "text-[#5d3f32] hover:text-[#8c503c]"
                      )}
                    >
                      Pending ({tasks.filter((t) => !t.completed).length})
                    </button>
                    <button
                      onClick={() => setTaskFilter("completed")}
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors",
                        taskFilter === "completed" ? "bg-[#8c503c] text-white" : "text-[#5d3f32] hover:text-[#8c503c]"
                      )}
                    >
                      Done ({tasks.filter((t) => t.completed).length})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="flex items-center gap-1.5 bg-[#8c503c] text-white px-2.5 py-1 rounded-sm text-[9px] lg:text-[10px] font-bold tracking-widest uppercase hover:bg-[#b8785e] transition-colors shadow-sm"
                  >
                    {isAddingTask ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {isAddingTask ? "Cancel" : "Add Task"}
                  </button>
                </div>
              </div>

              {/* Add Task Expandable Form */}
              <AnimatePresence>
                {isAddingTask && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddTask}
                    className="relative z-20 mb-3 bg-[#f4efe6] border border-[#e5e0d5] p-2.5 rounded-sm flex flex-col gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Write confrontation dialogue in Chapter 2..."
                      className="w-full bg-white border border-[#d8d2c4] rounded-sm px-2.5 py-1.5 text-xs text-[#4a3225] font-serif placeholder:text-stone-400 focus:outline-none focus:border-[#8c503c]"
                      autoFocus
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Type Picker */}
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-stone-500">
                          <span>Type:</span>
                          {(['writing', 'editing', 'worldbuilding', 'research'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setNewTaskType(t)}
                              className={cn(
                                "px-1.5 py-0.5 rounded-sm border transition-colors",
                                newTaskType === t
                                  ? "bg-[#8c503c] text-white border-[#8c503c]"
                                  : "bg-white text-stone-600 border-[#d8d2c4] hover:border-stone-400"
                              )}
                            >
                              {t === 'worldbuilding' ? 'world' : t}
                            </button>
                          ))}
                        </div>

                        {/* Urgency Picker */}
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-stone-500 ml-2">
                          <span>Urgency:</span>
                          {(['low', 'medium', 'high'] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setNewTaskUrgency(u)}
                              className={cn(
                                "px-1.5 py-0.5 rounded-sm border transition-colors",
                                newTaskUrgency === u
                                  ? u === 'high'
                                    ? "bg-red-700 text-white border-red-700"
                                    : "bg-amber-700 text-white border-amber-700"
                                  : "bg-white text-stone-600 border-[#d8d2c4] hover:border-stone-400"
                              )}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="bg-[#4a3225] hover:bg-[#8c503c] disabled:opacity-40 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm transition-colors"
                      >
                        Save Task
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar relative z-10 min-h-0">
                {filteredTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                    <CheckCircle2 className="w-8 h-8 text-stone-300 mb-2 stroke-[1.5]" />
                    <p className="font-serif text-sm font-medium text-stone-600">No tasks found</p>
                    <p className="text-xs text-stone-400 mt-0.5">Click "+ Add Task" to set your writing priorities.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 lg:space-y-2">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "group flex items-center gap-2 lg:gap-3 p-2 lg:p-2.5 rounded-sm border transition-all cursor-pointer relative",
                          task.completed
                            ? "bg-[#f4efe6]/50 border-transparent opacity-60"
                            : "bg-[#fcfaf5] border-[#e5e0d5] hover:border-[#d49a89] hover:shadow-sm"
                        )}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {!task.completed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8c503c] rounded-l-sm opacity-20" />
                        )}
                        <button
                          type="button"
                          className="shrink-0 focus:outline-none ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id);
                          }}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#8c503c]" />
                          ) : (
                            <div className="w-4 h-4 rounded-sm border-2 border-[#d49a89] hover:border-[#8c503c] transition-colors" />
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

                          <div className="flex items-center gap-1.5 shrink-0">
                            {task.urgency === "high" && !task.completed && (
                              <span className="flex items-center gap-0.5 text-[8px] lg:text-[9px] uppercase tracking-widest font-bold text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded-sm" title="High Priority">
                                <AlertCircle className="w-2.5 h-2.5" />
                                High
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[8px] lg:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-sm border",
                                task.type === "writing"
                                  ? "bg-[#f4efe6] text-[#8c503c] border-[#e5e0d5]"
                                  : task.type === "editing"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : task.type === "worldbuilding"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              )}
                            >
                              {task.type === "worldbuilding" ? "world" : task.type}
                            </span>

                            {/* Delete Task Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded-sm transition-all ml-1"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Stacked on small, flex col on large) */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 lg:gap-4 min-h-[140px] lg:min-h-0 h-full">
              {/* Quick Jump (Vintage Journal style) */}
              {activeProject ? (
                <div
                  className="bg-[#2a1a14] text-[#fcfaf5] rounded-sm p-4 lg:p-5 shadow-[4px_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none border border-[#5d3f32]"
                  onClick={() => navigate(`/project/${activeProject.id}/studio`)}
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
                      {activeProject.title}
                    </h3>
                    <p className="text-[#fcfaf5]/60 text-[10px] lg:text-xs mt-0.5 lg:mt-1 font-serif italic truncate">
                      {resumeStats.currentSceneTitle} • Updated {resumeStats.timeAgo}
                    </p>
                  </div>
                  <div className="relative z-10 mt-2 lg:mt-4 flex items-center justify-between ml-2">
                    <div className="flex items-center gap-1 lg:gap-1.5 bg-[#fcfaf5]/10 px-1.5 py-1 lg:px-2 lg:py-1 rounded-sm text-[8px] lg:text-[10px] font-bold tracking-widest uppercase border border-[#fcfaf5]/20">
                      <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-[#d49a89]" />
                      {(activeProject.currentWords || 0).toLocaleString()} words
                    </div>
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-sm bg-[#8c503c] border border-[#b8785e] flex items-center justify-center group-hover:bg-[#b8785e] transition-colors shadow-sm text-white">
                      <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-[#2a1a14] text-[#fcfaf5] rounded-sm p-4 lg:p-5 shadow-[4px_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none border border-[#5d3f32]"
                  onClick={() => navigate('/create')}
                >
                  <div className="relative z-10">
                    <p className="text-[7px] lg:text-[9px] uppercase tracking-widest font-bold text-[#d49a89]/70 mb-1">
                      Start Writing
                    </p>
                    <h3 className="font-serif text-sm lg:text-lg font-bold line-clamp-1 text-[#fcfaf5]">
                      Create New Archive
                    </h3>
                    <p className="text-[#fcfaf5]/60 text-[10px] lg:text-xs mt-1 font-serif italic">
                      Begin your novel or story
                    </p>
                  </div>
                  <div className="relative z-10 mt-4 flex items-center justify-end">
                    <div className="w-8 h-8 rounded-sm bg-[#8c503c] flex items-center justify-center text-white">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* World Radar (Polaroid style mini grid) */}
              <div className="bg-[#fcfaf5] rounded-sm p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex-1 flex flex-col min-h-0 relative">
                {/* Tape decoration */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 rotate-1 opacity-70 shadow-sm" />
                
                <div className="flex justify-between items-end mb-2 lg:mb-3 shrink-0 border-b border-[#e5e0d5] pb-2 mt-1">
                  <div>
                    <h3 className="font-serif text-sm lg:text-base font-bold text-[#4a3225] uppercase tracking-wide">
                      World Radar
                    </h3>
                    {activeProject && (
                      <p className="text-[8px] lg:text-[9px] text-[#8c503c] font-medium truncate max-w-[140px]">
                        {activeProject.title}
                      </p>
                    )}
                  </div>
                  <span className="text-[8px] lg:text-[9px] font-bold text-[#8c503c] tracking-widest uppercase">
                    {worldRadarStats.totalMentions} Mentions
                  </span>
                </div>

                {worldRadarStats.sortedMentions.length > 0 ? (
                  <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar min-h-0">
                    <div className="flex flex-col justify-start space-y-2 lg:space-y-3">
                      {worldRadarStats.sortedMentions.map((item) => {
                        const topCount = Math.max(1, worldRadarStats.sortedMentions[0].count);
                        const percentage = item.count > 0 
                          ? Math.max(12, Math.round((item.count / topCount) * 100))
                          : 0;

                        return (
                          <div
                            key={item.id}
                            className="relative group shrink-0 cursor-pointer"
                            onClick={() => {
                              if (activeProject) {
                                navigate(`/project/${activeProject.id}/characters`);
                              }
                            }}
                            title={`Click to view ${item.name} in Story Bible`}
                          >
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] lg:text-xs font-serif font-bold text-[#4a3225] group-hover:text-[#8c503c] transition-colors truncate pr-2">
                                {item.name}
                              </span>
                              <span className="text-[#8c503c] font-sans text-[8px] lg:text-[10px] font-bold shrink-0">
                                {item.count} {item.count === 1 ? 'mention' : 'mentions'}
                              </span>
                            </div>
                            <div className="h-1 lg:h-1.5 w-full bg-[#e5e0d5] rounded-sm overflow-hidden border border-[#d49a89]/20">
                              <div
                                className={cn(
                                  "h-full rounded-sm transition-all duration-700 relative",
                                  item.count > 0
                                    ? "bg-gradient-to-r from-[#d49a89] to-[#8c503c]"
                                    : "bg-stone-300"
                                )}
                                style={{ width: `${Math.max(percentage, item.count > 0 ? 8 : 0)}%` }}
                              >
                                {item.count > 0 && (
                                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                    <Users className="w-6 h-6 text-stone-300 mb-1 stroke-[1.5]" />
                    <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-stone-400">
                      No Characters Tracked
                    </p>
                    <p className="text-[9px] text-stone-400 mt-0.5">
                      Type @ in Writing Studio or add characters to track frequency.
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
