import { ManuscriptItem } from "@/mockData";
import { db, auth } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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
  coverUrl?: string;
  userId?: string;
}

export interface StoryBibleData {
  title?: string;
  genre?: string;
  subgenre?: string;
  targetAudience?: string;
  pov?: string;
  tone?: string;
  premise?: string;
  mainConflict?: string;
  storyGoal?: string;
  themes?: string;
  timePeriod?: string;
  primarySetting?: string;
  worldDescription?: string;
  importantRules?: string;
  narrativeStyle?: string;
  dialogueStyle?: string;
  pacing?: string;
  aiInstructions?: string;
}

export interface UserProfile {
  name: string;
  penName: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  plan: 'free' | 'pro';
  defaultFont: string;
  fontSize: string;
  defaultPov: string;
  defaultTone: string;
  theme: 'light' | 'dark' | 'system';
}

export interface ProjectData {
  id?: string;
  manuscript: ManuscriptItem[];
  characters: any[];
  locations: any[];
  characterGraphs?: Array<{ id: string; name: string; nodes: any[]; edges: any[] }>;
  locationMap?: {
    nodes: Array<{ id: string; x: number; y: number }>;
    edges: Array<{ id: string; source: string; target: string; label: string }>;
    unmapped?: any[];
  };
  notes?: Record<string, string>; // sceneId -> note content
  lastActiveSceneId?: string;
  lastActiveSceneTitle?: string;
  storyBible?: StoryBibleData;
  plotEvents?: any[];
  plotArcs?: any[];
  userId?: string;
}

export interface StudioTask {
  id: string;
  projectId?: string;
  title: string;
  type: 'writing' | 'editing' | 'worldbuilding' | 'research';
  completed: boolean;
  urgency: 'low' | 'medium' | 'high';
  createdAt: number;
  userId?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const PROJECTS_KEY = 'writing_studio_projects';
const PROJECT_DATA_PREFIX = 'writing_studio_data_';
const TASKS_KEY = 'writing_studio_tasks';
const PROFILE_KEY = 'writing_studio_profile';

const DEFAULT_TASKS: StudioTask[] = [
  {
    id: 'task-1',
    title: 'Draft Chapter 1 opening hook and sensory details',
    type: 'writing',
    completed: false,
    urgency: 'high',
    createdAt: Date.now() - 3600000 * 24,
  }
];

const defaultProfile: UserProfile = {
  name: "Jane Smith",
  penName: "J. S. Hawthorne",
  email: "jane.smith@example.com",
  bio: "Historical fiction & noir mystery novelist with a fondness for fog-drenched coasts and moody characters.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  plan: "pro",
  defaultFont: "Merriweather (Serif)",
  fontSize: "Medium (18px)",
  defaultPov: "Third Person Limited",
  defaultTone: "Suspenseful",
  theme: "light",
};

// In-Memory Cache initialized from LocalStorage (Fallback if not logged in)
let cachedProjects: ProjectMeta[] = (() => {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); } catch { return []; }
})();
let cachedProjectData: Record<string, ProjectData> = {};
let cachedTasks: StudioTask[] = (() => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  } catch { return DEFAULT_TASKS; }
})();
let cachedProfile: UserProfile | null = (() => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
})();
let currentUserId: string | null = null;

export const storage = {
  clearCache: () => {
    // Only clears user memory when logging out. Still falls back to LocalStorage
    cachedProjects = (() => {
      try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); } catch { return []; }
    })();
    cachedTasks = (() => {
      try {
        const data = localStorage.getItem(TASKS_KEY);
        return data ? JSON.parse(data) : DEFAULT_TASKS;
      } catch { return DEFAULT_TASKS; }
    })();
    cachedProfile = (() => {
      try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
    })();
    cachedProjectData = {};
    currentUserId = null;
  },
  
  syncFromCloud: async (userId: string) => {
    currentUserId = userId;
    try {
      // Load Profile
      try {
        const profileDoc = await getDoc(doc(db, `users/${userId}/profile/default`));
        if (profileDoc.exists()) {
          cachedProfile = profileDoc.data() as UserProfile;
          localStorage.setItem(PROFILE_KEY, JSON.stringify(cachedProfile));
        } else {
          cachedProfile = cachedProfile || defaultProfile;
          await setDoc(doc(db, `users/${userId}/profile/default`), cachedProfile);
        }
      } catch(e) { handleFirestoreError(e, OperationType.GET, `users/${userId}/profile/default`); }

      // Load Projects
      try {
        const projSnapshot = await getDocs(collection(db, `users/${userId}/projects`));
        cachedProjects = projSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as ProjectMeta));
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(cachedProjects));
      } catch(e) { handleFirestoreError(e, OperationType.LIST, `users/${userId}/projects`); }

      // Load Tasks
      try {
        const taskSnapshot = await getDocs(collection(db, `users/${userId}/tasks`));
        cachedTasks = taskSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as StudioTask));
        localStorage.setItem(TASKS_KEY, JSON.stringify(cachedTasks));
      } catch(e) { handleFirestoreError(e, OperationType.LIST, `users/${userId}/tasks`); }

      // Load all Project Data
      try {
        const pdSnapshot = await getDocs(collection(db, `users/${userId}/projectData`));
        pdSnapshot.docs.forEach(d => {
          const pData = d.data() as ProjectData;
          cachedProjectData[d.id] = pData;
          localStorage.setItem(PROJECT_DATA_PREFIX + d.id, JSON.stringify(pData));
        });
      } catch(e) { handleFirestoreError(e, OperationType.LIST, `users/${userId}/projectData`); }

    } catch (e) {
      console.error("Critical Sync Error", e);
    }
  },

  getTasks: (projectId?: string): StudioTask[] => {
    if (!cachedTasks) return [];
    if (projectId) {
      return cachedTasks.filter((t) => !t.projectId || t.projectId === projectId);
    }
    return cachedTasks;
  },

  saveTask: (task: StudioTask) => {
    const existingIndex = cachedTasks.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      cachedTasks[existingIndex] = task;
    } else {
      cachedTasks.unshift(task);
    }
    
    localStorage.setItem(TASKS_KEY, JSON.stringify(cachedTasks));
    if (currentUserId) {
      setDoc(doc(db, `users/${currentUserId}/tasks/${task.id}`), task)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/tasks/${task.id}`));
    }
  },

  deleteTask: (taskId: string) => {
    cachedTasks = cachedTasks.filter((t) => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(cachedTasks));
    if (currentUserId) {
      deleteDoc(doc(db, `users/${currentUserId}/tasks/${taskId}`))
        .catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${currentUserId}/tasks/${taskId}`));
    }
  },

  saveAllTasks: (tasks: StudioTask[]) => {
    cachedTasks = tasks;
    localStorage.setItem(TASKS_KEY, JSON.stringify(cachedTasks));
    if (currentUserId) {
      tasks.forEach(task => {
        setDoc(doc(db, `users/${currentUserId}/tasks/${task.id}`), task)
          .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/tasks/${task.id}`));
      });
    }
  },

  getProjects: (): ProjectMeta[] => {
    return cachedProjects || [];
  },

  saveProject: (project: ProjectMeta) => {
    const existingIndex = cachedProjects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      cachedProjects[existingIndex] = project;
    } else {
      cachedProjects.push(project);
    }
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(cachedProjects));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novelist-storage-updated', { detail: { projectId: project.id } }));
    }
    if (currentUserId) {
      project.userId = currentUserId;
      setDoc(doc(db, `users/${currentUserId}/projects/${project.id}`), project)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/projects/${project.id}`));
    }
  },

  updateProject: (id: string, updates: Partial<ProjectMeta>) => {
    const existingIndex = cachedProjects.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      cachedProjects[existingIndex] = { ...cachedProjects[existingIndex], ...updates };
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(cachedProjects));
      if (currentUserId) {
        setDoc(doc(db, `users/${currentUserId}/projects/${id}`), cachedProjects[existingIndex], { merge: true })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/projects/${id}`));
      }
    }
  },

  deleteProject: (id: string) => {
    cachedProjects = cachedProjects.filter(p => p.id !== id);
    delete cachedProjectData[id];
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(cachedProjects));
    localStorage.removeItem(PROJECT_DATA_PREFIX + id);
    if (currentUserId) {
      deleteDoc(doc(db, `users/${currentUserId}/projects/${id}`))
        .catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${currentUserId}/projects/${id}`));
      deleteDoc(doc(db, `users/${currentUserId}/projectData/${id}`))
        .catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${currentUserId}/projectData/${id}`));
    }
  },

  getProjectData: (id: string): ProjectData | null => {
    if (cachedProjectData[id]) return cachedProjectData[id];
    
    // Try localStorage if not in cache (e.g. initial load without cloud)
    try {
      const data = localStorage.getItem(PROJECT_DATA_PREFIX + id);
      if (data) {
        const parsed = JSON.parse(data);
        cachedProjectData[id] = parsed;
        return parsed;
      }
    } catch { return null; }
    
    return null;
  },

  saveProjectData: (id: string, data: Partial<ProjectData>) => {
    const existing = storage.getProjectData(id) || { manuscript: [], characters: [], locations: [] };
    const newData = { ...existing, ...data, id };
    cachedProjectData[id] = newData;
    localStorage.setItem(PROJECT_DATA_PREFIX + id, JSON.stringify(newData));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novelist-storage-updated', { detail: { projectId: id } }));
    }
    
    const project = cachedProjects.find(p => p.id === id);
    if (project) {
      project.lastModified = Date.now();
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

    if (currentUserId) {
      newData.userId = currentUserId;
      newData.id = id;
      setDoc(doc(db, `users/${currentUserId}/projectData/${id}`), newData)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/projectData/${id}`));
    }
  },

  getUserProfile: (): UserProfile => {
    return cachedProfile || defaultProfile;
  },

  saveUserProfile: (profile: Partial<UserProfile>): UserProfile => {
    const current = cachedProfile || defaultProfile;
    const updated = { ...current, ...profile };
    cachedProfile = updated;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    if (currentUserId) {
      setDoc(doc(db, `users/${currentUserId}/profile/default`), updated)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/profile/default`));
    }
    return updated;
  }
};
