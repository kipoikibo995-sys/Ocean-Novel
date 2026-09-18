import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  PenTool,
  Target,
  LayoutDashboard,
  Clock,
  Activity,
  BookOpen,
  Users,
  Map,
  Edit3,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { storage } from "@/lib/storage";
import { Download } from "lucide-react";
import { ExportModal } from "@/components/ExportModal";

export default function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const savedProject = id ? storage.getProjects().find(p => p.id === id) : null;
  const projectData = id ? storage.getProjectData(id) : null;

  const [showExportModal, setShowExportModal] = useState(false);
  const [coverUrl, setCoverUrl] = useState(
    savedProject?.coverUrl || "https://res.cloudinary.com/mekoxs1q/image/upload/v1788788313/7e1e3f9e-023d-4556-a04c-e0d633ba4cea_rcjcwh.png"
  );

  useEffect(() => {
    if (savedProject?.coverUrl) {
      setCoverUrl(savedProject.coverUrl);
    }
  }, [savedProject?.coverUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && id) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCoverUrl(base64String);
        storage.updateProject(id, { coverUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Real chapter and live word count calculation
  const countChapters = (items: any[] = []): number => {
    let count = 0;
    for (const item of items) {
      if (item.type === 'chapter') count++;
      if (item.children) count += countChapters(item.children);
    }
    return count;
  };

  const countWords = (items: any[] = []): number => {
    let words = 0;
    for (const item of items) {
      if (item.type === 'scene' && item.content) {
        const text = item.content.replace(/<[^>]*>/g, ' ').trim();
        if (text) {
          words += text.split(/\s+/).filter(Boolean).length;
        }
      }
      if (item.children) words += countWords(item.children);
    }
    return words;
  };

  const actualChaptersCount = countChapters(projectData?.manuscript || []);
  const liveWords = projectData?.manuscript ? countWords(projectData.manuscript) : (savedProject?.currentWords || 0);
  const totalWords = Math.max(liveWords, savedProject?.currentWords || 0);
  const targetWords = savedProject?.wordGoal || 50000;

  const projectStats = {
    totalWords,
    targetWords,
  };
  
  const displayTitle = savedProject?.title || "Untitled";
  const displayGenre = savedProject?.genre || "Fiction";

  // Plot events count
  const plotEvents = projectData?.plotEvents || [];
  const plannedEventsCount = plotEvents.length;
  const completedEventsCount = plotEvents.filter((e: any) => e.completed || e.status === 'completed').length;
  const plotProgressPct = plannedEventsCount > 0 
    ? Math.min(100, Math.round((completedEventsCount / plannedEventsCount) * 100)) 
    : Math.min(100, Math.round((totalWords / targetWords) * 100));

  // Build real activities list based on actual project state
  const activities = [
    {
      id: "act-1",
      action: "Drafting Scene in Writing Studio",
      details: projectData?.lastActiveSceneTitle 
        ? `Last worked on "${projectData.lastActiveSceneTitle}"`
        : "Initial scene synchronized in manuscript binder",
      time: "Recent",
    },
    {
      id: "act-2",
      action: "Manuscript Progress Tracked",
      details: `${totalWords.toLocaleString()} words written towards ${(targetWords / 1000).toFixed(0)}k target`,
      time: "Updated today",
    },
    {
      id: "act-3",
      action: "World Lore & Cast Established",
      details: `${projectData?.characters?.length ?? 0} characters and ${projectData?.locations?.length ?? 0} key story locations documented`,
      time: "Active in Bible",
    },
  ];

  return (
    <div
      className="flex-1 h-screen max-h-screen w-full overflow-hidden bg-[#F4F1EA] text-stone-800 flex flex-col relative font-sans selection:bg-[#965A5A] selection:text-white"
    >
      {/* Abstract Artistic Background - Matches Dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[#E8E3D7] rounded-full mix-blend-multiply blur-[60px] lg:blur-[100px] opacity-70" />
        <div className="absolute top-[30%] -left-20 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[#E2D9C8] rounded-full mix-blend-multiply blur-[60px] lg:blur-[120px] opacity-50" />
      </div>



      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto p-6 lg:px-12 lg:py-12 gap-8 lg:gap-12 min-h-0 h-full relative z-10">
        {/* Left Side Cover */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="hidden md:block w-[35%] lg:w-[35%] h-full rounded-2xl overflow-hidden shadow-xl relative border border-[#E5E0D5] shrink-0 group"
        >
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity" />
          
          {/* Change Cover overlay */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
              Change Cover
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col gap-3">
            <button
              onClick={() =>
                navigate(`/project/${(id || '1')}/workspace/studio`)
              }
              className="w-full py-4 bg-[#965A5A] hover:bg-[#7A4A4A] text-white rounded-xl font-bold tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 uppercase text-sm group/btn"
            >
              <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              Open Studio
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-3 uppercase text-xs"
            >
              <Download className="w-4 h-4" />
              Export Manuscript
            </button>
          </div>
        </motion.div>

        {/* Right Side Details (Light Theme Stats) */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8 shrink-0 mt-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-2 text-stone-500 text-[10px] font-bold tracking-widest uppercase">
                <span className="hover:text-stone-800 transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>All Books</span>
                <span className="text-stone-400">/</span>
                <span className="text-stone-800">{displayTitle}</span>
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-800 tracking-tight">
              {displayTitle}
            </h1>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0"
          >
            <div className="bg-white/80 border border-[#E5E0D5] shadow-sm rounded-xl p-5 hover:bg-white transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Total Words
                </span>
                <PenTool className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-800">
                {totalWords.toLocaleString()}
              </div>
              <div className="text-xs text-[#965A5A] mt-1 font-medium">
                {targetWords > 0 ? `${Math.round((totalWords / targetWords) * 100)}% of target` : "In progress"}
              </div>
            </div>

            <div className="bg-white/80 border border-[#E5E0D5] shadow-sm rounded-xl p-5 hover:bg-white transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Target
                </span>
                <Target className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-800">
                {targetWords.toLocaleString()}
              </div>
              <div className="h-1.5 w-full bg-[#E5E0D5] mt-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#965A5A]"
                  style={{
                    width: `${Math.min(100, Math.round((totalWords / targetWords) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white/80 border border-[#E5E0D5] shadow-sm rounded-xl p-5 hover:bg-white transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Chapters
                </span>
                <LayoutDashboard className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-800">
                {actualChaptersCount}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {actualChaptersCount > 0 ? `${actualChaptersCount} in manuscript` : "No chapters yet"}
              </div>
            </div>

            <div className="bg-white/80 border border-[#E5E0D5] shadow-sm rounded-xl p-5 hover:bg-white transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Time Spent
                </span>
                <Clock className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-800">
                {totalWords > 0 ? `${Math.max(1, Math.round(totalWords / 250))}h` : "0h"}
              </div>
              <div className="text-xs text-stone-500 mt-1">Estimated drafting</div>
            </div>
          </motion.div>

          {/* Bottom Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0"
          >
            {/* Activity */}
            <div className="bg-white/80 border border-[#E5E0D5] shadow-sm rounded-xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Recent Activity
              </h3>
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#965A5A] mt-1.5 shadow-[0_0_8px_rgba(150,90,90,0.4)] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {activity.details} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Plot + Nav */}
            <div className="flex flex-col gap-6">
              {/* Plot Coverage */}
              <div className="bg-white/80 border border-[#E5E0D5] shadow-sm rounded-xl p-6 flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      className="text-[#E5E0D5] stroke-current"
                      strokeWidth="8"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-[#965A5A] stroke-current"
                      strokeWidth="8"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={
                        251.2 * (1 - plotProgressPct / 100)
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-xl font-bold text-stone-800">
                      {plotProgressPct}%
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Plot Coverage
                  </h3>
                  <p className="text-sm text-stone-600">
                    {plannedEventsCount > 0 
                      ? `${completedEventsCount} of ${plannedEventsCount} planned plot events reached.`
                      : "No plot events structured yet. Open Timeline to begin."}
                  </p>
                </div>
              </div>

              {/* Mini Bento Nav */}
              <div className="grid grid-cols-3 gap-3 flex-1 min-h-[100px]">
                <button
                  onClick={() =>
                    navigate(`/project/${(id || '1')}/workspace/bible`)
                  }
                  className="bg-white/60 hover:bg-white border border-[#E5E0D5] shadow-sm rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] group"
                >
                  <BookOpen className="w-5 h-5 text-stone-400 group-hover:text-[#965A5A] transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 transition-colors">
                    Lore
                  </span>
                </button>
                <button
                  onClick={() => navigate(`/project/${(id || '1')}/characters`)}
                  className="bg-white/60 hover:bg-white border border-[#E5E0D5] shadow-sm rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] group"
                >
                  <Users className="w-5 h-5 text-stone-400 group-hover:text-[#965A5A] transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 transition-colors">
                    Cast
                  </span>
                </button>
                <button
                  onClick={() =>
                    navigate(`/project/${(id || '1')}/workspace/locations`)
                  }
                  className="bg-white/60 hover:bg-white border border-[#E5E0D5] shadow-sm rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] group"
                >
                  <Map className="w-5 h-5 text-stone-400 group-hover:text-[#965A5A] transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 transition-colors">
                    Map
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectId={id || "1"}
      />
    </div>
  );
}
