import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

import_stmt = 'import { Maximize2, Plus, MoreVertical, FileText, Settings, Sparkles, Send, RefreshCw, Copy, X, ListTree, ChevronDown, ChevronRight, ChevronLeft, Check, Focus, AlignLeft, Type, Target, Clock, MessageSquare, BookOpen, PanelRight } from "lucide-react";'
content = re.sub(r'import \{ .*?\} from "lucide-react";', import_stmt, content)

old_focus_toggle = '{/* Focus Mode Toggle */}'
new_focus_toggle = """{/* Toggle Context Panel */}
            {!isContextOpen && !isFocusMode && (
              <button 
                onClick={() => setIsContextOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] rounded-sm transition-colors ml-1"
                title="Open Sidebar"
              >
                <PanelRight className="w-4 h-4" />
              </button>
            )}

            {/* Focus Mode Toggle */}"""
content = content.replace(old_focus_toggle, new_focus_toggle)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
