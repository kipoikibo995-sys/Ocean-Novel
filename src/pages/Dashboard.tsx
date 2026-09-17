import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  PenTool,
  ArrowRight,
  TrendingUp,
  Flame,
  Coffee,
  Type,
  Trash2,
  X,
  Users,
  Settings as SettingsIcon,
  Maximize2,
  Search,
  ArrowUpRight,
  BarChart2,
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
import { ensureFantasyBooksSeeded } from "@/fantasySampleData";
import { useProject } from "@/context/ProjectContext";
import { runFantasySeed } from "@/lib/seed";

export default function Dashboard() {
  useEffect(() => {
    const seeded = runFantasySeed();
    if (seeded) {
      setTimeout(() => window.location.reload(), 1500);
    }
  }, []);

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

  // World Radar Expand Modal State
  const [isRadarExpanded, setIsRadarExpanded] = useState(false);
  const [radarSearch, setRadarSearch] = useState("");
  const [radarFilter, setRadarFilter] = useState<'all' | 'active' | 'silent'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRadarExpanded) {
        setIsRadarExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRadarExpanded]);

  useEffect(() => {
    // Ensure all 5 fantasy sample books exist with complete manuscripts and characters
    const projects = ensureFantasyBooksSeeded();

    const sorted = (projects || []).sort((a, b) => b.lastModified - a.lastModified);
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
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    let timeAgo = "Just now";
    if (days > 0) timeAgo = `${days}d ago`;
    else if (hours > 0) timeAgo = `${hours}h ago`;
    else if (mins >= 1) timeAgo = `${mins}m ago`;
    else timeAgo = "Just now";

    const displaySceneTitle = activeProjectData?.lastActiveSceneTitle || firstSceneTitle || "Chapter 1";

    return {
      chapters: chaptersCount || 1,
      scenes: scenesCount || 1,
      currentSceneTitle: displaySceneTitle,
      timeAgo,
    };
  }, [activeProject, activeProjectData]);

  // Real World Radar Stats computed from the actual project manuscript & character roster
  const worldRadarStats = useMemo(() => {
    if (!activeProject) return { totalMentions: 0, sortedMentions: [] };

    const manuscript = activeProjectData?.manuscript || [];
    const rawCharacters = activeProjectData?.characters && Array.isArray(activeProjectData.characters) && activeProjectData.characters.length > 0
      ? activeProjectData.characters
      : MOCK_CHARACTERS;

    const charMap: Record<string, { id: string; name: string; count: number; role: string; description?: string }> = {};

    // Register known characters
    (rawCharacters || []).forEach((c: any) => {
      const name = c.name?.trim() || "";
      if (name) {
        charMap[name.toLowerCase()] = {
          id: c.id || name,
          name: name,
          count: 0,
          role: c.role || "Character",
          description: c.description || c.shortBio || "",
        };
      }
    });

    let totalMentions = 0;
    let scenesScanned = 0;

    const scanForMentions = (items: ManuscriptItem[]) => {
      for (const item of items) {
        if (item.type === "scene") {
          scenesScanned++;
          if (item.content) {
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
        }
        if (item.children) scanForMentions(item.children);
      }
    };

    scanForMentions(manuscript);

    const sortedMentions = Object.values(charMap)
      .sort((a, b) => b.count - a.count);

    return { totalMentions, sortedMentions, scenesScanned };
  }, [activeProject, activeProjectData]);

  // Filtered mentions for expanded World Radar modal
  const filteredRadarMentions = useMemo(() => {
    return worldRadarStats.sortedMentions.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(radarSearch.toLowerCase()) ||
        (item.role && item.role.toLowerCase().includes(radarSearch.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(radarSearch.toLowerCase()));
      if (!matchesSearch) return false;

      if (radarFilter === 'active') return item.count > 0;
      if (radarFilter === 'silent') return item.count === 0;
      return true;
    });
  }, [worldRadarStats.sortedMentions, radarSearch, radarFilter]);

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
      className="flex-1 h-[100dvh] w-full overflow-hidden bg-[#F4F1EA] flex flex-col relative font-sans"
    >
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
              <h1 className="text-2xl lg:text-3xl font-sans font-bold text-[#4a3225] tracking-tight leading-none uppercase">
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

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 relative z-10">
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center justify-center gap-1.5 bg-[#f4efe6] text-[#4a3225] hover:bg-[#e5e0d5] border border-[#d8d2c4] px-3 py-2 rounded-sm text-[10px] lg:text-xs font-bold tracking-widest uppercase transition-colors shadow-sm"
                title="Author Profile & Settings"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-[#8c503c]" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => navigate("/create")}
                className="flex items-center justify-center gap-2 bg-[#8c503c] text-[#fcfaf5] px-4 py-2 rounded-sm text-[10px] lg:text-xs font-bold tracking-widest uppercase hover:bg-[#b8785e] transition-colors shadow-sm hover:shadow-md w-full sm:w-auto border border-[#4a3225]"
              >
                <Plus className="w-3.5 h-3.5" />
                New Archive
              </button>
            </div>
          </div>

          {/* ARCHIVAL BOOKSHELF */}
        <div className="relative pt-12 pb-0 px-2 sm:px-4 z-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar flex justify-start md:justify-center">
          {/* Container cho kệ sách, ôm sát content */}
          <div className="relative flex flex-col items-center shrink-0 min-w-min">
            
            {/* Wooden Shelf Base */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c371d] to-[#3a2211] rounded-t-[2px] shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] z-0" />
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#26150a] shadow-xl z-0" />
            
            <div className="flex items-end h-[280px] gap-[2px] lg:gap-[3px] pb-6 relative z-10 px-4">
              
              {/* Left Bookend (chặn sách trái) */}
              <div className="shrink-0 w-3 h-20 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-r border-[#5c3a21] rounded-t-sm shadow-[4px_0_8px_rgba(0,0,0,0.4)] mr-1 z-20" />

              {savedProjects.length === 0 && (
                <div className="flex items-center justify-center w-full max-w-md h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50 mb-4 mx-auto">
                  <p className="text-stone-500 text-sm font-medium">No archives found. Start a new project.</p>
                </div>
              )}
              {savedProjects.map((proj, index) => {
                // 2. Cập nhật bảng màu rõ rệt hơn
                const getGenreTheme = (gStr: string) => {
                  const g = (gStr || "").toLowerCase();
                  if (g.includes('fantasy')) return { bg: "bg-[#182330]", spine: "bg-[#0e1620]" }; // Navy
                  if (g.includes('thriller') || g.includes('horror') || g.includes('mystery')) return { bg: "bg-[#6b1c1c]", spine: "bg-[#3d0f0f]" }; // Crimson Red
                  if (g.includes('romance')) return { bg: "bg-[#592b45]", spine: "bg-[#331525]" }; // Deep Pink/Plum
                  if (g.includes('sci-fi') || g.includes('science')) return { bg: "bg-[#17424d]", spine: "bg-[#0a232b]" }; // Teal
                  if (g.includes('historical')) return { bg: "bg-[#423826]", spine: "bg-[#241e13]" }; // Olive
                  return { bg: "bg-[#382218]", spine: "bg-[#24140d]" }; // Default Leather Brown
                };
                
                const theme = getGenreTheme(proj.genre || "");
                const isSelected = selectedProjectId === proj.id;
                
                const progressRatio = Math.min(1, Math.max(0, (proj.currentWords || 0) / (proj.wordGoal || 75000)));
                const progressPercent = Math.round(progressRatio * 100);
                
                const spineWidth = 40 + Math.floor(progressRatio * 28); 
                const spineVariant = index % 4;
                
                // Varied but smooth skyline
                const HEIGHT_MAP = [230, 245, 235, 225, 250];
                const baseHeight = HEIGHT_MAP[index % HEIGHT_MAP.length];
                const bookHeight = isSelected ? baseHeight + 20 : baseHeight;
                
                const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;
                
                // Giới hạn ribbon chỉ cho 2 sách cập nhật gần nhất
                const recentProjectIds = [...savedProjects].sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0)).slice(0, 2).map(p => p.id);
                const isRecent = recentProjectIds.includes(proj.id);

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                    className={cn(
                      "group relative shrink-0 overflow-hidden cursor-pointer transition-all duration-500 ease-out select-none",
                      "rounded-l-[4px] rounded-r-md shadow-[-4px_0_12px_rgba(0,0,0,0.6)] border-y border-r border-black/40",
                      "hover:-translate-y-2 hover:shadow-[-6px_8px_16px_rgba(0,0,0,0.7)]", 
                      theme.bg,
                      ""
                    )}
                    style={{ width: isSelected ? '260px' : `${spineWidth}px`, height: `${bookHeight}px` }}
                    title={`${proj.title} • ${proj.genre || 'Unknown Genre'}`}
                  >
                    {/* Texture */}
                    <div
                      className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none z-30"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
                    />

                    {/* Spine Binding */}
                    <div 
                      className={cn(
                        "absolute left-0 top-0 bottom-0 border-r border-black/80 shadow-[inset_-3px_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center z-20 transition-all duration-500",
                        theme.spine
                      )}
                      style={{ width: `${spineWidth}px` }}
                    >
                      <div className="absolute left-[1px] top-0 bottom-0 w-[1.5px] bg-white/10 rounded-full" />
                      
                      {isRecent && !isSelected && (
                        <div className="absolute top-0 right-2 w-2.5 h-7 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                           <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-black/20 opacity-40" />
                        </div>
                      )}

                      {/* Style 0 */}
                      {spineVariant === 0 && (
                        <>
                          <div className={cn("absolute top-[32px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className={cn("absolute top-[60px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className={cn("absolute bottom-[32px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={cn(
                              "font-serif text-[12px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 70}px`, textAlign: 'center' }}>
                              {proj.title}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Style 1 */}
                      {spineVariant === 1 && (
                        <>
                          <div className="absolute top-[28px] bottom-[28px] left-[15%] right-[15%] bg-[#f4ebd8] rounded-[2px] shadow-[inset_0_0_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.6)] flex items-center justify-center border border-[#d6c7b0]">
                            <span className={cn(
                              "font-serif text-[10px] font-bold tracking-[0.1em] text-[#2c1b13] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 64}px`, textAlign: 'center' }}>
                              {proj.title}
                            </span>
                          </div>
                          {isComplete && (
                             <div className="absolute bottom-[10px] w-full h-[2px] bg-[#c49a45] border-t border-[#f4db89]" />
                          )}
                        </>
                      )}

                      {/* Style 2 */}
                      {spineVariant === 2 && (
                        <>
                          <div className="absolute top-0 w-full h-[45px] bg-black/40 border-b border-black/80" />
                          <div className="absolute bottom-0 w-full h-[45px] bg-black/40 border-t border-black/80" />
                          <div className={cn("absolute top-[45px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                          <div className={cn("absolute bottom-[45px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={cn(
                              "font-serif text-[12px] font-medium tracking-[0.15em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 100}px`, textAlign: 'center' }}>
                              {proj.title}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Style 3 */}
                      {spineVariant === 3 && (
                        <>
                          <div className={cn("absolute top-[14px] bottom-[14px] left-[10%] right-[10%] border rounded-[2px]", isComplete ? "border-[#c49a45]" : "border-white/30")} />
                          <div className={cn("absolute top-[18px] bottom-[18px] left-[20%] right-[20%] border", isComplete ? "border-[#c49a45] opacity-60" : "border-white/20")} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={cn(
                              "font-serif text-[11px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-white/80",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 50}px`, textAlign: 'center' }}>
                              {proj.title}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 1. Cover Plate Content (Trượt ra ngang accordion - Kích thước lớn hơn) */}
                    <div className={cn(
                      "absolute top-0 bottom-0 right-0 p-3 sm:p-4 transition-opacity duration-500 z-10 flex items-center justify-end overflow-hidden",
                      isSelected ? "opacity-100 delay-150" : "opacity-0 pointer-events-none"
                    )} style={{ width: `calc(100% - ${spineWidth}px)` }}>
                      <div className="w-full h-full bg-[#faf6ed] border border-[#dad1be] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),_1px_2px_8px_rgba(0,0,0,0.4)] rounded-[3px] p-4 flex flex-col justify-between relative overflow-hidden min-w-[180px]">
                        
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-white/60 border-t border-b border-black/5 rotate-[-0.5deg] pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />

                        {isRecent && (
                          <div className="absolute top-0 right-3 w-3 h-8 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-black/20 opacity-30" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between border-b border-[#e8ded0] pb-1.5 mb-2.5 mt-1">
                            <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#8c503c]">
                              Case File {index < 9 ? `· 0${index + 1}` : `· ${index + 1}`}
                            </span>
                          </div>
                          <h2 className="text-[16px] sm:text-[18px] font-serif font-bold leading-[1.25] text-[#2c1b13] line-clamp-3 text-left tracking-tight mb-2">
                            {proj.title}
                          </h2>
                          <div className="w-8 h-[2px] bg-[#8c503c]/40 my-2" />
                          <p className="text-[11px] font-serif italic text-[#745344] line-clamp-2 text-left leading-snug">
                            {proj.genre || "Fantasy Archive"}
                          </p>
                        </div>

                        <div className="mt-auto pt-2.5 border-t border-[#ebdcd0]">
                          <div className="flex items-baseline justify-between mb-1.5 gap-1">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#8c503c]/70 shrink-0">
                              Words
                            </span>
                            <span className="text-[11px] font-serif font-bold text-[#2c1b13] truncate">
                              {(proj.currentWords || 0).toLocaleString()} {isComplete && "★"}
                            </span>
                          </div>
                          <div className="w-full bg-[#e7decfa0] h-[3px] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-[#c49a45]" : "bg-[#8c503c]")}
                              style={{ width: `${Math.max(5, progressPercent)}%` }}
                            />
                          </div>
                          
                          {/* Nút hành động */}
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/project/${proj.id}`); }}
                              className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#2c1b13] hover:bg-[#8c503c] transition-colors px-3 py-1.5 rounded-sm"
                            >
                              Open Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Right Bookend (chặn sách phải) */}
              {savedProjects.length > 0 && (
                <div className="shrink-0 w-3 h-20 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-l border-[#2a1a0f] rounded-t-sm shadow-[-4px_0_8px_rgba(0,0,0,0.4)] ml-1 z-20" />
              )}
            </div>
            
            
          </div>
        </div>
        </section>

        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}
        <section className="flex-1 flex flex-col min-h-0 pb-2">
          <div className="mb-2 shrink-0 flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-sans font-bold text-[#4a3225] tracking-tight uppercase">
              Investigation Board
            </h2>
            {savedProjects.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-500 text-[10px] uppercase tracking-wider font-bold">Focus:</span>
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-white text-[#4a3225] text-[11px] font-sans font-bold border border-[#e5e0d5] rounded-sm px-2 py-0.5 focus:outline-none focus:border-[#d49a89]"
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
                  <h3 className="font-sans text-base lg:text-lg font-bold text-[#4a3225] uppercase tracking-wide">
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
                            <CheckCircle2 className="w-5 h-5 text-[#8c503c]" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[#d49a89] hover:border-[#8c503c] transition-colors" />
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
            <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 lg:gap-4 min-h-0 h-full">
              {/* Quick Jump (Vintage Journal style) */}
              {activeProject ? (
                <div
                  className="bg-[#2a1a14] text-[#fcfaf5] rounded-sm p-4 lg:p-5 shadow-[4px_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none border border-[#5d3f32]"
                  onClick={() => {
                    const targetScene = activeProjectData?.lastActiveSceneId;
                    navigate(`/project/${activeProject.id}/workspace/studio${targetScene ? `?scene=${targetScene}` : ''}`);
                  }}
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
                      {activeProject.genre} • {resumeStats.currentSceneTitle} • Updated {resumeStats.timeAgo}
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

              {/* World Radar (Polaroid style mini grid - clickable to expand) */}
              <div 
                className="bg-[#fcfaf5] rounded-sm p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex-1 flex flex-col min-h-0 relative group/card cursor-pointer hover:border-[#8c503c]/40 hover:shadow-[2px_6px_16px_rgba(0,0,0,0.25)] transition-all"
                onClick={() => setIsRadarExpanded(true)}
                title="Click to expand full World Radar"
              >
                <div className="flex justify-between items-start mb-2 lg:mb-3 shrink-0 border-b border-[#e5e0d5] pb-2 mt-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-sans text-sm lg:text-base font-bold text-[#4a3225] uppercase tracking-wide group-hover/card:text-[#8c503c] transition-colors">
                        World Radar
                      </h3>
                      <span className="text-[8px] lg:text-[9px] bg-[#8c503c]/10 text-[#8c503c] font-sans font-bold px-1.5 py-0.5 rounded-sm">
                        {worldRadarStats.totalMentions} Mentions
                      </span>
                    </div>
                    {savedProjects.length > 1 ? (
                      <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[8px] text-stone-500 font-serif">Book:</span>
                        <select
                          value={selectedProjectId || activeProject?.id || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedProjectId(e.target.value);
                          }}
                          className="text-[9px] text-[#8c503c] font-bold font-serif bg-white/80 border border-[#e5e0d5] rounded-xs px-1 py-0.2 focus:outline-none max-w-[130px] truncate"
                          title="Switch active book for World Radar"
                        >
                          {savedProjects.map((p) => (
                            <option key={p.id} value={p.id} className="text-stone-800 bg-[#fcfaf5]">
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : activeProject ? (
                      <p className="text-[8px] lg:text-[9px] text-[#8c503c] font-medium truncate max-w-[140px]" title={activeProject.title}>
                        Book: {activeProject.title}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRadarExpanded(true);
                    }}
                    className="p-1 rounded-sm text-[#8c503c] hover:bg-[#e5e0d5] hover:text-[#4a3225] transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                    title="Expand World Radar to full screen"
                  >
                    <span className="hidden sm:inline">Expand</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
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
                            className="relative group shrink-0"
                            onClick={(e) => {
                              // Clicking row directly also opens expanded view or character dossier
                              e.stopPropagation();
                              setIsRadarExpanded(true);
                            }}
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

                {/* Card footer prompt */}
                {worldRadarStats.sortedMentions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e5e0d5] flex items-center justify-between text-[10px] font-sans font-bold text-[#8c503c] shrink-0 uppercase tracking-widest bg-[#f4efe6] px-3 py-2 rounded-sm group-hover/card:bg-[#e5e0d5] transition-colors">
                    <span>View all {worldRadarStats.sortedMentions.length} characters</span>
                    <Maximize2 className="w-3.5 h-3.5 text-[#8c503c] group-hover/card:scale-110 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Expanded World Radar Modal Dialog */}
        <AnimatePresence>
          {isRadarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
              onClick={() => setIsRadarExpanded(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FCFAF5] border-2 border-[#5D3F32] rounded-sm shadow-[0_25px_60px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden relative text-stone-800"
              >
                {/* Vintage Leather Trim */}
                <div className="h-2 w-full bg-[#8C503C] border-b border-[#5D3F32]" />

                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-[#E5E0D5] bg-[#F4EFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C503C] bg-white px-2 py-0.5 rounded-sm border border-[#E5E0D5]">
                        World Radar • Expanded View
                      </span>
                      {savedProjects.length > 1 ? (
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-[11px] text-stone-600 font-serif">Book:</span>
                          <select
                            value={selectedProjectId || activeProject?.id || ""}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="text-xs font-serif font-bold text-[#4A3225] bg-white border border-[#E5E0D5] rounded-sm px-2 py-0.5 focus:ring-1 focus:ring-[#8C503C]"
                          >
                            {savedProjects.map((p) => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </div>
                      ) : activeProject ? (
                        <span className="text-[11px] text-stone-600 font-serif">
                          Book: <strong className="text-[#4A3225]">{activeProject.title}</strong>
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#4A3225]">
                      Character Frequency & Narrative Density
                    </h2>
                    <p className="text-xs text-stone-600 font-serif mt-0.5">
                      Analyzed from {worldRadarStats.scenesScanned} scenes in "{activeProject?.title}". Real-time breakdown of character mentions and relative presence.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeProject && (
                      <button
                        onClick={() => {
                          setIsRadarExpanded(false);
                          navigate(`/project/${activeProject.id}/characters`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#8C503C] hover:bg-[#723F2F] text-white transition-colors shadow-sm"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Cast Dossier</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsRadarExpanded(false)}
                      className="p-1.5 rounded-sm text-stone-500 hover:text-[#4A3225] hover:bg-[#E5E0D5] transition-colors"
                      title="Close (ESC)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats Summary & Search / Filter Controls */}
                <div className="px-4 sm:px-6 py-3 bg-[#FCFAF5] border-b border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D5] rounded-sm shadow-2xs">
                      <BarChart2 className="w-3.5 h-3.5 text-[#8C503C]" />
                      <span className="font-bold text-[#4A3225]">{worldRadarStats.totalMentions}</span>
                      <span className="text-stone-500">Total Mentions</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D5] rounded-sm shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-[#8C503C]" />
                      <span className="font-bold text-[#4A3225]">{worldRadarStats.sortedMentions.length}</span>
                      <span className="text-stone-500">Characters Tracked</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                    <div className="relative w-full sm:w-52">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search name, role, details..."
                        value={radarSearch}
                        onChange={(e) => setRadarSearch(e.target.value)}
                        className="w-full pl-8 pr-6 py-1 bg-white border border-[#E5E0D5] rounded-sm text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#8C503C]"
                      />
                      {radarSearch && (
                        <button
                          onClick={() => setRadarSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center bg-[#E5E0D5]/70 p-0.5 rounded-sm border border-[#E5E0D5] text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => setRadarFilter('all')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all",
                          radarFilter === 'all' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        All ({worldRadarStats.sortedMentions.length})
                      </button>
                      <button
                        onClick={() => setRadarFilter('active')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all",
                          radarFilter === 'active' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        Active ({worldRadarStats.sortedMentions.filter(m => m.count > 0).length})
                      </button>
                      <button
                        onClick={() => setRadarFilter('silent')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all",
                          radarFilter === 'silent' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        Silent ({worldRadarStats.sortedMentions.filter(m => m.count === 0).length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Body: Full grid showing all characters without vertical scroll crunch */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3">
                  {filteredRadarMentions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {filteredRadarMentions.map((item, idx) => {
                        const topCount = Math.max(1, worldRadarStats.sortedMentions[0]?.count || 1);
                        const percentage = item.count > 0
                          ? Math.round((item.count / topCount) * 100)
                          : 0;
                        const mentionShare = worldRadarStats.totalMentions > 0
                          ? Math.round((item.count / worldRadarStats.totalMentions) * 100)
                          : 0;

                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-sm border border-[#E5E0D5] bg-white hover:border-[#8C503C] hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-start gap-2.5">
                                  <span className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                                    idx === 0 && item.count > 0 ? "bg-[#8C503C] text-white shadow-xs" :
                                    idx === 1 && item.count > 0 ? "bg-[#B8785E] text-white" :
                                    "bg-stone-200 text-stone-700"
                                  )}>
                                    #{idx + 1}
                                  </span>
                                  <div>
                                    <h4 className="font-serif font-bold text-base text-[#4A3225] group-hover:text-[#8C503C] transition-colors leading-tight">
                                      {item.name}
                                    </h4>
                                    <span className="text-[10px] font-bold text-[#8C503C] tracking-widest uppercase inline-block mt-0.5">
                                      {item.role || "Character"}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className={cn(
                                    "text-sm font-bold font-sans block",
                                    item.count > 0 ? "text-[#8C503C]" : "text-stone-400"
                                  )}>
                                    {item.count} {item.count === 1 ? 'mention' : 'mentions'}
                                  </span>
                                  {worldRadarStats.totalMentions > 0 && (
                                    <span className="text-[9px] text-stone-500 font-sans block">
                                      {mentionShare}% narrative share
                                    </span>
                                  )}
                                </div>
                              </div>

                              {item.description && (
                                <p className="text-xs text-stone-600 font-serif line-clamp-2 mt-1 mb-2 italic">
                                  "{item.description}"
                                </p>
                              )}
                            </div>

                            {/* Relative Frequency Bar */}
                            <div className="mt-2 pt-2 border-t border-stone-100">
                              <div className="flex justify-between text-[9px] text-stone-500 mb-1 font-sans">
                                <span>Manuscript Density</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="h-2 w-full bg-[#E5E0D5] rounded-xs overflow-hidden border border-[#D49A89]/20">
                                <div
                                  className={cn(
                                    "h-full rounded-xs transition-all duration-700",
                                    item.count > 0
                                      ? "bg-gradient-to-r from-[#D49A89] via-[#B8785E] to-[#8C503C]"
                                      : "bg-stone-200"
                                  )}
                                  style={{ width: `${Math.max(percentage, item.count > 0 ? 6 : 0)}%` }}
                                />
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-stone-400 font-serif">
                                  {item.count > 0 ? 'Active in scenes' : 'Not mentioned yet'}
                                </span>
                                <button
                                  onClick={() => {
                                    setIsRadarExpanded(false);
                                    if (activeProject) {
                                      navigate(`/project/${activeProject.id}/characters`);
                                    }
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#8C503C] hover:text-[#4A3225] flex items-center gap-1 group-hover:underline"
                                >
                                  <span>View Dossier</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-sm border border-[#E5E0D5]">
                      <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="font-serif font-bold text-stone-700 text-sm">
                        No characters found matching filter
                      </p>
                      <p className="text-xs text-stone-500 font-serif mt-1">
                        Try changing your search term or select "All" characters above.
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-3 sm:p-4 bg-[#F4EFE6] border-t border-[#E5E0D5] flex items-center justify-between text-xs text-stone-600 font-serif">
                  <span>Tip: In Writing Studio, type <strong className="text-[#8C503C]">@</strong> to quickly mention any character in your text.</span>
                  <button
                    onClick={() => setIsRadarExpanded(false)}
                    className="px-4 py-1.5 bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors shadow-2xs"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
