import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# 1. Remove Right Panel Context & AI completely
# Looking for `{/* Right Panel: Context & AI */}`
right_panel_start = content.find('{/* Right Panel: Context & AI */}')
# Find the end of this block. It ends right before `</div>` and `{/* Bottom Status Bar */}`
status_bar_start = content.find('{/* Bottom Status Bar */}')

if right_panel_start != -1 and status_bar_start != -1:
    content = content[:right_panel_start] + content[status_bar_start:]

# Remove the PanelRight toggle button in the header
panel_toggle = """<button onClick={() => setIsContextOpen(!isContextOpen)} className={`p-1.5 rounded-sm transition-colors ${isContextOpen ? 'bg-[#E5E0D5] text-[#4A3225]' : 'text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]'}`}>
              <PanelRight className="w-4 h-4" />
            </button>"""
content = content.replace(panel_toggle, "")

# Remove AiActionButton component entirely
ai_btn = """function AiActionButton({ children }: { children: ReactNode }) {
  return (
    <button className="px-3 py-1.5 bg-white border border-[#E5E0D5] rounded-sm text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:border-[#D49A89] hover:text-[#8C503C] hover:bg-stone-50 transition-colors shadow-sm">
      {children}
    </button>
  )
}"""
content = content.replace(ai_btn, "")

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)

# 2. Fix Dashboard.tsx (Remove AI Editorial Tasks)
with open('src/pages/Dashboard.tsx', 'r') as f:
    content_dash = f.read()

ai_editorial = """            {/* AI Editorial Tasks (Left Col) */}
            <div className="col-span-1 bg-white border border-[#E5E0D5] rounded-sm p-5 relative overflow-hidden flex flex-col h-[380px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FCFAF5] to-transparent rounded-bl-full -z-0 opacity-50" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-serif font-bold text-lg text-[#4A3225] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D49A89]" />
                  AI Editorial
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Suggestions</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-200">
                <div className="p-3 bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#D49A89] mb-1">Tone Check</div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">Chapter 4 pacing feels slightly rushed compared to earlier chapters. Consider expanding the dialogue scene in the tavern.</p>
                  <button className="text-[10px] font-bold text-[#8C503C] hover:underline">Review Chapter 4</button>
                </div>
                
                <div className="p-3 bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#D49A89] mb-1">Plot Hole Warning</div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">You mentioned the amulet was lost in Ch.2, but the protagonist uses it in Ch.5.</p>
                  <button className="text-[10px] font-bold text-[#8C503C] hover:underline">Resolve Conflict</button>
                </div>
              </div>
            </div>"""

content_dash = content_dash.replace(ai_editorial, "")

# Make the Activity Feed span 3 columns now that the left col is gone
content_dash = content_dash.replace('<div className="col-span-1 lg:col-span-2 bg-white border border-[#E5E0D5] rounded-sm p-5 relative overflow-hidden flex flex-col h-[380px]">', '<div className="col-span-1 lg:col-span-3 bg-white border border-[#E5E0D5] rounded-sm p-5 relative overflow-hidden flex flex-col h-[380px]">')

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content_dash)
