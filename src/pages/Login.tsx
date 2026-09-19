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
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
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
        navigate("/dashboard", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Post-login data sync and redirection to Archive Projects
  const handlePostAuthSync = async (user: any, customPenName?: string) => {
    const authorName = customPenName || user.displayName || user.email?.split("@")[0] || "Author";
    storage.switchUser(user.uid, user.email, authorName);
    
    try {
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
          setSuccessMsg("Account created. Entering your Studio...");
          await handlePostAuthSync(userCred.user, nameToUse);
        }
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (userCred.user) {
          setSuccessMsg("Welcome back. Loading your archives...");
          await handlePostAuthSync(userCred.user);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Authentication failed. Please check your credentials.";
      const code = err?.code;

      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        message = "Invalid email or password. Please check your spelling.";
      } else if (code === "auth/email-already-in-use") {
        message = "This email is already registered. Please sign in instead.";
      } else if (code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (code === "auth/too-many-requests") {
        message = "Temporarily locked due to multiple attempts. Please try again shortly.";
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
        setSuccessMsg("Signed in with Google. Entering Studio...");
        await handlePostAuthSync(result.user);
      }
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setErrorMsg(err?.message || "Google authentication was interrupted.");
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
      setResetStatus("Password reset link dispatched to your inbox.");
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetStatus(null);
      }, 3000);
    } catch (err: any) {
      setResetStatus(err?.message || "Unable to send reset email. Please verify the address.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FCFAF6] font-sans selection:bg-[#8C503C] selection:text-white">
      
      {/* ================= LEFT COLUMN: EDITORIAL STUDIO SHOWCASE ================= */}
      <div className="w-full lg:w-[46%] xl:w-[42%] bg-[#1C110A] text-[#F4EFE6] p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#331E12] min-h-[380px] lg:min-h-screen shrink-0">
        
        {/* Subtle background atmosphere */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C503C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C89D66]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none text-white select-none">
          <Feather className="w-80 h-80" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8C503C] flex items-center justify-center text-[#FCFAF6] shadow-sm border border-[#A6634E]/30">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF7F2] block leading-none">
                Ocean Novel
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89D66] mt-1.5 block">
                Novel Architecture Studio
              </span>
            </div>
          </div>
        </div>

        {/* Editorial Headline & Statement */}
        <div className="relative z-10 my-10 lg:my-0 space-y-6 max-w-lg">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#2E1A10] border border-[#482819] text-[11px] font-semibold text-[#D4A373] tracking-wide">
            <span>Dedicated Workspace for Authors</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl font-bold text-[#FCFAF5] leading-[1.18] tracking-tight">
            Where epic sagas find their true form.
          </h1>

          <p className="font-serif text-sm sm:text-base text-[#C8B8A6] leading-relaxed">
            Architect intricate multi-volume manuscripts, track character networks, map fantasy worlds, and write distraction-free with seamless cloud synchronization.
          </p>
        </div>

        {/* Footer Editorial Quote */}
        <div className="relative z-10 pt-6 border-t border-[#331E12] flex items-center justify-between text-xs text-[#A69584] font-serif">
          <span>&ldquo;A novel is a world born from words.&rdquo;</span>
          <span className="font-mono text-[10px] text-[#C89D66] tracking-wider uppercase">Cloud Synced</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: EXPANSIVE AUTHENTICATION PANE ================= */}
      <div className="flex-1 bg-[#FCFAF6] p-8 sm:p-12 lg:p-16 xl:p-24 flex flex-col justify-center items-center relative overflow-y-auto">
        <div className="w-full max-w-md space-y-7">
          
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2A1B14] tracking-tight">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs sm:text-sm font-serif text-stone-500 mt-1">
                {mode === "signin"
                  ? "Sign in to access your manuscript archives"
                  : "Begin your author journey with Ocean Novel"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="p-1 bg-[#EFE9DE] rounded-lg flex items-center border border-[#E2DAD0] shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold tracking-wider rounded-md transition-all cursor-pointer",
                  mode === "signin"
                    ? "bg-white text-[#2A1B14] shadow-xs"
                    : "text-stone-500 hover:text-[#2A1B14]"
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
                  "px-3.5 py-1.5 text-xs font-bold tracking-wider rounded-md transition-all cursor-pointer",
                  mode === "signup"
                    ? "bg-white text-[#2A1B14] shadow-xs"
                    : "text-stone-500 hover:text-[#2A1B14]"
                )}
              >
                Register
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-relaxed">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* One-Click Google Authentication */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 px-4 bg-white hover:bg-stone-50 text-stone-700 border border-[#DCD5C9] hover:border-[#C5BBAA] rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
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
            <span>{isGoogleLoading ? "Connecting..." : "Continue with Google (Gmail)"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EAE3D6] w-full" />
            <span className="bg-[#FCFAF6] px-3.5 text-[10px] font-mono text-stone-400 uppercase tracking-widest relative">
              or continue with email
            </span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pen Name (Signup only) */}
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Author Pen Name / Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brandon Sanderson"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    className="w-full h-10.5 pl-10 pr-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-lg text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
                  />
                </div>
              </motion.div>
            )}

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
                  className="w-full h-10.5 pl-10 pr-3.5 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-lg text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
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
                  className="w-full h-10.5 pl-10 pr-10 bg-white border border-[#DCD5C9] focus:border-[#8C503C] focus:ring-1 focus:ring-[#8C503C] rounded-lg text-xs sm:text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 font-sans shadow-2xs"
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

            {/* Remember checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DCD5C9] text-[#8C503C] focus:ring-[#8C503C] w-4 h-4 accent-[#8C503C]"
                />
                <span className="text-xs font-serif text-stone-600">Remember session on this device</span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 bg-[#8C503C] hover:bg-[#723F2F] text-white rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Enter Studio" : "Create Author Profile"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#EAE3D6]">
            <p className="text-[11px] font-serif text-stone-400">
              Encrypted Author Workspace • Cloud Synced & Protected
            </p>
          </div>

        </div>
      </div>

      {/* PASSWORD RESET MODAL */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#FCFAF6] border border-[#E5E0D5] rounded-xl p-5 shadow-2xl space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-2.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#8C503C]" />
                  <h3 className="font-serif font-bold text-sm text-[#2A1B14]">
                    Reset Password
                  </h3>
                </div>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-serif text-stone-600">
                Enter your email to receive a password reset link.
              </p>

              <form onSubmit={handleSendPasswordReset} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#DCD5C9] focus:border-[#8C503C] rounded-lg text-xs text-stone-800 outline-none"
                />

                {resetStatus && (
                  <p className="text-[11px] font-serif text-[#8C503C]">{resetStatus}</p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-1.5 border border-[#DCD5C9] text-stone-600 text-[11px] font-bold uppercase rounded-md hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-3 py-1.5 bg-[#8C503C] hover:bg-[#723F2F] text-white text-[11px] font-bold uppercase rounded-md cursor-pointer disabled:opacity-60"
                  >
                    {isResetting ? "Sending..." : "Send Link"}
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
