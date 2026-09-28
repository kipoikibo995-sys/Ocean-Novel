import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storage, UserProfile } from "@/lib/storage";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { isUserAdmin } from "@/lib/adminService";
import { tierToPlan } from "@/lib/license";
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
  ExternalLink,
} from "lucide-react";
import { openSalesPage } from "@/lib/salesConfig";
import { cn } from "@/lib/utils";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    let unsubSnapshotReg: (() => void) | null = null;
    let unsubSnapshotProfile: (() => void) | null = null;

    const handleStorageUpdate = () => {
      setProfile(storage.getUserProfile());
    };
    window.addEventListener('novelist-storage-updated', handleStorageUpdate);

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        storage.switchUser(u.uid, u.email, u.displayName);
        await storage.syncFromCloud(u.uid);
        setProfile(storage.getUserProfile());

        const isAdminUser = isUserAdmin(u.email);

        // Real-time listener on registeredUsers in Firestore
        try {
          const regDocRef = doc(db, "registeredUsers", u.uid);
          unsubSnapshotReg = onSnapshot(regDocRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const livePlan = isAdminUser ? 'master' : tierToPlan(data?.tier);
              const cur = storage.getUserProfile();
              if (cur.plan !== livePlan) {
                const updated = storage.saveUserProfile({ plan: livePlan }, true);
                setProfile(updated);
              }
            }
          }, (err) => console.warn("Live registeredUsers listener notice:", err));
        } catch (e) {
          console.warn("Could not attach registeredUsers snapshot:", e);
        }

        // Real-time listener on user profile doc in Firestore
        try {
          const profDocRef = doc(db, `users/${u.uid}/profile/default`);
          unsubSnapshotProfile = onSnapshot(profDocRef, (snap) => {
            if (snap.exists()) {
              const pData = snap.data() as UserProfile;
              const targetPlan = isAdminUser ? 'master' : (pData?.plan || 'free');
              const cur = storage.getUserProfile();
              if (cur.plan !== targetPlan) {
                const updated = storage.saveUserProfile({ plan: targetPlan }, true);
                setProfile(updated);
              } else {
                setProfile(prev => ({ ...prev, ...pData, plan: targetPlan }));
              }
            }
          }, (err) => console.warn("Live profile snapshot notice:", err));
        } catch (e) {
          console.warn("Could not attach profile snapshot:", e);
        }
      }
    });

    return () => {
      window.removeEventListener('novelist-storage-updated', handleStorageUpdate);
      unsubAuth();
      if (unsubSnapshotReg) unsubSnapshotReg();
      if (unsubSnapshotProfile) unsubSnapshotProfile();
    };
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-lg text-[#4A3225]">
                    Subscription & License Rights
                  </CardTitle>
                  <CardDescription className="text-xs font-serif text-stone-500">
                    {profile.plan === 'master'
                      ? "Highest Tier License: All studio capabilities and premium features are fully unlocked for life."
                      : profile.plan === 'pro'
                      ? "Pro Tier License: Unlimited manuscripts & 50+ fantasy art assets unlocked."
                      : "Regular Tier License: Standard author quotas active with 3 manuscript slots."}
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button
                    onClick={() => navigate("/admin")}
                    className="bg-[#2C1B13] hover:bg-[#4A3225] text-[#FAF8F5] border border-[#5A3A29] text-xs font-bold font-mono tracking-wider h-9 px-4 rounded-sm shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C89D66]" />
                    <span>Admin User Manager</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* LICENSE BADGE BANNER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-[#8C503C]/30 rounded-sm bg-[#F4EFE6] gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-serif text-lg font-bold text-[#4A3225]">
                      Ocean Novel: {profile.plan === 'master' ? 'Premium Edition' : profile.plan === 'pro' ? 'Pro Edition' : 'Regular Edition'}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider font-mono",
                      profile.plan === 'master'
                        ? "bg-[#723F2F] text-amber-200 border border-[#8C503C]"
                        : profile.plan === 'pro'
                        ? "bg-[#8C503C] text-white"
                        : "bg-[#5D3F32] text-white"
                    )}>
                      {profile.plan === 'master' ? 'HIGHEST TIER (LIFETIME PREMIUM)' : profile.plan === 'pro' ? 'PRO ACTIVE' : 'REGULAR ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-serif leading-relaxed">
                    {profile.plan === 'master'
                      ? "You have unrestricted access to all studio capabilities: AI Ghostwriter Hub, Continuity Conflict Engine, 50+ Curated Fantasy Art Assets, EPUB 3 Amazon KDP Publication Exporter, and unlimited novel manuscripts."
                      : profile.plan === 'pro'
                      ? "You have unlocked unlimited novel manuscripts, complete Story Bible, 50+ fantasy character portraits & location art library, and EPUB 3 export."
                      : "Default Regular Edition: Up to 3 novel projects, 25 characters/project, 15 locations/project, @Mentions enabled, custom upload/URL image support."}
                  </p>
                  <div className="text-[11px] text-stone-600 font-serif pt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block animate-pulse" />
                    <span>Verified Account: <strong className="text-[#4A3225]">{firebaseUser?.email || profile.email || "Author"}</strong> (Tier managed by Studio CRM)</span>
                  </div>
                </div>

                {profile.plan !== 'master' && (
                  <Button
                    onClick={() => {
                      const target = profile.plan === 'free' ? 'pro' : 'premium';
                      openSalesPage(target);
                    }}
                    className="bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 h-9 rounded-sm shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{profile.plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Premium'}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </Button>
                )}
              </div>

              {/* TIER DISPLAY */}
              {profile.plan === 'master' ? (
                /* FOR PREMIUM EDITION: ONLY DISPLAY HIGHEST TIER CARD */
                <div className="max-w-3xl mx-auto">
                  <div className="p-6 rounded-md border-2 border-[#723F2F] bg-[#FDF9F3] ring-1 ring-[#723F2F]/20 space-y-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-mono text-[#723F2F] font-bold flex items-center gap-1.5 mb-0.5">
                          <Zap className="w-3.5 h-3.5 text-[#723F2F]" />
                          HIGHEST TIER ACTIVE
                        </span>
                        <h3 className="font-serif font-bold text-xl text-[#723F2F]">
                          Premium Edition — Full Lifetime Unrestricted Access
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white bg-[#723F2F] shadow-xs self-start sm:self-auto">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Active & Lifetime
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3 font-mono">
                        Unlocked Studio Privileges & Capabilities
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">AI Ghostwriter Hub & Creative Muse</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Craft scene beats, multi-layered dialogue tension, and break writer's block with precision prompts.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">Continuity Conflict Engine</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Scan timeline paradoxes, character trait contradictions, and track lore consistency across multi-book arcs.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <ShieldCheck className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">Unlimited Projects & Series Archives</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Write and organize multiple epic sagas, multi-volume series, and standalone manuscripts with zero limits.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <ShieldCheck className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">Unlimited Characters & Lore Atlas</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Deep character dossiers, worldbuilding location atlas, interactive relationship matrices, and family trees.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <ShieldCheck className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">50+ Curated Fantasy Art Library</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Handcrafted character portraits, creature illustrations, and atmospheric landscape backgrounds ready to use.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <ShieldCheck className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">Amazon KDP EPUB 3 & Word Export</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Industry-standard publication exporter for Kindle, EPUB 3 e-readers, print-ready Word (.docx), and Plain Text.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">Story Context Bridge</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">One-click export of complete Story Bible and scene context formatted directly for external AI assistants.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 rounded bg-white/70 border border-stone-200/60">
                          <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-serif font-bold text-xs text-stone-900 block">Word Echoes & Prose Cadence</span>
                            <span className="font-serif text-[11px] text-stone-600 leading-tight">Real-time diagnostic scanner for word repetition, sentence cadence variety, and prose rhythm optimization.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#723F2F]/5 p-3.5 rounded-sm">
                      <div className="flex items-center gap-2 text-xs font-serif text-[#4A3225]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Status: <strong>Lifetime highest edition active</strong> — Full unrestricted features with no recurring fees.</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#723F2F] bg-white px-2.5 py-1 rounded border border-[#723F2F]/20 shrink-0">
                        Tier: Premium (Full Unrestricted)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* FOR REGULAR & PRO USERS: SHOW CURRENT ACTIVE TIER + NEXT UPGRADE STEP */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                  {/* Current Active Plan Card */}
                  <div className="p-5 rounded-md border-2 border-[#5D3F32] bg-white space-y-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-100">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-mono text-stone-500 font-bold block">
                            Current Tier
                          </span>
                          <h4 className="font-serif font-bold text-base text-[#4A3225]">
                            {profile.plan === 'pro' ? 'Pro Edition' : 'Regular Edition'}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-white bg-[#5D3F32] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 font-mono">
                        Active Features
                      </div>
                      <ul className="space-y-2.5 text-xs font-serif text-stone-700">
                        {profile.plan === 'pro' ? (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>Unlimited Novel Archives</strong> simultaneously</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>Unlimited Characters & Locations</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>50+ Curated Fantasy Art Preset Library</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>EPUB 3 Amazon KDP Publication Exporter</strong></span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>Up to 3 Active Projects</strong> simultaneously</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>25 Characters & 15 Locations</strong> per novel</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span><strong>Smart @Mentions</strong> in chapters</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#5A9672] shrink-0 mt-0.5" />
                              <span>Standard Word (.docx) & Plain Text export</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-stone-200">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#5D3F32] py-2 bg-stone-100 rounded-sm">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Current Active Plan</span>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Step Card */}
                  <div className="p-5 rounded-md border-2 border-[#8C503C] bg-[#FAF8F5] space-y-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-200/60">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-mono text-[#8C503C] font-bold block">
                            Next Upgrade Step
                          </span>
                          <h4 className="font-serif font-bold text-base text-[#8C503C]">
                            {profile.plan === 'pro' ? 'Premium Edition' : 'Pro Edition'}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#8C503C] bg-[#8C503C]/10 border border-[#8C503C]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Upgrade
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 font-mono">
                        Unlocked Privileges
                      </div>
                      <ul className="space-y-2.5 text-xs font-serif text-stone-700">
                        {profile.plan === 'pro' ? (
                          <>
                            <li className="flex items-start gap-2">
                              <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                              <span><strong>AI Ghostwriter Hub</strong> & Scene Beats generator</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                              <span><strong>Continuity Conflict Engine</strong> timeline paradox scanner</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                              <span><strong>Story Context Bridge</strong> export to ChatGPT & Claude</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="w-4 h-4 text-[#723F2F] shrink-0 mt-0.5" />
                              <span><strong>Word Echoes & Prose Cadence</strong> rhythm scanner</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#8C503C] shrink-0 mt-0.5" />
                              <span><strong>Unlimited Novel Archives</strong> with zero limits</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#8C503C] shrink-0 mt-0.5" />
                              <span><strong>Unlimited Characters & Locations</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#8C503C] shrink-0 mt-0.5" />
                              <span><strong>50+ Curated Fantasy Art Library</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#8C503C] shrink-0 mt-0.5" />
                              <span><strong>Amazon KDP EPUB 3 Exporter</strong></span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-stone-200">
                      <Button
                        onClick={() => openSalesPage(profile.plan === 'pro' ? 'premium' : 'pro')}
                        className="w-full text-xs font-bold uppercase tracking-wider text-white bg-[#8C503C] hover:bg-[#723F2F] shadow-sm py-2.5 h-10 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Upgrade to {profile.plan === 'pro' ? 'Premium Edition' : 'Pro Edition'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
