import React, { ReactNode, useState, useEffect, useRef, useMemo } from "react";
import { Maximize2, Plus, MoreVertical, FileText, Settings, RefreshCw, Copy, X, ListTree, ChevronDown, ChevronRight, ChevronLeft, Check, Focus, AlignLeft, Type, Target, Clock, MessageSquare, BookOpen, PanelRight, Users, MapPin, StickyNote, Search, ExternalLink, Tag, AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ManuscriptItem } from "@/mockData";
import MentionEditor from "@/components/MentionEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage, ProjectData } from "@/lib/storage";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import AIPromptModal from "@/components/AIPromptModal";
import UpgradeModal from "@/components/UpgradeModal";
import { PLAN_LIMITS } from "@/lib/license";

// Helper functions for manuscript tree
const findFirstSceneId = (items: ManuscriptItem[]): string => {
  for (const item of items) {
    if (item.type === 'scene') return item.id;
    if (item.children) {
      const found = findFirstSceneId(item.children);
      if (found) return found;
    }
  }
  return 'scene-1';
};

const findNodeById = (items: ManuscriptItem[], id: string): ManuscriptItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNodeById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findSceneContent = (items: ManuscriptItem[], sceneId: string): string => {
  for (const item of items) {
    if (item.id === sceneId) return item.content || '';
    if (item.children) {
      const found = findSceneContent(item.children, sceneId);
      if (found !== '') return found;
    }
  }
  return '';
};

export default function WritingStudio() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chars' | 'locs' | 'notes'>('chars');
  const [selectedEntity, setSelectedEntity] = useState<{id: string, type: string} | null>(null);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isManuscriptOpen, setIsManuscriptOpen] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // License check for OTO2 AI Ghostwriter
  const userProfile = storage.getUserProfile();
  const currentPlan = userProfile?.plan || 'free';
  const hasAiGhostwriter = PLAN_LIMITS[currentPlan]?.hasAiGhostwriterHub ?? false;

  const handleOpenAiPromptHub = () => {
    if (!hasAiGhostwriter) {
      setShowUpgradeModal(true);
    } else {
      setIsAIPromptModalOpen(true);
    }
  };
  
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sceneParam = searchParams.get('scene');
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'notes') {
      setActiveTab('notes');
      setIsContextOpen(true);
    }
  }, [tabParam]);

  // Keyboard shortcut for Global Search: Ctrl+Shift+F or Cmd+Shift+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [projectMeta, setProjectMeta] = useState<any>(() => {
    if (projectId) {
      const projects = storage.getProjects();
      return projects.find(p => p.id === projectId) || null;
    }
    return null;
  });

  // Entities & Notes state with synchronous lazy initialization
  const [characters, setCharacters] = useState<any[]>(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data?.characters && data.characters.length > 0) return data.characters;
    }
    return [];
  });

  const [locations, setLocations] = useState<any[]>(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data?.locations && data.locations.length > 0) return data.locations;
    }
    return [];
  });

  const [sceneNotes, setSceneNotes] = useState<Record<string, string>>(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data?.notes) return data.notes;
    }
    return {};
  });

  const [scratchpad, setScratchpad] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);
  const [copiedEntityName, setCopiedEntityName] = useState<string | null>(null);
  const noteSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Manuscript state with synchronous lazy initialization
  const [manuscript, setManuscript] = useState<ManuscriptItem[]>(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data?.manuscript && data.manuscript.length > 0) {
        return data.manuscript;
      }
    }
    return [];
  });

  // Active scene and content initialized with support for sceneParam or lastActiveSceneId
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    const data = projectId ? storage.getProjectData(projectId) : null;
    const initManuscript = data?.manuscript && data.manuscript.length > 0 
      ? data.manuscript 
      : [];
    
    if (sceneParam && findNodeById(initManuscript, sceneParam)) {
      return sceneParam;
    }
    if (data?.lastActiveSceneId && findNodeById(initManuscript, data.lastActiveSceneId)) {
      return data.lastActiveSceneId;
    }
    return findFirstSceneId(initManuscript);
  });

  const [activeContent, setActiveContent] = useState<string>(() => {
    const data = projectId ? storage.getProjectData(projectId) : null;
    const initManuscript = data?.manuscript && data.manuscript.length > 0 
      ? data.manuscript 
      : [];
    
    let targetId = findFirstSceneId(initManuscript);
    if (sceneParam && findNodeById(initManuscript, sceneParam)) {
      targetId = sceneParam;
    } else if (data?.lastActiveSceneId && findNodeById(initManuscript, data.lastActiveSceneId)) {
      targetId = data.lastActiveSceneId;
    }
    return findSceneContent(initManuscript, targetId);
  });

  // Keep in sync if projectId changes in route
  useEffect(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data) {
        const loadedManuscript = data.manuscript && data.manuscript.length > 0 ? data.manuscript : [];
        setManuscript(loadedManuscript);
        
        let target = activeDocId;
        if (sceneParam && findNodeById(loadedManuscript, sceneParam)) {
          target = sceneParam;
        } else if (data.lastActiveSceneId && findNodeById(loadedManuscript, data.lastActiveSceneId)) {
          target = data.lastActiveSceneId;
        } else if (!findNodeById(loadedManuscript, target)) {
          target = findFirstSceneId(loadedManuscript);
        }

        setActiveDocId(target);
        setActiveContent(findSceneContent(loadedManuscript, target));

        setCharacters(data.characters && data.characters.length > 0 ? data.characters : []);
        setLocations(data.locations && data.locations.length > 0 ? data.locations : []);
        setSceneNotes(data.notes || {});

        const projects = storage.getProjects();
        setProjectMeta(projects.find(p => p.id === projectId) || null);
      }
    }
  }, [projectId]);

  // Persist last active scene for Resume Drafting in Dashboard
  useEffect(() => {
    if (projectId && activeDocId && manuscript.length > 0) {
      const activeNode = findNodeById(manuscript, activeDocId);
      if (activeNode && activeNode.type === 'scene') {
        storage.saveProjectData(projectId, {
          lastActiveSceneId: activeDocId,
          lastActiveSceneTitle: activeNode.title,
        });
      }
    }
  }, [projectId, activeDocId, manuscript]);

  // React to URL sceneParam changes
  useEffect(() => {
    if (sceneParam && sceneParam !== activeDocId && manuscript.length > 0) {
      const node = findNodeById(manuscript, sceneParam);
      if (node) {
        setActiveDocId(sceneParam);
        setActiveContent(findSceneContent(manuscript, sceneParam));
      }
    }
  }, [sceneParam, manuscript]);
  

  const [isSaving, setIsSaving] = useState(false);

  // Binder State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['part-1', 'chap-1', 'part-2', 'chap-4', 'chap-5']));
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [addMenuOpen, setAddMenuOpen] = useState(false);


  // Typography Settings
  const [fontSize, setFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg');
  const [fontFamily, setFontFamily] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-serif');
  const [showTypeSettings, setShowTypeSettings] = useState(false);

  // Stats (Active Scene)
  const plainText = activeContent.replace(/<[^>]*>?/gm, ' ');
  const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 wpm
  
  // Stats (Project Total)
  const getTotalWords = (items: ManuscriptItem[]): number => {
    let total = 0;
    for (const item of items) {
       if (item.type === 'scene' && item.content) {
         const plainText = item.content.replace(/<[^>]*>?/gm, ' ');
         total += plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
       }
       if (item.children) total += getTotalWords(item.children);
    }
    return total;
  };
  const totalProjectWords = getTotalWords(manuscript);
  
  const currentProjectMeta = projectId ? storage.getProjects().find(p => p.id === projectId) : null;
  const targetWords = currentProjectMeta?.wordGoal || 50000;
  const progressPercent = Math.min(100, Math.round((totalProjectWords / targetWords) * 100));

  // Save timeout and pending content refs for instant persistence
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingContentRef = useRef<{ docId: string; content: string } | null>(null);

  const flushSave = () => {
    if (!pendingContentRef.current || !projectId) return;
    const { docId, content } = pendingContentRef.current;
    pendingContentRef.current = null;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    setManuscript(prev => {
      const updateNode = (items: ManuscriptItem[]): ManuscriptItem[] => {
        return items.map(item => {
          if (item.id === docId) {
            return { ...item, content };
          }
          if (item.children) {
            return { ...item, children: updateNode(item.children) };
          }
          return item;
        });
      };
      const updated = updateNode(prev);
      storage.saveProjectData(projectId, { manuscript: updated });
      return updated;
    });
    setIsSaving(false);
  };

  useEffect(() => {
    // Flush any pending unsaved text before loading new scene
    flushSave();
    const content = findSceneContent(manuscript, activeDocId);
    setActiveContent(content);
  }, [activeDocId]);

  // Flush on unmount (e.g., navigating to Dashboard or other tabs)
  useEffect(() => {
    return () => {
      flushSave();
    };
  }, [projectId]);

  const handleEntityClick = (entityId: string, entityType: 'character' | 'location') => {
    setSelectedEntity({ id: entityId, type: entityType });
    setActiveTab(entityType === 'character' ? 'chars' : 'locs');
    if (!isContextOpen) setIsContextOpen(true);
    
    // Auto-scroll to entity
    setTimeout(() => {
      const el = document.getElementById(`entity-${entityId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleNoteChange = (newNoteText: string) => {
    setSceneNotes(prev => {
      const updated = { ...prev, [activeDocId]: newNoteText };
      if (noteSaveTimeoutRef.current) clearTimeout(noteSaveTimeoutRef.current);
      noteSaveTimeoutRef.current = setTimeout(() => {
        if (projectId) {
          storage.saveProjectData(projectId, { notes: updated });
        }
      }, 600);
      return updated;
    });
  };

  const getEntityMentionCount = (name: string) => {
    if (!activeContent || !name) return 0;
    try {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`@${escaped}|data-label="${escaped}"|\\b${escaped}\\b`, 'gi');
      const matches = activeContent.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  };

  const handleCopyEntityTag = (name: string) => {
    navigator.clipboard.writeText(`@${name}`);
    setCopiedEntityName(name);
    setTimeout(() => setCopiedEntityName(null), 1800);
  };

  const handleContentChange = (newHtml: string) => {
    setActiveContent(newHtml);
    setIsSaving(true);
    pendingContentRef.current = { docId: activeDocId, content: newHtml };
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      flushSave();
    }, 800);
  };


  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedNodeId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedNodeId || draggedNodeId === targetId) return;

    const newManuscript = JSON.parse(JSON.stringify(manuscript));
    
    // Find and remove source
    let draggedNode = null;
    const removeNode = (items: ManuscriptItem[]) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === draggedNodeId) {
          draggedNode = items.splice(i, 1)[0];
          return true;
        }
        if (items[i].children && removeNode(items[i].children!)) return true;
      }
      return false;
    };
    removeNode(newManuscript);

    if (!draggedNode) return;

    // Insert at target
    const insertNode = (items: ManuscriptItem[]) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === targetId) {
          // If dropping on a folder, insert inside it
          if (items[i].type === 'part' || items[i].type === 'chapter') {
            if (!items[i].children) items[i].children = [];
            items[i].children!.push(draggedNode!);
            setExpandedNodes(prev => new Set(prev).add(targetId));
          } else {
            // Drop on a scene, insert after it
            items.splice(i + 1, 0, draggedNode!);
          }
          return true;
        }
        if (items[i].children && insertNode(items[i].children!)) return true;
      }
      return false;
    };
    
    if (!insertNode(newManuscript)) {
       // fallback if target not found (shouldn't happen), just push to root
       newManuscript.push(draggedNode);
    }

    setManuscript(newManuscript); if (projectId) storage.saveProjectData(projectId, { manuscript: newManuscript });
    setDraggedNodeId(null);
  };

  const handleAction = (action: string, item: ManuscriptItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuOpenId(null);
    const newManuscript = JSON.parse(JSON.stringify(manuscript));

    const findParentArray = (items: ManuscriptItem[], id: string): ManuscriptItem[] | null => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) return items;
        if (items[i].children) {
          const res = findParentArray(items[i].children!, id);
          if (res) return res;
        }
      }
      return null;
    };

    if (action === 'rename') {
      setEditingNodeId(item.id);
      setEditingTitle(item.title);
      return;
    }

    if (action === 'delete') {
      setContextMenuOpenId(null);
      setItemToDelete(item);
      return;
    }

    if (action === 'duplicate' || action === 'add_scene_below') {
       const parentArr = findParentArray(newManuscript, item.id);
       if (parentArr) {
          const idx = parentArr.findIndex(x => x.id === item.id);
          if (idx > -1) {
             const newId = (action === 'duplicate' ? item.type : 'scene') + '-' + Date.now();
             const newItem: ManuscriptItem = action === 'duplicate' 
                ? JSON.parse(JSON.stringify({ ...item, id: newId, title: item.title + ' (Copy)' }))
                : { id: newId, type: 'scene', title: 'New Scene', content: '' };
             
             parentArr.splice(idx + 1, 0, newItem);
             setManuscript(newManuscript); if (projectId) storage.saveProjectData(projectId, { manuscript: newManuscript });
             if (action === 'add_scene_below') {
                setActiveDocId(newId);
                setEditingNodeId(newId);
                setEditingTitle('New Scene');
             }
          }
       }
       return;
    }
  };

  const saveRename = () => {
    if (!editingNodeId) return;
    const newManuscript = JSON.parse(JSON.stringify(manuscript));
    
    const updateTitle = (items: ManuscriptItem[]) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === editingNodeId) {
          items[i].title = editingTitle || 'Untitled';
          return true;
        }
        if (items[i].children && updateTitle(items[i].children!)) return true;
      }
      return false;
    };
    updateTitle(newManuscript);
    setManuscript(newManuscript); if (projectId) storage.saveProjectData(projectId, { manuscript: newManuscript });
    setEditingNodeId(null);
  };

  // State for Create Item Modal
  const [createModal, setCreateModal] = useState<{
    isOpen: boolean;
    type: 'part' | 'chapter' | 'scene';
    parentId?: string;
  } | null>(null);
  const [createTitle, setCreateTitle] = useState('');
  const [createParentId, setCreateParentId] = useState<string>('');

  // State for Delete Confirmation Modal
  const [itemToDelete, setItemToDelete] = useState<ManuscriptItem | null>(null);

  // Helper to extract parts
  const availableParts = useMemo(() => {
    return manuscript.filter(m => m.type === 'part').map(p => ({ id: p.id, title: p.title }));
  }, [manuscript]);

  // Helper to extract chapters
  const availableChapters = useMemo(() => {
    const list: { id: string; title: string; partTitle?: string }[] = [];
    for (const item of manuscript) {
      if (item.type === 'chapter') {
        list.push({ id: item.id, title: item.title });
      } else if (item.type === 'part' && item.children) {
        for (const child of item.children) {
          if (child.type === 'chapter') {
            list.push({ id: child.id, title: child.title, partTitle: item.title });
          }
        }
      }
    }
    return list;
  }, [manuscript]);

  const openCreateModal = (type: 'part' | 'chapter' | 'scene', parentId?: string) => {
    setAddMenuOpen(false);
    let initialParent = parentId || '';
    if (!initialParent) {
      if (type === 'chapter' && availableParts.length > 0) {
        initialParent = availableParts[0].id;
      } else if (type === 'scene' && availableChapters.length > 0) {
        const currentChapter = availableChapters.find(c => {
          const chapNode = findNodeById(manuscript, c.id);
          return chapNode?.children?.some(s => s.id === activeDocId);
        });
        initialParent = currentChapter ? currentChapter.id : availableChapters[0].id;
      }
    }
    setCreateParentId(initialParent);
    setCreateTitle('');
    setCreateModal({ isOpen: true, type, parentId: initialParent });
  };

  const handleConfirmCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!createModal) return;

    const { type } = createModal;
    const newManuscript: ManuscriptItem[] = JSON.parse(JSON.stringify(manuscript));
    const newId = `${type}-${Date.now()}`;
    const defaultTitle = type === 'part'
      ? `Part ${availableParts.length + 1}`
      : type === 'chapter'
      ? `Chapter ${availableChapters.length + 1}`
      : `Scene ${Date.now().toString().slice(-4)}`;
    const title = createTitle.trim() || defaultTitle;

    const newItem: ManuscriptItem = {
      id: newId,
      type,
      title,
      ...(type !== 'scene' ? { children: [] } : { content: '<p></p>' })
    };

    if (type === 'part') {
      newManuscript.push(newItem);
      setExpandedNodes(prev => new Set(prev).add(newId));
    } else if (type === 'chapter') {
      if (createParentId) {
        const parentPart = newManuscript.find(m => m.id === createParentId);
        if (parentPart) {
          if (!parentPart.children) parentPart.children = [];
          parentPart.children.push(newItem);
          setExpandedNodes(prev => new Set(prev).add(createParentId).add(newId));
        } else {
          newManuscript.push(newItem);
          setExpandedNodes(prev => new Set(prev).add(newId));
        }
      } else {
        newManuscript.push(newItem);
        setExpandedNodes(prev => new Set(prev).add(newId));
      }
    } else if (type === 'scene') {
      let inserted = false;
      if (createParentId) {
        const insertIntoChapter = (items: ManuscriptItem[]): boolean => {
          for (const item of items) {
            if (item.id === createParentId) {
              if (!item.children) item.children = [];
              item.children.push(newItem);
              setExpandedNodes(prev => new Set(prev).add(item.id));
              return true;
            }
            if (item.children && insertIntoChapter(item.children)) return true;
          }
          return false;
        };
        inserted = insertIntoChapter(newManuscript);
      }

      if (!inserted) {
        if (newManuscript.length > 0) {
          const first = newManuscript[0];
          if (first.type === 'chapter') {
            if (!first.children) first.children = [];
            first.children.push(newItem);
          } else if (first.type === 'part' && first.children && first.children.length > 0) {
            if (!first.children[0].children) first.children[0].children = [];
            first.children[0].children.push(newItem);
          } else {
            newManuscript.push(newItem);
          }
        } else {
          const chapterId = `chapter-${Date.now()}`;
          newManuscript.push({
            id: chapterId,
            type: 'chapter',
            title: 'Chapter 1',
            children: [newItem]
          });
          setExpandedNodes(prev => new Set(prev).add(chapterId));
        }
      }
      setActiveDocId(newId);
    }

    setManuscript(newManuscript);
    if (projectId) {
      storage.saveProjectData(projectId, { manuscript: newManuscript });
    }

    setCreateModal(null);
    setCreateTitle('');
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    const newManuscript: ManuscriptItem[] = JSON.parse(JSON.stringify(manuscript));
    const findParentArray = (items: ManuscriptItem[], id: string): ManuscriptItem[] | null => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) return items;
        if (items[i].children) {
          const res = findParentArray(items[i].children!, id);
          if (res) return res;
        }
      }
      return null;
    };

    const parentArr = findParentArray(newManuscript, itemToDelete.id);
    if (parentArr) {
      const idx = parentArr.findIndex(x => x.id === itemToDelete.id);
      if (idx > -1) {
        parentArr.splice(idx, 1);
      }
      setManuscript(newManuscript);
      if (projectId) {
        storage.saveProjectData(projectId, { manuscript: newManuscript });
      }

      const isDescendantOrSelf = (node: ManuscriptItem, targetId: string): boolean => {
        if (node.id === targetId) return true;
        if (node.children) {
          return node.children.some(child => isDescendantOrSelf(child, targetId));
        }
        return false;
      };

      if (isDescendantOrSelf(itemToDelete, activeDocId)) {
        const nextScene = findFirstSceneId(newManuscript);
        setActiveDocId(nextScene || '');
      }
    }

    setItemToDelete(null);
  };




  // Exit Focus Mode on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        setIsContextOpen(true);
        setIsManuscriptOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
  

  return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const renderManuscriptTree = (items: ManuscriptItem[], level = 0) => {
    return (
      <div className="space-y-0.5">
        {items.map(item => {
          const isFolder = item.type === 'part' || item.type === 'chapter';
          const isExpanded = expandedNodes.has(item.id);
          const isEditing = editingNodeId === item.id;
          
          return (
          <div key={item.id}>
            <div 
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`group flex items-center justify-between py-1.5 px-2 rounded-sm cursor-pointer transition-colors ${activeDocId === item.id ? 'bg-[#8C503C] text-white shadow-sm' : 'hover:bg-[#E5E0D5] text-stone-600'} ${draggedNodeId === item.id ? 'opacity-50' : ''}`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => {
                if (item.type === 'scene') setActiveDocId(item.id);
                else toggleExpand(item.id, { stopPropagation: () => {} } as any);
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                {isFolder ? (
                  <div onClick={(e) => toggleExpand(item.id, e)} className="shrink-0 p-0.5 hover:bg-black/10 rounded-sm">
                    {isExpanded ? <ChevronDown className="w-3 h-3 opacity-70" /> : <ChevronRight className="w-3 h-3 opacity-70" />}
                  </div>
                ) : (
                  <FileText className="w-3 h-3 opacity-70 ml-1 shrink-0" />
                )}
                
                {isEditing ? (
                  <input 
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); }}
                    className={`text-xs w-full bg-white/20 border-b border-white/50 focus:outline-none px-1 ${isFolder ? 'font-bold uppercase tracking-widest text-[9px]' : 'font-medium'}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  isFolder && item.title.includes(':') ? (
                  <div className="flex flex-col flex-1 min-w-0 pr-1 py-1">
                    <span className="font-bold uppercase tracking-widest text-[8px] text-stone-400/80">
                      {item.title.split(':')[0]}:
                    </span>
                    <span className="font-bold uppercase tracking-widest text-[10px] text-[#4A3225] leading-tight mt-[1px]">
                      {item.title.substring(item.title.indexOf(':') + 1).trim()}
                    </span>
                  </div>
                ) : (
                  <span className={`text-xs ${isFolder ? 'font-bold uppercase tracking-widest text-[9px] whitespace-normal leading-tight py-1' : 'font-medium truncate'} flex-1`}>
                    {item.title}
                  </span>
                )
                )}
              </div>

              {/* Context Menu Button */}
              <div className="relative shrink-0 ml-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuOpenId(contextMenuOpenId === item.id ? null : item.id);
                  }}
                  className={`p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity ${contextMenuOpenId === item.id ? 'opacity-100 bg-black/10' : 'hover:bg-black/10'}`}
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
                
                {/* Dropdown */}
                {contextMenuOpenId === item.id && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E5E0D5] rounded-sm shadow-lg py-1 z-50 text-stone-700">
                    <button onClick={(e) => handleAction('rename', item, e)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] transition-colors">Rename</button>
                    {item.type === 'part' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuOpenId(null);
                          openCreateModal('chapter', item.id);
                        }} 
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] text-[#8C503C] font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" /> Add Chapter Inside
                      </button>
                    )}
                    {item.type === 'chapter' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuOpenId(null);
                          openCreateModal('scene', item.id);
                        }} 
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] text-[#8C503C] font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" /> Add Scene Inside
                      </button>
                    )}
                    <button onClick={(e) => handleAction('duplicate', item, e)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] transition-colors">Duplicate</button>
                    {!isFolder && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuOpenId(null);
                          // find parent chapter for this scene
                          const currentChapter = availableChapters.find(c => {
                            const chapNode = findNodeById(manuscript, c.id);
                            return chapNode?.children?.some(s => s.id === item.id);
                          });
                          openCreateModal('scene', currentChapter?.id);
                        }} 
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] transition-colors"
                      >
                        Add Scene Below
                      </button>
                    )}
                    <div className="h-px bg-[#E5E0D5] my-1" />
                    <button 
                      onClick={(e) => handleAction('delete', item, e)} 
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] text-red-600 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            {isFolder && isExpanded && item.children && renderManuscriptTree(item.children, level + 1)}
          </div>
        )})}
      </div>
    );
  };

  const getBreadcrumbs = (items: ManuscriptItem[], targetId: string, currentPath: ManuscriptItem[] = []): ManuscriptItem[] | null => {
    for (const item of items) {
      const path = [...currentPath, item];
      if (item.id === targetId) return path;
      if (item.children) {
        const found = getBreadcrumbs(item.children, targetId, path);
        if (found) return found;
      }
    }
    return null;
  };
  
  const breadcrumbs = getBreadcrumbs(manuscript, activeDocId) || [];
  const currentDoc = breadcrumbs[breadcrumbs.length - 1];
  const parentDoc = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F1EA]">
      {/* Left Panel: Manuscript Binder */}
      {isManuscriptOpen && !isFocusMode && (
        <div className="w-64 bg-[#FCFAF5] border-r border-[#E5E0D5] flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-10 transition-all">
          <div className="p-4 border-b border-[#E5E0D5] flex justify-between items-center bg-[#FCFAF5] shrink-0">
            <div className="flex items-center gap-2 text-[#4A3225]">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Binder</span>
            </div>
            <button onClick={() => setIsManuscriptOpen(false)} className="text-stone-400 hover:text-stone-700 hover:bg-[#E5E0D5] p-1 rounded-sm transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {manuscript.length === 0 ? (
              <div className="py-8 px-3 text-center">
                <p className="text-xs text-stone-400 mb-3">No chapters or scenes yet</p>
                <button
                  onClick={() => openCreateModal('chapter')}
                  className="px-3 py-1.5 bg-[#8C503C] hover:bg-[#733F2E] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add First Chapter
                </button>
              </div>
            ) : (
              renderManuscriptTree(manuscript)
            )}
          </div>
          <div className="p-3 border-t border-[#E5E0D5] bg-[#F9F6ED] shrink-0 relative">
            <button 
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="w-full py-1.5 border border-dashed border-[#D49A89] text-[#8C503C] rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[#8C503C] hover:text-white transition-colors flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> ADD
            </button>
            
            {addMenuOpen && (
               <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-[#E5E0D5] rounded-sm shadow-lg py-1 z-50 text-stone-700">
                  <button onClick={() => openCreateModal('scene')} className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[#8C503C]" /> New Scene</button>
                  <button onClick={() => openCreateModal('chapter')} className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-[#8C503C]" /> New Chapter</button>
                  <button onClick={() => openCreateModal('part')} className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors flex items-center gap-2"><ListTree className="w-3.5 h-3.5 text-[#8C503C]" /> New Part</button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Center: Editor Area */}
      <div className={`flex-1 flex flex-col relative transition-all duration-500 ${isFocusMode ? 'bg-[#FCFAF5]' : 'bg-[#F4F1EA]'}`}>
        {/* Editor Header */}
        <div className={`shrink-0 p-4 flex items-center justify-between transition-opacity duration-300 ${isFocusMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#FCFAF5] to-transparent pt-6' : 'border-b border-[#E5E0D5] bg-white/40 backdrop-blur-md relative z-10'}`}>
          <div className="flex items-center gap-3">
            {!isManuscriptOpen && !isFocusMode && (
              <button onClick={() => setIsManuscriptOpen(true)} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] rounded-sm transition-colors">
                <ListTree className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-[#4A3225]">
                 {parentDoc ? parentDoc.title : (currentDoc?.title || 'Untitled')}
              </h2>
              {parentDoc && currentDoc && (
                <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <span>{currentDoc.title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Formatting Toolbar Portal Target */}
            <div id="editor-toolbar-portal-target" className="flex items-center justify-center"></div>

            <div className="w-px h-5 bg-[#E5E0D5]" />

            {/* Auto-save */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 w-20 justify-end transition-opacity duration-300">
               {isSaving ? (
                  <><RefreshCw className="w-3 h-3 animate-spin text-stone-400/70" /> Saving...</>
               ) : (
                  <><Check className="w-3.5 h-3.5 text-[#5A9672]/70" /> Saved</>
               )}
            </div>
            
            {/* Typography Controls */}
            <div className="relative ml-2">
              <button 
                onClick={() => setShowTypeSettings(!showTypeSettings)}
                className={`p-1.5 rounded-sm transition-colors ${showTypeSettings ? 'bg-[#E5E0D5] text-[#4A3225]' : 'text-stone-500 hover:bg-[#E5E0D5] hover:text-[#4A3225]'}`}
                title="Typography Settings"
              >
                <Type className="w-4 h-4" />
              </button>
              
              {showTypeSettings && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E5E0D5] shadow-xl rounded-sm p-3 z-50">
                  <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase mb-2">Font Style</div>
                  <div className="flex gap-1 mb-4 bg-stone-100 p-1 rounded-sm">
                    <button onClick={() => setFontFamily('font-serif')} className={`flex-1 py-1 text-xs font-serif rounded-sm ${fontFamily === 'font-serif' ? 'bg-white shadow-sm font-bold text-[#4A3225]' : 'text-stone-500'}`}>Serif</button>
                    <button onClick={() => setFontFamily('font-sans')} className={`flex-1 py-1 text-xs font-sans rounded-sm ${fontFamily === 'font-sans' ? 'bg-white shadow-sm font-bold text-[#4A3225]' : 'text-stone-500'}`}>Sans</button>
                    <button onClick={() => setFontFamily('font-mono')} className={`flex-1 py-1 text-xs font-mono rounded-sm ${fontFamily === 'font-mono' ? 'bg-white shadow-sm font-bold text-[#4A3225]' : 'text-stone-500'}`}>Mono</button>
                  </div>
                  
                  <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase mb-2">Size</div>
                  <div className="flex justify-between items-center bg-stone-100 p-1 rounded-sm">
                    <button onClick={() => setFontSize('text-base')} className={`w-8 h-8 flex items-center justify-center text-sm rounded-sm ${fontSize === 'text-base' ? 'bg-white shadow-sm text-[#4A3225]' : 'text-stone-500'}`}>A</button>
                    <button onClick={() => setFontSize('text-lg')} className={`w-8 h-8 flex items-center justify-center text-base rounded-sm ${fontSize === 'text-lg' ? 'bg-white shadow-sm text-[#4A3225]' : 'text-stone-500'}`}>A</button>
                    <button onClick={() => setFontSize('text-xl')} className={`w-8 h-8 flex items-center justify-center text-lg rounded-sm ${fontSize === 'text-xl' ? 'bg-white shadow-sm text-[#4A3225]' : 'text-stone-500'}`}>A</button>
                    <button onClick={() => setFontSize('text-2xl')} className={`w-8 h-8 flex items-center justify-center text-xl rounded-sm ${fontSize === 'text-2xl' ? 'bg-white shadow-sm text-[#4A3225]' : 'text-stone-500'}`}>A</button>
                  </div>
                </div>
              )}
            </div>

            {/* Global Search & Replace Trigger */}
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="p-1.5 rounded-sm transition-colors text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]"
              title="Global Search & Replace (Ctrl+Shift+F)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Toggle Context Panel */}
            {!isFocusMode && (
              <button 
                onClick={() => setIsContextOpen(!isContextOpen)}
                className={`p-1.5 rounded-sm transition-colors ml-1 ${isContextOpen ? 'bg-[#E5E0D5] text-[#4A3225]' : 'text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]'}`}
                title={isContextOpen ? "Hide Sidebar (Characters, Locations, Notes)" : "Show Sidebar (Characters, Locations, Notes)"}
              >
                <PanelRight className="w-4 h-4" />
              </button>
            )}

            {/* Focus Mode Toggle */}
            <button 
              onClick={() => {
                setIsFocusMode(!isFocusMode);
                if (!isFocusMode) {
                  setIsContextOpen(false);
                  setIsManuscriptOpen(false);
                } else {
                  setIsContextOpen(true);
                  setIsManuscriptOpen(true);
                }
              }} 
              className={`p-1.5 rounded-sm transition-colors ${isFocusMode ? 'bg-[#8C503C] text-white shadow-inner' : 'text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]'}`}
              title="Focus Mode"
            >
              <Focus className="w-4 h-4" />
            </button>

            
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative z-0">
          <div className="max-w-[800px] mx-auto h-full flex flex-col px-8">
            {manuscript.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EDE8DC] flex items-center justify-center text-[#8C503C] mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#332218] mb-2">Manuscript Empty</h3>
                <p className="text-sm text-stone-500 max-w-sm mb-6">
                  Start drafting by creating your first chapter and scene in the binder.
                </p>
                <button
                  onClick={() => {
                    setCreateModal({ isOpen: true, type: 'scene', parentId: undefined });
                    setCreateTitle('Scene 1');
                  }}
                  className="px-5 py-2.5 bg-[#8C503C] hover:bg-[#703F2F] text-white text-xs font-bold tracking-wider uppercase rounded-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create First Scene
                </button>
              </div>
            ) : !activeDocId ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <p className="text-sm text-stone-500 font-serif italic">Select a scene from the left binder to begin editing.</p>
              </div>
            ) : (
              <div className={`flex-1 py-16 ${isFocusMode ? 'pb-48' : 'pb-32'}`}>
                <MentionEditor 
                  key={activeDocId}
                  initialValue={activeContent}
                  mentionItems={[...characters, ...locations]}
                  onEntityClick={handleEntityClick}
                  onChange={handleContentChange}
                  className={`${fontFamily} ${fontSize} leading-[1.8] text-[#332218]`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className={`shrink-0 h-10 border-t border-[#E5E0D5] bg-[#FCFAF5] flex items-center justify-between px-6 transition-opacity duration-300 ${isFocusMode ? 'opacity-0 hover:opacity-100 absolute bottom-0 left-0 right-0 z-50' : 'relative z-10'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-stone-500">
              <AlignLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">{wordCount} Words</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">{readingTime} min read</span>
            </div>
          </div>

          {/* Center AI Prompt Hub Button (No Star Icon) */}
          <button
            onClick={handleOpenAiPromptHub}
            className="px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#8C503C] hover:text-white bg-[#8C503C]/10 hover:bg-[#8C503C] border border-[#8C503C]/20 hover:border-[#8C503C] rounded-sm transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center gap-1.5"
            title="Open Ocean Novel AI Prompt Hub (Premium)"
          >
            <span>AI Prompt Hub</span>
            {!hasAiGhostwriter && (
              <span className="text-[8px] bg-[#8C503C] text-white px-1 py-0.2 rounded-xs font-mono font-bold">
                Premium
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-3 text-stone-500">
            <span className="text-[10px] font-bold tracking-widest uppercase">Project Goal: {progressPercent}%</span>
            <div className="w-24 h-1.5 bg-[#E5E0D5] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5A9672] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Context Panel (Characters, Locations, Notes) */}
      {isContextOpen && !isFocusMode && (
        <div className="w-80 bg-[#FCFAF5] border-l border-[#E5E0D5] flex flex-col shrink-0 h-full relative z-20 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] transition-all">
          {/* Header with Navigation Tabs and Close */}
          <div className="p-2.5 border-b border-[#E5E0D5] bg-[#FCFAF5] shrink-0 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 bg-[#EDE8DC] p-0.5 rounded-sm flex-1">
              <button
                onClick={() => { setActiveTab('chars'); setSearchQuery(''); }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'chars'
                    ? 'bg-[#8C503C] text-white shadow-sm'
                    : 'text-[#5D3F32] hover:text-[#8C503C]'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Characters</span>
              </button>
              <button
                onClick={() => { setActiveTab('locs'); setSearchQuery(''); }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'locs'
                    ? 'bg-[#8C503C] text-white shadow-sm'
                    : 'text-[#5D3F32] hover:text-[#8C503C]'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Locations</span>
              </button>
              <button
                onClick={() => { setActiveTab('notes'); setSearchQuery(''); }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'notes'
                    ? 'bg-[#8C503C] text-white shadow-sm'
                    : 'text-[#5D3F32] hover:text-[#8C503C]'
                }`}
              >
                <StickyNote className="w-3 h-3" />
                <span>Notes</span>
              </button>
            </div>

            <button
              onClick={() => setIsContextOpen(false)}
              className="text-stone-400 hover:text-stone-700 hover:bg-[#E5E0D5] p-1 rounded-sm transition-colors shrink-0"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar for Characters and Locations */}
          {(activeTab === 'chars' || activeTab === 'locs') && (
            <div className="p-2.5 border-b border-[#E5E0D5] bg-[#F9F6ED] shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'chars' ? "Filter characters..." : "Filter locations..."}
                  className="w-full bg-white border border-[#E5E0D5] rounded-sm pl-8 pr-7 py-1 text-xs text-[#4A3225] font-serif placeholder:text-stone-400 focus:outline-none focus:border-[#8C503C]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 1: CHARACTERS */}
          {activeTab === 'chars' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
                {characters
                  .filter((c) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      (c.name && c.name.toLowerCase().includes(query)) ||
                      (c.role && c.role.toLowerCase().includes(query)) ||
                      (c.description && c.description.toLowerCase().includes(query)) ||
                      (c.traits && Array.isArray(c.traits) && c.traits.some((t: string) => t.toLowerCase().includes(query)))
                    );
                  })
                  .map((char, cIdx) => {
                    const isExpanded = expandedEntityId === `char-${char.id}` || selectedEntity?.id === String(char.id);
                    const mentionCount = getEntityMentionCount(char.name);

                    return (
                      <div
                        key={`studio-char-${char.id || cIdx}`}
                        id={`entity-${char.id}`}
                        className={`border rounded-sm transition-all overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
                          isExpanded ? 'border-[#8C503C] ring-1 ring-[#8C503C]/20' : 'border-[#E5E0D5] hover:border-[#D49A89]'
                        }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => setExpandedEntityId(isExpanded ? null : `char-${char.id}`)}
                          className="p-2.5 flex items-start justify-between gap-2 cursor-pointer select-none hover:bg-[#F9F6ED]/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {char.imageUrl ? (
                              <img
                                src={char.imageUrl}
                                alt={char.name}
                                className="w-8 h-8 rounded-sm object-cover shrink-0 border border-[#E5E0D5]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-sm bg-[#8C503C]/10 text-[#8C503C] border border-[#8C503C]/20 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                                {char.name ? char.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-serif text-xs font-bold text-[#4A3225] truncate">
                                  {char.name}
                                </h4>
                                {mentionCount > 0 && (
                                  <span className="bg-[#8C503C]/10 text-[#8C503C] text-[8px] font-bold px-1 rounded-sm font-mono shrink-0">
                                    {mentionCount} {mentionCount === 1 ? 'mention' : 'mentions'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-500 font-sans truncate">
                                {char.role || 'Character'} {char.age ? `• ${char.age} yrs` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-stone-400">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="px-2.5 pb-2.5 pt-1 border-t border-[#F4F1EA] bg-[#FCFAF5] space-y-2 text-xs">
                            {char.motivation && (
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-0.5">
                                  Motivation:
                                </span>
                                <p className="font-serif text-[#4A3225] leading-relaxed text-[11px]">
                                  {char.motivation}
                                </p>
                              </div>
                            )}

                            {(char.description || char.backstory) && (
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-0.5">
                                  Profile / Backstory:
                                </span>
                                <p className="font-serif text-stone-600 leading-relaxed text-[11px] line-clamp-4">
                                  {char.description || char.backstory}
                                </p>
                              </div>
                            )}

                            {char.traits && Array.isArray(char.traits) && char.traits.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {char.traits.map((trait: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-[#EDE8DC] text-[#5D3F32] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                                  >
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="pt-1.5 flex items-center justify-between border-t border-[#E5E0D5]/60">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyEntityTag(char.name);
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider text-[#8C503C] hover:text-[#B8785E] flex items-center gap-1 transition-colors"
                              >
                                {copiedEntityName === char.name ? (
                                  <><Check className="w-3 h-3 text-emerald-600" /> Copied @{char.name}</>
                                ) : (
                                  <><Copy className="w-3 h-3" /> Copy @{char.name}</>
                                )}
                              </button>

                              {projectId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/project/${projectId}/characters`);
                                  }}
                                  className="text-[9px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                                >
                                  Edit <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {characters.length === 0 && (
                  <div className="text-center p-6 text-stone-400 font-serif">
                    <Users className="w-8 h-8 text-stone-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-xs font-bold text-stone-600">No characters recorded</p>
                    <p className="text-[10px] text-stone-400 mt-1">Add characters in the Story Bible to reference them here.</p>
                  </div>
                )}
              </div>

              {/* Bottom Link to Story Bible */}
              {projectId && (
                <div className="p-2 border-t border-[#E5E0D5] bg-[#F9F6ED] shrink-0 text-center">
                  <button
                    onClick={() => navigate(`/project/${projectId}/characters`)}
                    className="text-[10px] font-bold tracking-widest uppercase text-[#8C503C] hover:text-[#4A3225] flex items-center justify-center gap-1.5 w-full py-1 transition-colors"
                  >
                    <span>Manage Characters in Story Bible</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: LOCATIONS */}
          {activeTab === 'locs' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
                {locations
                  .filter((loc) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      (loc.name && loc.name.toLowerCase().includes(query)) ||
                      (loc.type && loc.type.toLowerCase().includes(query)) ||
                      (loc.description && loc.description.toLowerCase().includes(query))
                    );
                  })
                  .map((loc, lIdx) => {
                    const isExpanded = expandedEntityId === `loc-${loc.id}` || selectedEntity?.id === String(loc.id);
                    const mentionCount = getEntityMentionCount(loc.name);

                    return (
                      <div
                        key={`studio-loc-${loc.id || lIdx}`}
                        id={`entity-${loc.id}`}
                        className={`border rounded-sm transition-all overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
                          isExpanded ? 'border-[#8C503C] ring-1 ring-[#8C503C]/20' : 'border-[#E5E0D5] hover:border-[#D49A89]'
                        }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => setExpandedEntityId(isExpanded ? null : `loc-${loc.id}`)}
                          className="p-2.5 flex items-start justify-between gap-2 cursor-pointer select-none hover:bg-[#F9F6ED]/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {loc.imageUrl ? (
                              <img
                                src={loc.imageUrl}
                                alt={loc.name}
                                className="w-8 h-8 rounded-sm object-cover shrink-0 border border-[#E5E0D5]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-sm bg-[#8C503C]/10 text-[#8C503C] border border-[#8C503C]/20 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-serif text-xs font-bold text-[#4A3225] truncate">
                                  {loc.name}
                                </h4>
                                {mentionCount > 0 && (
                                  <span className="bg-[#8C503C]/10 text-[#8C503C] text-[8px] font-bold px-1 rounded-sm font-mono shrink-0">
                                    {mentionCount} {mentionCount === 1 ? 'mention' : 'mentions'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-500 font-sans truncate">
                                {loc.type || 'Setting'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-stone-400">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="px-2.5 pb-2.5 pt-1 border-t border-[#F4F1EA] bg-[#FCFAF5] space-y-2 text-xs">
                            {loc.imageUrl && (
                              <div className="rounded-sm overflow-hidden border border-[#E5E0D5] my-1">
                                <img src={loc.imageUrl} alt={loc.name} className="w-full h-24 object-cover" />
                              </div>
                            )}

                            {loc.description && (
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-0.5">
                                  Atmosphere & Details:
                                </span>
                                <p className="font-serif text-stone-600 leading-relaxed text-[11px]">
                                  {loc.description}
                                </p>
                              </div>
                            )}

                            <div className="pt-1.5 flex items-center justify-between border-t border-[#E5E0D5]/60">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyEntityTag(loc.name);
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider text-[#8C503C] hover:text-[#B8785E] flex items-center gap-1 transition-colors"
                              >
                                {copiedEntityName === loc.name ? (
                                  <><Check className="w-3 h-3 text-emerald-600" /> Copied @{loc.name}</>
                                ) : (
                                  <><Copy className="w-3 h-3" /> Copy @{loc.name}</>
                                )}
                              </button>

                              {projectId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/project/${projectId}/locations`);
                                  }}
                                  className="text-[9px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                                >
                                  Edit <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {locations.length === 0 && (
                  <div className="text-center p-6 text-stone-400 font-serif">
                    <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-xs font-bold text-stone-600">No locations recorded</p>
                    <p className="text-[10px] text-stone-400 mt-1">Add locations in Story Bible to reference them here.</p>
                  </div>
                )}
              </div>

              {/* Bottom Link to Story Bible */}
              {projectId && (
                <div className="p-2 border-t border-[#E5E0D5] bg-[#F9F6ED] shrink-0 text-center">
                  <button
                    onClick={() => navigate(`/project/${projectId}/locations`)}
                    className="text-[10px] font-bold tracking-widest uppercase text-[#8C503C] hover:text-[#4A3225] flex items-center justify-center gap-1.5 w-full py-1 transition-colors"
                  >
                    <span>Manage Locations in Story Bible</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 3: NOTES */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto custom-scrollbar">
              {/* Active Scene Note Box */}
              <div className="bg-white border border-[#E5E0D5] rounded-sm p-3 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA] mb-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#8C503C]">
                      Scene Scratchpad
                    </span>
                    <h4 className="font-serif text-xs font-bold text-[#4A3225] truncate max-w-[180px]">
                      {currentDoc?.title || 'Current Scene'}
                    </h4>
                  </div>
                  <span className="text-[9px] text-stone-400 italic">
                    Auto-saved
                  </span>
                </div>

                <textarea
                  value={sceneNotes[activeDocId] || ''}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Record sensory details, motives, secrets to reveal, dialogue cues, or revisions for this specific scene..."
                  rows={8}
                  className="w-full bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm p-2.5 text-xs text-[#332218] font-serif leading-relaxed placeholder:text-stone-400 focus:outline-none focus:border-[#8C503C] resize-none"
                />
              </div>

              {/* Crafting Prompts / Checkpoints */}
              <div className="bg-[#F9F6ED] border border-[#E5E0D5] rounded-sm p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#5D3F32] block">
                    Scene Focus Checkpoints
                  </span>
                  <button
                    onClick={handleOpenAiPromptHub}
                    className="text-[10px] text-[#8C503C] hover:underline font-bold"
                  >
                    Generate AI Prompt
                  </button>
                </div>
                <ul className="space-y-1.5 text-[11px] font-serif text-stone-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#8C503C] font-bold">•</span>
                    <span>What does the viewpoint character desire right now?</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#8C503C] font-bold">•</span>
                    <span>What sensory detail roots the reader in this space?</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#8C503C] font-bold">•</span>
                    <span>What conflict or unexpected turn shifts the tension?</span>
                  </li>
                </ul>
              </div>

              {/* Global Project Scratchpad */}
              <div className="bg-white border border-[#E5E0D5] rounded-sm p-3 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#F4F1EA] mb-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">
                    General Manuscript Notes
                  </span>
                </div>
                <textarea
                  value={scratchpad}
                  onChange={(e) => setScratchpad(e.target.value)}
                  placeholder="Universal story ideas, future plot turns, questions to research..."
                  rows={4}
                  className="w-full bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm p-2 text-xs text-[#332218] font-serif leading-relaxed placeholder:text-stone-400 focus:outline-none focus:border-[#8C503C] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Search & Replace Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        projectId={projectId || "1"}
        onNavigateToScene={(sceneId) => {
          setActiveDocId(sceneId);
        }}
      />

      {/* Ocean Novel AI Prompt Hub Modal */}
      <AIPromptModal
        isOpen={isAIPromptModalOpen}
        onClose={() => setIsAIPromptModalOpen(false)}
        projectMeta={projectMeta}
        activeSceneTitle={currentDoc?.title || 'Current Scene'}
        activeSceneNotes={sceneNotes[activeDocId] || ''}
        activeSceneContent={activeContent}
        characters={(() => {
          if (projectId) {
            const data = storage.getProjectData(projectId);
            if (data?.characters && data.characters.length > 0) return data.characters;
          }
          return characters;
        })()}
        locations={locations}
      />

      {/* Create Item Modal */}
      <AnimatePresence>
        {createModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setCreateModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#FCFAF5] rounded-xl shadow-2xl border border-[#E5E0D5] overflow-hidden flex flex-col z-10"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E5E0D5] bg-white/60">
                <h2 className="text-base font-serif font-bold text-stone-800 flex items-center gap-2">
                  {createModal.type === 'part' && <ListTree className="w-5 h-5 text-[#8C503C]" />}
                  {createModal.type === 'chapter' && <BookOpen className="w-5 h-5 text-[#8C503C]" />}
                  {createModal.type === 'scene' && <FileText className="w-5 h-5 text-[#8C503C]" />}
                  Add New {createModal.type.charAt(0).toUpperCase() + createModal.type.slice(1)}
                </h2>
                <button
                  type="button"
                  onClick={() => setCreateModal(null)}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder={
                      createModal.type === 'part'
                        ? "e.g. Part I: The Silent Twilight"
                        : createModal.type === 'chapter'
                        ? "e.g. Chapter 1: Whispers in the Dark"
                        : "e.g. Scene 1: An Unexpected Encounter"
                    }
                    className="w-full bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#8C503C] transition-colors"
                  />
                </div>

                {createModal.type === 'chapter' && availableParts.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                      Place Inside Part (Optional)
                    </label>
                    <select
                      value={createParentId}
                      onChange={(e) => setCreateParentId(e.target.value)}
                      className="w-full bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-[#8C503C] transition-colors"
                    >
                      <option value="">(Root Level - No Part)</option>
                      {availableParts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {createModal.type === 'scene' && availableChapters.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                      Belongs to Chapter
                    </label>
                    <select
                      value={createParentId}
                      onChange={(e) => setCreateParentId(e.target.value)}
                      className="w-full bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-[#8C503C] transition-colors"
                    >
                      {availableChapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.partTitle ? `${c.partTitle} ➔ ${c.title}` : c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E0D5]">
                  <button
                    type="button"
                    onClick={() => setCreateModal(null)}
                    className="px-4 py-2 border border-[#E5E0D5] bg-white hover:bg-[#F4F1EA] text-stone-600 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#8C503C] hover:bg-[#733F2E] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create {createModal.type}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Item Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setItemToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#FCFAF5] rounded-xl shadow-2xl border border-[#E5E0D5] overflow-hidden flex flex-col z-10 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-serif font-bold text-stone-800">
                    Delete {itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)}
                  </h3>
                  <p className="text-sm text-stone-600 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-stone-800">"{itemToDelete.title}"</span>?
                  </p>

                  {itemToDelete.children && itemToDelete.children.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        This {itemToDelete.type} contains {itemToDelete.children.length} sub-item(s). All child chapters and scenes will also be permanently deleted.
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-stone-400 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E0D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 border border-[#E5E0D5] bg-white hover:bg-[#F4F1EA] text-stone-600 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OTO2 AI Ghostwriter Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="ai_hub"
      />
    </div>
  );
}
