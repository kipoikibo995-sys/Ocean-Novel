import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Feather,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Check,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();

  // Mode: "signin" | "signup"
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  // Monitor auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        storage.switchUser(user.uid, user.email, user.displayName);
        try {
          await storage.syncFromCloud(user.uid);
        } catch (e) {
          console.warn("Auto-sync on login mount:", e);
        }
        // If already logged in, navigate straight to dashboard
        navigate("/dashboard", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Post-login data sync and redirection to Archive Projects
  const handlePostAuthSync = async (user: any, customPenName?: string) => {
    const authorName = customPenName || user.displayName || user.email?.split("@")[0] || "Author";
    storage.switchUser(user.uid, user.email, authorName);
    
    // Sync cloud Firestore with user data
    try {
      await storage.syncFromCloud(user.uid);
      await storage.syncAllLocalDataToCloud(user.uid);
    } catch (e) {
      console.warn("Post-auth synchronization note:", e);
    }

    // Direct transition to the Archive Projects page
    navigate("/dashboard");
  };

  // Submit handler (Email/Password)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        // Create new account
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const nameToUse = penName.trim() || email.split("@")[0] || "Author";

        if (userCred.user) {
          try {
            await updateProfile(userCred.user, { displayName: nameToUse });
          } catch (err) {
            console.warn("Profile update note:", err);
          }
          setSuccessMsg("Account created successfully! Loading your archive projects...");
          await handlePostAuthSync(userCred.user, nameToUse);
        }
      } else {
        // Sign In with existing account
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (userCred.user) {
          setSuccessMsg("Welcome back! Loading your archive projects...");
          await handlePostAuthSync(userCred.user);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Authentication failed. Please check your credentials.";
      const code = err?.code;

      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        message = "Invalid email or password. Please check your spelling or create a new account.";
      } else if (code === "auth/email-already-in-use") {
        message = "This email address is already registered. Please switch to Sign In.";
      } else if (code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (code === "auth/too-many-requests") {
        message = "Access temporarily blocked due to multiple failed attempts. Please try again shortly.";
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In (Gmail) handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setSuccessMsg(`Signed in as ${result.user.email}. Loading your archive projects...`);
        await handlePostAuthSync(result.user);
      }
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setErrorMsg(err?.message || "Google authentication was interrupted. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Password reset handler
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      setResetStatus("Please enter a valid email address.");
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus("A password reset link has been dispatched to your email address!");
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetStatus(null);
      }, 3500);
    } catch (err: any) {
      setResetStatus(err?.message || "Unable to send reset email. Please verify your address.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F1EA] flex flex-col lg:flex-row overflow-x-hidden font-sans select-none">
      {/* ================= LEFT COLUMN: LITERARY ARCHIVE SHOWCASE ================= */}
      <div className="relative flex-1 bg-[#2C1810] text-[#F4EFE6] p-8 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[420px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-[#4A2E20]">
        {/* Background Atmosphere Layers */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-repeat mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C503C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8C503C] flex items-center justify-center text-[#F4F1EA] shadow-md border border-[#A6634E]/40">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF7F2] block leading-none">
                Ocean Novel
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4A373] mt-1 block">
                Novel Architecture & Writing Studio
              </span>
            </div>
          </div>
        </div>

        {/* Center Narrative Statement & Archive Showcase */}
        <div className="relative z-10 my-8 lg:my-0 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D2317] border border-[#5C3826] text-[11px] font-medium text-[#E5C39E]">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Dedicated Studio for Worldbuilders & Novelists</span>
          </div>

          <h1 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-bold text-[#FCFAF5] leading-[1.15] tracking-tight">
            Where epic sagas and grand worldbuilding come alive.
          </h1>

          <p className="font-serif text-sm lg:text-base text-[#D5C6B5] leading-relaxed">
            Organize complex multi-volume manuscripts with rich character dossiers, interactive location atlases, 
            3-act plot beat sheets, and a dedicated TipTap studio with automatic Firebase Cloud persistence.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-[#3A2217]/70 border border-[#523323] flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-[#E5C39E] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#FCFAF5]">Archive Projects</div>
                <div className="text-[11px] text-[#BCAAA4]">Master fantasy books & custom archives</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#3A2217]/70 border border-[#523323] flex items-start gap-3">
              <Compass className="w-4 h-4 text-[#E5C39E] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#FCFAF5]">Interactive Atlas</div>
                <div className="text-[11px] text-[#BCAAA4]">Pins, trade routes & geography</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#3A2217]/70 border border-[#523323] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#E5C39E] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#FCFAF5]">Consistency Engine</div>
                <div className="text-[11px] text-[#BCAAA4]">Scans typos & character continuity</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#3A2217]/70 border border-[#523323] flex items-start gap-3">
              <Layers className="w-4 h-4 text-[#E5C39E] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#FCFAF5]">Firebase Cloud Sync</div>
                <div className="text-[11px] text-[#BCAAA4]">0ms instant local + cloud persistence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Literary Quote */}
        <div className="relative z-10 pt-4 border-t border-[#4A2E20]/60 flex items-center justify-between text-xs text-[#A8988B] font-serif">
          <span>&ldquo;A novel is a world born from words.&rdquo;</span>
          <span className="text-[10px] tracking-widest uppercase text-[#8C503C] font-mono">v2.4 Canon</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: AUTHENTICATION FORM ================= */}
      <div className="w-full lg:w-[480px] xl:w-[540px] bg-[#FCFAF5] flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 shrink-0 shadow-2xl relative">
        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* Header Switcher */}
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3225] tracking-tight">
              {mode === "signin" ? "Sign in to your Studio" : "Create Author Account"}
            </h2>
            <p className="text-xs sm:text-sm font-serif text-stone-500">
              {mode === "signin"
                ? "Enter your credentials or use Google to enter your Archive Projects."
                : "Create an author profile with cloud-synced manuscripts and story bibles."}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="p-1 bg-[#EFE9DF] rounded-lg flex items-center border border-[#E5E0D5]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all relative cursor-pointer",
                mode === "signin"
                  ? "bg-white text-[#4A3225] shadow-sm"
                  : "text-stone-500 hover:text-[#4A3225]"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all relative cursor-pointer",
                mode === "signup"
                  ? "bg-white text-[#4A3225] shadow-sm"
                  : "text-stone-500 hover:text-[#4A3225]"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 bg-[#FDF2F2] border border-[#F8B4B4] rounded-md flex items-start gap-2.5 text-xs text-[#9B1C1C]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E02424]" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 bg-[#EDF7EE] border border-[#B3E2B8] rounded-md flex items-start gap-2.5 text-xs text-[#1E562F]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
                <span className="flex-1 leading-relaxed">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign-In (Gmail) Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 px-4 bg-white hover:bg-[#F9F7F2] text-[#4A3225] border border-[#DCD5C9] hover:border-[#C4B9A7] rounded-md font-medium text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#8C503C]" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google (Gmail)"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5E0D5] w-full" />
            <span className="bg-[#FCFAF5] px-3 text-[11px] font-serif text-stone-400 uppercase tracking-wider relative">
              or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Author Pen Name (Only shown on Sign Up) */}
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A3225]">
                  Author Pen Name / Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brandon Sanderson or J.R.R. Tolkien"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-md text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans"
                  />
                </div>
              </motion.div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A3225]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-md text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A3225]">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-[11px] font-serif text-[#8C503C] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-md text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DCD5C9] text-[#8C503C] focus:ring-[#8C503C] w-3.5 h-3.5 accent-[#8C503C]"
                />
                <span className="text-xs font-serif text-stone-600">Remember on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 bg-[#8C503C] hover:bg-[#723F2F] text-white rounded-md font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{mode === "signin" ? "Entering Studio..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Enter Archive Projects" : "Create Author Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Protected Access Info */}
          <div className="pt-2 text-center border-t border-[#E5E0D5]">
            <p className="text-[11px] font-serif text-stone-500">
              Authentication required to access and edit protected novel manuscripts & story bibles.
            </p>
          </div>

        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#FCFAF5] border border-[#E5E0D5] rounded-xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#8C503C]" />
                  <h3 className="font-serif font-bold text-base text-[#4A3225]">
                    Reset Author Password
                  </h3>
                </div>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-serif text-stone-600">
                Enter your account email below. We will send a secure password reset link to your inbox.
              </p>

              <form onSubmit={handleSendPasswordReset} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] rounded-md text-xs text-stone-800 outline-none"
                />

                {resetStatus && (
                  <p className="text-xs font-serif text-[#8C503C] font-medium">{resetStatus}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 border border-[#DCD5C9] text-stone-600 text-xs font-bold uppercase rounded-md hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 bg-[#8C503C] hover:bg-[#723F2F] text-white text-xs font-bold uppercase rounded-md cursor-pointer"
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
