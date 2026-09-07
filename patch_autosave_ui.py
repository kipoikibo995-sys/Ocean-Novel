import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

old_block = r'\{/\*\ Auto-save \*/\}\n\s*<div className="flex items-center gap-1\.5 text-\[10px\] font-bold tracking-widest uppercase text-stone-400 w-20 justify-end">\n\s*\{isSaving \? \(\n\s*<><RefreshCw className="w-3 h-3 animate-spin text-\[#8C503C\]" /> Saving</>\n\s*\) : \(\n\s*<><Check className="w-3 h-3 text-\[#5A9672\]" /> Saved</>\n\s*\)\}\n\s*</div>'

new_block = """{/* Auto-save */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 w-20 justify-end transition-opacity duration-300">
               {isSaving ? (
                  <><RefreshCw className="w-3 h-3 animate-spin text-stone-400/70" /> Saving...</>
               ) : (
                  <><Check className="w-3.5 h-3.5 text-[#5A9672]/70" /> Saved</>
               )}
            </div>"""

content = re.sub(old_block, new_block, content)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
