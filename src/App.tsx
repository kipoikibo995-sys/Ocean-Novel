/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AppLayout, ProjectLayout } from "./components/layout/layouts";
import { storage } from "./lib/storage";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Feather, RefreshCw } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import ProjectOverview from "./pages/ProjectOverview";
import StoryBible from "./pages/StoryBible";
import Characters from "./pages/Characters";
import Locations from "./pages/Locations";
import Plot from "./pages/Plot";
import WritingStudio from "./pages/WritingStudio";
import Settings from "./pages/Settings";
import GlobalSearchPage from "./pages/GlobalSearchPage";
import ConsistencyCheckerPage from "./pages/ConsistencyCheckerPage";
import Login from "./pages/Login";

function ProtectedRoute() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F4F1EA] flex flex-col items-center justify-center text-[#4A3225] select-none">
        <div className="w-12 h-12 rounded-lg bg-[#8C503C] flex items-center justify-center text-[#FAF7F2] shadow-md mb-4 animate-pulse">
          <Feather className="w-6 h-6" />
        </div>
        <div className="font-serif text-lg font-bold">Ocean Novel Studio</div>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-serif mt-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8C503C]" />
          <span>Verifying Author Access...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect directly to Login
  if (!user || user.isAnonymous) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      {/* Public Authentication Gate */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<Login />} />

      {/* Root Route: Redirects to /dashboard (which passes through ProtectedRoute) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Archive & Studio Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<ProjectLayout />}>
            <Route path="/project/:id" element={<ProjectOverview />} />
            <Route path="/project/:id/characters" element={<Characters />} />
            <Route path="/project/:id/bible" element={<StoryBible />} />
            <Route path="/project/:id/locations" element={<Locations />} />
            <Route path="/project/:id/plot" element={<Plot />} />
            <Route path="/project/:id/workspace" element={<Navigate to="studio" replace />} />
            <Route path="/project/:id/workspace/bible" element={<StoryBible />} />
            <Route path="/project/:id/workspace/locations" element={<Locations />} />
            <Route path="/project/:id/workspace/plot" element={<Plot />} />
            <Route path="/project/:id/workspace/studio" element={<WritingStudio />} />
            <Route path="/project/:id/studio" element={<WritingStudio />} />
            <Route path="/project/:id/workspace/search" element={<GlobalSearchPage />} />
            <Route path="/project/:id/search" element={<GlobalSearchPage />} />
            <Route path="/project/:id/workspace/consistency" element={<ConsistencyCheckerPage />} />
            <Route path="/project/:id/consistency" element={<ConsistencyCheckerPage />} />
            <Route path="/project/:id/workspace/settings" element={<Settings />} />
            <Route path="/project/:id/settings" element={<Settings />} />
            <Route path="/project/:id/profile" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    storage.initAutoSync();
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
