import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

start_marker = "{/* ARCHIVAL BOOKSHELF */}"
end_marker = "        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    new_html = """{/* ARCHIVAL BOOKSHELF */}
        <div className="relative pt-8 pb-0 px-2 sm:px-4 z-10 w-full overflow-hidden shrink-0">
          {/* Wooden Shelf Base (4. Thêm chiều sâu & Bóng đổ) */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c371d] to-[#3a2211] rounded-t-[2px] shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] z-0" />
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#26150a] shadow-xl z-0" />
          
          {/* 4. Bookends (Chặn sách ở 2 đầu kệ) */}
          <div className="absolute bottom-6 left-1 w-2.5 h-16 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-r border-[#5c3a21] rounded-t-sm shadow-[4px_0_8px_rgba(0,0,0,0.4)] z-20" />
          <div className="absolute bottom-6 right-1 w-2.5 h-16 bg-gradient-to-b from-[#4a2e1b] to-[#2a1a0f] border-l border-[#2a1a0f] rounded-t-sm shadow-[-4px_0_8px_rgba(0,0,0,0.4)] z-20" />

          <div className="flex items-end h-[250px] gap-[2px] lg:gap-[3px] overflow-x-auto overflow-y-visible custom-scrollbar pb-6 relative z-10 px-4">
            {savedProjects.length === 0 && (
              <div className="flex items-center justify-center w-full h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50 mb-4">
                <p className="text-stone-500 text-sm font-medium">No archives found. Start a new project.</p>
              </div>
            )}
            {savedProjects.map((proj, index) => {
              // 2. Phân loại trực quan qua màu gáy sách theo thể loại
              const getGenreTheme = (gStr: string) => {
                const g = (gStr || "").toLowerCase();
                if (g.includes('fantasy')) return { bg: "bg-[#182330]", spine: "bg-[#0e1620]" }; // Navy
                if (g.includes('thriller') || g.includes('horror') || g.includes('mystery')) return { bg: "bg-[#4a1c1c]", spine: "bg-[#2a0e0e]" }; // Deep Red
                if (g.includes('romance')) return { bg: "bg-[#4a2530]", spine: "bg-[#2d161d]" }; // Burgundy
                if (g.includes('sci-fi') || g.includes('science')) return { bg: "bg-[#17252d]", spine: "bg-[#0c161c]" }; // Teal
                if (g.includes('historical')) return { bg: "bg-[#332a1e]", spine: "bg-[#1f1912]" }; // Olive Brown
                return { bg: "bg-[#2a1a14]", spine: "bg-[#1a0f0b]" }; // Default Leather Brown
              };
              
              const theme = getGenreTheme(proj.genre || "");
              const isSelected = selectedProjectId === proj.id;
              
              const progressRatio = Math.min(1, Math.max(0, (proj.currentWords || 0) / (proj.wordGoal || 75000)));
              const progressPercent = Math.round(progressRatio * 100);
              
              // 3. Độ dày gáy sách phản ánh dữ liệu (Từ 36px đến 64px)
              const spineWidth = 36 + Math.floor(progressRatio * 28); 
              
              // 5. Đánh dấu trạng thái đặc biệt
              const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;
              const isRecent = Date.now() - (proj.lastModified || 0) < 3 * 24 * 60 * 60 * 1000; // Updated within 3 days

              return (
                <div
                  key={proj.id}
                  // 1. Click để mở rộng tại chỗ
                  onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                  className={cn(
                    "group relative shrink-0 overflow-hidden cursor-pointer transition-all duration-500 ease-out select-none",
                    "rounded-l-[4px] rounded-r-md shadow-[-4px_0_12px_rgba(0,0,0,0.6)] border-y border-r border-black/40",
                    // 1. Hover nhô lên nhẹ
                    "hover:-translate-y-2 hover:shadow-[-6px_8px_16px_rgba(0,0,0,0.7)]", 
                    theme.bg,
                    isSelected ? "h-[225px]" : "h-[210px]"
                  )}
                  style={{ width: isSelected ? '200px' : `${spineWidth}px` }}
                  title={`${proj.title} • ${proj.genre || 'Unknown Genre'}`} // Native Tooltip fallback
                >
                  {/* Leather/Cloth Cover Texture */}
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
                    <div className="absolute left-[2px] top-0 bottom-0 w-[1.5px] bg-white/10 rounded-full" />
                    
                    {/* 5. Ribbon cho sách mới cập nhật */}
                    {isRecent && !isSelected && (
                      <div className="absolute top-0 right-2 w-2 h-6 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                         <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-black/20 opacity-30" />
                      </div>
                    )}

                    {/* 5. Embossed spine ribs (Gold foil nếu hoàn thành) */}
                    <div className={cn("absolute top-[28px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                    <div className={cn("absolute top-[52px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                    <div className={cn("absolute bottom-[28px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />

                    {/* 7. Vertical Text Title */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className={cn(
                        "font-serif text-[11.5px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                        isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                        isSelected ? "opacity-0" : "opacity-100"
                      )} style={{ width: '170px', textAlign: 'center' }}>
                        {proj.title}
                      </span>
                    </div>
                  </div>

                  {/* 1. Cover Plate Content (Trượt ra ngang accordion) */}
                  <div className={cn(
                    "absolute top-0 bottom-0 right-0 p-2 sm:p-2.5 transition-opacity duration-500 z-10 flex items-center justify-end overflow-hidden",
                    isSelected ? "opacity-100 delay-150" : "opacity-0 pointer-events-none"
                  )} style={{ width: `calc(100% - ${spineWidth}px)` }}>
                    <div className="w-full h-full bg-[#faf6ed] border border-[#dad1be] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),_1px_2px_8px_rgba(0,0,0,0.4)] rounded-[2px] p-2.5 flex flex-col justify-between relative overflow-hidden min-w-[130px]">
                      
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/60 border-t border-b border-black/5 rotate-[-0.5deg] pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />

                      {isRecent && (
                        <div className="absolute top-0 right-2 w-2.5 h-6 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                           <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-black/20 opacity-30" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between border-b border-[#e8ded0] pb-1 mb-1.5 mt-1">
                          <span className="block text-[7.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8c503c]">
                            Case File {index < 9 ? `· 0${index + 1}` : `· ${index + 1}`}
                          </span>
                        </div>
                        <h2 className="text-[13px] sm:text-[14px] font-serif font-bold leading-[1.25] text-[#2c1b13] line-clamp-3 text-left tracking-tight">
                          {proj.title}
                        </h2>
                        <div className="w-6 h-[1.5px] bg-[#8c503c]/30 my-1.5" />
                        <p className="text-[8.5px] font-serif italic text-[#745344] line-clamp-2 text-left leading-snug">
                          {proj.genre || "Fantasy Archive"}
                        </p>
                      </div>

                      <div className="mt-auto pt-1.5 border-t border-[#ebdcd0]">
                        <div className="flex items-baseline justify-between mb-1 gap-1">
                          <span className="text-[7.5px] uppercase font-bold tracking-widest text-[#8c503c]/70 shrink-0">
                            Words
                          </span>
                          <span className="text-[9px] font-serif font-bold text-[#2c1b13] truncate">
                            {(proj.currentWords || 0).toLocaleString()} {isComplete && "★"}
                          </span>
                        </div>
                        <div className="w-full bg-[#e7decfa0] h-[2.5px] rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-[#c49a45]" : "bg-[#8c503c]")}
                            style={{ width: `${Math.max(5, progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend cho thể loại (Idea 2) */}
          <div className="absolute top-2 right-4 flex items-center gap-3 bg-white/50 px-3 py-1.5 rounded-full border border-[#e5e0d5] text-[9px] font-sans font-medium text-stone-500 uppercase tracking-widest backdrop-blur-sm z-20">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#182330]" /> Fantasy</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#4a1c1c]" /> Thriller</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#4a2530]" /> Romance</span>
          </div>
        </div>
"""
    
    new_content = content[:start_idx] + new_html + content[end_idx:]
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(new_content)
    print("Patched Dashboard.tsx successfully v2")
else:
    print("Could not find markers")
