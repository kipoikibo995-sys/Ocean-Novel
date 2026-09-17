import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# We need to calculate spineVariant near the other consts.
# Let's find: const isSelected = selectedProjectId === proj.id;
# and add const spineVariant = index % 4;

content = content.replace(
    "const isSelected = selectedProjectId === proj.id;",
    "const isSelected = selectedProjectId === proj.id;\n              const spineVariant = index % 4;"
)

# Now, we replace the Spine Binding div contents.
old_spine_content = """                  {/* Spine Binding */}
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
                  </div>"""


new_spine_content = """                  {/* Spine Binding */}
                  <div 
                    className={cn(
                      "absolute left-0 top-0 bottom-0 border-r border-black/80 shadow-[inset_-3px_0_8px_rgba(0,0,0,0.8)] flex items-center justify-center z-20 transition-all duration-500",
                      theme.spine
                    )}
                    style={{ width: `${spineWidth}px` }}
                  >
                    <div className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-white/10 rounded-full" />
                    
                    {/* Ribbon cho sách mới cập nhật (áp dụng chung) */}
                    {isRecent && !isSelected && (
                      <div className="absolute top-0 right-2 w-2 h-6 bg-[#b83b3b] shadow-sm flex items-end justify-center rounded-b-sm pointer-events-none z-40">
                         <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-black/20 opacity-30" />
                      </div>
                    )}

                    {/* ---------------- SPINE STYLES ---------------- */}
                    
                    {/* Style 0: Classic Ribbed (Cổ điển, gân nổi) */}
                    {spineVariant === 0 && (
                      <>
                        <div className={cn("absolute top-[28px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                        <div className={cn("absolute top-[52px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                        <div className={cn("absolute bottom-[28px] w-full h-[3.5px] border-t shadow-[0_2px_3px_rgba(0,0,0,0.7)]", isComplete ? "bg-[#c49a45] border-[#f4db89]" : "bg-black/60 border-white/15")} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className={cn(
                            "font-serif text-[11px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                            isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                            isSelected ? "opacity-0" : "opacity-100"
                          )} style={{ width: '170px', textAlign: 'center' }}>
                            {proj.title}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Style 1: Journal Label (Sổ tay, nhãn dán giấy) */}
                    {spineVariant === 1 && (
                      <>
                        <div className="absolute top-[24px] bottom-[24px] left-[15%] right-[15%] bg-[#f4ebd8] rounded-[1px] shadow-[inset_0_0_8px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.6)] flex items-center justify-center border border-[#d6c7b0]">
                          <span className={cn(
                            "font-serif text-[9px] font-bold tracking-[0.1em] text-[#2c1b13] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300",
                            isSelected ? "opacity-0" : "opacity-100"
                          )} style={{ width: '130px', textAlign: 'center' }}>
                            {proj.title}
                          </span>
                        </div>
                        {isComplete && (
                           <div className="absolute bottom-[8px] w-full h-[2px] bg-[#c49a45] border-t border-[#f4db89]" />
                        )}
                      </>
                    )}

                    {/* Style 2: Academic Half-Bound (Thư viện học thuật, dải màu 2 đầu) */}
                    {spineVariant === 2 && (
                      <>
                        <div className="absolute top-0 w-full h-[40px] bg-black/40 border-b border-black/80" />
                        <div className="absolute bottom-0 w-full h-[40px] bg-black/40 border-t border-black/80" />
                        <div className={cn("absolute top-[40px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                        <div className={cn("absolute bottom-[40px] w-full h-[2px] border-t shadow-[0_1px_2px_rgba(0,0,0,0.5)]", isComplete ? "border-[#c49a45]" : "border-white/20")} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className={cn(
                            "font-serif text-[11.5px] font-medium tracking-[0.15em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                            isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                            isSelected ? "opacity-0" : "opacity-100"
                          )} style={{ width: '110px', textAlign: 'center' }}>
                            {proj.title}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Style 3: Ornate Framed (Cổ điển, khung viền kép sang trọng) */}
                    {spineVariant === 3 && (
                      <>
                        <div className={cn("absolute top-[12px] bottom-[12px] left-[10%] right-[10%] border rounded-[1px]", isComplete ? "border-[#c49a45]" : "border-white/30")} />
                        <div className={cn("absolute top-[16px] bottom-[16px] left-[20%] right-[20%] border", isComplete ? "border-[#c49a45] opacity-60" : "border-white/20")} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className={cn(
                            "font-serif text-[10px] font-bold tracking-[0.25em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                            isComplete ? "text-[#e8c678]" : "text-white/80",
                            isSelected ? "opacity-0" : "opacity-100"
                          )} style={{ width: '150px', textAlign: 'center' }}>
                            {proj.title}
                          </span>
                        </div>
                      </>
                    )}
                    
                  </div>"""

content = content.replace(old_spine_content, new_spine_content)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
print("Spine styles patched!")
