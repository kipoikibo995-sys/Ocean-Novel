import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Feather,
  Check,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithAdmin,
    signOut,
    syncNow,
    isSyncing,
    lastSyncTime,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleStudioSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Signing into Ocean Novel...");
    const success = await signInWithAdmin(email || "author@ocean-novel.com", password);
    if (success) {
      setStatusMessage("Authenticated successfully! Synced to Cloud.");
      setTimeout(() => {
        setStatusMessage(null);
        closeAuthModal();
      }, 700);
    } else {
      setStatusMessage("Authentication failed. Please check credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    setStatusMessage("Connecting to Google Account...");
    await signInWithGoogle();
    setStatusMessage("Google Account Connected & Synced!");
    setTimeout(() => {
      setStatusMessage(null);
      closeAuthModal();
    }, 700);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-[#fcfaf5] rounded-xl shadow-2xl border border-[#ded5c7] overflow-hidden z-10 my-auto flex flex-col md:flex-row"
        >
          {/* LEFT COLUMN: Atmospheric Showcase */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-[#fcfaf5] via-[#f7f2ea] to-[#eddcc9] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-[#ded5c7]">
            {/* Ambient soft glow / blur effect */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

            {/* Content Upper */}
            <div className="relative z-10">
              {/* Quill Feather Badge */}
              <div className="w-12 h-12 rounded-xl bg-[#ede6da] border border-[#ded5c7] flex items-center justify-center text-[#3e2e26] shadow-xs">
                <Feather className="w-6 h-6 stroke-[1.75]" />
              </div>

              {/* Title & Tagline */}
              <div className="mt-8">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1f1915] font-normal leading-tight tracking-tight">
                  Write the next
                  <span className="block font-serif italic text-3xl sm:text-4xl text-[#1f1915] mt-1">
                    bestseller.
                  </span>
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  Ocean Novel is the premium environment for authors. Manage your library, organize ideas, and generate full manuscripts with advanced AI.
                </p>
              </div>

              {/* Statistics Counters */}
              <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-[#ded5c7]/70">
                <div>
                  <div className="font-serif text-2xl font-bold text-[#1f1915]">
                    10k+
                  </div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-stone-500 mt-0.5">
                    AUTHORS
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-[#1f1915]">
                    1M+
                  </div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-stone-500 mt-0.5">
                    WORDS WRITTEN
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Signature */}
            <div className="relative z-10 mt-8 pt-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 font-serif">
                — OCEAN NOVEL STUDIO
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In Card */}
          <div className="w-full md:w-7/12 bg-white/95 sm:bg-[#fcfaf5]/90 p-6 sm:p-10 flex flex-col justify-between relative">
            {/* Top Close Bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-stone-500 font-semibold uppercase tracking-wider">
                Cloud Sync Access
              </span>
              <button
                type="button"
                onClick={closeAuthModal}
                className="ml-auto text-stone-400 hover:text-stone-800 text-xs font-serif font-bold uppercase tracking-widest transition-colors py-1 px-2 cursor-pointer"
                title="Close modal"
              >
                CLOSE
              </button>
            </div>

            {/* Header */}
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#1f1915] font-medium tracking-tight">
                Welcome back
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-6 font-sans">
                Sign in to access your manuscripts and settings
              </p>

              {/* Status Feedback Notification */}
              {statusMessage && (
                <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleStudioSignIn} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1.5"
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="author@example.com"
                    className="w-full bg-[#f7f4ec] border border-[#d8d0c2] focus:border-amber-700 focus:bg-white text-stone-900 text-sm rounded-lg px-4 py-3 outline-none transition-all font-sans font-medium"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password-input"
                    className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1.5"
                  >
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full bg-[#f7f4ec] border border-[#d8d0c2] focus:border-amber-700 focus:bg-white text-stone-900 text-sm rounded-lg px-4 py-3 outline-none transition-all font-sans tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full bg-[#26231d] hover:bg-[#39342b] active:scale-[0.99] text-[#fcfaf5] text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>CONNECTING...</span>
                    </>
                  ) : (
                    <span>SIGN IN TO OCEAN NOVEL</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  OR
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSyncing}
                className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] border border-stone-300 text-stone-700 font-sans font-medium text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-xs hover:border-stone-400 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Bottom Footer Text */}
            <div className="mt-6 text-center text-xs text-stone-500 font-sans">
              Ocean Novel Cloud Studio • Secure Encrypted Persistence
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
