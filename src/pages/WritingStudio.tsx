import { ReactNode, useState, useEffect, useRef } from "react";
import { Maximize2, MoreVertical, FileText, Settings, Sparkles, Send, RefreshCw, Copy, X, ListTree, ChevronDown, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CHARACTERS, MOCK_LOCATIONS, MOCK_MANUSCRIPT, ManuscriptItem } from "@/mockData";
import MentionEditor from "@/components/MentionEditor";

export default function WritingStudio() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'chars' | 'locs' | 'notes'>('chars');
  const [selectedEntity, setSelectedEntity] = useState<{id: string, type: string} | null>(null);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isManuscriptOpen, setIsManuscriptOpen] = useState(true);
  
  // Manuscript state
  const [manuscript, setManuscript] = useState(MOCK_MANUSCRIPT);
  const [activeDocId, setActiveDocId] = useState<string>('scene-1');
  const [activeContent, setActiveContent] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load active document content
  useEffect(() => {
    let foundContent = '';
    const findDoc = (items: ManuscriptItem[]) => {
      for (const item of items) {
        if (item.id === activeDocId) {
          foundContent = item.content || '';
          return true;
        }
        if (item.children && findDoc(item.children)) return true;
      }
      return false;
    };
    findDoc(manuscript);
    setActiveContent(foundContent);
  }, [activeDocId, manuscript]);

  const handleEntityClick = (entityId: string, entityType: 'character' | 'location') => {
    setSelectedEntity({ id: entityId, type: entityType });
    setActiveTab(entityType === 'character' ? 'chars' : 'locs');
    if (!isContextOpen) setIsContextOpen(true);
    setTimeout(() => {
      const el = document.getElementById(`${entityType === 'character' ? 'char' : 'loc'}-${entityId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleContentChange = (newContent: string) => {
    if (newContent === activeContent) return;
    setActiveContent(newContent);
    setIsSaving(true);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      // Update mock manuscript tree
      const updateTree = (items: ManuscriptItem[]): ManuscriptItem[] => {
        return items.map(item => {
          if (item.id === activeDocId) {
            return { ...item, content: newContent };
          }
          if (item.children) {
            return { ...item, children: updateTree(item.children) };
          }
          return item;
        });
      };
      setManuscript(updateTree(manuscript));
      setIsSaving(false);
    }, 1000);
  };

  const TabsTrigger = ({ active, onClick, children, className }: any) => (
    <button 
      onClick={onClick} 
      className={`px-3 py-1.5 rounded-md font-medium text-sm transition-colors ${active ? 'bg-[#965A5A] text-white shadow' : 'text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]'} ${className}`}
    >
      {children}
    </button>
  );

  const TabsList = ({ children, className }: { children: ReactNode, className?: string }) => (
    <div className={`flex bg-[#E5E0D5] p-1 rounded-lg ${className}`}>
      {children}
    </div>
  );

  const Tabs = ({ children, className }: { children: ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
  );

  // Render Manuscript Tree
  const renderTree = (items: ManuscriptItem[], level = 0) => {
    return items.map(item => {
      const isActive = item.id === activeDocId;
      const isScene = item.type === 'scene';
      return (
        <div key={item.id} className="w-full">
          <button
            onClick={() => isScene && setActiveDocId(item.id)}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 group transition-colors ${
              isActive ? 'bg-[#965A5A]/10 text-[#965A5A] border-r-2 border-[#965A5A]' : 'text-stone-600 hover:bg-[#E5E0D5]'
            }`}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            {item.children ? (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#965A5A]' : 'text-stone-400'}`} />
            )}
            <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'} ${item.type !== 'scene' ? 'uppercase tracking-widest text-[10px] font-bold mt-2' : 'truncate'}`}>
              {item.title}
            </span>
          </button>
          {item.children && (
            <div className="flex flex-col w-full">
              {renderTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F4F1EA]' : ''}`}>
      
      {/* Left Panel: Manuscript Structure */}
      {isManuscriptOpen && (
        <div className="hidden md:flex w-64 border-r border-[#E5E0D5] bg-[#F9F6ED] flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
           <div className="p-4 border-b border-[#E5E0D5] flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                <ListTree className="w-4 h-4" /> Manuscript
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-400 hover:text-stone-800 hover:bg-[#E5E0D5]" onClick={() => setIsManuscriptOpen(false)}>
                 <ChevronLeft className="w-4 h-4" />
              </Button>
           </div>
           <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
             {renderTree(manuscript)}
           </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-[#E5E0D5] bg-white/50 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {!isManuscriptOpen && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]" onClick={() => setIsManuscriptOpen(true)}>
                <ListTree className="w-4 h-4" />
              </Button>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Chapter 1</span>
                 <span className="text-stone-300">/</span>
                 <span className="font-serif font-bold text-stone-800 text-sm">The Lighthouse</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Auto-save Indicator */}
            <div className="flex items-center gap-1.5 mr-4 text-xs font-medium text-stone-500">
               {isSaving ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-[#965A5A]" /> Saving...
                  </>
               ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Saved
                  </>
               )}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] h-8 w-8 p-0 rounded-xl">
              <Maximize2 className="w-4 h-4" />
            </Button>
            {!isContextOpen && (
              <Button variant="ghost" size="sm" onClick={() => setIsContextOpen(true)} className="bg-[#965A5A] text-white hover:bg-[#7D4A4A] hover:text-white rounded-xl">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                AI Assistant
              </Button>
            )}
          </div>
        </div>

        {/* Manuscript Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth bg-transparent">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <div className="flex-1 pt-12 pb-32">
              <MentionEditor 
                initialValue={activeContent}
                onEntityClick={handleEntityClick}
                onChange={handleContentChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Context & AI */}
      {isContextOpen && (
        <div className="hidden lg:flex w-80 border-l border-[#E5E0D5] bg-[#F9F6ED] flex-col shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] z-10">
          <div className="p-3 border-b border-[#E5E0D5] flex items-center justify-between">
             <Tabs className="w-full">
                <TabsList className="w-full grid grid-cols-4 bg-transparent p-1 border border-[#E5E0D5]">
                  <TabsTrigger active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} className="text-xs">AI</TabsTrigger>
                  <TabsTrigger active={activeTab === 'chars'} onClick={() => setActiveTab('chars')} className="text-xs">Chars</TabsTrigger>
                  <TabsTrigger active={activeTab === 'locs'} onClick={() => setActiveTab('locs')} className="text-xs">Locs</TabsTrigger>
                  <TabsTrigger active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} className="text-xs">Notes</TabsTrigger>
                </TabsList>
             </Tabs>
             <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 shrink-0 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]" onClick={() => setIsContextOpen(false)}>
               <X className="w-4 h-4" />
             </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar">
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="relative">
                  <Input placeholder="Ask AI about this chapter..." className="pr-10 bg-[#F9F6ED] shadow-md border-[#E5E0D5] focus-visible:ring-1 focus-visible:ring-[#965A5A] rounded-xl" />
                  <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-stone-800 hover:bg-[#E5E0D5]">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <AiActionButton>Continue Writing</AiActionButton>
                  <AiActionButton>Improve Description</AiActionButton>
                  <AiActionButton>Increase Tension</AiActionButton>
                  <AiActionButton>Rewrite</AiActionButton>
                </div>

                <div className="mt-6 bg-[#F9F6ED] border border-[#E5E0D5] rounded-xl p-4 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#965A5A]" />
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-stone-800" />
                    <span className="text-[10px] font-bold text-stone-800 uppercase tracking-widest">AI Suggestion</span>
                  </div>
                  <p className="text-sm text-stone-800 leading-relaxed font-serif">
                    The sound came again from somewhere below the lighthouse. A slow, metallic scraping, like something heavy being dragged across stone. Sarah froze, her breath caught in her throat. The beam of her flashlight trembled, illuminating dust motes dancing in the cold air. 
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="bg-[#965A5A] hover:bg-[#965A5A]/90 text-white rounded-xl text-xs h-7">Insert</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 rounded-xl border-[#E5E0D5] hover:bg-[#E5E0D5] text-stone-800">Replace</Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 w-7 p-0 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]"><RefreshCw className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 w-7 p-0 ml-auto text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]"><Copy className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chars' && (
              <div className="space-y-3">
                {MOCK_CHARACTERS.map(char => (
                  <div key={char.id} className={`p-3 rounded-xl border shadow-md transition-all ${selectedEntity?.id === char.id ? 'bg-[#965A5A]/10 border-[#965A5A] ring-2 ring-[#965A5A]/20' : 'bg-[#F9F6ED] border-[#E5E0D5]'}`} id={`char-${char.id}`}>
                    <h4 className="text-sm font-semibold text-stone-800">{char.name}</h4>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-2">{char.role}</p>
                    <p className="text-xs text-stone-600 line-clamp-3">{char.description}</p>
                    {selectedEntity?.id === char.id && (
                       <div className="mt-3 pt-3 border-t border-[#965A5A]/30 flex justify-end">
                         <Button size="sm" variant="outline" className="h-6 text-[10px]">Full Profile</Button>
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'locs' && (
              <div className="space-y-3">
                {MOCK_LOCATIONS.map(loc => (
                  <div key={loc.id} className="bg-[#F9F6ED] p-3 rounded-xl border border-[#E5E0D5] shadow-md" id={`loc-${loc.id}`}>
                    <h4 className="text-sm font-semibold text-stone-800">{loc.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">{loc.type}</p>
                    <p className="text-xs text-stone-600">{loc.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4 h-full flex flex-col">
                <textarea 
                  className="w-full flex-1 rounded-xl bg-[#F4F1EA] border border-[#E5E0D5] p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#965A5A]"
                  placeholder="Jot down ideas, plot holes, or reminders for this chapter..."
                  defaultValue="Reveal that Daniel has been investigating the lighthouse secretly. Make sure to mention the specific brand of cigarettes he smokes as a clue for later."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AiActionButton({ children }: { children: ReactNode }) {
  return (
    <button className="px-3 py-1.5 bg-[#F9F6ED] border border-[#E5E0D5] rounded-xl text-xs font-medium text-stone-600 hover:border-[#965A5A] hover:text-stone-800 hover:bg-[#E5E0D5] transition-colors shadow-md">
      {children}
    </button>
  )
}
