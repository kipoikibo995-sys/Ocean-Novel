import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# 1. Add new state variables
state_vars = """
  const [isSaving, setIsSaving] = useState(false);

  // Binder State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['part-1', 'chap-1', 'part-2', 'chap-4', 'chap-5']));
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
"""
content = re.sub(r'  const \[isSaving, setIsSaving\] = useState\(false\);', state_vars, content)

# 2. Add helper functions and the new renderManuscriptTree
helpers_and_render = """
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

    setManuscript(newManuscript);
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
             setManuscript(newManuscript);
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
             setManuscript(newManuscript);
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
    setManuscript(newManuscript);
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

    setManuscript(newManuscript);
    if (type === 'scene') setActiveDocId(newId);
    setEditingNodeId(newId);
    setEditingTitle(newItem.title);
  };

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
                  <span className={`text-xs truncate ${isFolder ? 'font-bold uppercase tracking-widest text-[9px]' : 'font-medium'}`}>
                    {item.title}
                  </span>
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
"""

content = re.sub(r'  const renderManuscriptTree = \(items: ManuscriptItem\[\], level = 0\) => \{.*?\};\n', helpers_and_render, content, flags=re.DOTALL)

# 3. Replace the old "New Scene" button at the bottom
old_add_btn = """          <div className="p-3 border-t border-[#E5E0D5] bg-[#F9F6ED] shrink-0">
            <button className="w-full py-1.5 border border-dashed border-[#D49A89] text-[#8C503C] rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[#8C503C] hover:text-white transition-colors flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> New Scene
            </button>
          </div>"""

new_add_btn = """          <div className="p-3 border-t border-[#E5E0D5] bg-[#F9F6ED] shrink-0 relative">
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
          </div>"""

content = content.replace(old_add_btn, new_add_btn)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)

