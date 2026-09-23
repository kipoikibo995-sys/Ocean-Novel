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
  MapPin,
  RefreshCw,
  BookOpen,
  ChevronDown,
  User as UserIcon,
  Cloud,
  ShieldCheck,
} from "lucide-react";
import { ManuscriptItem } from "@/mockData";
import { cn } from "@/lib/utils";
import { storage, ProjectMeta, StudioTask, UserProfile } from "@/lib/storage";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { TimelineSettingsModal } from "@/components/TimelineSettingsModal";
import UpgradeModal from "@/components/UpgradeModal";
import { PLAN_LIMITS } from "@/lib/license";

import { isUserAdmin } from "@/lib/adminService";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const navigate = useNavigate();

  const [savedProjects, setSavedProjects] = useState<ProjectMeta[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectMeta | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check quota & license edition for projects
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const currentPlan = userProfile?.plan || 'free';
  const maxAllowedProjects = PLAN_LIMITS[currentPlan].maxProjects;

  const versionBadge = useMemo(() => {
    switch (currentPlan) {
      case 'master':
        return {
          label: 'PREMIUM',
          style: 'bg-[#241711] text-[#E5BF7C] border-[#5A3C28] ring-1 ring-[#D4A359]/40 shadow-xs hover:bg-[#1A100B]',
          tooltip: 'Premium Edition (OTO2) — Full Unrestricted Access',
        };
      case 'pro':
        return {
          label: 'PRO',
          style: 'bg-[#8C503C] text-[#FFF9F2] border-[#723F2F] shadow-xs hover:bg-[#773E2E]',
          tooltip: 'Pro Edition (OTO1) — Unlimited Manuscripts & 50+ Art Library',
        };
      case 'free':
      default:
        return {
          label: 'REGULAR',
          style: 'bg-[#EAE4D8] text-[#5C4738] border-[#D4CCBE] hover:bg-[#DFD8CB] hover:border-[#8C503C]/40',
          tooltip: 'Regular Edition (FE) — Max 3 Active Projects',
        };
    }
  }, [currentPlan]);

  const handleNewProjectClick = () => {
    if (savedProjects.length >= maxAllowedProjects) {
      setShowUpgradeModal(true);
    } else {
      navigate("/create");
    }
  };

  // Real Tasks State (synced with LocalStorage)
  const [tasks, setTasks] = useState<StudioTask[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<StudioTask['type']>("writing");
  const [newTaskUrgency, setNewTaskUrgency] = useState<StudioTask['urgency']>("medium");

  // Auth & Per-User Data Sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u && !u.isAnonymous) {
        storage.switchUser(u.uid, u.email, u.displayName);
        await storage.syncFromCloud(u.uid);
        setUserProfile(storage.getUserProfile());
        const projs = storage.getProjects().sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
        setSavedProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
        setTasks(storage.getTasks());
      } else {
        storage.clearCache();
        setUserProfile(storage.getUserProfile());
        setSavedProjects([]);
        setTasks([]);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleProfileSync = () => {
      setUserProfile(storage.getUserProfile());
    };
    window.addEventListener('storage', handleProfileSync);
    window.addEventListener('focus', handleProfileSync);
    return () => {
      window.removeEventListener('storage', handleProfileSync);
      window.removeEventListener('focus', handleProfileSync);
    };
  }, []);

  // World Radar Expand Modal State
  const [isRadarExpanded, setIsRadarExpanded] = useState(false);
  const [radarSearch, setRadarSearch] = useState("");
  const [radarFilter, setRadarFilter] = useState<'all' | 'active' | 'silent'>('all');
  const [radarEntityType, setRadarEntityType] = useState<'all' | 'characters' | 'locations'>('all');
  const [miniRadarType, setMiniRadarType] = useState<'all' | 'characters' | 'locations'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Author Timeline & Stats Configuration Modal
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [timelineSettings, setTimelineSettings] = useState(() => storage.getTimelineSettings());

  useEffect(() => {
    const handleTimelineUpdate = () => {
      setTimelineSettings(storage.getTimelineSettings());
    };
    window.addEventListener('novelist-timeline-updated', handleTimelineUpdate);
    return () => window.removeEventListener('novelist-timeline-updated', handleTimelineUpdate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRadarExpanded) {
        setIsRadarExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRadarExpanded]);

  // Real-time synchronization when manuscript updates or tab gains focus
  useEffect(() => {
    const handleSync = () => {
      const updated = storage.getProjects().sort((a, b) => b.lastModified - a.lastModified);
      setSavedProjects(updated);
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('novelist-storage-updated', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('novelist-storage-updated', handleSync);
    };
  }, []);

  const handleManualScan = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsScanning(true);
    const updated = storage.getProjects().sort((a, b) => b.lastModified - a.lastModified);
    setSavedProjects(updated);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsScanning(false), 500);
  };

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

  const handleDeleteProject = async (proj: ProjectMeta) => {
    setIsDeletingProject(true);
    try {
      storage.deleteProject(proj.id);
      const updated = storage.getProjects().sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      setSavedProjects(updated);
      if (selectedProjectId === proj.id) {
        setSelectedProjectId(updated.length > 0 ? updated[0].id : null);
      }
      setProjectToDelete(null);
    } catch (err) {
      console.error("Error deleting book project:", err);
    } finally {
      setIsDeletingProject(false);
    }
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
  }, [activeProject?.id, activeProject?.lastModified, refreshTrigger]);

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

  // Real World Radar Stats computed dynamically from the actual project manuscript, characters & locations
  const worldRadarStats = useMemo(() => {
    if (!activeProject) {
      return {
        totalMentions: 0,
        sortedMentions: [] as Array<{
          id: string;
          name: string;
          count: number;
          entityType: 'character' | 'location';
          role: string;
          description?: string;
          avatarUrl?: string;
          imageUrl?: string;
          scenesAppeared: Array<{ id: string; title: string; count: number }>;
        }>,
        characterCount: 0,
        locationCount: 0,
        scenesScanned: 0,
      };
    }

    const manuscript = activeProjectData?.manuscript || [];
    const rawCharacters = activeProjectData?.characters && Array.isArray(activeProjectData.characters)
      ? activeProjectData.characters
      : [];
    const rawLocations = activeProjectData?.locations && Array.isArray(activeProjectData.locations)
      ? activeProjectData.locations
      : [];

    const entityMap: Record<string, {
      id: string;
      name: string;
      count: number;
      entityType: 'character' | 'location';
      role: string;
      description?: string;
      avatarUrl?: string;
      imageUrl?: string;
      scenesAppeared: Array<{ id: string; title: string; count: number }>;
    }> = {};

    const nameToKey: Record<string, string> = {};
    const idToKey: Record<string, string> = {};

    // 1. Register all characters from project roster
    rawCharacters.forEach((c: any) => {
      const name = c.name?.trim();
      if (!name) return;
      const key = `char-${c.id || name}`;
      entityMap[key] = {
        id: key,
        name,
        count: 0,
        entityType: 'character',
        role: c.role || 'Character',
        description: c.backstory || c.description || c.shortBio || '',
        avatarUrl: c.avatarUrl || '',
        scenesAppeared: [],
      };
      nameToKey[name.toLowerCase()] = key;
      if (c.id) idToKey[String(c.id).toLowerCase()] = key;
      if (Array.isArray(c.aliases)) {
        c.aliases.forEach((alias: string) => {
          if (alias?.trim()) nameToKey[alias.trim().toLowerCase()] = key;
        });
      }
    });

    // 2. Register all locations from project atlas
    rawLocations.forEach((loc: any) => {
      const name = loc.name?.trim();
      if (!name) return;
      const key = `loc-${loc.id || name}`;
      entityMap[key] = {
        id: key,
        name,
        count: 0,
        entityType: 'location',
        role: loc.type || 'Location',
        description: loc.description || '',
        imageUrl: loc.imageUrl || '',
        scenesAppeared: [],
      };
      nameToKey[name.toLowerCase()] = key;
      if (loc.id) idToKey[String(loc.id).toLowerCase()] = key;
      if (Array.isArray(loc.aliases)) {
        loc.aliases.forEach((alias: string) => {
          if (alias?.trim()) nameToKey[alias.trim().toLowerCase()] = key;
        });
      }
    });

    let totalMentions = 0;
    let scenesScanned = 0;

    // 3. Deep-scan manuscript content across every scene
    const scanForMentions = (items: ManuscriptItem[]) => {
      for (const item of items) {
        if (item.type === 'scene') {
          scenesScanned++;
          const content = item.content || '';
          if (!content.trim()) {
            if (item.children) scanForMentions(item.children);
            continue;
          }

          const sceneOccurrences: Record<string, number> = {};

          // A. TipTap mention tag extraction (from @ mentions inserted via MentionEditor)
          const tagRegex = /<span[^>]*data-type="mention"[^>]*>([\s\S]*?)<\/span>/gi;
          let tagMatch;
          while ((tagMatch = tagRegex.exec(content)) !== null) {
            const tagHtml = tagMatch[0];
            const innerText = tagMatch[1]?.replace(/<[^>]*>/g, '').replace(/^@/, '').trim();
            const labelMatch = /data-label="([^"]+)"/i.exec(tagHtml);
            const idMatch = /data-id="([^"]+)"/i.exec(tagHtml);

            const label = labelMatch ? labelMatch[1].trim() : innerText;
            const entityId = idMatch ? idMatch[1].trim() : '';

            let matchedKey: string | null = null;
            if (entityId && idToKey[entityId.toLowerCase()]) {
              matchedKey = idToKey[entityId.toLowerCase()];
            } else if (label && nameToKey[label.toLowerCase()]) {
              matchedKey = nameToKey[label.toLowerCase()];
            } else if (innerText && nameToKey[innerText.toLowerCase()]) {
              matchedKey = nameToKey[innerText.toLowerCase()];
            }

            if (matchedKey) {
              sceneOccurrences[matchedKey] = (sceneOccurrences[matchedKey] || 0) + 1;
            } else if (label || innerText) {
              const fallbackName = label || innerText;
              const fallbackKey = `dyn-${fallbackName.toLowerCase()}`;
              if (!entityMap[fallbackKey]) {
                entityMap[fallbackKey] = {
                  id: fallbackKey,
                  name: fallbackName,
                  count: 0,
                  entityType: 'character',
                  role: 'Mentioned Entity',
                  scenesAppeared: [],
                };
                nameToKey[fallbackName.toLowerCase()] = fallbackKey;
              }
              sceneOccurrences[fallbackKey] = (sceneOccurrences[fallbackKey] || 0) + 1;
            }
          }

          // Strip mention spans before narrative scanning to prevent double counting
          const proseWithoutMentions = content
            .replace(/<span[^>]*data-type="mention"[^>]*>[\s\S]*?<\/span>/gi, ' ')
            .replace(/<[^>]+>/g, ' ');

          // B. Scan plain text @Name patterns (if typed manually without autocomplete)
          const atRegex = /@([a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+(?:\s+[a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+)?)/g;
          let atMatch;
          while ((atMatch = atRegex.exec(proseWithoutMentions)) !== null) {
            const rawName = atMatch[1].trim();
            const rawKey = nameToKey[rawName.toLowerCase()];
            if (rawKey) {
              sceneOccurrences[rawKey] = (sceneOccurrences[rawKey] || 0) + 1;
            }
          }

          // C. Real text scanning: Find occurrences of character and location names in natural prose
          Object.entries(entityMap).forEach(([key, entity]) => {
            const searchNames = [entity.name];
            // If multi-word name (e.g. "Elena Vance" or "Castle Greyhaven"), also search first distinctive part
            const parts = entity.name.split(/\s+/);
            if (parts.length > 1 && parts[0].length >= 4 && !['the', 'lord', 'lady', 'king', 'queen', 'sir'].includes(parts[0].toLowerCase())) {
              searchNames.push(parts[0]);
            }

            let entityProseMatches = 0;
            searchNames.forEach(targetName => {
              if (targetName && targetName.length >= 3) {
                try {
                  const escaped = targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  // Unicode-safe word boundaries
                  const regex = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'gui');
                  const matches = proseWithoutMentions.match(regex);
                  if (matches) {
                    entityProseMatches += matches.length;
                  }
                } catch {
                  // Fallback for environments without Unicode property escapes
                  const escaped = targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
                  const matches = proseWithoutMentions.match(regex);
                  if (matches) {
                    entityProseMatches += matches.length;
                  }
                }
              }
            });

            if (entityProseMatches > 0) {
              sceneOccurrences[key] = (sceneOccurrences[key] || 0) + entityProseMatches;
            }
          });

          // Aggregate scene occurrences into entityMap
          Object.entries(sceneOccurrences).forEach(([key, count]) => {
            if (entityMap[key] && count > 0) {
              entityMap[key].count += count;
              totalMentions += count;
              entityMap[key].scenesAppeared.push({
                id: item.id,
                title: item.title,
                count,
              });
            }
          });
        }
        if (item.children) scanForMentions(item.children);
      }
    };

    scanForMentions(manuscript);

    const sortedMentions = Object.values(entityMap)
      .sort((a, b) => b.count - a.count);

    const characterCount = sortedMentions.filter(m => m.entityType === 'character').length;
    const locationCount = sortedMentions.filter(m => m.entityType === 'location').length;

    return {
      totalMentions,
      sortedMentions,
      characterCount,
      locationCount,
      scenesScanned,
    };
  }, [activeProject, activeProjectData]);

  // Filtered mentions for expanded World Radar modal
  const filteredRadarMentions = useMemo(() => {
    return worldRadarStats.sortedMentions.filter((item) => {
      // Filter by entity type (All / Characters / Locations)
      if (radarEntityType === 'characters' && item.entityType !== 'character') return false;
      if (radarEntityType === 'locations' && item.entityType !== 'location') return false;

      const matchesSearch = item.name.toLowerCase().includes(radarSearch.toLowerCase()) ||
        (item.role && item.role.toLowerCase().includes(radarSearch.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(radarSearch.toLowerCase())) ||
        item.scenesAppeared.some(s => s.title.toLowerCase().includes(radarSearch.toLowerCase()));
      if (!matchesSearch) return false;

      if (radarFilter === 'active') return item.count > 0;
      if (radarFilter === 'silent') return item.count === 0;
      return true;
    });
  }, [worldRadarStats.sortedMentions, radarSearch, radarFilter, radarEntityType]);

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

  // Accurate Timeline Streak & Writing Time
  const calculatedAutoStreak = useMemo(() => {
    return storage.calculateTimelineStreak(savedProjects);
  }, [savedProjects]);

  const displayStreak = useMemo(() => {
    if (timelineSettings.streakMode === 'custom') {
      return `${timelineSettings.customStreakDays || calculatedAutoStreak} Days`;
    }
    return `${calculatedAutoStreak} Days`;
  }, [timelineSettings, calculatedAutoStreak]);

  const displayWritingTime = useMemo(() => {
    if (timelineSettings.timeMode === 'custom') {
      const h = timelineSettings.customHours ?? 0;
      const m = timelineSettings.customMinutes ?? 0;
      return `${h}h ${m}m`;
    }
    // Realistic novel drafting velocity: ~900 words per hour
    const h = Math.floor(totalWordsAcrossAll / 900);
    const m = Math.round((totalWordsAcrossAll % 900) / 15);
    return `${Math.max(0, h)}h ${m}m`;
  }, [timelineSettings, totalWordsAcrossAll]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 min-h-screen lg:h-[100dvh] w-full overflow-y-auto lg:overflow-hidden bg-[#F4F1EA] flex flex-col relative font-sans"
    >
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 min-h-full lg:h-full relative z-10 flex flex-col gap-3 lg:gap-4">
        {/* SECTION 1: THE MANUSCRIPTS */}
        <section className="shrink-0 flex flex-col gap-2 sm:gap-3 relative z-30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfaf5] p-3.5 sm:p-4 lg:p-6 rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.15)] border border-[#e5e0d5] relative z-30">
            {/* Archive Folder Tab Decoration */}
            <div
              className="absolute -top-3.5 left-4 w-28 sm:w-32 h-4 sm:h-5 bg-[#e5e0d5]"
              style={{ clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)" }}
            />
            <div className="absolute -top-1 left-4 right-4 h-2 bg-[#fcfaf5] rounded-t-sm z-0" />
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 relative z-30">
              <div className="relative inline-flex items-start">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold text-[#4a3225] tracking-tight leading-none uppercase pr-0.5">
                  Archive Projects
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    if (currentPlan !== 'master') {
                      setShowUpgradeModal(true);
                    } else {
                      navigate("/settings?tab=billing");
                    }
                  }}
                  className={cn(
                    "relative -top-1.5 sm:-top-2 ml-1.5 px-1.5 sm:px-2 py-0.5 rounded-[3px] text-[8px] sm:text-[9.5px] font-mono font-bold uppercase tracking-wider border leading-none transition-all duration-200 cursor-pointer select-none",
                    versionBadge.style
                  )}
                  title={`${versionBadge.tooltip} • Click to view license status`}
                >
                  {versionBadge.label}
                </button>
              </div>

              {/* COMPACT COLLAPSIBLE AUTHOR STATS */}
              <div className="relative z-50">
                <button
                  type="button"
                  onClick={() => setIsStatsOpen((prev) => !prev)}
                  className={cn(
                    "group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-xs select-none",
                    isStatsOpen
                      ? "bg-[#8c503c] text-[#fcfaf5] border-[#4a3225] shadow-inner"
                      : "bg-white/80 hover:bg-white text-stone-700 hover:text-[#4a3225] border-[#e5e0d5] hover:border-amber-400/80"
                  )}
                  title="Click to view full writing stats & timeline"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isStatsOpen ? "bg-amber-400/30 text-amber-200" : "bg-orange-100 text-orange-600"
                  )}>
                    <Flame className="w-2.5 h-2.5" />
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                    {displayStreak}
                  </span>

                  <span className={cn("text-[10px] opacity-40", isStatsOpen ? "text-white" : "text-stone-400")}>•</span>

                  <span className="text-[10px] sm:text-[11px] font-medium opacity-90 whitespace-nowrap">
                    {totalWordsAcrossAll > 1000 ? `${(totalWordsAcrossAll / 1000).toFixed(1)}k W` : `${totalWordsAcrossAll} W`}
                  </span>

                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-200 ml-0.5 shrink-0",
                    isStatsOpen ? "rotate-180 text-[#fcfaf5]" : "text-stone-400 group-hover:text-stone-700"
                  )} />
                </button>

                {/* Collapsible Dropdown Details Card */}
                <AnimatePresence>
                  {isStatsOpen && (
                    <>
                      {/* Backdrop overlay for outside-click dismiss */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsStatsOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 sm:left-auto top-full mt-2 z-50 bg-[#fcfaf5] border border-[#d8d2c4] rounded-lg shadow-xl p-3.5 w-72 sm:w-84 max-w-[90vw] flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#e5e0d5]">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a3225] flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[#8c503c]" />
                            Writing Stats & Streak
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsStatsOpen(false);
                              setIsTimelineModalOpen(true);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#8c503c] hover:text-[#5a3225] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Configure ✎
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {/* Streak */}
                          <div className="bg-white/80 border border-[#e5e0d5] rounded-md p-2 flex flex-col items-center text-center shadow-xs">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-1">
                              <Flame className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[7px] font-bold uppercase tracking-wider text-stone-500">Streak</p>
                            <p className="text-[10px] sm:text-[11px] font-bold text-stone-900 mt-0.5 truncate max-w-full">{displayStreak}</p>
                          </div>

                          {/* Total Words */}
                          <div className="bg-white/80 border border-[#e5e0d5] rounded-md p-2 flex flex-col items-center text-center shadow-xs">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                              <Type className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[7px] font-bold uppercase tracking-wider text-stone-500">Total Words</p>
                            <p className="text-[10px] sm:text-[11px] font-bold text-stone-900 mt-0.5 truncate max-w-full">{totalWordsAcrossAll.toLocaleString()} W</p>
                          </div>

                          {/* Writing Time */}
                          <div className="bg-white/80 border border-[#e5e0d5] rounded-md p-2 flex flex-col items-center text-center shadow-xs">
                            <div className="w-6 h-6 rounded-full bg-[#f4efe6] border border-[#e5e0d5] flex items-center justify-center text-[#8c503c] mb-1">
                              <Coffee className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[7px] font-bold uppercase tracking-wider text-stone-500">Writing Time</p>
                            <p className="text-[10px] sm:text-[11px] font-bold text-[#4a3225] mt-0.5 truncate max-w-full">{displayWritingTime}</p>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 relative z-10 pt-1 sm:pt-0">
              {currentUser?.email && isUserAdmin(currentUser.email) && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#2c1b13] text-[#FAF8F5] hover:bg-[#4a3225] border border-[#5a3a29] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-sm text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
                  title="Master Admin Dashboard (CRM & WarriorPlus IPN)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C89D66] shrink-0" />
                  <span className="whitespace-nowrap">Admin Dashboard</span>
                </button>
              )}
              <button
                onClick={() => navigate("/settings")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#f4efe6] text-[#4a3225] hover:bg-[#e5e0d5] border border-[#d8d2c4] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-sm text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
                title={`Author Settings (${currentUser?.email || "Author"})`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <SettingsIcon className="w-3.5 h-3.5 text-[#8c503c] shrink-0" />
                <span className="max-w-[85px] sm:max-w-[130px] truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0] || "Settings"}</span>
              </button>
              <button
                onClick={handleNewProjectClick}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 bg-[#8c503c] text-[#fcfaf5] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-sm text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:bg-[#b8785e] transition-colors shadow-sm hover:shadow-md border border-[#4a3225] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">New Archive</span>
                {savedProjects.length >= maxAllowedProjects && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-black/40 text-amber-200 rounded-xs font-mono font-bold">
                    3/3
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ARCHIVAL BOOKSHELF */}
        <div className="relative pt-8 sm:pt-12 pb-0 z-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar touch-pan-x">
          {/* Bookshelf container */}
          <div className="relative flex flex-col shrink-0 min-w-full w-max">
            
            {/* Wooden Shelf Base */}
            <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 bg-gradient-to-b from-[#5c371d] to-[#3a2211] rounded-t-[2px] shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] z-0" />
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#26150a] shadow-xl z-0" />
            
            <div className="flex items-end h-[260px] sm:h-[280px] gap-[2px] lg:gap-[3px] pb-5 sm:pb-6 relative z-10 px-3 sm:px-4 lg:px-8 justify-start">
              
              {/* Left Bookend */}
              <div className="shrink-0 w-3 h-16 sm:h-20 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-r border-[#5c3a21] rounded-t-sm shadow-[4px_0_8px_rgba(0,0,0,0.4)] mr-1 z-20" />

              {savedProjects.length === 0 && (
                <div className="flex items-center justify-center w-full max-w-md h-[180px] sm:h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50 mb-4 mx-auto p-4 text-center">
                  <p className="text-stone-500 text-xs sm:text-sm font-medium">No archives found. Click "+ New Archive" to start your first novel.</p>
                </div>
              )}
              {savedProjects.map((proj, index) => {
                // Genre-specific spine colors
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
                
                const titleLength = (proj.title || "").trim().length;

                // Natural random variation in book spine thickness (random thick & slim books):
                // Uses a deterministic seed from the project ID & index so each book retains its unique physical volume consistently.
                // Maximum thickness is strictly capped at 60px per user request.
                const pseudoRandom = (proj.id || "").split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), index * 41);
                const THICKNESS_VARIATIONS = [36, 52, 40, 60, 44, 56, 38, 58, 46, 50];
                const baseRandomThickness = THICKNESS_VARIATIONS[Math.abs(pseudoRandom) % THICKNESS_VARIATIONS.length];
                
                // Add slight bulk based on manuscript progress (strictly capped at 60px max)
                const progressBonus = Math.min(3, Math.floor(progressRatio * 3));
                const spineWidth = Math.min(60, Math.max(36, baseRandomThickness + progressBonus));
                const spineVariant = index % 4;
                
                // Varied but smooth skyline
                const HEIGHT_MAP = [220, 235, 225, 215, 240];
                const baseHeight = HEIGHT_MAP[index % HEIGHT_MAP.length];
                const bookHeight = isSelected ? baseHeight + 18 : baseHeight;
                
                const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;
                
                // Dynamic font calculation (font size scaling):
                // Utilizes the full length of the book spine. Scales font size smoothly so the entire title fits.
                // Truncates with '...' only if an exceptionally long title still exceeds the full spine length at minimum font size.
                const getSpineTitleConfig = (title: string, availableHeight: number) => {
                  const len = Math.max(1, title.length);
                  // Calculate font size that ensures the title fills the available length gracefully:
                  // For shorter titles (Dune, Hobbit), keep generous size (12px - 13px) with nice tracking.
                  // For longer titles, scale down gradually so the entire title fits comfortably.
                  let idealFontSize = Math.min(13, Math.floor((availableHeight / (len * 0.64)) * 2) / 2);
                  let fontSize = Math.max(8.5, idealFontSize);
                  
                  let letterSpacing = '0.08em';
                  if (fontSize <= 8.5) letterSpacing = '0.02em';
                  else if (fontSize <= 9.5) letterSpacing = '0.04em';
                  else if (fontSize <= 11) letterSpacing = '0.06em';
                  else if (len < 12) letterSpacing = '0.14em'; // Short titles get spacious tracking

                  return { fontSize, letterSpacing };
                };

                // Helper to render book spine title spanning the full vertical length of the spine
                const renderSpineTitle = (availHeight: number, isParchment = false) => {
                  const { fontSize, letterSpacing } = getSpineTitleConfig(proj.title, availHeight);
                  return (
                    <div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10"
                      style={{ width: `${spineWidth}px`, height: `${bookHeight}px` }}
                    >
                      <div 
                        className="flex items-center justify-center"
                        style={{
                          width: `${availHeight}px`,
                          height: `${spineWidth}px`,
                          transform: 'rotate(-90deg)',
                          transformOrigin: 'center center',
                        }}
                      >
                        <span 
                          className={cn(
                            "font-serif font-bold uppercase text-center block transition-opacity duration-300 px-1 whitespace-nowrap overflow-hidden text-ellipsis",
                            isParchment
                              ? "text-[#2c1b13]"
                              : isComplete
                                ? "text-[#e8c678] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                : "text-[#ebdcd0] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
                            isSelected ? "opacity-75" : "opacity-100"
                          )}
                          style={{
                            width: `${availHeight}px`,
                            maxWidth: `${availHeight}px`,
                            fontSize: `${fontSize}px`,
                            letterSpacing,
                            lineHeight: 1,
                          }}
                          title={proj.title}
                        >
                          {proj.title}
                        </span>
                      </div>
                    </div>
                  );
                };
                
                // Ribbon indicator for most recently updated books
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
                      theme.bg
                    )}
                    style={{ width: isSelected ? `${Math.max(260, spineWidth + 195)}px` : `${spineWidth}px`, height: `${bookHeight}px` }}
                    title={`${proj.title} • ${proj.genre || 'Fantasy Archive'}`}
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
                          <div className={cn("absolute top-[16px] w-full h-[2.5px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.6)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className={cn("absolute top-[22px] w-full h-[2px] border-t", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/40 border-white/10")} />
                          <div className={cn("absolute bottom-[22px] w-full h-[2px] border-t", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/40 border-white/10")} />
                          <div className={cn("absolute bottom-[16px] w-full h-[2.5px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.6)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          {renderSpineTitle(baseHeight - 48)}
                        </>
                      )}

                      {/* Style 1 */}
                      {spineVariant === 1 && (
                        <>
                          <div className="absolute top-[16px] bottom-[16px] left-[10%] right-[10%] bg-[#f4ebd8] rounded-[2px] shadow-[inset_0_0_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.6)] border border-[#d6c7b0]" />
                          {isComplete && (
                             <div className="absolute bottom-[10px] w-full h-[2px] bg-[#c49a45] border-t border-[#f4db89]" />
                          )}
                          {renderSpineTitle(baseHeight - 44, true)}
                        </>
                      )}

                      {/* Style 2 */}
                      {spineVariant === 2 && (
                        <>
                          <div className="absolute top-0 w-full h-[18px] bg-black/40 border-b border-black/80" />
                          <div className="absolute bottom-0 w-full h-[18px] bg-black/40 border-t border-black/80" />
                          <div className={cn("absolute top-[18px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                          <div className={cn("absolute bottom-[18px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                          {renderSpineTitle(baseHeight - 46)}
                        </>
                      )}

                      {/* Style 3 */}
                      {spineVariant === 3 && (
                        <>
                          <div className={cn("absolute top-[12px] bottom-[12px] left-[10%] right-[10%] border rounded-[2px]", isComplete ? "border-[#c49a45]" : "border-white/30")} />
                          <div className={cn("absolute top-[16px] bottom-[16px] left-[18%] right-[18%] border", isComplete ? "border-[#c49a45] opacity-60" : "border-white/20")} />
                          {renderSpineTitle(baseHeight - 34)}
                        </>
                      )}
                    </div>

                    {/* 1. Cover Plate Content (Accordion expanded slideout) */}
                    <div className={cn(
                      "absolute top-0 bottom-0 right-0 p-2.5 sm:p-3 transition-opacity duration-500 z-10 flex items-center justify-end overflow-hidden",
                      isSelected ? "opacity-100 delay-150" : "opacity-0 pointer-events-none"
                    )} style={{ width: `calc(100% - ${spineWidth}px)` }}>
                      <div className="w-full h-full bg-[#faf6ed] border border-[#dad1be] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),_1px_2px_8px_rgba(0,0,0,0.4)] rounded-[3px] p-3 sm:p-3.5 flex flex-col justify-between relative overflow-hidden min-w-[160px]">
                        
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-3 bg-white/60 border-t border-b border-black/5 rotate-[-0.5deg] pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />

                        {isRecent && (
                          <div className="absolute top-0 right-2 w-2.5 h-6 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                             <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-black/20 opacity-30" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center justify-between border-b border-[#e8ded0] pb-1 mb-1.5 mt-0.5">
                            <span className="block text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-[#8c503c]">
                              Case File {index < 9 ? `· 0${index + 1}` : `· ${index + 1}`}
                            </span>
                          </div>
                          <h2 className="text-[14px] sm:text-[16px] font-serif font-bold leading-[1.2] text-[#2c1b13] line-clamp-2 text-left tracking-tight mb-1 break-words">
                            {proj.title}
                          </h2>
                          <div className="w-6 h-[1.5px] bg-[#8c503c]/40 my-1" />
                          <p className="text-[10px] sm:text-[11px] font-serif italic text-[#745344] line-clamp-2 text-left leading-tight break-words">
                            {proj.genre || "Fantasy Archive"}
                          </p>
                        </div>

                        <div className="mt-auto pt-2 border-t border-[#ebdcd0]">
                          <div className="flex items-baseline justify-between mb-1 gap-1">
                            <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-[#8c503c]/70 shrink-0">
                              Words
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-serif font-bold text-[#2c1b13] truncate">
                              {(proj.currentWords || 0).toLocaleString()} {isComplete && "★"}
                            </span>
                          </div>
                          <div className="w-full bg-[#e7decfa0] h-[3px] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-[#c49a45]" : "bg-[#8c503c]")}
                              style={{ width: `${Math.max(5, progressPercent)}%` }}
                            />
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete(proj);
                              }}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors border border-transparent hover:border-rose-200 cursor-pointer shrink-0"
                              title={`Delete "${proj.title}"`}
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/project/${proj.id}`); }}
                              className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white bg-[#2c1b13] hover:bg-[#8c503c] transition-colors px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-sm cursor-pointer whitespace-nowrap"
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

              {/* Right Bookend */}
              {savedProjects.length > 0 && (
                <div className="shrink-0 w-3 h-16 sm:h-20 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-l border-[#2a1a0f] rounded-t-sm shadow-[-4px_0_8px_rgba(0,0,0,0.4)] ml-1 z-20" />
              )}
            </div>
          </div>
        </div>
        </section>

        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}
        <section className="flex-1 flex flex-col min-h-fit lg:min-h-0 pb-4 lg:pb-2">
          <div className="mb-2 shrink-0 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg lg:text-xl font-sans font-bold text-[#4a3225] tracking-tight uppercase">
              Investigation Board
            </h2>
            {savedProjects.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-500 text-[10px] uppercase tracking-wider font-bold">Focus:</span>
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-white text-[#4a3225] text-[10px] sm:text-[11px] font-sans font-bold border border-[#e5e0d5] rounded-sm px-2 py-0.5 focus:outline-none focus:border-[#d49a89] max-w-[160px] sm:max-w-xs truncate"
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-fit lg:min-h-0">
            {/* Task Notes (Left Col) */}
            <div className="lg:col-span-8 bg-[#fcfaf5] rounded-sm p-3.5 sm:p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden group min-h-[320px] lg:min-h-0 h-full">
              {/* Paper texture overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 relative z-10 shrink-0 border-b border-[#e5e0d5] pb-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="font-sans text-sm sm:text-base lg:text-lg font-bold text-[#4a3225] uppercase tracking-wide">
                    Task Notes
                  </h3>
                  {/* Status filter pills */}
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-[#ede8dc] p-0.5 rounded-sm">
                    <button
                      onClick={() => setTaskFilter("all")}
                      className={cn(
                        "px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors",
                        taskFilter === "all" ? "bg-[#8c503c] text-white" : "text-[#5d3f32] hover:text-[#8c503c]"
                      )}
                    >
                      All ({tasks.length})
                    </button>
                    <button
                      onClick={() => setTaskFilter("pending")}
                      className={cn(
                        "px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors",
                        taskFilter === "pending" ? "bg-[#8c503c] text-white" : "text-[#5d3f32] hover:text-[#8c503c]"
                      )}
                    >
                      Pending ({tasks.filter((t) => !t.completed).length})
                    </button>
                    <button
                      onClick={() => setTaskFilter("completed")}
                      className={cn(
                        "px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors",
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
                    className="flex items-center gap-1.5 bg-[#8c503c] text-white px-2.5 py-1 rounded-sm text-[8px] sm:text-[9px] lg:text-[10px] font-bold tracking-widest uppercase hover:bg-[#b8785e] transition-colors shadow-sm cursor-pointer"
                  >
                    {isAddingTask ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{isAddingTask ? "Cancel" : "Add Task"}</span>
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
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Picker */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-stone-500">
                          <span>Type:</span>
                          {(['writing', 'editing', 'worldbuilding', 'research'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setNewTaskType(t)}
                              className={cn(
                                "px-1.5 py-0.5 rounded-sm border transition-colors cursor-pointer",
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
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-stone-500">
                          <span>Urgency:</span>
                          {(['low', 'medium', 'high'] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setNewTaskUrgency(u)}
                              className={cn(
                                "px-1.5 py-0.5 rounded-sm border transition-colors cursor-pointer",
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
                        className="bg-[#4a3225] hover:bg-[#8c503c] disabled:opacity-40 text-white text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm transition-colors cursor-pointer"
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
                  <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 sm:p-6 text-stone-400">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-stone-300 mb-2 stroke-[1.5]" />
                    <p className="font-serif text-xs sm:text-sm font-medium text-stone-600">No tasks found</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Click "+ Add Task" to set your writing priorities.</p>
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
                            : "bg-[#fcfaf5] border-[#e5e0d5] hover:border-[#d49a89] hover:shadow-xs"
                        )}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {!task.completed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8c503c] rounded-l-sm opacity-20" />
                        )}
                        <button
                          type="button"
                          className="shrink-0 focus:outline-none ml-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id);
                          }}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#8c503c]" />
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#d49a89] hover:border-[#8c503c] transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2 lg:gap-4">
                          <p
                            className={cn(
                              "text-xs lg:text-sm font-serif transition-colors truncate break-words",
                              task.completed
                                ? "text-stone-400 line-through"
                                : "text-[#4a3225] font-medium"
                            )}
                          >
                            {task.title}
                          </p>

                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            {task.urgency === "high" && !task.completed && (
                              <span className="flex items-center gap-0.5 text-[7px] sm:text-[8px] lg:text-[9px] uppercase tracking-widest font-bold text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded-sm" title="High Priority">
                                <AlertCircle className="w-2.5 h-2.5" />
                                High
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[7px] sm:text-[8px] lg:text-[9px] uppercase tracking-widest font-bold px-1 sm:px-1.5 py-0.5 rounded-sm border",
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
                              className="opacity-60 sm:opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded-sm transition-all ml-0.5 cursor-pointer"
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
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:gap-4 min-h-fit lg:min-h-0 h-full">
              {/* Quick Jump (Vintage Journal style) */}
              {activeProject ? (
                <div
                  className="bg-[#2a1a14] text-[#fcfaf5] rounded-sm p-3.5 sm:p-4 lg:p-5 shadow-[4px_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none border border-[#5d3f32] min-h-[130px]"
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
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 sm:w-3 bg-black/50 border-r border-[#5d3f32]" />
                  
                  <div className="absolute top-0 right-0 p-3 lg:p-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 text-[#d49a89]">
                    <PenTool className="w-10 h-10 lg:w-16 lg:h-16" />
                  </div>
                  <div className="relative z-10 ml-2">
                    <p className="text-[7px] lg:text-[9px] uppercase tracking-widest font-bold text-[#d49a89]/70 mb-0.5">
                      Resume Drafting
                    </p>
                    <h3 className="font-serif text-sm lg:text-lg font-bold line-clamp-1 text-[#fcfaf5] break-words">
                      {activeProject.title}
                    </h3>
                    <p className="text-[#fcfaf5]/60 text-[10px] lg:text-xs mt-0.5 font-serif italic truncate">
                      {activeProject.genre} • {resumeStats.currentSceneTitle} • Updated {resumeStats.timeAgo}
                    </p>
                  </div>
                  <div className="relative z-10 mt-3 lg:mt-4 flex items-center justify-between ml-2">
                    <div className="flex items-center gap-1 lg:gap-1.5 bg-[#fcfaf5]/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-sm text-[8px] lg:text-[10px] font-bold tracking-widest uppercase border border-[#fcfaf5]/20">
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
                  className="bg-[#2a1a14] text-[#fcfaf5] rounded-sm p-3.5 sm:p-4 lg:p-5 shadow-[4px_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform shrink-0 flex-1 lg:flex-none border border-[#5d3f32] min-h-[130px]"
                  onClick={() => navigate('/create')}
                >
                  <div className="relative z-10">
                    <p className="text-[7px] lg:text-[9px] uppercase tracking-widest font-bold text-[#d49a89]/70 mb-0.5">
                      Start Writing
                    </p>
                    <h3 className="font-serif text-sm lg:text-lg font-bold line-clamp-1 text-[#fcfaf5]">
                      Create New Archive
                    </h3>
                    <p className="text-[#fcfaf5]/60 text-[10px] lg:text-xs mt-0.5 font-serif italic">
                      Begin your fantasy novel or story
                    </p>
                  </div>
                  <div className="relative z-10 mt-3 flex items-center justify-end">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#8c503c] flex items-center justify-center text-white">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* World Radar (Polaroid style mini grid - clickable to expand) */}
              <div 
                className="bg-[#fcfaf5] rounded-sm p-3.5 sm:p-4 lg:p-5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.15)] flex-1 flex flex-col min-h-[180px] lg:min-h-0 relative group/card cursor-pointer hover:border-[#8c503c]/40 hover:shadow-[2px_6px_16px_rgba(0,0,0,0.2)] transition-all"
                onClick={() => setIsRadarExpanded(true)}
                title="Click to expand full World Radar"
              >
                <div className="flex justify-between items-start mb-2 lg:mb-3 shrink-0 border-b border-[#e5e0d5] pb-2 mt-0.5">
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-sans text-xs sm:text-sm lg:text-base font-bold text-[#4a3225] uppercase tracking-wide group-hover/card:text-[#8c503c] transition-colors">
                        World Radar
                      </h3>
                      <span className="text-[8px] lg:text-[9px] bg-[#8c503c]/10 text-[#8c503c] font-sans font-bold px-1.5 py-0.5 rounded-sm shrink-0">
                        {worldRadarStats.totalMentions} Mentions
                      </span>
                    </div>
                    {savedProjects.length > 1 ? (
                      <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[8px] text-stone-500 font-serif shrink-0">Book:</span>
                        <select
                          value={selectedProjectId || activeProject?.id || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedProjectId(e.target.value);
                          }}
                          className="text-[8px] sm:text-[9px] text-[#8c503c] font-bold font-serif bg-white/80 border border-[#e5e0d5] rounded-xs px-1 py-0.2 focus:outline-none max-w-[110px] sm:max-w-[130px] truncate"
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
                      <p className="text-[8px] lg:text-[9px] text-[#8c503c] font-medium truncate max-w-[120px] sm:max-w-[140px]" title={activeProject.title}>
                        Book: {activeProject.title}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleManualScan}
                      className="p-1 rounded-sm text-[#8c503c] hover:bg-[#e5e0d5] hover:text-[#4a3225] transition-colors cursor-pointer"
                      title="Re-scan manuscript text now"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isScanning && "animate-spin text-[#8c503c]")} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRadarExpanded(true);
                      }}
                      className="p-1 rounded-sm text-[#8c503c] hover:bg-[#e5e0d5] hover:text-[#4a3225] transition-colors flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                      title="Expand World Radar to full screen"
                    >
                      <span className="hidden sm:inline">Expand</span>
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Entity Type Tabs in Mini Card */}
                <div 
                  className="flex items-center gap-1 mb-2 pb-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border-b border-[#e5e0d5]/60 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setMiniRadarType('all')}
                    className={cn(
                      "px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer",
                      miniRadarType === 'all'
                        ? "bg-[#8c503c] text-white"
                        : "text-stone-500 hover:text-stone-800 hover:bg-[#e5e0d5]/50"
                    )}
                  >
                    All ({worldRadarStats.sortedMentions.length})
                  </button>
                  <button
                    onClick={() => setMiniRadarType('characters')}
                    className={cn(
                      "px-1.5 py-0.5 rounded-xs transition-colors flex items-center gap-0.5 cursor-pointer",
                      miniRadarType === 'characters'
                        ? "bg-[#8c503c] text-white"
                        : "text-stone-500 hover:text-stone-800 hover:bg-[#e5e0d5]/50"
                    )}
                  >
                    <Users className="w-2.5 h-2.5" />
                    Chars ({worldRadarStats.characterCount})
                  </button>
                  <button
                    onClick={() => setMiniRadarType('locations')}
                    className={cn(
                      "px-1.5 py-0.5 rounded-xs transition-colors flex items-center gap-0.5 cursor-pointer",
                      miniRadarType === 'locations'
                        ? "bg-[#8c503c] text-white"
                        : "text-stone-500 hover:text-stone-800 hover:bg-[#e5e0d5]/50"
                    )}
                  >
                    <MapPin className="w-2.5 h-2.5" />
                    Locs ({worldRadarStats.locationCount})
                  </button>
                </div>

                {(() => {
                  const miniItems = worldRadarStats.sortedMentions.filter(item => {
                    if (miniRadarType === 'characters') return item.entityType === 'character';
                    if (miniRadarType === 'locations') return item.entityType === 'location';
                    return true;
                  });

                  if (miniItems.length === 0) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                        <Users className="w-6 h-6 text-stone-300 mb-1 stroke-[1.5]" />
                        <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-stone-400">
                          No Entities Tracked
                        </p>
                        <p className="text-[9px] text-stone-400 mt-0.5">
                          Type character or location names in Writing Studio to see live frequency.
                        </p>
                      </div>
                    );
                  }

                  const topCount = Math.max(1, miniItems[0]?.count || 1);

                  return (
                    <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar min-h-0">
                      <div className="flex flex-col justify-start space-y-2 lg:space-y-2.5">
                        {miniItems.map((item) => {
                          const percentage = item.count > 0 
                            ? Math.max(12, Math.round((item.count / topCount) * 100))
                            : 0;

                          return (
                            <div
                              key={`radar-mini-${item.id}`}
                              className="relative group shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsRadarExpanded(true);
                              }}
                            >
                              <div className="flex justify-between items-end mb-1">
                                <div className="flex items-center gap-1 min-w-0 pr-2">
                                  {item.entityType === 'character' ? (
                                    <Users className="w-2.5 h-2.5 text-[#8c503c] shrink-0" />
                                  ) : (
                                    <MapPin className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                  )}
                                  <span className="text-[10px] lg:text-xs font-serif font-bold text-[#4a3225] group-hover:text-[#8c503c] transition-colors truncate">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[#8c503c] font-sans text-[8px] lg:text-[9px] font-bold">
                                    {item.count} {item.count === 1 ? 'mention' : 'mentions'}
                                  </span>
                                  {item.scenesAppeared.length > 0 && (
                                    <span className="text-stone-400 font-serif text-[7px] lg:text-[8px] ml-1">
                                      ({item.scenesAppeared.length} {item.scenesAppeared.length === 1 ? 'scene' : 'scenes'})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="h-1 lg:h-1.5 w-full bg-[#e5e0d5] rounded-sm overflow-hidden border border-[#d49a89]/20">
                                <div
                                  className={cn(
                                    "h-full rounded-sm transition-all duration-700 relative",
                                    item.count > 0
                                      ? item.entityType === 'character'
                                        ? "bg-gradient-to-r from-[#d49a89] to-[#8c503c]"
                                        : "bg-gradient-to-r from-amber-300 to-amber-600"
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
                  );
                })()}

                {/* Card footer prompt */}
                {worldRadarStats.sortedMentions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#e5e0d5] flex items-center justify-between text-[8px] sm:text-[9px] font-sans font-bold text-[#8c503c] shrink-0 uppercase tracking-widest bg-[#f4efe6] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-sm group-hover/card:bg-[#e5e0d5] transition-colors">
                    <span>View all {worldRadarStats.sortedMentions.length} entities</span>
                    <Maximize2 className="w-3 h-3 text-[#8c503c] group-hover/card:scale-110 transition-transform" />
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
                      Narrative Frequency & World Density
                    </h2>
                    <p className="text-xs text-stone-600 font-serif mt-0.5">
                      Dynamically scanned in real-time across {worldRadarStats.scenesScanned} manuscript scenes in "{activeProject?.title}".
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleManualScan}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-white border border-[#E5E0D5] text-[#4A3225] hover:border-[#8C503C] hover:text-[#8C503C] transition-colors shadow-2xs"
                      title="Re-scan manuscript content"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isScanning && "animate-spin text-[#8C503C]")} />
                      <span>{isScanning ? "Scanning..." : "Re-scan"}</span>
                    </button>
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
                  <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D5] rounded-sm shadow-2xs">
                      <BarChart2 className="w-3.5 h-3.5 text-[#8C503C]" />
                      <span className="font-bold text-[#4A3225]">{worldRadarStats.totalMentions}</span>
                      <span className="text-stone-500">Total Mentions</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D5] rounded-sm shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-[#8C503C]" />
                      <span className="font-bold text-[#4A3225]">{worldRadarStats.characterCount}</span>
                      <span className="text-stone-500">Characters</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D5] rounded-sm shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-bold text-[#4A3225]">{worldRadarStats.locationCount}</span>
                      <span className="text-stone-500">Locations</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E0D5] rounded-sm shadow-2xs">
                      <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                      <span className="font-bold text-[#4A3225]">{worldRadarStats.scenesScanned}</span>
                      <span className="text-stone-500">Scenes Scanned</span>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 flex-1 sm:flex-initial justify-end">
                    <div className="relative w-full sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search name, role, scene..."
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

                    {/* Entity Type Filter Tabs */}
                    <div className="flex items-center bg-[#E5E0D5]/70 p-0.5 rounded-sm border border-[#E5E0D5] text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => setRadarEntityType('all')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all",
                          radarEntityType === 'all' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setRadarEntityType('characters')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all flex items-center gap-1",
                          radarEntityType === 'characters' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        <Users className="w-3 h-3" />
                        Chars ({worldRadarStats.characterCount})
                      </button>
                      <button
                        onClick={() => setRadarEntityType('locations')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all flex items-center gap-1",
                          radarEntityType === 'locations' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        <MapPin className="w-3 h-3" />
                        Locs ({worldRadarStats.locationCount})
                      </button>
                    </div>

                    {/* Activity Status Filter Tabs */}
                    <div className="flex items-center bg-[#E5E0D5]/70 p-0.5 rounded-sm border border-[#E5E0D5] text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => setRadarFilter('all')}
                        className={cn(
                          "px-2 py-1 rounded-sm transition-all",
                          radarFilter === 'all' ? "bg-white text-[#4A3225] shadow-2xs" : "text-stone-600 hover:text-stone-900"
                        )}
                      >
                        All
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

                {/* Modal Body: Full grid showing all scanned entities with scene breakdowns */}
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
                            key={`radar-modal-${item.id}-${idx}`}
                            className="p-4 rounded-sm border border-[#E5E0D5] bg-white hover:border-[#8C503C] hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                                    idx === 0 && item.count > 0 ? "bg-[#8C503C] text-white shadow-xs" :
                                    idx === 1 && item.count > 0 ? "bg-[#B8785E] text-white" :
                                    "bg-stone-200 text-stone-700"
                                  )}>
                                    #{idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="font-serif font-bold text-base text-[#4A3225] group-hover:text-[#8C503C] transition-colors leading-tight truncate">
                                        {item.name}
                                      </h4>
                                      <span className={cn(
                                        "text-[8px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider shrink-0 border",
                                        item.entityType === 'character'
                                          ? "bg-rose-50 text-rose-800 border-rose-200"
                                          : "bg-amber-50 text-amber-800 border-amber-200"
                                      )}>
                                        {item.entityType === 'character' ? 'Character' : 'Location'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#8C503C] tracking-widest uppercase inline-block mt-0.5 truncate">
                                      {item.role || (item.entityType === 'character' ? "Character" : "Location")}
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

                            {/* Relative Frequency Bar & Scenes breakdown */}
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
                                      ? item.entityType === 'character'
                                        ? "bg-gradient-to-r from-[#D49A89] via-[#B8785E] to-[#8C503C]"
                                        : "bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700"
                                      : "bg-stone-200"
                                  )}
                                  style={{ width: `${Math.max(percentage, item.count > 0 ? 6 : 0)}%` }}
                                />
                              </div>

                              {/* Scene Appearance Pills */}
                              {item.scenesAppeared.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-stone-100">
                                  <span className="text-[9px] font-bold text-stone-500 font-serif uppercase tracking-wider block mb-1">
                                    Appears in {item.scenesAppeared.length} {item.scenesAppeared.length === 1 ? 'scene' : 'scenes'}:
                                  </span>
                                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
                                    {item.scenesAppeared.map((scene, sceneIdx) => (
                                      <span
                                        key={`scene-badge-${item.id}-${scene.id}-${sceneIdx}`}
                                        className="text-[9px] bg-[#F4EFE6] text-[#4A3225] border border-[#E5E0D5] px-1.5 py-0.5 rounded-xs font-serif flex items-center gap-1"
                                        title={`${scene.count} mention(s) in "${scene.title}"`}
                                      >
                                        <span className="truncate max-w-[120px]">{scene.title}</span>
                                        <span className="font-bold text-[#8C503C]">×{scene.count}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-stone-400 font-serif">
                                  {item.count > 0
                                    ? `Found in ${item.scenesAppeared.length} scene${item.scenesAppeared.length === 1 ? '' : 's'}`
                                    : 'Not mentioned yet in manuscript'}
                                </span>
                                <button
                                  onClick={() => {
                                    setIsRadarExpanded(false);
                                    if (activeProject) {
                                      if (item.entityType === 'character') {
                                        navigate(`/project/${activeProject.id}/characters`);
                                      } else {
                                        navigate(`/project/${activeProject.id}/workspace/locations`);
                                      }
                                    }
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#8C503C] hover:text-[#4A3225] flex items-center gap-1 group-hover:underline"
                                >
                                  <span>{item.entityType === 'character' ? 'View Dossier' : 'View Location'}</span>
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
                        No entities found matching filter
                      </p>
                      <p className="text-xs text-stone-500 font-serif mt-1">
                        Try changing your search term or select "All" above.
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-3 sm:p-4 bg-[#F4EFE6] border-t border-[#E5E0D5] flex items-center justify-between text-xs text-stone-600 font-serif">
                  <span>Tip: In Writing Studio, type character names directly or use <strong className="text-[#8C503C]">@</strong> to tag them into your narrative.</span>
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

        {/* AUTHOR TIMELINE & STATS CONFIGURATION MODAL */}
        <TimelineSettingsModal
          isOpen={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
          savedProjects={savedProjects}
          totalWords={totalWordsAcrossAll}
          onUpdated={() => setTimelineSettings(storage.getTimelineSettings())}
        />

        {/* DELETE ARCHIVE / BOOK CONFIRMATION MODAL */}
        <AnimatePresence>
          {projectToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isDeletingProject && setProjectToDelete(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative bg-[#FCFAF5] border border-[#D8D2C4] rounded-lg shadow-2xl w-full max-w-md overflow-hidden z-10"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[#E5E0D5] flex items-center justify-between bg-[#F4EFE6]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
                        Delete Manuscript Archive
                      </h3>
                      <p className="text-[11px] font-serif text-stone-500 mt-0.5">
                        Permanent action confirmation
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isDeletingProject}
                    onClick={() => setProjectToDelete(null)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-sm transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="bg-white border border-[#E5E0D5] rounded-md p-3.5 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C503C] mb-1">
                      {projectToDelete.genre || "Fiction Novel"}
                    </div>
                    <h4 className="font-serif font-bold text-stone-900 text-lg leading-snug">
                      {projectToDelete.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-stone-500 font-serif mt-2 pt-2 border-t border-stone-100">
                      <span>Author: <strong>{projectToDelete.author || "Author"}</strong></span>
                      <span>•</span>
                      <span>Words: <strong>{(projectToDelete.currentWords || 0).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 font-serif leading-relaxed">
                    Are you sure you want to permanently delete this book archive? All associated manuscript chapters, characters, locations, notes, and story bible files will be permanently erased from your account and cloud sync.
                  </p>

                  <div className="bg-rose-50/80 border border-rose-200 rounded-md p-2.5 text-[11px] text-rose-800 font-serif flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>This action cannot be undone.</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#F4EFE6] border-t border-[#E5E0D5] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isDeletingProject}
                    onClick={() => setProjectToDelete(null)}
                    className="px-4 py-2 border border-[#D8D2C4] bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Keep Archive
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingProject}
                    onClick={() => handleDeleteProject(projectToDelete)}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingProject ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FE Quota Exceeded Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="projects"
          currentCount={savedProjects.length}
          maxLimit={maxAllowedProjects}
        />
      </div>
    </motion.div>
  );
}
