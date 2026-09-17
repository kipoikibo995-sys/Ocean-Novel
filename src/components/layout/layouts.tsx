import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  LayoutDashboard,
  Settings,
  FileText,
  Users,
  Map,
  PenTool,
  Edit3,
  Grid,
  User,
  HelpCircle,
  ArrowLeft,
  Menu,
  ChevronLeft,
  Search,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout() {
  return (
    <div className="h-screen w-screen bg-[#F4F1EA] text-stone-800 font-sans flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export function ProjectLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (location.pathname.includes("/workspace/studio")) {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  const navItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: `/project/${location.pathname.split("/")[2] || "1"}`,
    },
    {
      label: "Characters",
      icon: Users,
      href: `/project/${location.pathname.split("/")[2] || "1"}/characters`,
    },
    {
      label: "Locations",
      icon: Map,
      href: `/project/${location.pathname.split("/")[2] || "1"}/workspace/locations`,
    },
    {
      label: "Plot & Timeline",
      icon: Book,
      href: `/project/${location.pathname.split("/")[2] || "1"}/workspace/plot`,
    },
  ];

  const workspaceItems = [
    {
      label: "Writing Studio",
      icon: PenTool,
      href: `/project/${location.pathname.split("/")[2] || "1"}/workspace/studio`,
    },
  ];

  const toolItems = [
    {
      label: "Search & Replace",
      icon: Search,
      href: `/project/${location.pathname.split("/")[2] || "1"}/workspace/search`,
    },
    {
      label: "Consistency Checker",
      icon: ShieldCheck,
      href: `/project/${location.pathname.split("/")[2] || "1"}/workspace/consistency`,
    },
  ];

  return (
    <div className="flex flex-1 overflow-hidden h-full bg-[#F4F1EA]">
      <aside
        className={cn(
          "bg-[#B56D6D] border-r border-[#9A5A5A] flex flex-col shrink-0 py-6 shadow-[4px_0_12px_rgba(0,0,0,0.1)] z-50 transition-all duration-300 ease-in-out",
          isExpanded ? "w-64 px-4 items-stretch" : "w-16 px-0 items-center",
        )}
      >
        {/* Header & Toggle */}
        <div
          className={cn(
            "flex items-center mb-8",
            isExpanded ? "justify-between px-2" : "justify-center",
          )}
        >
          {isExpanded && (
            <span className="text-white font-serif tracking-widest font-bold uppercase text-sm">
              Ocean Novel
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:text-white transition-colors outline-none focus:outline-none focus:ring-0"
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Back to All Books */}
        <button
          onClick={() => navigate("/dashboard")}
          className={cn(
            "flex items-center rounded-xl transition-colors mb-4 border border-white/20 shadow-sm bg-white/5",
            isExpanded ? "w-full px-4 h-11 gap-3" : "w-11 h-11 justify-center mx-auto",
            "text-white/90 hover:text-white hover:bg-white/15 hover:border-white/40"
          )}
          title="All Books"
        >
          <Grid className="w-5 h-5 shrink-0" />
          {isExpanded && <span className="font-semibold text-sm">All Books</span>}
        </button>

        <nav className="flex-1 w-full flex flex-col gap-1.5 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isExpanded && (
            <div className="text-white/70 text-[10px] uppercase font-bold tracking-widest px-4 mb-1 mt-1">
              Database
            </div>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-xl transition-colors",
                  isExpanded
                    ? "w-full px-4 h-10 gap-3"
                    : "w-10 h-10 justify-center mx-auto",
                  isActive
                    ? "bg-[#F59E0B] text-[#3E2723] shadow-md font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/10 font-medium",
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#3E2723]" : "")} />
                {isExpanded && (
                  <span className="text-sm truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          <div
            className={cn(
              "bg-white/20 my-3",
              isExpanded ? "w-full h-px" : "w-8 h-px mx-auto",
            )}
          />

          {isExpanded && (
            <div className="text-white/70 text-[10px] uppercase font-bold tracking-widest px-4 mb-1">
              Create
            </div>
          )}
          {workspaceItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-2xl transition-all shadow-lg border-2",
                  isExpanded
                    ? "w-full px-4 h-12 gap-3"
                    : "w-12 h-12 justify-center mx-auto",
                  isActive
                    ? "bg-[#F59E0B] border-[#F59E0B] text-[#3E2723]"
                    : "bg-[#8A5252] border-[#8A5252] text-white hover:bg-[#F59E0B] hover:border-[#F59E0B] hover:text-[#3E2723]",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isExpanded && (
                  <span className="font-bold text-sm truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          <div
            className={cn(
              "bg-white/20 my-3",
              isExpanded ? "w-full h-px" : "w-8 h-px mx-auto",
            )}
          />

          {isExpanded && (
            <div className="text-white/70 text-[10px] uppercase font-bold tracking-widest px-4 mb-1">
              Tools & Quality
            </div>
          )}
          {toolItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-xl transition-all",
                  isExpanded
                    ? "w-full px-4 h-10 gap-3"
                    : "w-10 h-10 justify-center mx-auto",
                  isActive
                    ? "bg-[#F59E0B] text-[#3E2723] font-bold shadow-md"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white font-medium",
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#3E2723]" : "")} />
                {isExpanded && (
                  <span className="text-xs truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "bg-white/20 mb-3 mt-auto shrink-0",
            isExpanded ? "w-full h-px" : "w-8 h-px mx-auto"
          )}
        />

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => {
              const projId = location.pathname.split("/")[2] || "1";
              navigate(`/project/${projId}/workspace/settings?tab=profile`);
            }}
            className={cn(
              "flex items-center rounded-xl transition-colors",
              isExpanded
                ? "w-full px-4 h-10 gap-3"
                : "w-10 h-10 justify-center mx-auto",
              location.pathname.includes("settings") && (location.search.includes("tab=profile") || !location.search.includes("tab="))
                ? "bg-[#8A5252] text-white shadow-inner"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title="Profile"
          >
            <User className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="font-medium text-sm">Profile</span>}
          </button>
          <button
            onClick={() => {
              const projId = location.pathname.split("/")[2] || "1";
              navigate(`/project/${projId}/workspace/settings?tab=preferences`);
            }}
            className={cn(
              "flex items-center rounded-xl transition-colors",
              isExpanded
                ? "w-full px-4 h-10 gap-3"
                : "w-10 h-10 justify-center mx-auto",
              location.pathname.includes("settings") && location.search.includes("tab=preferences")
                ? "bg-[#8A5252] text-white shadow-inner"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title="Settings"
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isExpanded && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F1EA]">
        <Outlet />
      </main>
    </div>
  );
}
