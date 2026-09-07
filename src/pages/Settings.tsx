import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storage, UserProfile } from "@/lib/storage";
import {
  User,
  PenTool,
  Palette,
  CreditCard,
  Download,
  Upload,
  Check,
  ArrowLeft,
  ShieldCheck,
  Coffee,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
];

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'appearance' | 'billing' | 'data'>(
    (tabParam as any) || 'profile'
  );

  const [profile, setProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'profile' | 'preferences' | 'appearance' | 'billing' | 'data') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storage.saveUserProfile(profile);
    setSaveStatus("Profile successfully updated!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSavePreferences = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storage.saveUserProfile(profile);
    setSaveStatus("Writing preferences saved!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTogglePlan = () => {
    const newPlan = profile.plan === 'pro' ? 'free' : 'pro';
    const updated = storage.saveUserProfile({ plan: newPlan });
    setProfile(updated);
    setSaveStatus(`Switched plan to ${newPlan.toUpperCase()}!`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Export JSON Backup
  const handleExportData = () => {
    const projects = storage.getProjects();
    const fullBackup: Record<string, any> = {
      profile: storage.getUserProfile(),
      projects,
      projectData: {},
      exportedAt: new Date().toISOString(),
    };

    projects.forEach((p) => {
      fullBackup.projectData[p.id] = storage.getProjectData(p.id);
    });

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scribe_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F1EA] p-4 lg:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D5] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={() => {
                  if (projectId) {
                    navigate(`/project/${projectId}`);
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8C503C] hover:text-[#4A3225] transition-colors group"
                title={projectId ? "Back to Project Overview" : "Back to Archive Projects"}
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>{projectId ? "Project Overview" : "Archive Projects"}</span>
              </button>
              <span className="text-stone-300">/</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 bg-[#E5E0D5]/50 px-2 py-0.5 rounded-sm">
                Studio Preferences
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#4A3225]">
              Settings & Author Profile
            </h1>
            <p className="text-xs lg:text-sm text-stone-500 font-serif mt-0.5">
              Manage your pen name, typography standards, and workspace environment.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                if (projectId) {
                  navigate(`/project/${projectId}`);
                } else {
                  navigate("/dashboard");
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#f4efe6] hover:bg-[#e5e0d5] text-[#4a3225] border border-[#d8d2c4] rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-sm"
              title={projectId ? "Return to Project Overview" : "Return to Archive Projects"}
            >
              <ArrowLeft className="w-4 h-4 text-[#8c503c]" />
              <span>{projectId ? "Back to Project" : "Back to Archives"}</span>
            </button>
          </div>
        </div>

        {/* Global Save Notification Toast */}
        {saveStatus && (
          <div className="bg-[#5A9672] text-white px-4 py-2.5 rounded-sm text-xs font-serif shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-[#E5E0D5]/60 p-1 rounded-md border border-[#E5E0D5]">
          <button
            onClick={() => handleTabChange('profile')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeTab === 'profile'
                ? "bg-white text-[#4A3225] shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/40"
            )}
          >
            <User className="w-3.5 h-3.5" />
            Author Profile
          </button>
          <button
            onClick={() => handleTabChange('preferences')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeTab === 'preferences'
                ? "bg-white text-[#4A3225] shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/40"
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
            Writing Preferences
          </button>
          <button
            onClick={() => handleTabChange('appearance')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeTab === 'appearance'
                ? "bg-white text-[#4A3225] shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/40"
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </button>
          <button
            onClick={() => handleTabChange('billing')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeTab === 'billing'
                ? "bg-white text-[#4A3225] shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/40"
            )}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Plan & Billing
          </button>
          <button
            onClick={() => handleTabChange('data')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeTab === 'data'
                ? "bg-white text-[#4A3225] shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/40"
            )}
          >
            <Download className="w-3.5 h-3.5" />
            Backup & Data
          </button>
        </div>

        {/* TAB 1: AUTHOR PROFILE */}
        {activeTab === 'profile' && (
          <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
            <CardHeader className="border-b border-[#E5E0D5] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg text-[#4A3225]">Author Identity</CardTitle>
                  <CardDescription className="text-xs font-serif text-stone-500">
                    Your personal bio and pen name applied across manuscripts and exported case files.
                  </CardDescription>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#8C503C]/10 flex items-center justify-center text-[#8C503C]">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Avatar Selector */}
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Author Avatar
                </Label>
                <div className="flex items-center gap-4">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#8C503C] shadow-sm"
                  />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-stone-500">Choose from classic author portraits:</p>
                    <div className="flex items-center gap-2">
                      {AVATAR_OPTIONS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfile({ ...profile, avatarUrl: url })}
                          className={cn(
                            "w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-105",
                            profile.avatarUrl === url ? "border-[#8C503C] scale-110 shadow-md" : "border-stone-300 opacity-70"
                          )}
                        >
                          <img src={url} alt="option" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Real / Account Name
                  </Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-white border-[#E5E0D5] font-serif text-sm focus-visible:ring-[#8C503C]"
                    placeholder="e.g. Jane Smith"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Pen Name / Nom de Plume
                  </Label>
                  <Input
                    value={profile.penName}
                    onChange={(e) => setProfile({ ...profile, penName: e.target.value })}
                    className="bg-white border-[#E5E0D5] font-serif text-sm focus-visible:ring-[#8C503C]"
                    placeholder="e.g. J. S. Hawthorne"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-white border-[#E5E0D5] font-serif text-sm focus-visible:ring-[#8C503C]"
                  placeholder="author@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Author Biography / Notes
                </Label>
                <Textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="bg-white border-[#E5E0D5] font-serif text-sm focus-visible:ring-[#8C503C]"
                  placeholder="Brief synopsis of your writing style, awards, and literary interests..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-[#8C503C] hover:bg-[#723F2F] text-white font-bold tracking-widest uppercase text-xs rounded-sm px-6"
                >
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: WRITING PREFERENCES */}
        {activeTab === 'preferences' && (
          <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
            <CardHeader className="border-b border-[#E5E0D5] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg text-[#4A3225]">Studio Standards</CardTitle>
                  <CardDescription className="text-xs font-serif text-stone-500">
                    Default typography and narrative configurations applied to new documents.
                  </CardDescription>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#8C503C]/10 flex items-center justify-center text-[#8C503C]">
                  <PenTool className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Default Typography
                  </Label>
                  <select
                    value={profile.defaultFont}
                    onChange={(e) => setProfile({ ...profile, defaultFont: e.target.value })}
                    className="flex h-10 w-full rounded-sm border border-[#E5E0D5] bg-white px-3 py-2 text-sm font-serif focus:ring-1 focus:ring-[#8C503C] focus:outline-none"
                  >
                    <option>Merriweather (Serif)</option>
                    <option>Playfair Display (Serif)</option>
                    <option>Lora (Serif)</option>
                    <option>Inter (Sans-serif)</option>
                    <option>Courier Prime (Monospace)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Editor Font Size
                  </Label>
                  <select
                    value={profile.fontSize}
                    onChange={(e) => setProfile({ ...profile, fontSize: e.target.value })}
                    className="flex h-10 w-full rounded-sm border border-[#E5E0D5] bg-white px-3 py-2 text-sm font-serif focus:ring-1 focus:ring-[#8C503C] focus:outline-none"
                  >
                    <option>Small (16px)</option>
                    <option>Medium (18px)</option>
                    <option>Large (20px)</option>
                    <option>Extra Large (24px)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Default Point of View (POV)
                  </Label>
                  <Input
                    value={profile.defaultPov}
                    onChange={(e) => setProfile({ ...profile, defaultPov: e.target.value })}
                    className="bg-white border-[#E5E0D5] font-serif text-sm focus-visible:ring-[#8C503C]"
                    placeholder="e.g. Third Person Limited"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Default Atmosphere / Tone
                  </Label>
                  <Input
                    value={profile.defaultTone}
                    onChange={(e) => setProfile({ ...profile, defaultTone: e.target.value })}
                    className="bg-white border-[#E5E0D5] font-serif text-sm focus-visible:ring-[#8C503C]"
                    placeholder="e.g. Atmospheric Noir, Suspense"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F4EFE6] rounded-sm border border-[#E5E0D5] flex items-center gap-3">
                <Coffee className="w-5 h-5 text-[#8C503C] shrink-0" />
                <p className="text-xs text-[#4A3225] font-serif">
                  Writing Studio automatically saves after 1.5 seconds of pause, recording word counts and character mentions dynamically.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-[#8C503C] hover:bg-[#723F2F] text-white font-bold tracking-widest uppercase text-xs rounded-sm px-6"
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: APPEARANCE */}
        {activeTab === 'appearance' && (
          <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
            <CardHeader className="border-b border-[#E5E0D5] pb-4">
              <CardTitle className="font-serif text-lg text-[#4A3225]">Reading & Writing Environment</CardTitle>
              <CardDescription className="text-xs font-serif text-stone-500">
                Adjust contrast and color palette to protect your eyes during long drafting sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => {
                    const updated = storage.saveUserProfile({ theme: 'light' });
                    setProfile(updated);
                    setSaveStatus("Applied Warm Parchment theme.");
                  }}
                  className={cn(
                    "p-4 rounded-sm border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2",
                    profile.theme === 'light'
                      ? "border-[#8C503C] bg-[#F4F1EA] shadow-sm"
                      : "border-[#E5E0D5] bg-white opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[#E5E0D5] flex items-center justify-center text-[#4A3225] font-serif font-bold">
                    P
                  </div>
                  <span className="font-serif font-bold text-sm text-[#4A3225]">Warm Parchment</span>
                  <span className="text-[10px] text-stone-500">Classic antique novel aesthetic</span>
                </div>

                <div
                  onClick={() => {
                    const updated = storage.saveUserProfile({ theme: 'dark' });
                    setProfile(updated);
                    setSaveStatus("Applied Midnight Library theme.");
                  }}
                  className={cn(
                    "p-4 rounded-sm border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2",
                    profile.theme === 'dark'
                      ? "border-[#8C503C] bg-[#2A1A14] text-white shadow-sm"
                      : "border-[#E5E0D5] bg-[#3D261D] text-stone-300 opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[#4A3225] flex items-center justify-center text-[#E5E0D5] font-serif font-bold">
                    M
                  </div>
                  <span className="font-serif font-bold text-sm">Midnight Library</span>
                  <span className="text-[10px] opacity-70">Deep espresso dark canvas</span>
                </div>

                <div
                  onClick={() => {
                    const updated = storage.saveUserProfile({ theme: 'system' });
                    setProfile(updated);
                    setSaveStatus("Follow System preference enabled.");
                  }}
                  className={cn(
                    "p-4 rounded-sm border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2",
                    profile.theme === 'system'
                      ? "border-[#8C503C] bg-[#F4F1EA] shadow-sm"
                      : "border-[#E5E0D5] bg-white opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[#E5E0D5] flex items-center justify-center text-stone-600 font-serif font-bold">
                    S
                  </div>
                  <span className="font-serif font-bold text-sm text-stone-700">System Dynamic</span>
                  <span className="text-[10px] text-stone-500">Syncs with OS day/night mode</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: PLAN & BILLING */}
        {activeTab === 'billing' && (
          <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
            <CardHeader className="border-b border-[#E5E0D5] pb-4">
              <CardTitle className="font-serif text-lg text-[#4A3225]">Subscription & Cloud Vault</CardTitle>
              <CardDescription className="text-xs font-serif text-stone-500">
                Manage your account tier and unlimited manuscript storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-[#8C503C]/30 rounded-sm bg-[#F4EFE6] gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif text-lg font-bold text-[#4A3225]">
                      Current Plan: {profile.plan === 'pro' ? 'Pro Master Scribe' : 'Free Writer Tier'}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider",
                      profile.plan === 'pro' ? "bg-[#8C503C] text-white" : "bg-stone-300 text-stone-800"
                    )}>
                      {profile.plan === 'pro' ? 'Active' : 'Basic'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-serif">
                    {profile.plan === 'pro'
                      ? 'Unlimited manuscripts, complete Story Bible, character relationship matrix, and instant full exports.'
                      : 'Standard editor, up to 3 projects, and local browser persistence.'}
                  </p>
                </div>

                <Button
                  onClick={handleTogglePlan}
                  className={cn(
                    "font-bold uppercase tracking-widest text-xs px-5 py-2 rounded-sm transition-colors",
                    profile.plan === 'pro'
                      ? "bg-stone-200 hover:bg-stone-300 text-stone-800"
                      : "bg-[#8C503C] hover:bg-[#723F2F] text-white"
                  )}
                >
                  {profile.plan === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                </Button>
              </div>

              {/* Pro Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2 text-xs font-serif text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                  <span>Full local and cloud export to Markdown, Word, and JSON.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-serif text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                  <span>Smart @ mention tracking and World Radar frequency analytics.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-serif text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                  <span>Unlimited scenes, acts, and nested chapter binders.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-serif text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                  <span>Zero telemetry, private offline-first writing architecture.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: BACKUP & DATA */}
        {activeTab === 'data' && (
          <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
            <CardHeader className="border-b border-[#E5E0D5] pb-4">
              <CardTitle className="font-serif text-lg text-[#4A3225]">Data Vault & Portable Backups</CardTitle>
              <CardDescription className="text-xs font-serif text-stone-500">
                Export and protect your creative work in human-readable JSON formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 border border-[#E5E0D5] rounded-sm bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#4A3225]">Complete Archive Export</h4>
                  <p className="text-xs text-stone-500 font-serif mt-0.5">
                    Download a single backup file containing all books, chapters, characters, notes, and profile configs.
                  </p>
                </div>
                <Button
                  onClick={handleExportData}
                  className="bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download Backup (.json)
                </Button>
              </div>

              <div className="p-4 bg-[#F4EFE6] border border-[#E5E0D5] rounded-sm text-xs text-stone-600 font-serif leading-relaxed">
                <span className="font-bold text-[#4A3225]">Tip: </span>
                You can also export individual manuscripts as standard .TXT or .MD files directly inside the <strong>Writing Studio</strong> top toolbar.
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
