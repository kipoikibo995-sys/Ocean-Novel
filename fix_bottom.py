import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# Let's cleanly replace the duplicate bottom status bars.
# Finding the first occurrence of:
#        {/* Bottom Status Bar */}
#        <div className={`shrink-0 h-10 border-t

start = content.find('{/* Bottom Status Bar */}')

if start != -1:
    content = content[:start] + """{/* Bottom Status Bar */}
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
            <span className="text-[10px] font-bold tracking-widest uppercase">Daily Goal: {Math.min(100, Math.round((wordCount / 1000) * 100))}%</span>
            <div className="w-24 h-1.5 bg-[#E5E0D5] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5A9672] transition-all duration-500"
                style={{ width: `${Math.min(100, (wordCount / 1000) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
