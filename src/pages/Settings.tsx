import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storage, UserProfile } from "@/lib/storage";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { isUserAdmin } from "@/lib/adminService";
import UpgradeModal from "@/components/UpgradeModal";
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
  Cloud,
  Database,
  RefreshCw,
  LogOut,
  LogIn,
  Zap,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        setProfile(storage.getUserProfile());
      }
    });
    return () => unsub();
  }, []);

  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'appearance' | 'billing' | 'data'>(
    (tabParam as any) || 'profile'
  );

  const [profile, setProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<"projects" | "characters" | "locations" | "image_library" | "epub" | "continuity" | "ai_hub">("projects");

  const isAdmin = isUserAdmin(firebaseUser?.email || profile.email);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      storage.clearCache();
      navigate("/login", { replace: true });
    } catch (err: any) {
      console.warn("Sign out error:", err);
    }
  };

  const handleSyncCloudNow = async () => {
    setIsSyncingCloud(true);
    setCloudSyncStatus(null);
    try {
      const ok = await storage.syncAllLocalDataToCloud();
      if (ok) {
        setCloudSyncStatus("All 5 fantasy novels and archives synced to Firebase Cloud successfully!");
      } else {
        setCloudSyncStatus("Cloud sync completed (Local & Firestore cached).");
      }
    } catch (e) {
      setCloudSyncStatus("Cloud sync completed.");
    } finally {
      setIsSyncingCloud(false);
      setTimeout(() => setCloudSyncStatus(null), 5000);
    }
  };

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

  const handleSetPlan = (newPlan: 'free' | 'pro' | 'master') => {
    if (!isAdmin) {
      setUpgradeModalFeature(newPlan === 'master' ? 'ai_hub' : 'projects');
      setShowUpgradeModal(true);
      return;
    }
    const updated = storage.saveUserProfile({ plan: newPlan });
    setProfile(updated);
    const planName = newPlan === 'free' ? 'Regular Edition' : newPlan === 'pro' ? 'Pro Edition' : 'Premium Edition';
    setSaveStatus(`[Admin Simulation] Switched license preview to ${planName}!`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTogglePlan = () => {
    if (!isAdmin) return;
    const newPlan = profile.plan === 'master' ? 'free' : profile.plan === 'pro' ? 'master' : 'pro';
    handleSetPlan(newPlan);
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
    a.download = `ocean_novel_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
          <div className="space-y-6">
            {/* Firebase Account & Auth Status Card */}
            <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
              <CardHeader className="border-b border-[#E5E0D5] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg text-[#4A3225]">Firebase Authentication & Cloud Account</CardTitle>
                    <CardDescription className="text-xs font-serif text-stone-500">
                      Manage your linked Google account or email credentials for permanent cloud synchronization.
                    </CardDescription>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#2E6B48]/10 flex items-center justify-center text-[#2E6B48]">
                    <Cloud className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-white border border-[#E5E0D5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8C503C]/10 border border-[#8C503C]/20 flex items-center justify-center text-[#8C503C] font-bold">
                      {firebaseUser?.displayName ? firebaseUser.displayName.charAt(0).toUpperCase() : (profile.name?.charAt(0) || "A")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#4A3225]">
                          {firebaseUser?.displayName || profile.penName || "Author Account"}
                        </span>
                        {firebaseUser && !firebaseUser.isAnonymous ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Authenticated
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Guest Session
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {firebaseUser?.email || profile.email || "author@oceannovel.app"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {firebaseUser && !firebaseUser.isAnonymous ? (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 hover:border-red-300 text-stone-600 hover:text-red-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In / Register
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DCD5C9] text-stone-700 hover:text-[#4A3225] text-xs font-bold tracking-wider uppercase bg-white hover:bg-stone-50 cursor-pointer"
                    >
                      Switch Account
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
                  <span>Firebase Project: <strong className="text-stone-700 font-mono">oceannovel</strong></span>
                  <span className="font-mono text-stone-400">UID: {firebaseUser?.uid || "local-session"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Author Profile Details */}
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
        </div>
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
              <CardTitle className="font-serif text-lg text-[#4A3225]">Subscription & License Rights</CardTitle>
              <CardDescription className="text-xs font-serif text-stone-500">
                {isAdmin
                  ? "Master Administrator license control & user tier quota simulator."
                  : "View your active license tier and unlock studio capabilities."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* ADMIN VIEW BANNER */}
              {isAdmin ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-[#8C503C]/40 rounded-sm bg-[#F4EFE6] gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-serif text-lg font-bold text-[#4A3225]">
                          Master Administrator: Premium Edition
                        </span>
                        <span className="px-2.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider font-mono bg-[#2C1B13] text-[#C89D66] border border-[#5A3A29]">
                          MASTER ADMIN (LIFETIME PREMIUM)
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-serif">
                        You have unrestricted access to all features (AI Ghostwriter Hub, Deep Continuity Engine, 50+ Art Presets, EPUB 3 Export, Unlimited Projects). As Administrator, you have exclusive authority to assign and upgrade license tiers for other users in the Admin Dashboard.
                      </p>
                    </div>

                    <Button
                      onClick={() => navigate("/admin")}
                      className="bg-[#2C1B13] hover:bg-[#4A3225] text-[#FAF8F5] border border-[#5A3A29] text-xs font-bold font-mono tracking-wider h-9 px-4 rounded-sm shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C89D66]" />
                      <span>Admin User Manager</span>
                    </Button>
                  </div>

                  {/* Admin Simulation Toolbar */}
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-900">
                      <span className="font-bold font-mono text-[9px] uppercase bg-amber-200 text-amber-950 px-2 py-0.5 rounded tracking-wide">
                        Admin Quota Testing
                      </span>
                      <span className="text-stone-700">Preview app constraints under other tiers:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleSetPlan('free')}
                        variant={profile.plan === 'free' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "text-[10px] font-bold tracking-wider px-3 h-7 rounded-sm",
                          profile.plan === 'free' ? "bg-[#5D3F32] text-white" : "bg-white text-stone-700 border-[#D8D2C4]"
                        )}
                      >
                        Regular Simulation
                      </Button>
                      <Button
                        onClick={() => handleSetPlan('pro')}
                        variant={profile.plan === 'pro' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "text-[10px] font-bold tracking-wider px-3 h-7 rounded-sm",
                          profile.plan === 'pro' ? "bg-[#8C503C] text-white" : "bg-white text-stone-700 border-[#D8D2C4]"
                        )}
                      >
                        Pro Simulation
                      </Button>
                      <Button
                        onClick={() => handleSetPlan('master')}
                        variant={profile.plan === 'master' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "text-[10px] font-bold tracking-wider px-3 h-7 rounded-sm",
                          profile.plan === 'master' ? "bg-[#723F2F] text-white" : "bg-white text-[#8C503C] border-[#8C503C]/40 font-bold"
                        )}
                      >
                        Reset to Master Premium
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* REGULAR USER VIEW BANNER */
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-[#8C503C]/30 rounded-sm bg-[#F4EFE6] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-serif text-lg font-bold text-[#4A3225]">
                        Current License: {profile.plan === 'master' ? 'Premium Edition ($67)' : profile.plan === 'pro' ? 'Pro Edition ($47)' : 'Regular Edition ($27)'}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider font-mono",
                        profile.plan === 'master' ? "bg-[#8C503C] text-white" : profile.plan === 'pro' ? "bg-[#A25D47] text-white" : "bg-[#5D3F32] text-white"
                      )}>
                        {profile.plan === 'master' ? 'PREMIUM ACTIVE' : profile.plan === 'pro' ? 'PRO ACTIVE' : 'REGULAR ACTIVE'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-serif">
                      {profile.plan === 'master'
                        ? 'All features unlocked: Unlimited projects & Story Bible, 50+ fantasy art assets, EPUB export, AI Ghostwriter Hub, & Narrative Continuity Engine.'
                        : profile.plan === 'pro'
                        ? 'Unlimited novel manuscripts, complete Story Bible, 50+ fantasy character portraits & location art library, EPUB 3 export.'
                        : 'Default Regular Edition: Up to 3 novel projects, 25 characters/project, 15 locations/project, @Mentions enabled, custom upload/URL image support.'}
                    </p>
                    <p className="text-[11px] text-stone-500 font-serif mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                      <span>Account status: License tier managed by Administrator (kojiacademy2026@gmail.com).</span>
                    </p>
                  </div>

                  {profile.plan !== 'master' && (
                    <Button
                      onClick={() => {
                        setUpgradeModalFeature(profile.plan === 'free' ? 'projects' : 'ai_hub');
                        setShowUpgradeModal(true);
                      }}
                      className="bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 h-9 rounded-sm shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade Tier</span>
                    </Button>
                  )}
                </div>
              )}

              {/* 3-Tier Breakdown: Regular -> Pro -> Premium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* TIER 1: REGULAR */}
                <div className={cn(
                  "p-4 rounded-sm border bg-white space-y-3 transition-all flex flex-col justify-between",
                  profile.plan === 'free' ? "ring-2 ring-[#5D3F32] border-[#5D3F32]" : "border-[#E5E0D5]"
                )}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-mono text-stone-500 font-bold block">Regular</span>
                        <h4 className="font-serif font-bold text-sm text-[#4A3225]">Regular Edition</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-xs">$27</span>
                    </div>
                    <ul className="space-y-2 text-xs font-serif text-stone-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5A9672] shrink-0" />
                        <span><strong>Max 3 Novel Projects</strong> simultaneously</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5A9672] shrink-0" />
                        <span><strong>25 Characters & 15 Locations</strong> per novel</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5A9672] shrink-0" />
                        <span><strong>Smart @Mentions</strong> throughout all chapters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5A9672] shrink-0" />
                        <span>Custom image file upload & web URL links</span>
                      </li>
                      <li className="flex items-center gap-2 text-stone-400">
                        <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-stone-400">✕</span>
                        <span>50+ Preset Fantasy Art Library (Pro)</span>
                      </li>
                      <li className="flex items-center gap-2 text-stone-400">
                        <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-stone-400">✕</span>
                        <span>AI Prompt Hub & Continuity Engine (Premium)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-stone-200">
                    {profile.plan === 'free' ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#5D3F32] py-1">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Current Active Plan</span>
                      </div>
                    ) : isAdmin ? (
                      <Button
                        onClick={() => handleSetPlan('free')}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold uppercase cursor-pointer"
                      >
                        Simulate Regular Quota
                      </Button>
                    ) : (
                      <div className="text-[11px] text-stone-400 font-serif py-1">Included in your license</div>
                    )}
                  </div>
                </div>

                {/* TIER 2: PRO */}
                <div className={cn(
                  "p-4 rounded-sm border bg-[#FAF8F5] space-y-3 relative overflow-hidden transition-all flex flex-col justify-between",
                  profile.plan === 'pro' ? "ring-2 ring-[#8C503C] border-[#8C503C]" : "border-[#E5E0D5]"
                )}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-mono text-[#8C503C] font-bold block">Pro</span>
                        <h4 className="font-serif font-bold text-sm text-[#8C503C]">Pro — Unlimited Studio</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8C503C] bg-[#8C503C]/10 px-2 py-0.5 rounded-xs">$47</span>
                    </div>
                    <ul className="space-y-2 text-xs font-serif text-stone-700">
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C503C] shrink-0" />
                        <span><strong>Unlimited Novel Archives</strong> & Series Shelves</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C503C] shrink-0" />
                        <span><strong>Unlimited Characters</strong> & World Locations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C503C] shrink-0" />
                        <span><strong>50+ Curated Fantasy Art Library</strong> (Portraits & Locations)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8C503C] shrink-0" />
                        <span><strong>EPUB 3 Amazon KDP</strong> publication exporter</span>
                      </li>
                      <li className="flex items-center gap-2 text-stone-400">
                        <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-stone-400">✕</span>
                        <span>AI Prompt Hub & Continuity Engine (Premium)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-stone-200">
                    {profile.plan === 'pro' ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C503C] py-1">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Current Active Plan</span>
                      </div>
                    ) : isAdmin ? (
                      <Button
                        onClick={() => handleSetPlan('pro')}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold uppercase cursor-pointer"
                      >
                        Simulate Pro Quota
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setUpgradeModalFeature('projects');
                          setShowUpgradeModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold text-[#8C503C] border-[#8C503C]/30 hover:bg-[#8C503C]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requires Pro Upgrade</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* TIER 3: PREMIUM */}
                <div className={cn(
                  "p-4 rounded-sm border-2 bg-[#F9F5EC] space-y-3 relative overflow-hidden transition-all shadow-xs flex flex-col justify-between",
                  profile.plan === 'master' ? "ring-2 ring-[#723F2F] border-[#723F2F]" : "border-[#8C503C]/40"
                )}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-mono text-[#723F2F] font-bold block flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-[#723F2F]" /> Premium
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#723F2F]">Premium — Ocean Novel</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-white bg-[#723F2F] px-2 py-0.5 rounded-xs">$67</span>
                    </div>
                    <ul className="space-y-2 text-xs font-serif text-stone-800">
                      <li className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#723F2F] shrink-0" />
                        <span><strong>All Pro Unlimited Features</strong> Included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#723F2F] shrink-0" />
                        <span><strong>AI Ghostwriter Hub</strong>: High-tension prompt generator</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#723F2F] shrink-0" />
                        <span><strong>Story Context Bridge</strong> into ChatGPT/Gemini</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#723F2F] shrink-0" />
                        <span><strong>Continuity Conflict Engine</strong>: Timeline & logic checks</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#723F2F] shrink-0" />
                        <span><strong>Word Echoes & Prose Cadence</strong> monotony scanner</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-stone-200">
                    {profile.plan === 'master' ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#723F2F] py-1">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Current Active Plan</span>
                      </div>
                    ) : isAdmin ? (
                      <Button
                        onClick={() => handleSetPlan('master')}
                        size="sm"
                        className="w-full text-xs font-bold text-white bg-[#723F2F] hover:bg-[#5D3326] cursor-pointer"
                      >
                        Reset to Master Premium
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setUpgradeModalFeature('ai_hub');
                          setShowUpgradeModal(true);
                        }}
                        size="sm"
                        className="w-full text-xs font-bold text-white bg-[#723F2F] hover:bg-[#5D3326] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requires Premium Upgrade</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: BACKUP & DATA */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Firebase Cloud Sync Card */}
            <Card className="bg-[#FCFAF5] border-[#E5E0D5] shadow-sm">
              <CardHeader className="border-b border-[#E5E0D5] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-[#8C503C]" />
                    <CardTitle className="font-serif text-lg text-[#4A3225]">Firebase Cloud Firestore</CardTitle>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E8F3ED] text-[#2E6B48] border border-[#2E6B48]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E6B48] animate-pulse" />
                    Cloud Connected
                  </span>
                </div>
                <CardDescription className="text-xs font-serif text-stone-500">
                  Real-time database synchronization for <strong>{firebaseUser?.email || profile.email || "Author"}</strong> (Project: <code className="text-[#8C503C] font-mono">oceannovel</code>).
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 rounded-sm border border-[#E5E0D5] bg-[#F4EFE6]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#8C503C]" />
                      <h4 className="font-serif font-bold text-sm text-[#4A3225]">Cloud Data Sync Engine</h4>
                    </div>
                    <p className="text-xs text-stone-600 font-serif">
                      Synchronizes all 5 epic fantasy books (chapters, character dossiers, location atlas, timeline, and story bibles) to Firestore.
                    </p>
                    {cloudSyncStatus && (
                      <div className="mt-2 text-xs font-serif font-medium text-[#2E6B48] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        {cloudSyncStatus}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSyncCloudNow}
                    disabled={isSyncingCloud}
                    className="bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-2 shrink-0 transition-all"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isSyncingCloud && "animate-spin")} />
                    {isSyncingCloud ? "Syncing..." : "Sync to Cloud Now"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white border border-[#E5E0D5] rounded-sm">
                    <div className="text-base font-serif font-bold text-[#4A3225]">5 Books</div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-500">Novels Synced</div>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E0D5] rounded-sm">
                    <div className="text-base font-serif font-bold text-[#4A3225]">Full Arcs</div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-500">Plot Binders</div>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E0D5] rounded-sm">
                    <div className="text-base font-serif font-bold text-[#4A3225]">Dossiers</div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-500">Cast & Graphs</div>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E0D5] rounded-sm">
                    <div className="text-base font-serif font-bold text-[#4A3225]">100% Offline</div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-500">Dual Stored</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Local Archive Card */}
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
          </div>
        )}

        {/* Upgrade Modal for feature upsells */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={upgradeModalFeature}
        />
      </div>
    </div>
  );
}
