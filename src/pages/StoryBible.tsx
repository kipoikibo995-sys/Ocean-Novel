import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage, StoryBibleData } from "@/lib/storage";
import { MOCK_PROJECT } from "@/mockData";
import { Check, BookOpen, ArrowLeft } from "lucide-react";

export default function StoryBible() {
  const { id = "1" } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Initialize data from storage or default
  const [form, setForm] = useState<StoryBibleData>(() => {
    const project = storage.getProjects().find((p) => p.id === id);
    const data = storage.getProjectData(id);
    const bible = data?.storyBible;

    return {
      title: bible?.title ?? (project?.title || MOCK_PROJECT.title),
      genre: bible?.genre ?? (project?.genre || MOCK_PROJECT.genre),
      subgenre: bible?.subgenre ?? "Mystery / Suspense",
      targetAudience: bible?.targetAudience ?? (project?.audience || "Adult"),
      pov: bible?.pov ?? "First Person",
      tone: bible?.tone ?? "Dark, Suspenseful",
      premise: bible?.premise ?? (project?.logline || MOCK_PROJECT.premise),
      mainConflict: bible?.mainConflict ?? "Sarah must uncover the truth about her sister's disappearance while navigating the hostility of her estranged family and a town that wants its secrets buried.",
      storyGoal: bible?.storyGoal ?? "Discover what happened to Emily Cole.",
      themes: bible?.themes ?? "Grief, memory, isolation, family secrets.",
      timePeriod: bible?.timePeriod ?? "Present Day",
      primarySetting: bible?.primarySetting ?? "Greyhaven (Fictional coastal town, Maine)",
      worldDescription: bible?.worldDescription ?? "An isolated, fading fishing town characterized by dense fog, jagged cliffs, and a close-knit, secretive community.",
      importantRules: bible?.importantRules ?? "The town operates on its own unspoken social rules; outsiders are not trusted. The local police force is small and often turns a blind eye to influential families.",
      narrativeStyle: bible?.narrativeStyle ?? "Introspective, slightly unreliable narrator. Focus on sensory details related to cold, dampness, and isolation.",
      dialogueStyle: bible?.dialogueStyle ?? "Clipped, evasive. Characters rarely say exactly what they mean.",
      pacing: bible?.pacing ?? "Slow burn building to a fast-paced climax.",
      aiInstructions: bible?.aiInstructions ?? "When assisting with writing, favor shorter, punchier sentences during suspenseful moments. Avoid melodrama. Emphasize the harsh environment.",
    };
  });

  const handleChange = (field: keyof StoryBibleData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save to ProjectData
    storage.saveProjectData(id, {
      storyBible: form,
    });

    // Also update title & genre in ProjectMeta if changed
    const projects = storage.getProjects();
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      if (form.title && form.title !== proj.title) {
        proj.title = form.title;
      }
      if (form.genre && form.genre !== proj.genre) {
        proj.genre = form.genre;
      }
      if (form.premise && form.premise !== proj.logline) {
        proj.logline = form.premise;
      }
      storage.saveProject(proj);
    }

    setSaveStatus("Story Bible updated successfully!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F1EA] p-4 lg:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D5] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C503C] bg-[#E5E0D5]/50 px-2 py-0.5 rounded-sm">
                World Canon
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#4A3225]">Story Bible</h1>
            <p className="text-xs lg:text-sm text-stone-500 font-serif mt-0.5">The foundation, characters, atmosphere, and rules of your universe.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave}
              className="bg-[#8C503C] hover:bg-[#723F2F] text-white font-bold tracking-widest uppercase text-xs rounded-sm px-5 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Save feedback banner */}
        {saveStatus && (
          <div className="bg-[#5A9672] text-white px-4 py-2.5 rounded-sm text-xs font-serif shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        <Tabs className="w-full">
          <TabsList className="mb-6 bg-[#E5E0D5]/60 p-1 rounded-sm border border-[#E5E0D5]">
            <TabsTrigger 
              active={activeTab === "details"} 
              onClick={() => setActiveTab("details")}
              className="text-xs font-serif font-bold"
            >
              Book Details
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === "core"} 
              onClick={() => setActiveTab("core")}
              className="text-xs font-serif font-bold"
            >
              Story Core
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === "world"} 
              onClick={() => setActiveTab("world")}
              className="text-xs font-serif font-bold"
            >
              World & Rules
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === "style"} 
              onClick={() => setActiveTab("style")}
              className="text-xs font-serif font-bold"
            >
              Writing Style
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BOOK DETAILS */}
          <TabsContent active={activeTab === "details"} className="space-y-6 bg-[#FCFAF5] p-6 rounded-sm border border-[#E5E0D5] shadow-sm mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Book Title</Label>
                <Input 
                  value={form.title || ""} 
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Genre</Label>
                <Input 
                  value={form.genre || ""} 
                  onChange={(e) => handleChange("genre", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Subgenre</Label>
                <Input 
                  value={form.subgenre || ""} 
                  onChange={(e) => handleChange("subgenre", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Target Audience</Label>
                <Input 
                  value={form.targetAudience || ""} 
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Narrative POV</Label>
                <Input 
                  value={form.pov || ""} 
                  onChange={(e) => handleChange("pov", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Tone & Mood</Label>
                <Input 
                  value={form.tone || ""} 
                  onChange={(e) => handleChange("tone", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: STORY CORE */}
          <TabsContent active={activeTab === "core"} className="space-y-6 bg-[#FCFAF5] p-6 rounded-sm border border-[#E5E0D5] shadow-sm mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Premise / Logline</Label>
                <Textarea 
                  className="min-h-[100px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.premise || ""} 
                  onChange={(e) => handleChange("premise", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Main Conflict</Label>
                <Textarea 
                  className="min-h-[100px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.mainConflict || ""} 
                  onChange={(e) => handleChange("mainConflict", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Story Goal</Label>
                <Input 
                  value={form.storyGoal || ""} 
                  onChange={(e) => handleChange("storyGoal", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Key Themes</Label>
                <Input 
                  value={form.themes || ""} 
                  onChange={(e) => handleChange("themes", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: WORLD & RULES */}
          <TabsContent active={activeTab === "world"} className="space-y-6 bg-[#FCFAF5] p-6 rounded-sm border border-[#E5E0D5] shadow-sm mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Time Period</Label>
                  <Input 
                    value={form.timePeriod || ""} 
                    onChange={(e) => handleChange("timePeriod", e.target.value)}
                    className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Primary Setting</Label>
                  <Input 
                    value={form.primarySetting || ""} 
                    onChange={(e) => handleChange("primarySetting", e.target.value)}
                    className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">World Description</Label>
                <Textarea 
                  className="min-h-[100px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.worldDescription || ""} 
                  onChange={(e) => handleChange("worldDescription", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Important Lore & Rules</Label>
                <Textarea 
                  className="min-h-[80px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.importantRules || ""} 
                  onChange={(e) => handleChange("importantRules", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* TAB 4: WRITING STYLE */}
          <TabsContent active={activeTab === "style"} className="space-y-6 bg-[#FCFAF5] p-6 rounded-sm border border-[#E5E0D5] shadow-sm mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Narrative Style</Label>
                <Textarea 
                  className="min-h-[80px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.narrativeStyle || ""} 
                  onChange={(e) => handleChange("narrativeStyle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Dialogue Conventions</Label>
                <Textarea 
                  className="min-h-[80px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.dialogueStyle || ""} 
                  onChange={(e) => handleChange("dialogueStyle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Pacing Direction</Label>
                <Input 
                  value={form.pacing || ""} 
                  onChange={(e) => handleChange("pacing", e.target.value)}
                  className="rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Writing Tone & Rules</Label>
                <Textarea 
                  className="min-h-[100px] rounded-sm border-[#E5E0D5] bg-white font-serif focus-visible:ring-[#8C503C]" 
                  value={form.aiInstructions || ""} 
                  onChange={(e) => handleChange("aiInstructions", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
