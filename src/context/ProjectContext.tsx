import { createContext, useContext, useState, ReactNode } from "react";

export interface Project {
  id: string;
  title: string;
  tags: string[];
  logline: string;
  coverImage: string;
  lastModified: string;
  stats: {
    totalWords: number;
    targetWords: number;
    chapters: number;
    drafts: number;
    timeSpentHours: number;
    plotCoverage: number;
    writtenEvents: number;
    totalEvents: number;
  };
  recentActivity: {
    id: string;
    action: string;
    details: string;
    daysAgo: number;
  }[];
}

const initialProject: Project = {
  id: "1",
  title: "The Silent Harbor",
  tags: ["Historical", "Campaign"],
  logline:
    "In the celestial realm of The Silent Harbor, the sun is a myth and the stars are the only masters of time. This is a world locked in a Permanent Twilight, where the horizon is dominated by a shattered, silver moon that has hung in a perfect crescent for ten thousand years.",
  coverImage:
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80",
  lastModified: "2 hours ago",
  stats: {
    totalWords: 52430,
    targetWords: 80000,
    chapters: 24,
    drafts: 4,
    timeSpentHours: 142,
    plotCoverage: 70,
    writtenEvents: 14,
    totalEvents: 20,
  },
  recentActivity: [
    {
      id: "1",
      action: "Edited Chapter 3",
      details: "Added 500 words",
      daysAgo: 1,
    },
    {
      id: "2",
      action: "Edited Chapter 2",
      details: "Added 500 words",
      daysAgo: 2,
    },
    {
      id: "3",
      action: "Edited Chapter 1",
      details: "Added 500 words",
      daysAgo: 3,
    },
  ],
};

interface ProjectContextType {
  project: Project;
  setProject: (p: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(initialProject);
  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
