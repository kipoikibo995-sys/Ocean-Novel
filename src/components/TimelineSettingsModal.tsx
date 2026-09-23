import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Clock, Type, RotateCcw, Check, Calendar, BookOpen } from "lucide-react";
import { storage, ProjectMeta, AuthorTimelineSettings } from "@/lib/storage";

interface TimelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: ProjectMeta[];
  totalWords: number;
  onUpdated: () => void;
}

export function TimelineSettingsModal({
  isOpen,
  onClose,
  savedProjects,
  totalWords,
  onUpdated,
}: TimelineSettingsModalProps) {
  const [settings, setSettings] = useState<AuthorTimelineSettings>(storage.getTimelineSettings());

  const autoStreak = storage.calculateTimelineStreak(savedProjects);
  // Realistic writing velocity: ~900 words per hour
  const autoHours = Math.floor(totalWords / 900);
  const autoMinutes = Math.round((totalWords % 900) / 15);

  const [streakMode, setStreakMode] = useState<'auto' | 'custom'>(settings.streakMode || 'auto');
  const [customStreakDays, setCustomStreakDays] = useState<number>(settings.customStreakDays || autoStreak);

  const [timeMode, setTimeMode] = useState<'auto' | 'custom'>(settings.timeMode || 'auto');
  const [customHours, setCustomHours] = useState<number>(settings.customHours || autoHours);
  const [customMinutes, setCustomMinutes] = useState<number>(settings.customMinutes || autoMinutes);

  useEffect(() => {
    if (isOpen) {
      const current = storage.getTimelineSettings();
      setSettings(current);
      setStreakMode(current.streakMode);
      setCustomStreakDays(current.customStreakDays || autoStreak);
      setTimeMode(current.timeMode);
      setCustomHours(current.customHours ?? autoHours);
      setCustomMinutes(current.customMinutes ?? autoMinutes);
    }
  }, [isOpen, autoStreak, autoHours, autoMinutes]);

  const handleSave = () => {
    storage.saveTimelineSettings({
      streakMode,
      customStreakDays: Math.max(1, Number(customStreakDays) || 1),
      timeMode,
      customHours: Math.max(0, Number(customHours) || 0),
      customMinutes: Math.min(59, Math.max(0, Number(customMinutes) || 0)),
    });
    onUpdated();
    onClose();
  };

  const handleResetToAuto = () => {
    setStreakMode('auto');
    setTimeMode('auto');
    setCustomStreakDays(autoStreak);
    setCustomHours(autoHours);
    setCustomMinutes(autoMinutes);
    storage.saveTimelineSettings({
      streakMode: 'auto',
      customStreakDays: autoStreak,
      timeMode: 'auto',
      customHours: autoHours,
      customMinutes: autoMinutes,
    });
    onUpdated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-lg bg-[#FCFAF5] rounded-xl shadow-2xl border border-[#E5E0D5] overflow-hidden text-stone-800"
        >
          {/* Top Dossier Ribbon */}
          <div className="bg-[#4A3225] text-[#F4F1EA] px-6 py-4 flex items-center justify-between border-b border-[#38261C]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base tracking-wide leading-tight text-amber-100">
                  Author Timeline & Stats Configuration
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-amber-200/70">
                  Configure Writing Milestones & Metrics
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
            {/* Live Preview Strip */}
            <div className="bg-[#F4EFE6] border border-[#E0D7C7] rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
                Live Preview // Displayed on Author Header
              </span>
              <div className="flex items-center gap-3 sm:gap-6 bg-white/70 px-4 py-2 rounded-lg border border-stone-300/60 shadow-xs w-full justify-around">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-stone-500">Streak</p>
                    <p className="text-xs font-bold text-stone-800">
                      {streakMode === 'custom' ? `${customStreakDays} Days` : `${autoStreak} Days`}
                    </p>
                  </div>
                </div>

                <div className="w-px h-5 bg-stone-300/60" />

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Type className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-stone-500">Total Words</p>
                    <p className="text-xs font-bold text-stone-800">{totalWords.toLocaleString()} W</p>
                  </div>
                </div>

                <div className="w-px h-5 bg-stone-300/60" />

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f4efe6] border border-[#e5e0d5] flex items-center justify-center text-[#8c503c]">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-stone-500">Writing Time</p>
                    <p className="text-xs font-bold text-[#4a3225]">
                      {timeMode === 'custom'
                        ? `${customHours}h ${customMinutes}m`
                        : `${autoHours}h ${autoMinutes}m`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STREAK SETTINGS */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4A3225] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  1. Writing Streak
                </label>
                <div className="flex items-center bg-[#EAE4D7] rounded-md p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setStreakMode('auto')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      streakMode === 'auto'
                        ? 'bg-white text-[#4A3225] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Auto (Calculated)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreakMode('custom')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      streakMode === 'custom'
                        ? 'bg-white text-[#4A3225] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Custom Value
                  </button>
                </div>
              </div>

              {streakMode === 'auto' ? (
                <div className="p-3 bg-stone-100/80 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                  <span>
                    Automatically computed from active writing history: <strong>{autoStreak} consecutive days</strong>.
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Active Timeline
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={customStreakDays}
                      onChange={(e) => setCustomStreakDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-800 focus:outline-none focus:border-amber-600"
                    />
                    <span className="text-xs font-semibold text-stone-600">Consecutive Days</span>
                  </div>
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-stone-500 uppercase mr-1">Quick Select:</span>
                    {[1, 2, 3, 5, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setCustomStreakDays(d)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          customStreakDays === d
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-extrabold'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WRITING TIME SETTINGS */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4A3225] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8c503c]" />
                  2. Total Writing Time
                </label>
                <div className="flex items-center bg-[#EAE4D7] rounded-md p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTimeMode('auto')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      timeMode === 'auto'
                        ? 'bg-white text-[#4A3225] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Auto (By Word Count)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('custom')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      timeMode === 'custom'
                        ? 'bg-white text-[#4A3225] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Custom Value
                  </button>
                </div>
              </div>

              {timeMode === 'auto' ? (
                <div className="p-3 bg-stone-100/80 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                  <span>
                    Estimated standard author velocity (~900 words/hour): <strong>{autoHours}h {autoMinutes}m</strong>.
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Velocity Standard
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={customHours}
                      onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-800 focus:outline-none focus:border-amber-600"
                    />
                    <span className="text-xs font-semibold text-stone-600">Hours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-20 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-800 focus:outline-none focus:border-amber-600"
                    />
                    <span className="text-xs font-semibold text-stone-600">Minutes</span>
                  </div>
                </div>
              )}
            </div>

            {/* PROJECTS WORD COUNT AUDIT */}
            <div className="border-t border-[#E5E0D5] pt-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#4A3225]" />
                Archived Manuscripts Overview ({savedProjects.length} projects)
              </span>
              <div className="max-h-28 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {savedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#F8F5EE] border border-stone-200/60"
                  >
                    <span className="font-serif font-medium text-stone-800 truncate max-w-[260px]">
                      {p.title}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#8c503c]">
                      {(p.currentWords || 0).toLocaleString()} words
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="bg-[#F4EFE6] px-6 py-3.5 border-t border-[#E5E0D5] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToAuto}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 py-1.5 px-2.5 rounded hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Auto
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-stone-600 hover:text-stone-800 px-4 py-2 rounded-lg border border-stone-300 hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="text-xs font-bold text-[#FCFAF5] bg-[#8c503c] hover:bg-[#a6624c] px-5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors border border-[#4a3225] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
