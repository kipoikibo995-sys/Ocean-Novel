import { ManuscriptItem } from "@/mockData";
import { db, auth } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

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

export interface AuthorTimelineSettings {
  streakMode: 'auto' | 'custom';
  customStreakDays: number;
  timeMode: 'auto' | 'custom';
  customHours: number;
  customMinutes: number;
  activeDates?: string[];
  totalWritingMinutesTracked?: number;
}

const TIMELINE_SETTINGS_KEY = 'writing_studio_timeline_settings';

const defaultTimelineSettings: AuthorTimelineSettings = {
  streakMode: 'auto',
  customStreakDays: 1,
  timeMode: 'auto',
  customHours: 0,
  customMinutes: 0,
  activeDates: [],
  totalWritingMinutesTracked: 0,
};

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

/**
 * Safe wrapper for localStorage.setItem with automatic QuotaExceededError recovery.
 * Protects against 5MB browser localStorage overflow.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.code === 22 ||
        error.code === 1014 ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    if (isQuota) {
      console.warn(`[Ocean Novel Storage] QuotaExceededError writing "${key}". Initiating auto-recovery...`);
      try {
        // 1. Sanitize heavy base64 cover images in cachedProjects
        if (Array.isArray(cachedProjects)) {
          cachedProjects.forEach(p => {
            if (p.coverUrl && p.coverUrl.startsWith('data:') && p.coverUrl.length > 50000) {
              p.coverUrl = "https://res.cloudinary.com/mekoxs1q/image/upload/v1788788313/7e1e3f9e-023d-4556-a04c-e0d633ba4cea_rcjcwh.png";
            }
          });
        }

        // 2. Remove any exceptionally large or stale entries in localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k !== key && k !== PROJECTS_KEY && k !== PROFILE_KEY) {
            const itemVal = localStorage.getItem(k);
            if (itemVal && itemVal.length > 250000) {
              keysToRemove.push(k);
            }
          }
        }
        keysToRemove.forEach(k => {
          try { localStorage.removeItem(k); } catch {}
        });

        // 3. If writing PROJECTS_KEY, strip heavy data from the value being written
        let retryVal = value;
        if (key === PROJECTS_KEY) {
          try {
            const list = JSON.parse(value);
            if (Array.isArray(list)) {
              const stripped = list.map((p: any) => {
                if (p.coverUrl && p.coverUrl.startsWith('data:') && p.coverUrl.length > 30000) {
                  return { ...p, coverUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788788313/7e1e3f9e-023d-4556-a04c-e0d633ba4cea_rcjcwh.png" };
                }
                return p;
              });
              retryVal = JSON.stringify(stripped);
            }
          } catch {}
        }

        localStorage.setItem(key, retryVal);
        console.info(`[Ocean Novel Storage] Successfully recovered and saved "${key}".`);
        return true;
      } catch {
        console.warn(`[Ocean Novel Storage] Storage quota exhausted for "${key}". In-memory state and cloud sync are safely preserved.`);
        return false;
      }
    } else {
      console.error(`[Ocean Novel Storage] Error writing "${key}":`, error);
      return false;
    }
  }
}

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
  name: "Koji Academy",
  penName: "Koji Academy",
  email: "kojiacademy2026@gmail.com",
  bio: "Lead Studio Author & Novel Architect at Ocean Novel.",
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
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const list: ProjectMeta[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    let cleaned = false;
    const sanitized = list.map(p => {
      if (p.coverUrl && p.coverUrl.startsWith('data:') && p.coverUrl.length > 50000) {
        cleaned = true;
        return {
          ...p,
          coverUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788788313/7e1e3f9e-023d-4556-a04c-e0d633ba4cea_rcjcwh.png"
        };
      }
      return p;
    });
    if (cleaned) {
      try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(sanitized)); } catch {}
    }
    return sanitized;
  } catch {
    return [];
  }
})();
let cachedProjectData: Record<string, ProjectData> = {};
let cachedTasks: StudioTask[] = (() => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  } catch { return DEFAULT_TASKS; }
})();
let cachedProfile: UserProfile | null = (() => {
  try { 
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); 
    if (p && (p.email === 'jane.smith@example.com' || !p.email)) {
      return { ...p, name: "Koji Academy", penName: "Koji Academy", email: "kojiacademy2026@gmail.com" };
    }
    return p;
  } catch { return null; }
})();
let currentUserId: string | null = null;

/**
 * Strips undefined properties and deeply prepares objects for error-free Firestore document insertion.
 */
function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value === undefined) return null;
      return value;
    })
  );
}

export async function ensureFirebaseAuth(): Promise<string | null> {
  if (auth.currentUser) {
    storage.setCurrentUserId(auth.currentUser.uid);
    return auth.currentUser.uid;
  }
  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      storage.setCurrentUserId(cred.user.uid);
      return cred.user.uid;
    }
  } catch (err) {
    console.warn('Firebase anonymous authentication:', err);
  }
  return null;
}

function canSyncWithFirestore(targetUserId?: string | null): boolean {
  const uid = targetUserId || currentUserId;
  return Boolean(
    auth.currentUser &&
    uid &&
    uid !== 'null' &&
    uid !== 'undefined' &&
    auth.currentUser.uid === uid
  );
}

export const storage = {
  getCurrentUserId: () => currentUserId,
  setCurrentUserId: (userId: string | null) => {
    currentUserId = userId && userId !== 'null' ? userId : null;
  },

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
  
  syncAllLocalDataToCloud: async (userId?: string) => {
    let effectiveUid = userId || currentUserId;
    if (!effectiveUid || !auth.currentUser) {
      effectiveUid = (await ensureFirebaseAuth()) || undefined;
    }

    if (!effectiveUid || effectiveUid === 'null') {
      console.warn("Cannot sync to cloud: no authenticated session available.");
      return false;
    }

    currentUserId = effectiveUid;
    if (!canSyncWithFirestore(effectiveUid)) {
      return false;
    }

    try {
      // 1. Profile (Assigned to kojiacademy2026@gmail.com)
      const prof = storage.getUserProfile();
      if (!prof.email || prof.email === 'jane.smith@example.com') {
        prof.email = 'kojiacademy2026@gmail.com';
        prof.name = 'Koji Academy';
        prof.penName = 'Koji Academy';
      }
      await setDoc(doc(db, `users/${effectiveUid}/profile/default`), cleanForFirestore(prof), { merge: true });

      // 2. Projects & ProjectData (all 5 fantasy sample books and user books)
      const projs = storage.getProjects();
      for (const p of projs) {
        const pWithUser = cleanForFirestore({ ...p, userId: effectiveUid });
        await setDoc(doc(db, `users/${effectiveUid}/projects/${p.id}`), pWithUser, { merge: true });
        
        const pData = storage.getProjectData(p.id);
        if (pData) {
          const pdWithUser = cleanForFirestore({ ...pData, userId: effectiveUid, id: p.id });
          await setDoc(doc(db, `users/${effectiveUid}/projectData/${p.id}`), pdWithUser, { merge: true });
        }
      }

      // 3. Tasks
      const ts = storage.getTasks();
      for (const t of ts) {
        const tWithUser = cleanForFirestore({ ...t, userId: effectiveUid });
        await setDoc(doc(db, `users/${effectiveUid}/tasks/${t.id}`), tWithUser, { merge: true });
      }

      // 4. Timeline Settings
      const tl = storage.getTimelineSettings();
      await setDoc(doc(db, `users/${effectiveUid}/settings/timeline`), cleanForFirestore(tl), { merge: true });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('novelist-cloud-synced', { 
          detail: { success: true, timestamp: Date.now(), userId: effectiveUid, email: prof.email } 
        }));
      }

      return true;
    } catch (e) {
      console.warn("Could not sync all to cloud directly", e);
      handleFirestoreError(e, OperationType.WRITE, `users/${effectiveUid}`);
      return false;
    }
  },

  initAutoSync: () => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          storage.setCurrentUserId(user.uid);
          await storage.syncAllLocalDataToCloud(user.uid);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            if (cred.user) {
              storage.setCurrentUserId(cred.user.uid);
              await storage.syncAllLocalDataToCloud(cred.user.uid);
            }
          } catch (err) {
            console.warn('Anonymous sign-in on auto-sync skipped:', err);
          }
        }
      });
    } catch (err) {
      console.warn('Init auto-sync listener error:', err);
    }
  },

  syncFromCloud: async (userId: string) => {
    if (!userId || userId === 'null') return;
    currentUserId = userId;
    if (!canSyncWithFirestore(userId)) {
      return;
    }

    try {
      // Load Profile
      try {
        const profileDoc = await getDoc(doc(db, `users/${userId}/profile/default`));
        if (profileDoc.exists()) {
          cachedProfile = profileDoc.data() as UserProfile;
          safeLocalStorageSet(PROFILE_KEY, JSON.stringify(cachedProfile));
        } else {
          cachedProfile = cachedProfile || defaultProfile;
          await setDoc(doc(db, `users/${userId}/profile/default`), cachedProfile);
        }
      } catch(e) { handleFirestoreError(e, OperationType.GET, `users/${userId}/profile/default`); }

      // Load Timeline Settings
      try {
        const tlDoc = await getDoc(doc(db, `users/${userId}/settings/timeline`));
        if (tlDoc.exists()) {
          const cloudTl = tlDoc.data() as AuthorTimelineSettings;
          safeLocalStorageSet(TIMELINE_SETTINGS_KEY, JSON.stringify(cloudTl));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('novelist-timeline-updated', { detail: cloudTl }));
          }
        }
      } catch(e) { handleFirestoreError(e, OperationType.GET, `users/${userId}/settings/timeline`); }

      // Load Projects with Full Bidirectional Merge
      try {
        const projSnapshot = await getDocs(collection(db, `users/${userId}/projects`));
        const cloudProjectsMap = new Map<string, ProjectMeta>();
        projSnapshot.docs.forEach(d => {
          cloudProjectsMap.set(d.id, { ...d.data(), id: d.id } as ProjectMeta);
        });

        // Current local projects
        const localProjects = cachedProjects || [];
        const mergedProjectsMap = new Map<string, ProjectMeta>(cloudProjectsMap);

        // Merge local projects into cloud projects map
        for (const localP of localProjects) {
          if (!mergedProjectsMap.has(localP.id)) {
            // Local project that was created locally/offline -> upload to Cloud Firestore
            mergedProjectsMap.set(localP.id, { ...localP, userId });
            await setDoc(doc(db, `users/${userId}/projects/${localP.id}`), { ...localP, userId }, { merge: true });
            const pData = storage.getProjectData(localP.id);
            if (pData) {
              await setDoc(doc(db, `users/${userId}/projectData/${localP.id}`), { ...pData, userId, id: localP.id }, { merge: true });
            }
          } else {
            // Both cloud and local have this project: keep the one with newer lastModified
            const cloudP = mergedProjectsMap.get(localP.id)!;
            if ((localP.lastModified || 0) > (cloudP.lastModified || 0)) {
              mergedProjectsMap.set(localP.id, { ...localP, userId });
              await setDoc(doc(db, `users/${userId}/projects/${localP.id}`), { ...localP, userId }, { merge: true });
              const pData = storage.getProjectData(localP.id);
              if (pData) {
                await setDoc(doc(db, `users/${userId}/projectData/${localP.id}`), { ...pData, userId, id: localP.id }, { merge: true });
              }
            }
          }
        }

        cachedProjects = Array.from(mergedProjectsMap.values()).sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
        safeLocalStorageSet(PROJECTS_KEY, JSON.stringify(cachedProjects));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('novelist-storage-updated', { detail: {} }));
        }
      } catch(e) { handleFirestoreError(e, OperationType.LIST, `users/${userId}/projects`); }

      // Load Tasks with Bidirectional Merge
      try {
        const taskSnapshot = await getDocs(collection(db, `users/${userId}/tasks`));
        const taskMap = new Map<string, StudioTask>();
        taskSnapshot.docs.forEach(d => {
          taskMap.set(d.id, { ...d.data(), id: d.id } as StudioTask);
        });

        (cachedTasks || []).forEach(t => {
          if (!taskMap.has(t.id)) {
            taskMap.set(t.id, { ...t, userId });
            setDoc(doc(db, `users/${userId}/tasks/${t.id}`), { ...t, userId }, { merge: true }).catch(() => {});
          }
        });

        cachedTasks = Array.from(taskMap.values());
        safeLocalStorageSet(TASKS_KEY, JSON.stringify(cachedTasks));
      } catch(e) { handleFirestoreError(e, OperationType.LIST, `users/${userId}/tasks`); }

      // Load all Project Data with Bidirectional Merge
      try {
        const pdSnapshot = await getDocs(collection(db, `users/${userId}/projectData`));
        pdSnapshot.docs.forEach(d => {
          const cloudPData = d.data() as ProjectData;
          const localPData = storage.getProjectData(d.id);
          if (!localPData) {
            cachedProjectData[d.id] = cloudPData;
            safeLocalStorageSet(PROJECT_DATA_PREFIX + d.id, JSON.stringify(cloudPData));
          } else {
            // Keep merged
            cachedProjectData[d.id] = { ...cloudPData, ...localPData };
            safeLocalStorageSet(PROJECT_DATA_PREFIX + d.id, JSON.stringify(cachedProjectData[d.id]));
          }
        });

        // Upload any local project data not yet in cloud
        for (const p of (cachedProjects || [])) {
          const localPData = storage.getProjectData(p.id);
          if (localPData && !pdSnapshot.docs.some(d => d.id === p.id)) {
            await setDoc(doc(db, `users/${userId}/projectData/${p.id}`), { ...localPData, userId, id: p.id }, { merge: true });
          }
        }
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
    
    safeLocalStorageSet(TASKS_KEY, JSON.stringify(cachedTasks));
    if (canSyncWithFirestore()) {
      setDoc(doc(db, `users/${currentUserId}/tasks/${task.id}`), task)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/tasks/${task.id}`));
    }
  },

  deleteTask: (taskId: string) => {
    cachedTasks = cachedTasks.filter((t) => t.id !== taskId);
    safeLocalStorageSet(TASKS_KEY, JSON.stringify(cachedTasks));
    if (canSyncWithFirestore()) {
      deleteDoc(doc(db, `users/${currentUserId}/tasks/${taskId}`))
        .catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${currentUserId}/tasks/${taskId}`));
    }
  },

  saveAllTasks: (tasks: StudioTask[]) => {
    cachedTasks = tasks;
    safeLocalStorageSet(TASKS_KEY, JSON.stringify(cachedTasks));
    if (canSyncWithFirestore()) {
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
    // Sanitize any large base64 cover to protect quota
    const sanitizedProject = { ...project };
    if (sanitizedProject.coverUrl && sanitizedProject.coverUrl.startsWith('data:') && sanitizedProject.coverUrl.length > 80000) {
      sanitizedProject.coverUrl = "https://res.cloudinary.com/mekoxs1q/image/upload/v1788788313/7e1e3f9e-023d-4556-a04c-e0d633ba4cea_rcjcwh.png";
    }

    const existingIndex = cachedProjects.findIndex(p => p.id === sanitizedProject.id);
    if (existingIndex >= 0) {
      cachedProjects[existingIndex] = sanitizedProject;
    } else {
      cachedProjects.push(sanitizedProject);
    }
    
    safeLocalStorageSet(PROJECTS_KEY, JSON.stringify(cachedProjects));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novelist-storage-updated', { detail: { projectId: sanitizedProject.id } }));
    }
    if (canSyncWithFirestore()) {
      sanitizedProject.userId = currentUserId!;
      setDoc(doc(db, `users/${currentUserId}/projects/${sanitizedProject.id}`), sanitizedProject)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/projects/${sanitizedProject.id}`));
    }
  },

  updateProject: (id: string, updates: Partial<ProjectMeta>) => {
    const existingIndex = cachedProjects.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.coverUrl && sanitizedUpdates.coverUrl.startsWith('data:') && sanitizedUpdates.coverUrl.length > 80000) {
        sanitizedUpdates.coverUrl = "https://res.cloudinary.com/mekoxs1q/image/upload/v1788788313/7e1e3f9e-023d-4556-a04c-e0d633ba4cea_rcjcwh.png";
      }
      cachedProjects[existingIndex] = { ...cachedProjects[existingIndex], ...sanitizedUpdates };
      safeLocalStorageSet(PROJECTS_KEY, JSON.stringify(cachedProjects));
      if (canSyncWithFirestore()) {
        setDoc(doc(db, `users/${currentUserId}/projects/${id}`), cachedProjects[existingIndex], { merge: true })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/projects/${id}`));
      }
    }
  },

  deleteProject: (id: string) => {
    cachedProjects = cachedProjects.filter(p => p.id !== id);
    delete cachedProjectData[id];
    safeLocalStorageSet(PROJECTS_KEY, JSON.stringify(cachedProjects));
    try {
      localStorage.removeItem(PROJECT_DATA_PREFIX + id);
    } catch {}
    if (canSyncWithFirestore()) {
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
    safeLocalStorageSet(PROJECT_DATA_PREFIX + id, JSON.stringify(newData));
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

    if (canSyncWithFirestore()) {
      newData.userId = currentUserId!;
      newData.id = id;
      setDoc(doc(db, `users/${currentUserId}/projectData/${id}`), newData)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/projectData/${id}`));
    }
  },

  getUserProfile: (): UserProfile => {
    if (cachedProfile && (cachedProfile.email === 'jane.smith@example.com' || !cachedProfile.email)) {
      cachedProfile = {
        ...cachedProfile,
        name: "Koji Academy",
        penName: "Koji Academy",
        email: "kojiacademy2026@gmail.com"
      };
      safeLocalStorageSet(PROFILE_KEY, JSON.stringify(cachedProfile));
    }
    return cachedProfile || defaultProfile;
  },

  saveUserProfile: (profile: Partial<UserProfile>): UserProfile => {
    const current = cachedProfile || defaultProfile;
    const updated = { ...current, ...profile };
    cachedProfile = updated;
    safeLocalStorageSet(PROFILE_KEY, JSON.stringify(updated));
    if (canSyncWithFirestore()) {
      setDoc(doc(db, `users/${currentUserId}/profile/default`), updated)
        .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/profile/default`));
    }
    return updated;
  },

  getTimelineSettings: (): AuthorTimelineSettings => {
    try {
      const stored = localStorage.getItem(TIMELINE_SETTINGS_KEY);
      return stored ? { ...defaultTimelineSettings, ...JSON.parse(stored) } : defaultTimelineSettings;
    } catch {
      return defaultTimelineSettings;
    }
  },

  saveTimelineSettings: (settings: Partial<AuthorTimelineSettings>): AuthorTimelineSettings => {
    const current = storage.getTimelineSettings();
    const updated = { ...current, ...settings };
    try {
      safeLocalStorageSet(TIMELINE_SETTINGS_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('novelist-timeline-updated', { detail: updated }));
      }
      if (canSyncWithFirestore()) {
        setDoc(doc(db, `users/${currentUserId}/settings/timeline`), updated, { merge: true })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUserId}/settings/timeline`));
      }
    } catch (e) {
      console.error("Error saving timeline settings", e);
    }
    return updated;
  },

  calculateTimelineStreak: (projects: ProjectMeta[]): number => {
    const today = new Date().toISOString().slice(0, 10);
    const dateSet = new Set<string>();
    dateSet.add(today);

    (projects || []).forEach(p => {
      if (p.lastModified) {
        try {
          const d = new Date(p.lastModified).toISOString().slice(0, 10);
          dateSet.add(d);
        } catch { /* ignore */ }
      }
    });

    const settings = storage.getTimelineSettings();
    if (settings.activeDates) {
      settings.activeDates.forEach(d => dateSet.add(d));
    }

    const sortedDates = Array.from(dateSet).sort().reverse();
    if (sortedDates.length === 0) return 1;

    let streak = 0;
    const checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (dateSet.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no activity yet, check if yesterday was active
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().slice(0, 10);
          if (dateSet.has(yesterdayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return Math.max(1, streak);
  }
};

