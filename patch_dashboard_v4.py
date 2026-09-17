import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

start_marker = "{/* ARCHIVAL BOOKSHELF */}"
end_marker = "        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    new_html = """{/* ARCHIVAL BOOKSHELF */}
        <div className="relative pt-12 pb-0 px-2 sm:px-4 z-10 w-full overflow-hidden shrink-0 flex flex-col items-center">
          {/* Container cho kệ sách, căn giữa nếu ít sách */}
          <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
            
            {/* Wooden Shelf Base */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c371d] to-[#3a2211] rounded-t-[2px] shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] z-0" />
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#26150a] shadow-xl z-0" />
            
            <div className="flex items-end h-[260px] gap-[2px] lg:gap-[3px] overflow-x-auto overflow-y-visible custom-scrollbar pb-6 relative z-10 px-4 w-full justify-start md:justify-center">
              
              {/* Left Bookend (chặn sách trái) */}
              <div className="shrink-0 w-3 h-20 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-r border-[#5c3a21] rounded-t-sm shadow-[4px_0_8px_rgba(0,0,0,0.4)] mr-1 z-20" />

              {savedProjects.length === 0 && (
                <div className="flex items-center justify-center w-full max-w-md h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50 mb-4 mx-auto">
                  <p className="text-stone-500 text-sm font-medium">No archives found. Start a new project.</p>
                </div>
              )}
              {savedProjects.map((proj, index) => {
                // 2. Cập nhật bảng màu rõ rệt hơn
                const getGenreTheme = (gStr: string) => {
                  const g = (gStr || "").toLowerCase();
                  if (g.includes('fantasy')) return { bg: "bg-[#182330]", spine: "bg-[#0e1620]" }; // Navy
                  if (g.includes('thriller') || g.includes('horror') || g.includes('mystery')) return { bg: "bg-[#6b1c1c]", spine: "bg-[#3d0f0f]" }; // Crimson Red
                  if (g.includes('romance')) return { bg: "bg-[#592b45]", spine: "bg-[#331525]" }; // Deep Pink/Plum
                  if (g.includes('sci-fi') || g.includes('science')) return { bg: "bg-[#17424d]", spine: "bg-[#0a232b]" }; // Teal
                  if (g.includes('historical')) return { bg: "bg-[#423826]", spine: "bg-[#241e13]" }; // Olive
                  return { bg: "bg-[#382218]", spine: "bg-[#24140d]" }; // Default Leather Brown
                };
                
                const theme = getGenreTheme(proj.genre || "");
                const isSelected = selectedProjectId === proj.id;
                
                const progressRatio = Math.min(1, Math.max(0, (proj.currentWords || 0) / (proj.wordGoal || 75000)));
                const progressPercent = Math.round(progressRatio * 100);
                
                const spineWidth = 40 + Math.floor(progressRatio * 28); 
                const spineVariant = index % 4;
                
                const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;
                
                // Giới hạn ribbon chỉ cho 2 sách cập nhật gần nhất
                const recentProjectIds = [...savedProjects].sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0)).slice(0, 2).map(p => p.id);
                const isRecent = recentProjectIds.includes(proj.id);

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                    className={cn(
                      "group relative shrink-0 overflow-hidden cursor-pointer transition-all duration-500 ease-out select-none",
                      "rounded-l-[4px] rounded-r-md shadow-[-4px_0_12px_rgba(0,0,0,0.6)] border-y border-r border-black/40",
                      "hover:-translate-y-2 hover:shadow-[-6px_8px_16px_rgba(0,0,0,0.7)]", 
                      theme.bg,
                      isSelected ? "h-[240px]" : "h-[220px]"
                    )}
                    style={{ width: isSelected ? '260px' : `${spineWidth}px` }}
                    title={`${proj.title} • ${proj.genre || 'Unknown Genre'}`}
                  >
                    {/* Texture */}
                    <div
                      className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none z-30"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
                    />

                    {/* Spine Binding */}
                    <div 
                      className={cn(
                        "absolute left-0 top-0 bottom-0 border-r border-black/80 shadow-[inset_-3px_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center z-20 transition-all duration-500",
                        theme.spine
                      )}
                      style={{ width: `${spineWidth}px` }}
                    >
                      <div className="absolute left-[1px] top-0 bottom-0 w-[1.5px] bg-white/10 rounded-full" />
                      
                      {isRecent && !isSelected && (
                        <div className="absolute top-0 right-2 w-2.5 h-7 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                           <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-black/20 opacity-40" />
                        </div>
                      )}

                      {/* Style 0 */}
                      {spineVariant === 0 && (
                        <>
                          <div className={cn("absolute top-[32px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className={cn("absolute top-[60px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className={cn("absolute bottom-[32px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={cn(
                              "font-serif text-[12px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-visible transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: '200px', textAlign: 'center' }}>
                              {proj.title.length > 25 ? proj.title.substring(0, 25) + "..." : proj.title}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Style 1 */}
                      {spineVariant === 1 && (
                        <>
                          <div className="absolute top-[28px] bottom-[28px] left-[15%] right-[15%] bg-[#f4ebd8] rounded-[2px] shadow-[inset_0_0_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.6)] flex items-center justify-center border border-[#d6c7b0]">
                            <span className={cn(
                              "font-serif text-[10px] font-bold tracking-[0.1em] text-[#2c1b13] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-visible transition-opacity duration-300",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: '160px', textAlign: 'center' }}>
                              {proj.title.length > 25 ? proj.title.substring(0, 25) + "..." : proj.title}
                            </span>
                          </div>
                          {isComplete && (
                             <div className="absolute bottom-[10px] w-full h-[2px] bg-[#c49a45] border-t border-[#f4db89]" />
                          )}
                        </>
                      )}

                      {/* Style 2 */}
                      {spineVariant === 2 && (
                        <>
                          <div className="absolute top-0 w-full h-[45px] bg-black/40 border-b border-black/80" />
                          <div className="absolute bottom-0 w-full h-[45px] bg-black/40 border-t border-black/80" />
                          <div className={cn("absolute top-[45px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                          <div className={cn("absolute bottom-[45px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={cn(
                              "font-serif text-[12px] font-medium tracking-[0.15em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-visible transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: '120px', textAlign: 'center' }}>
                              {proj.title.length > 18 ? proj.title.substring(0, 18) + "..." : proj.title}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Style 3 */}
                      {spineVariant === 3 && (
                        <>
                          <div className={cn("absolute top-[14px] bottom-[14px] left-[10%] right-[10%] border rounded-[2px]", isComplete ? "border-[#c49a45]" : "border-white/30")} />
                          <div className={cn("absolute top-[18px] bottom-[18px] left-[20%] right-[20%] border", isComplete ? "border-[#c49a45] opacity-60" : "border-white/20")} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={cn(
                              "font-serif text-[11px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-visible transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-white/80",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: '170px', textAlign: 'center' }}>
                              {proj.title.length > 22 ? proj.title.substring(0, 22) + "..." : proj.title}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 1. Cover Plate Content (Trượt ra ngang accordion - Kích thước lớn hơn) */}
                    <div className={cn(
                      "absolute top-0 bottom-0 right-0 p-3 sm:p-4 transition-opacity duration-500 z-10 flex items-center justify-end overflow-hidden",
                      isSelected ? "opacity-100 delay-150" : "opacity-0 pointer-events-none"
                    )} style={{ width: `calc(100% - ${spineWidth}px)` }}>
                      <div className="w-full h-full bg-[#faf6ed] border border-[#dad1be] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),_1px_2px_8px_rgba(0,0,0,0.4)] rounded-[3px] p-4 flex flex-col justify-between relative overflow-hidden min-w-[180px]">
                        
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-white/60 border-t border-b border-black/5 rotate-[-0.5deg] pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />

                        {isRecent && (
                          <div className="absolute top-0 right-3 w-3 h-8 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-black/20 opacity-30" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between border-b border-[#e8ded0] pb-1.5 mb-2.5 mt-1">
                            <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#8c503c]">
                              Case File {index < 9 ? `· 0${index + 1}` : `· ${index + 1}`}
                            </span>
                          </div>
                          <h2 className="text-[16px] sm:text-[18px] font-serif font-bold leading-[1.25] text-[#2c1b13] line-clamp-3 text-left tracking-tight mb-2">
                            {proj.title}
                          </h2>
                          <div className="w-8 h-[2px] bg-[#8c503c]/40 my-2" />
                          <p className="text-[11px] font-serif italic text-[#745344] line-clamp-2 text-left leading-snug">
                            {proj.genre || "Fantasy Archive"}
                          </p>
                        </div>

                        <div className="mt-auto pt-2.5 border-t border-[#ebdcd0]">
                          <div className="flex items-baseline justify-between mb-1.5 gap-1">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#8c503c]/70 shrink-0">
                              Words
                            </span>
                            <span className="text-[11px] font-serif font-bold text-[#2c1b13] truncate">
                              {(proj.currentWords || 0).toLocaleString()} {isComplete && "★"}
                            </span>
                          </div>
                          <div className="w-full bg-[#e7decfa0] h-[3px] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-[#c49a45]" : "bg-[#8c503c]")}
                              style={{ width: `${Math.max(5, progressPercent)}%` }}
                            />
                          </div>
                          
                          {/* Nút hành động */}
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/project/${proj.id}`); }}
                              className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#2c1b13] hover:bg-[#8c503c] transition-colors px-3 py-1.5 rounded-sm"
                            >
                              Open Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Right Bookend (chặn sách phải) */}
              {savedProjects.length > 0 && (
                <div className="shrink-0 w-3 h-20 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-l border-[#2a1a0f] rounded-t-sm shadow-[-4px_0_8px_rgba(0,0,0,0.4)] ml-1 z-20" />
              )}
            </div>
            
            {/* Legend cho thể loại (Idea 2) */}
            <div className="absolute top-2 right-4 flex items-center gap-3 bg-white/70 px-3 py-1.5 rounded-full border border-[#e5e0d5] text-[9px] font-sans font-medium text-stone-600 uppercase tracking-widest backdrop-blur-md z-20 shadow-sm">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#182330]" /> Fantasy</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#6b1c1c]" /> Thriller</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#592b45]" /> Romance</span>
            </div>
          </div>
        </div>
"""
    
    new_content = content[:start_idx] + new_html + content[end_idx:]
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(new_content)
    print("Patched Dashboard.tsx successfully v4")
else:
    print("Could not find markers")
