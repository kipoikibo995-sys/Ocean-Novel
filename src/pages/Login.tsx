import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  BookOpen,
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
import { adminService } from "@/lib/adminService";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();

  // Mode: "signin" | "signup"
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Security Math Captcha (For Register)
  const [captchaQuestion, setCaptchaQuestion] = useState(() => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 7) + 2;
    return { num1: n1, num2: n2, answer: n1 + n2 };
  });
  const [captchaInput, setCaptchaInput] = useState("");

  const refreshCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 7) + 2;
    setCaptchaQuestion({ num1: n1, num2: n2, answer: n1 + n2 });
    setCaptchaInput("");
  };

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
        navigate("/dashboard", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Post-login data sync and redirection
  const handlePostAuthSync = async (user: any, customPenName?: string) => {
    const authorName = customPenName || user.displayName || user.email?.split("@")[0] || "Author";
    storage.switchUser(user.uid, user.email, authorName);

    try {
      await adminService.trackUserActivity({
        uid: user.uid,
        email: user.email,
        displayName: authorName,
      });
      await storage.syncFromCloud(user.uid);
      await storage.syncAllLocalDataToCloud(user.uid);
    } catch (e) {
      console.warn("Post-auth synchronization note:", e);
    }

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

    if (mode === "signup") {
      if (!confirmPassword) {
        setErrorMsg("Please confirm your password.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please verify your password confirmation.");
        return;
      }
      const parsedCaptcha = parseInt(captchaInput.trim(), 10);
      if (isNaN(parsedCaptcha) || parsedCaptcha !== captchaQuestion.answer) {
        setErrorMsg("Incorrect math verification. Please solve the calculation to continue.");
        refreshCaptcha();
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const nameToUse = penName.trim() || email.split("@")[0] || "Author";

        if (userCred.user) {
          try {
            await updateProfile(userCred.user, { displayName: nameToUse });
          } catch (err) {
            console.warn("Profile update note:", err);
          }
          setSuccessMsg("Author profile created. Entering your Studio...");
          await handlePostAuthSync(userCred.user, nameToUse);
        }
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (userCred.user) {
          setSuccessMsg("Welcome back, Storyteller. Loading your archives...");
          await handlePostAuthSync(userCred.user);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Authentication failed. Please verify your credentials.";
      const code = err?.code;

      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        message = "Invalid email or password. Please check your spelling.";
      } else if (code === "auth/email-already-in-use") {
        message = "This email is already registered. Please sign in instead.";
      } else if (code === "auth/weak-password") {
        message = "Password must be at least 6 characters long.";
      } else if (code === "auth/too-many-requests") {
        message = "Too many attempts. Access temporarily paused for your security.";
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setSuccessMsg("Google verified. Synchronizing author archives...");
        await handlePostAuthSync(result.user);
      }
    } catch (err: any) {
      const isUserCancellation =
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        err?.code === "auth/popup-blocked";

      if (isUserCancellation) {
        console.info("[Auth] Google Sign-In popup was closed or cancelled by the user.");
      } else {
        console.error("Google Sign-In error:", err);
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
      setResetStatus("A password reset link has been dispatched to your inbox.");
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetStatus(null);
      }, 2500);
    } catch (err: any) {
      setResetStatus(err?.message || "Unable to send reset email. Please verify the address.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F5] font-sans selection:bg-[#8C503C] selection:text-white overflow-x-hidden">
      
      {/* ================= LEFT COLUMN: CLEAN EDITORIAL SHOWCASE ================= */}
      <div className="w-full lg:w-[46%] xl:w-[42%] bg-[#17100B] text-[#F4EFE6] p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2C1C13] min-h-[420px] lg:min-h-screen shrink-0">
        
        {/* Atmospheric ambient glows */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#8C503C]/12 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-[#C89D66]/8 rounded-full blur-[90px] pointer-events-none" />
        
        {/* 1. Header & Brand Identity */}
        <div className="relative z-10">
          <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF7F2] block leading-none">
            Ocean Novel
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C89D66] mt-1.5 block">
            Novel Architecture Studio
          </span>
        </div>

        {/* 2. Focused Editorial Narrative */}
        <div className="relative z-10 my-8 lg:my-0 space-y-6 max-w-md">
          <div className="space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl xl:text-[44px] font-bold text-[#FCFAF5] leading-[1.15] tracking-tight">
              Build characters.<br />Architect universes.
            </h1>

            <p className="font-serif text-sm sm:text-base text-[#C8B8A6] leading-relaxed">
              Design deep character arcs, plot dynamic relationship webs, and write with seamless cloud sync.
            </p>
          </div>

          {/* Clean typographic highlights without any icons */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-[#2A1B12]">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#C89D66] block">
                Characters
              </span>
              <p className="text-xs text-stone-400 mt-1 font-serif leading-snug">
                Flaws, desires & relationship webs
              </p>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#C89D66] block">
                Story Bible
              </span>
              <p className="text-xs text-stone-400 mt-1 font-serif leading-snug">
                Lore, factions & world rules
              </p>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#C89D66] block">
                Cloud Vault
              </span>
              <p className="text-xs text-stone-400 mt-1 font-serif leading-snug">
                Private, real-time synchronization
              </p>
            </div>
          </div>
        </div>

        {/* 3. Footer Editorial Quote */}
        <div className="relative z-10 pt-6 border-t border-[#2C1C13] flex items-center justify-between text-xs text-[#A69584] font-serif">
          <span>&ldquo;A novel is a world born from words.&rdquo;</span>
          <span className="font-mono text-[10px] text-[#C89D66] tracking-wider uppercase">
            Encrypted & Synced
          </span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: FLUID AUTHENTICATION PANE ================= */}
      <div className="flex-1 bg-[#FAF8F5] p-6 sm:p-10 lg:p-14 xl:p-20 flex flex-col justify-center items-center relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header & Mode Switcher with Smooth Sliding Indicator */}
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2A1B14] tracking-tight">
                {mode === "signin" ? "Welcome Back" : "Create Author Profile"}
              </h2>
              <p className="text-xs sm:text-sm font-serif text-stone-500 mt-1">
                {mode === "signin"
                  ? "Sign in to access your manuscript archives and story bible"
                  : "Begin crafting your characters and story universe today"}
              </p>
            </div>

            {/* Fluid Mode Switcher */}
            <div className="p-1 bg-[#ECE5D8] rounded-xl flex items-center border border-[#DFD6C7] relative">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold tracking-wider rounded-lg transition-colors duration-200 cursor-pointer text-center relative z-10",
                  mode === "signin" ? "text-[#2A1B14]" : "text-stone-500 hover:text-stone-800"
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
                  refreshCaptcha();
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold tracking-wider rounded-lg transition-colors duration-200 cursor-pointer text-center relative z-10",
                  mode === "signup" ? "text-[#2A1B14]" : "text-stone-500 hover:text-stone-800"
                )}
              >
                Register
              </button>

              {/* Smooth Animated Indicator */}
              <motion.div
                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-[#D8CEBE]"
                layoutId="authTabIndicator"
                initial={false}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                style={{
                  width: "calc(50% - 4px)",
                  left: mode === "signin" ? "4px" : "calc(50%)",
                }}
              />
            </div>
          </div>

          {/* Feedback Alerts with Smooth Motion */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-relaxed">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* One-Click Google Authentication */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 px-4 bg-white hover:bg-stone-50 text-stone-700 border border-[#DCD5C9] hover:border-[#BFAF9C] rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
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
            <span>{isGoogleLoading ? "Connecting to Author Cloud..." : "Continue with Google"}</span>
          </motion.button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EAE3D6] w-full" />
            <span className="bg-[#FAF8F5] px-3.5 text-[10px] font-mono text-stone-400 uppercase tracking-widest relative">
              or continue with email
            </span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Pen Name (Signup only) with smooth height animation */}
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Author Pen Name / Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={mode === "signup"}
                      placeholder="e.g. Brandon Sanderson"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-2 focus:ring-[#8C503C]/15 rounded-xl text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-2 focus:ring-[#8C503C]/15 rounded-xl text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs font-serif text-[#8C503C] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-2 focus:ring-[#8C503C]/15 rounded-xl text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required={mode === "signup"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-2 focus:ring-[#8C503C]/15 rounded-xl text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && confirmPassword && (
                    <p
                      className={cn(
                        "text-[11px] font-sans pl-1 transition-colors",
                        password === confirmPassword ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"
                      )}
                    >
                      {password === confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Math Captcha Verification (Signup only) */}
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Security Verification (Math Captcha)
                    </label>
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                      Human Check
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center gap-2 px-3.5 h-11 bg-[#F4EFE6] border border-[#DDD5C7] rounded-xl font-mono text-sm font-bold text-[#2A1B14] select-none shrink-0 shadow-2xs">
                      <span>{captchaQuestion.num1}</span>
                      <span className="text-[#8C503C]">+</span>
                      <span>{captchaQuestion.num2}</span>
                      <span className="text-stone-400">=</span>
                      <span className="text-[#8C503C]">?</span>
                    </div>

                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      title="Generate new calculation"
                      className="w-11 h-11 rounded-xl border border-[#DCD5C9] bg-white hover:bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        required={mode === "signup"}
                        placeholder="Result"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="w-full h-11 px-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-2 focus:ring-[#8C503C]/15 rounded-xl text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-mono shadow-2xs"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DCD5C9] text-[#8C503C] focus:ring-[#8C503C] w-4 h-4 accent-[#8C503C]"
                />
                <span className="text-xs font-serif text-stone-600">Keep author session active</span>
              </label>
            </div>

            {/* Submit CTA */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 bg-gradient-to-r from-[#8C503C] to-[#753D2C] hover:from-[#7C4432] hover:to-[#683324] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 mt-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Entering Studio...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Open Studio Archives" : "Create Author Profile"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Security & Cloud Badge */}
          <div className="text-center pt-3 border-t border-[#EAE3D6] flex items-center justify-center gap-2 text-stone-400">
            <BookOpen className="w-3.5 h-3.5 text-[#8C503C]" />
            <p className="text-[11px] font-serif">
              Private Author Vault • Real-Time Cloud Synchronization
            </p>
          </div>

        </div>
      </div>

      {/* PASSWORD RESET MODAL */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8C503C]/10 flex items-center justify-center text-[#8C503C]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2A1B14]">
                      Reset Password
                    </h3>
                    <p className="text-[10px] font-mono text-stone-500">
                      Author Vault Recovery
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer w-6 h-6 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-serif text-stone-600 leading-relaxed">
                Enter your registered email address and we will dispatch a secure link to reset your author credentials.
              </p>

              <form onSubmit={handleSendPasswordReset} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-xl text-xs text-stone-800 outline-none shadow-2xs"
                />

                {resetStatus && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] font-serif text-[#8C503C] bg-[#8C503C]/10 p-2 rounded-lg"
                  >
                    {resetStatus}
                  </motion.p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-1.5 border border-[#DCD5C9] text-stone-600 text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-1.5 bg-[#8C503C] hover:bg-[#753D2C] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg cursor-pointer disabled:opacity-60 shadow-xs"
                  >
                    {isResetting ? "Dispatching..." : "Send Reset Link"}
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
