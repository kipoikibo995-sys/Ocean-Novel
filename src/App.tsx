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
import { AnimatePresence } from "motion/react";
import { AppLayout, ProjectLayout } from "./components/layout/layouts";
import { ProjectProvider } from "./context/ProjectContext";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import ProjectOverview from "./pages/ProjectOverview";
import StoryBible from "./pages/StoryBible";
import Characters from "./pages/Characters";
import Locations from "./pages/Locations";
import Plot from "./pages/Plot";
import WritingStudio from "./pages/WritingStudio";
import Settings from "./pages/Settings";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateProject />} />

          <Route path="/project/:id" element={<ProjectOverview />} />
          <Route element={<ProjectLayout />}>
            <Route path="/project/:id/characters" element={<Characters />} />
            <Route path="/project/:id/workspace" element={<Navigate to="studio" replace />} />
            <Route path="/project/:id/workspace/bible" element={<StoryBible />} />
            <Route path="/project/:id/workspace/locations" element={<Locations />} />
            <Route path="/project/:id/workspace/plot" element={<Plot />} />
            <Route path="/project/:id/workspace/studio" element={<WritingStudio />} />
            <Route path="/project/:id/workspace/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ProjectProvider>
  );
}
