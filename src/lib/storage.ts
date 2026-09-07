import { ManuscriptItem } from "@/mockData";

export interface ProjectMeta {
  id: string;
  title: string;
  author: string;
  genre: string;
  audience: string;
  logline: string;
  wordGoal: number;
  currentWords: number;
  lastModified: number;
  themeColor: string;
}

export interface ProjectData {
  manuscript: ManuscriptItem[];
  characters: any[];
  locations: any[];
}

export interface StudioTask {
  id: string;
  projectId?: string;
  title: string;
  type: 'writing' | 'editing' | 'worldbuilding' | 'research';
  completed: boolean;
  urgency: 'low' | 'medium' | 'high';
  createdAt: number;
}

const PROJECTS_KEY = 'writing_studio_projects';
const PROJECT_DATA_PREFIX = 'writing_studio_data_';
const TASKS_KEY = 'writing_studio_tasks';

const DEFAULT_TASKS: StudioTask[] = [
  {
    id: 'task-1',
    title: 'Draft Chapter 1 opening hook and sensory details',
    type: 'writing',
    completed: false,
    urgency: 'high',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'task-2',
    title: 'Flesh out core motivation and backstory for protagonist',
    type: 'worldbuilding',
    completed: false,
    urgency: 'medium',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'task-3',
    title: 'Review pacing and dialogue flow in opening scene',
    type: 'editing',
    completed: false,
    urgency: 'high',
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'task-4',
    title: 'Verify historical and geographical accuracy for settings',
    type: 'research',
    completed: true,
    urgency: 'low',
    createdAt: Date.now() - 3600000 * 48,
  },
];

export const storage = {
  getTasks: (projectId?: string): StudioTask[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      if (!data) {
        localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
        return DEFAULT_TASKS;
      }
      const all: StudioTask[] = JSON.parse(data);
      if (projectId) {
        return all.filter((t) => !t.projectId || t.projectId === projectId);
      }
      return all;
    } catch (e) {
      return DEFAULT_TASKS;
    }
  },

  saveTask: (task: StudioTask) => {
    try {
      const tasks = storage.getTasks();
      const existingIndex = tasks.findIndex((t) => t.id === task.id);
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.unshift(task);
      }
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save task', e);
    }
  },

  deleteTask: (taskId: string) => {
    try {
      const tasks = storage.getTasks().filter((t) => t.id !== taskId);
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to delete task', e);
    }
  },

  saveAllTasks: (tasks: StudioTask[]) => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save all tasks', e);
    }
  },
  getProjects: (): ProjectMeta[] => {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveProject: (project: ProjectMeta) => {
    const projects = storage.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  deleteProject: (id: string) => {
    const projects = storage.getProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.removeItem(PROJECT_DATA_PREFIX + id);
  },

  getProjectData: (id: string): ProjectData | null => {
    try {
      const data = localStorage.getItem(PROJECT_DATA_PREFIX + id);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveProjectData: (id: string, data: Partial<ProjectData>) => {
    const existing = storage.getProjectData(id) || { manuscript: [], characters: [], locations: [] };
    const newData = { ...existing, ...data };
    localStorage.setItem(PROJECT_DATA_PREFIX + id, JSON.stringify(newData));
    
    // Update last modified on the meta object
    const projects = storage.getProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      project.lastModified = Date.now();
      
      // Calculate total words if manuscript is provided
      if (data.manuscript) {
        let totalWords = 0;
        const countWords = (items: ManuscriptItem[]) => {
          for (const item of items) {
            if (item.type === 'scene' && item.content) {
              const plainText = item.content.replace(/<[^>]*>?/gm, ' ');
              const words = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
              totalWords += words;
            }
            if (item.children) {
              countWords(item.children);
            }
          }
        };
        countWords(data.manuscript);
        project.currentWords = totalWords;
      }
      
      storage.saveProject(project);
    }
  }
};
