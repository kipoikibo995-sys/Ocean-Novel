import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# 1. Update the useEffect that loads content to only depend on activeDocId
old_use_effect_content = """  useEffect(() => {
    // Find active doc content
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
  }, [activeDocId, manuscript]);"""

new_use_effect_content = """  // Save timeout ref
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
  }, [activeDocId]);"""
content = content.replace(old_use_effect_content, new_use_effect_content)

# 2. Update handleContentChange with real saving
old_handle_content = """  const handleContentChange = (newHtml: string) => {
    setActiveContent(newHtml);
    setIsSaving(true);
    // Simulate save
    setTimeout(() => setIsSaving(false), 800);
  };"""

new_handle_content = """  const handleContentChange = (newHtml: string) => {
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
        return updateNode(prev);
      });
      setIsSaving(false);
    }, 1000);
  };"""
content = content.replace(old_handle_content, new_handle_content)

# 3. Remove old auto-save useEffect
old_auto_save_effect = """  // Auto-save logic
  useEffect(() => {
    if (!activeContent) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      // Simulate saving delay
      setIsSaving(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeContent]);"""
content = content.replace(old_auto_save_effect, "")

# 4. Generate dynamic breadcrumbs
# Look for Editor Header
old_header = """        {/* Editor Header */}
        <div className={`shrink-0 p-4 flex items-center justify-between transition-opacity duration-300 ${isFocusMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#FCFAF5] to-transparent pt-6' : 'border-b border-[#E5E0D5] bg-white/40 backdrop-blur-md relative z-10'}`}>
          <div className="flex items-center gap-3">
            {!isManuscriptOpen && !isFocusMode && (
              <button onClick={() => setIsManuscriptOpen(true)} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] rounded-sm transition-colors">
                <ListTree className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-[#4A3225]">Chapter 1: The Arrival</h2>
              <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5 mt-0.5">
                <span>Scene 1</span>
                <span className="w-0.5 h-0.5 rounded-full bg-stone-400"></span>
                <span>The Bus Ride</span>
              </div>
            </div>
          </div>"""

new_header = """  const getBreadcrumbs = (items: ManuscriptItem[], targetId: string, currentPath: ManuscriptItem[] = []): ManuscriptItem[] | null => {
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
          </div>"""
content = content.replace(old_header, new_header)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
