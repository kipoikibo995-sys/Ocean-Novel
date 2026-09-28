import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  BookOpen,
  Users,
  Heart,
  Eye,
  Check,
  Plus,
  Copy,
  Compass,
  Flame,
  Crown,
  Layers
} from "lucide-react";
import {
  CharacterPreset,
  CHARACTER_PRESETS,
  CHARACTER_CATEGORIES,
  CHARACTER_ROLES
} from "@/data/characterPresets";

interface CharacterPresetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: CharacterPreset, directSave?: boolean) => void;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
}

export default function CharacterPresetPickerModal({
  isOpen,
  onClose,
  onSelectPreset,
  title = "50 Premade Character Archetypes",
  subtitle = "Choose from 50 fully realized fantasy archetypes complete with backstory, personality, traits, and portraits.",
  actionLabel = "Use Character"
}: CharacterPresetPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [inspectingPreset, setInspectingPreset] = useState<CharacterPreset | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Filtered list
  const filteredPresets = useMemo(() => {
    return CHARACTER_PRESETS.filter((preset) => {
      // Category filter
      if (selectedCategory !== "All" && preset.category !== selectedCategory) {
        return false;
      }
      // Role filter
      if (selectedRole !== "All" && preset.role.toUpperCase() !== selectedRole.toUpperCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = preset.name.toLowerCase().includes(q);
        const matchesTitle = preset.title.toLowerCase().includes(q);
        const matchesArchetype = preset.archetype.toLowerCase().includes(q);
        const matchesRace = preset.race.toLowerCase().includes(q);
        const matchesMbti = preset.mbti.toLowerCase().includes(q);
        const matchesTraits = preset.traits.some((t) => t.toLowerCase().includes(q));
        const matchesTags = preset.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesLore = preset.backstory.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesTitle &&
          !matchesArchetype &&
          !matchesRace &&
          !matchesMbti &&
          !matchesTraits &&
          !matchesTags &&
          !matchesLore
        ) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedRole]);

  if (!isOpen) return null;

  const handleCopySheet = async (preset: CharacterPreset) => {
    const text = `# Character Dossier: ${preset.name} (${preset.title})
- Role: ${preset.role}
- Category: ${preset.category}
- Archetype: ${preset.archetype}
- MBTI: ${preset.mbti}
- Species / Race: ${preset.race}
- Age: ${preset.age} | Gender: ${preset.gender}
- Group: ${preset.group} | Status: ${preset.status}

## Personality Traits
${preset.traits.join(", ")}

## Core Goal & Motivation
${preset.goal}

## Internal & External Conflict
${preset.conflict}

## Formative Trauma
${preset.trauma}

## Backstory
${preset.backstory}

## Physical Appearance
${preset.physicalAppearance}

## Signature Ability & Gear
- Ability: ${preset.signatureAbility}
- Gear: ${preset.gear}
`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotification("Character dossier copied to clipboard!");
      setTimeout(() => setCopiedNotification(null), 2500);
    } catch {
      // fallback
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "PROTAGONIST":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-600/40";
      case "ANTAGONIST":
        return "bg-rose-950/80 text-rose-300 border-rose-600/40";
      case "RIVAL":
        return "bg-amber-950/80 text-amber-300 border-amber-600/40";
      case "MENTOR":
        return "bg-purple-950/80 text-purple-300 border-purple-600/40";
      case "ALLY":
        return "bg-cyan-950/80 text-cyan-300 border-cyan-600/40";
      default:
        return "bg-stone-800 text-stone-300 border-stone-600/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-[#2b1812] border border-[#8c503c]/60 rounded-md shadow-2xl overflow-hidden text-[#fcfaf5]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#5d3f32] bg-[#22120d]/90">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-1.5 rounded bg-[#b8785e]/20 text-[#d49a89] border border-[#b8785e]/30">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#fcfaf5] tracking-wide">
                {title}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#8c503c]/40 text-[#d49a89] border border-[#8c503c]/50">
                50 Ready Characters
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif italic text-[#d49a89]/80 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-[#3d261d]/80 hover:bg-[#5d3f32] text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-[#8c503c]/30"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[#5d3f32] bg-[#24140e]/95 space-y-3 shrink-0">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, archetype, race, trait, or keyword (e.g. elf, assassin, mentor)..."
                className="w-full bg-[#1b0e0a] border border-[#8c503c]/40 rounded px-9 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#b8785e] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results count indicator */}
            <div className="text-[11px] font-mono text-[#d49a89]/70 shrink-0 self-center">
              Showing <span className="font-bold text-[#fcfaf5]">{filteredPresets.length}</span> of 50 Archetypes
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#b8785e]" /> Class:
            </span>
            {CHARACTER_CATEGORIES.map((cat) => {
              const count = cat === "All" 
                ? CHARACTER_PRESETS.length 
                : CHARACTER_PRESETS.filter(p => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 transition-all border ${
                    isSelected
                      ? "bg-[#b8785e] text-white border-[#d49a89] shadow-sm"
                      : "bg-[#1f100a] text-stone-300 border-[#5d3f32]/60 hover:border-[#8c503c] hover:text-white"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 shrink-0 flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#b8785e]" /> Role:
            </span>
            {CHARACTER_ROLES.map((role) => {
              const count = role === "All"
                ? CHARACTER_PRESETS.length
                : CHARACTER_PRESETS.filter(p => p.role.toUpperCase() === role.toUpperCase()).length;
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider uppercase shrink-0 transition-all border ${
                    isSelected
                      ? "bg-[#8c503c] text-white border-[#d49a89]"
                      : "bg-[#180c07] text-stone-400 border-[#4a2e23] hover:border-[#8c503c]/60 hover:text-stone-200"
                  }`}
                >
                  {role} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Card Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#20100a] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#5d3f32] [&::-webkit-scrollbar-track]:bg-[#180c07]">
          {filteredPresets.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <Compass className="w-12 h-12 text-[#8c503c]/60 mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#fcfaf5]">No archetypes found</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-md">
                Try clearing your search query or switching categories to browse the other available characters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedRole("All");
                }}
                className="mt-4 px-4 py-1.5 rounded bg-[#b8785e] hover:bg-[#a66850] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="group relative flex flex-col bg-[#2b1812] border border-[#5d3f32] hover:border-[#b8785e] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
                >
                  {/* Portrait Header */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#180c07]">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b1812] via-transparent to-black/30" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border backdrop-blur-md shadow-sm ${getRoleBadgeColor(preset.role)}`}>
                        {preset.role}
                      </span>
                      <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 text-[#d49a89] border border-white/10 backdrop-blur-md">
                        {preset.mbti}
                      </span>
                    </div>

                    {/* Category Label at bottom of image */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 pointer-events-none">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#d49a89] drop-shadow-md">
                        {preset.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex flex-col p-4 space-y-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#fcfaf5] group-hover:text-[#d49a89] transition-colors leading-tight">
                        {preset.name}
                      </h3>
                      <p className="text-[11px] font-serif italic text-amber-200/80 tracking-wide mt-0.5">
                        {preset.title}
                      </p>
                      <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1.5 font-mono">
                        <span>{preset.race}</span>
                        <span>•</span>
                        <span>Age {preset.age}</span>
                      </div>
                    </div>

                    {/* Archetype Badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1e100a] border border-[#5d3f32]/60 text-[9.5px] font-bold text-[#d49a89] uppercase tracking-wider">
                      <BookOpen className="w-3 h-3 text-[#b8785e] shrink-0" />
                      <span className="truncate">{preset.archetype}</span>
                    </div>

                    {/* Traits Pills */}
                    <div className="flex flex-wrap gap-1">
                      {preset.traits.slice(0, 4).map((trait, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#3d261d]/80 text-stone-300 border border-[#5d3f32]/50 font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                      {preset.traits.length > 4 && (
                        <span className="text-[9px] px-1 text-stone-400 font-mono">
                          +{preset.traits.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Backstory Excerpt */}
                    <p className="text-[11px] font-serif text-stone-300/90 leading-relaxed line-clamp-3 italic pt-1 border-t border-[#4a2e23]">
                      "{preset.backstory}"
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-3 flex items-center gap-2 border-t border-[#4a2e23]">
                      <button
                        onClick={() => setInspectingPreset(preset)}
                        className="flex-1 py-1.5 px-2 rounded-xs bg-[#3d261d] hover:bg-[#5d3f32] text-[#fcfaf5] text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 border border-[#8c503c]/40"
                        title="View Full Character Sheet"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#d49a89]" /> Dossier
                      </button>

                      <button
                        onClick={() => {
                          onSelectPreset(preset, false);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xs bg-[#b8785e] hover:bg-[#a66850] text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm"
                        title="Load into Editor"
                      >
                        <Plus className="w-3.5 h-3.5" /> {actionLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-[#5d3f32] bg-[#22120d] flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-[#d49a89]">
              💡 Tip: Click "Dossier" to view full motivation, conflicts, trauma, abilities, and gear before importing.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-[#3d261d] hover:bg-[#5d3f32] text-stone-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Inspecting Full Dossier Sheet Modal */}
      {inspectingPreset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#fcfaf5] text-[#332218] rounded-sm shadow-2xl overflow-hidden border border-[#e5e0d5]">
            
            {/* Toast inside Inspect */}
            {copiedNotification && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#332218] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> {copiedNotification}
              </div>
            )}

            {/* Inspect Top Nav */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#e5e0d5] bg-[#f4efe6]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c503c] bg-[#ede8dc] px-2 py-0.5 rounded">
                  Character Dossier #{inspectingPreset.id.replace('char-preset-', '')}
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  • {inspectingPreset.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopySheet(inspectingPreset)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider border border-stone-300 transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Copy Full Markdown Dossier"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8c503c]" /> Copy Dossier
                </button>
                <button
                  onClick={() => setInspectingPreset(null)}
                  className="w-7 h-7 rounded text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Inspect Body Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-stone-300">
              
              {/* Header Profile Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-full sm:w-48 aspect-[3/4] shrink-0 rounded-sm overflow-hidden border border-[#e5e0d5] shadow-md bg-stone-100">
                  <img
                    src={inspectingPreset.imageUrl}
                    alt={inspectingPreset.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${getRoleBadgeColor(inspectingPreset.role)}`}>
                      {inspectingPreset.role}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ede8dc] text-[#5d3f32] px-2 py-0.5 rounded border border-[#e5e0d5]">
                      MBTI: {inspectingPreset.mbti}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ede8dc] text-[#5d3f32] px-2 py-0.5 rounded border border-[#e5e0d5]">
                      Status: {inspectingPreset.status}
                    </span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a3225]">
                    {inspectingPreset.name}
                  </h1>
                  <p className="font-serif text-lg italic text-[#b8785e]">
                    "{inspectingPreset.title}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#e5e0d5] text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">Species / Race</span>
                      <span className="font-bold text-[#4a3225]">{inspectingPreset.race}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">Age</span>
                      <span className="font-bold text-[#4a3225]">{inspectingPreset.age}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">Faction / Group</span>
                      <span className="font-bold text-[#4a3225]">{inspectingPreset.group}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Archetype & Traits */}
              <div className="p-4 rounded bg-[#f4efe6] border border-[#e5e0d5] space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#b8785e]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8c503c]">
                    Archetype: {inspectingPreset.archetype}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inspectingPreset.traits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white text-[#5d3f32] border border-[#e5e0d5] rounded-xs shadow-2xs"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Narrative Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded bg-white border border-[#e5e0d5] shadow-xs space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#b8785e] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Core Goal
                  </h4>
                  <p className="text-xs font-serif leading-relaxed text-[#4a3225]">
                    {inspectingPreset.goal}
                  </p>
                </div>

                <div className="p-4 rounded bg-white border border-[#e5e0d5] shadow-xs space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Conflict
                  </h4>
                  <p className="text-xs font-serif leading-relaxed text-[#4a3225]">
                    {inspectingPreset.conflict}
                  </p>
                </div>

                <div className="p-4 rounded bg-white border border-[#e5e0d5] shadow-xs space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-700 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> Inciting Trauma
                  </h4>
                  <p className="text-xs font-serif leading-relaxed text-[#4a3225]">
                    {inspectingPreset.trauma}
                  </p>
                </div>
              </div>

              {/* Backstory */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8c503c] border-b border-[#e5e0d5] pb-1">
                  Backstory & Origins
                </h4>
                <p className="font-serif text-sm leading-relaxed text-[#332218] bg-[#fcfaf5] p-4 rounded border border-[#e5e0d5]">
                  {inspectingPreset.backstory}
                </p>
              </div>

              {/* Physical Appearance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8c503c] border-b border-[#e5e0d5] pb-1">
                  Physical Appearance & Visual Signature
                </h4>
                <p className="font-serif text-xs leading-relaxed text-[#4a3225] bg-[#f4efe6] p-3 rounded border border-[#e5e0d5]">
                  {inspectingPreset.physicalAppearance}
                </p>
              </div>

              {/* Combat & Gear */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded bg-white border border-[#e5e0d5] shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8785e] block mb-1">
                    Signature Ability / Magic
                  </span>
                  <p className="text-xs font-serif font-semibold text-[#4a3225]">
                    {inspectingPreset.signatureAbility}
                  </p>
                </div>
                <div className="p-3.5 rounded bg-white border border-[#e5e0d5] shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8785e] block mb-1">
                    Iconic Relics & Gear
                  </span>
                  <p className="text-xs font-serif font-semibold text-[#4a3225]">
                    {inspectingPreset.gear}
                  </p>
                </div>
              </div>
            </div>

            {/* Inspect Footer Actions */}
            <div className="p-4 px-6 border-t border-[#e5e0d5] bg-[#f4efe6] flex items-center justify-between">
              <button
                onClick={() => setInspectingPreset(null)}
                className="px-4 py-2 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Back to List
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const preset = inspectingPreset;
                    setInspectingPreset(null);
                    onSelectPreset(preset, false);
                    onClose();
                  }}
                  className="px-6 py-2 rounded bg-[#b8785e] hover:bg-[#a66850] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Load This Character
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
