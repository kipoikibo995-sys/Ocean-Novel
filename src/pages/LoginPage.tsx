import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  Feather,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGoogle, signInWithAdmin, isSyncing } = useAuth();

  const [email, setEmail] = useState("kojiacademy2026@gmail.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to destination or dashboard
  const destination = (location.state as any)?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    if (user) {
      navigate(destination, { replace: true });
    }
  }, [user, navigate, destination]);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage("Authenticating with StreamWriter Studio...");

    try {
      const success = await signInWithAdmin(email, password);
      if (success) {
        setStatusMessage("Authenticated successfully! Entering Archive Projects...");
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 600);
      } else {
        setErrorMessage("Authentication failed. Please check your credentials.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage("Connecting to Google Account...");

    try {
      await signInWithGoogle();
      setStatusMessage("Google Account Connected! Entering Archive Projects...");
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 600);
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign-in was cancelled or encountered an error.");
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail("kojiacademy2026@gmail.com");
    setPassword("••••••••••••");
    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage("Logging in as Admin (kojiacademy2026@gmail.com)...");

    const success = await signInWithAdmin("kojiacademy2026@gmail.com");
    if (success) {
      setStatusMessage("Welcome back, Koji Academy! Redirecting to Archive Projects...");
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4efe6] text-stone-900 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      {/* Background ambient texture / subtle decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#eddcc9] rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-amber-200/40 rounded-full blur-3xl translate-y-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-5xl bg-[#fcfaf5] rounded-2xl shadow-2xl border border-[#ded5c7] overflow-hidden flex flex-col md:flex-row z-10 my-auto"
      >
        {/* LEFT COLUMN: Atmospheric Brand Showcase */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#fcfaf5] via-[#f7f2ea] to-[#ebd9c5] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-[#ded5c7]">
          {/* Soft ambient inner glow */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ede6da] border border-[#ded5c7] flex items-center justify-center text-[#3e2e26] shadow-xs">
                <Feather className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg tracking-tight text-[#26231d] block">
                  StreamWriter
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500 block">
                  Author Studio
                </span>
              </div>
            </div>

            {/* Display Headline */}
            <div className="mt-10 sm:mt-14">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#1f1915] font-normal leading-tight tracking-tight">
                Write the next
                <span className="block font-serif italic font-normal text-3xl sm:text-4xl lg:text-[42px] text-[#2c1f17] mt-1">
                  bestseller.
                </span>
              </h1>
              <p className="mt-5 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                StreamWriter Studio is the dedicated environment for novelists and narrative architects. Organize your story bibles, track character arcs, build worlds, and craft your manuscripts.
              </p>
            </div>

            {/* Metric Counters */}
            <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-[#ded5c7]/80">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1f1915]">
                  10k+
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-stone-500 mt-1">
                  NOVELISTS
                </div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1f1915]">
                  1M+
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-stone-500 mt-1">
                  WORDS WRITTEN
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Brand Statement */}
          <div className="relative z-10 mt-10 pt-6 border-t border-[#ded5c7]/60 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 font-serif">
              STREAMWRITER CLOUD ARCHIVES
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Ready</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form */}
        <div className="w-full md:w-7/12 bg-white/95 sm:bg-[#fcfaf5]/90 p-8 sm:p-12 flex flex-col justify-between relative">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1f1915] font-medium tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 font-sans">
                  Sign in to access your Archive Projects and manuscript studio
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#f4efe6] border border-[#ded5c7] flex items-center justify-center text-stone-600">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Admin Access Preset Card */}
            <div className="mt-6 p-3.5 bg-[#f5ede0] border border-[#d8c7b0] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#3e2e26] text-[#fcfaf5] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  KA
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      Koji Academy
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold tracking-wider uppercase shrink-0">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-mono truncate">
                    kojiacademy2026@gmail.com
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={isLoading || isSyncing}
                className="shrink-0 bg-[#3e2e26] hover:bg-[#2a1e18] active:scale-95 text-[#fcfaf5] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>Quick Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Status / Feedback Notifications */}
            {statusMessage && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                <span className="font-bold">Error:</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleEmailPasswordSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1.5"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="kojiacademy2026@gmail.com"
                  className="w-full bg-[#f7f4ec] border border-[#d8d0c2] focus:border-amber-700 focus:bg-white text-stone-900 text-sm rounded-lg px-4 py-3 outline-none transition-all font-sans font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[10px] font-bold tracking-widest uppercase text-stone-500"
                  >
                    PASSWORD
                  </label>
                  <span className="text-[11px] text-stone-400">Default: any password</span>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
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
                disabled={isLoading || isSyncing}
                className="w-full bg-[#26231d] hover:bg-[#39342b] active:scale-[0.99] text-[#fcfaf5] text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading || isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>ENTERING ARCHIVES...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO ARCHIVE PROJECTS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
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
              disabled={isLoading || isSyncing}
              className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] border border-[#d8d0c2] text-stone-700 font-sans font-medium text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-xs hover:border-stone-400 cursor-pointer disabled:opacity-50"
            >
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-8 pt-4 border-t border-[#ded5c7]/60 flex items-center justify-between text-[11px] text-stone-500 font-sans">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Cloud Firestore Synced</span>
            </span>
            <span>StreamWriter v2.6</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
