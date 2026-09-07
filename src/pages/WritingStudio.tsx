import React, { ReactNode, useState, useEffect, useRef } from "react";
import { Maximize2, Plus, MoreVertical, FileText, Settings, Sparkles, Send, RefreshCw, Copy, X, ListTree, ChevronDown, ChevronRight, ChevronLeft, Check, Focus, AlignLeft, Type, Target, Clock, MessageSquare, BookOpen, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CHARACTERS, MOCK_LOCATIONS, MOCK_MANUSCRIPT, ManuscriptItem } from "@/mockData";
import MentionEditor from "@/components/MentionEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage, ProjectData } from "@/lib/storage";
import { useParams } from "react-router-dom";

export default function WritingStudio() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chars' | 'locs' | 'notes'>('chars');
  const [selectedEntity, setSelectedEntity] = useState<{id: string, type: string} | null>(null);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isManuscriptOpen, setIsManuscriptOpen] = useState(true);
  
  const { id: projectId } = useParams();

  // Manuscript state
  const [manuscript, setManuscript] = useState<ManuscriptItem[]>([]);
  
  // Load data on mount
  useEffect(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data && data.manuscript && data.manuscript.length > 0) {
        setManuscript(data.manuscript);
        
        // Find first scene to activate
        const findFirstScene = (items: ManuscriptItem[]): string | null => {
           for (const item of items) {
             if (item.type === 'scene') return item.id;
             if (item.children) {
                const found = findFirstScene(item.children);
                if (found) return found;
             }
           }
           return null;
        };
        const first = findFirstScene(data.manuscript);
        if (first) setActiveDocId(first);
      } else {
        setManuscript(MOCK_MANUSCRIPT);
      }
    }
  }, [projectId]);
  const [activeDocId, setActiveDocId] = useState<string>('scene-1');
  const [activeContent, setActiveContent] = useState<string>('');
  

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

  // Save timeout ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load content ONLY when switching active docs to avoid overwriting ongoing edits
    const findContent = (items: ManuscriptItem[]): string | null => {
      for (const item of items) {
        if (item.id === activeDocId) return item.content || '';
        if (item.children) {
          const found = findContent(item.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    
    const content = findContent(manuscript);
    setActiveContent(content || '');
  }, [activeDocId]);

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

  const handleContentChange = (newHtml: string) => {
    setActiveContent(newHtml);
    setIsSaving(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setManuscript(prev => {
        const updateNode = (items: ManuscriptItem[]): ManuscriptItem[] => {
          return items.map(item => {
            if (item.id === activeDocId) {
              return { ...item, content: newHtml };
            }
            if (item.children) {
              return { ...item, children: updateNode(item.children) };
            }
            return item;
          });
        };
        const updated = updateNode(prev);
        if (projectId) storage.saveProjectData(projectId, { manuscript: updated });
        return updated;
      });
      setIsSaving(false);
    }, 1000);
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
       if (confirm('Are you sure you want to delete this item?')) {
          const parentArr = findParentArray(newManuscript, item.id);
          if (parentArr) {
             const idx = parentArr.findIndex(x => x.id === item.id);
             if (idx > -1) parentArr.splice(idx, 1);
             setManuscript(newManuscript); if (projectId) storage.saveProjectData(projectId, { manuscript: newManuscript });
             if (activeDocId === item.id) setActiveDocId('scene-1');
          }
       }
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

  const handleAddNew = (type: 'part' | 'chapter' | 'scene') => {
    setAddMenuOpen(false);
    const newManuscript = JSON.parse(JSON.stringify(manuscript));
    const newId = type + '-' + Date.now();
    const newItem: ManuscriptItem = { 
       id: newId, 
       type, 
       title: 'New ' + type.charAt(0).toUpperCase() + type.slice(1), 
       ...(type !== 'scene' ? { children: [] } : { content: '' }) 
    };

    if (type === 'part') {
       newManuscript.push(newItem);
    } else {
       // Find a place to put it
       const findInsertPlace = (items: ManuscriptItem[]): boolean => {
         for (let i = 0; i < items.length; i++) {
           if (items[i].id === activeDocId) {
              if (type === 'chapter' && items[i].type === 'part') {
                 if (!items[i].children) items[i].children = [];
                 items[i].children!.push(newItem);
                 setExpandedNodes(prev => new Set(prev).add(items[i].id));
                 return true;
              }
              // Just insert after current if possible, or push to root if not handled nicely
           }
           if (items[i].children && findInsertPlace(items[i].children!)) return true;
         }
         return false;
       };
       
       if (!findInsertPlace(newManuscript)) {
          // If failed to find a smart place, just dump it in the first part/chapter
          if (type === 'chapter' && newManuscript.length > 0) {
             if (!newManuscript[0].children) newManuscript[0].children = [];
             newManuscript[0].children.push(newItem);
             setExpandedNodes(prev => new Set(prev).add(newManuscript[0].id));
          } else {
             // Fallback
             newManuscript.push(newItem);
          }
       }
    }

    setManuscript(newManuscript); if (projectId) storage.saveProjectData(projectId, { manuscript: newManuscript });
    if (type === 'scene') setActiveDocId(newId);
    setEditingNodeId(newId);
    setEditingTitle(newItem.title);
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
              className={`group flex items-center justify-between py-1.5 px-2 rounded-sm cursor-pointer transition-colors ${activeDocId === item.id ? 'bg-[#965A5A] text-white shadow-sm' : 'hover:bg-[#E5E0D5] text-stone-600'} ${draggedNodeId === item.id ? 'opacity-50' : ''}`}
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
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#E5E0D5] rounded-sm shadow-lg py-1 z-50 text-stone-700">
                    <button onClick={(e) => handleAction('rename', item, e)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] transition-colors">Rename</button>
                    <button onClick={(e) => handleAction('duplicate', item, e)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] transition-colors">Duplicate</button>
                    {!isFolder && <button onClick={(e) => handleAction('add_scene_below', item, e)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] transition-colors">Add Scene Below</button>}
                    <div className="h-px bg-[#E5E0D5] my-1" />
                    <button onClick={(e) => handleAction('delete', item, e)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F4F1EA] text-red-600 transition-colors">Delete</button>
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
            {renderManuscriptTree(manuscript)}
          </div>
          <div className="p-3 border-t border-[#E5E0D5] bg-[#F9F6ED] shrink-0 relative">
            <button 
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="w-full py-1.5 border border-dashed border-[#D49A89] text-[#8C503C] rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[#8C503C] hover:text-white transition-colors flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> ADD
            </button>
            
            {addMenuOpen && (
               <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-[#E5E0D5] rounded-sm shadow-lg py-1 z-50 text-stone-700">
                  <button onClick={() => handleAddNew('scene')} className="w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors flex items-center gap-2"><FileText className="w-3 h-3" /> New Scene</button>
                  <button onClick={() => handleAddNew('chapter')} className="w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors flex items-center gap-2"><BookOpen className="w-3 h-3" /> New Chapter</button>
                  <button onClick={() => handleAddNew('part')} className="w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors flex items-center gap-2"><ListTree className="w-3 h-3" /> New Part</button>
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

            {/* Toggle Context Panel */}
            {!isContextOpen && !isFocusMode && (
              <button 
                onClick={() => setIsContextOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] rounded-sm transition-colors ml-1"
                title="Open Sidebar"
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
            <div className={`flex-1 py-16 ${isFocusMode ? 'pb-48' : 'pb-32'}`}>
              <MentionEditor 
                key={activeDocId}
                initialValue={activeContent}
                onEntityClick={handleEntityClick}
                onChange={handleContentChange}
                className={`${fontFamily} ${fontSize} leading-[1.8] text-[#332218]`}
              />
            </div>
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
    </div>
  );
}
