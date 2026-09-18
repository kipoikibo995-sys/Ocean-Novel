/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppLayout, ProjectLayout } from "./components/layout/layouts";
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
import LoginPage from "./pages/LoginPage";

import { AuthProvider, useAuth } from "./lib/AuthContext";
import { AuthModal } from "./components/AuthModal";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-sm text-stone-600">Loading Ocean Novel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
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

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthModal />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
