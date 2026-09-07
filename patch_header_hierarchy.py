import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

old_header_block = r'\{/\*\ Editor Header \*/\}.*?\{/\*\ Focus Mode Toggle \*/\}'

new_header_block = """{/* Editor Header */}
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
          </div>

          <div className="flex items-center gap-4">
            {/* Formatting Toolbar Portal Target */}
            <div id="editor-toolbar-portal-target" className="flex items-center justify-center"></div>

            <div className="w-px h-5 bg-[#E5E0D5]" />

            {/* Auto-save */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-stone-400 w-20 justify-end">
               {isSaving ? (
                  <><RefreshCw className="w-3 h-3 animate-spin text-[#8C503C]" /> Saving</>
               ) : (
                  <><Check className="w-3 h-3 text-[#5A9672]" /> Saved</>
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

            {/* Focus Mode Toggle */}"""

content = re.sub(old_header_block, new_header_block, content, flags=re.DOTALL)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
