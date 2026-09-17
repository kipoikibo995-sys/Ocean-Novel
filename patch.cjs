const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const startStr = "              return (\n                <div\n                  key={proj.id}";
const endStr = "                </div>\n              );\n            })}\n          </div>\n        </section>";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(\`/project/\${proj.id}\`)}
                  onMouseEnter={() => setSelectedProjectId(proj.id)}
                  className="group/book shrink-0 flex items-end relative cursor-pointer select-none h-full"
                  style={{ zIndex: isSelected ? 25 : index + 2 }}
                >
                  <div
                    className={cn(
                      "relative rounded-r-md rounded-l-[3px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden flex",
                      "shadow-[-4px_4px_14px_rgba(0,0,0,0.35)] hover:shadow-[-6px_10px_24px_rgba(0,0,0,0.45)]",
                      "w-[42px] sm:w-[48px] lg:w-[56px]",
                      "group-hover/book:w-[170px] sm:group-hover/book:w-[190px] lg:group-hover/book:w-[220px]",
                      heightClass,
                      theme.bg,
                      theme.border,
                      isSelected && "ring-2 ring-[#c99846]/80 ring-offset-1 ring-offset-[#F4F1EA] -translate-y-2 shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
                    )}
                  >
                    {/* Spine Binding (Always visible) */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-[42px] sm:w-[48px] lg:w-[56px] bg-gradient-to-r from-black/60 via-black/40 to-black/20 border-r border-black/80 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between py-4 sm:py-5 z-20 shrink-0", theme.spine)}>
                      {/* Embossed spine ribs/bands */}
                      <div className="w-full px-[3px] flex flex-col gap-1">
                        <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                        <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                      </div>

                      {/* Vertical Title on Spine */}
                      <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden my-3">
                         <span 
                           className="text-white/90 font-serif text-[10px] sm:text-[11px] lg:text-xs font-bold tracking-widest whitespace-nowrap opacity-100 group-hover/book:opacity-0 transition-opacity duration-200"
                           style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                         >
                           {proj.title}
                         </span>
                      </div>

                      <div className="w-full px-[3px] flex flex-col gap-1">
                        <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                        <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                      </div>
                    </div>
                    
                    {/* Integrated Archival Case File Cover Plate (Reveals on Hover) */}
                    <div className="absolute top-[8px] bottom-[8px] left-[52px] sm:left-[60px] lg:left-[70px] w-[105px] sm:w-[115px] lg:w-[135px] z-10 pointer-events-none flex flex-col opacity-0 group-hover/book:opacity-100 transition-opacity duration-500">
                      <div className="h-full bg-[#faf6ed] border border-[#dad1be] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),_1px_2px_6px_rgba(0,0,0,0.15)] rounded-[2px] p-2 sm:p-2.5 flex flex-col justify-between relative overflow-hidden">
                        {/* Top: Case File Header */}
                        <div>
                          <div className="flex items-center justify-between border-b border-[#e8ded0] pb-1 mb-1.5">
                            <span className="block text-[7.5px] lg:text-[8.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8c503c]">
                              Case File {index < 9 ? \`· No. 0\${index + 1}\` : \`· No. \${index + 1}\`}
                            </span>
                          </div>
                          {/* Large Readable Book Title */}
                          <h2 className="text-[11px] sm:text-xs lg:text-[13px] font-serif font-bold leading-[1.25] text-[#2c1b13] line-clamp-3 text-left tracking-tight">
                            {proj.title}
                          </h2>
                          {/* Subtle Divider Line */}
                          <div className="w-8 h-[1.5px] bg-[#8c503c]/30 my-1.5" />
                          {/* Genre / Subgenre */}
                          <p className="text-[8.5px] lg:text-[9.5px] font-serif italic text-[#745344] line-clamp-1 text-left">
                            {proj.genre || "Fantasy Archive"}
                          </p>
                        </div>
                        {/* Bottom: Word Count & Progress */}
                        <div className="mt-auto pt-1.5 border-t border-[#ebdcd0]">
                          <div className="flex items-baseline justify-between mb-1 gap-1">
                            <span className="text-[7.5px] lg:text-[8.5px] uppercase font-bold tracking-widest text-[#8c503c]/70 shrink-0">
                              Words
                            </span>
                            <span className="text-[8.5px] lg:text-[10px] font-serif font-bold text-[#2c1b13] truncate">
                              {(proj.currentWords || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-[#e7decfa0] h-[3px] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#8c503c] rounded-full transition-all duration-700"
                              style={{ width: \`\${Math.min(100, Math.max(5, progress))}%\` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Fore-Edge (Simulating layered book pages inside) */}
                    <div className="absolute right-0 top-[2px] bottom-[2px] w-[5px] bg-[#e6dfd1] rounded-r-[2px] border-l border-[#baa791] shadow-inner opacity-90 flex flex-col justify-around py-3 pointer-events-none z-10">
                      <div className="w-full h-[1px] bg-black/15" />
                      <div className="w-full h-[1px] bg-black/15" />
                      <div className="w-full h-[1px] bg-black/15" />
                      <div className="w-full h-[1px] bg-black/15" />
                    </div>

                    {/* Leather/Cloth Cover Texture */}
                    <div
                      className="absolute inset-0 opacity-[0.22] mix-blend-overlay pointer-events-none rounded-r-md rounded-l-[3px]"
                      style={{
                        backgroundImage:
                          'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>`;

  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Successfully patched");
} else {
  console.error("Could not find start or end block");
}
