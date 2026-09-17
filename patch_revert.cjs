const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const startStr = '          {/* ARCHIVAL BOOK STACK (Physical Dossier Stack) */}';
const endStr = '        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `          {/* ARCHIVAL BOOK STACK (Physical Dossier Stack) */}
          <div className="flex items-end overflow-x-auto pt-6 pb-8 px-4 sm:px-6 snap-x -mx-4 sm:mx-0 scroll-smooth custom-scrollbar relative z-10">
            {/* Render all projects from local storage */}
            {savedProjects.length === 0 && (
               <div className="flex items-center justify-center w-full h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50">
                 <p className="text-stone-500 text-sm font-medium">No archives found. Start a new project.</p>
               </div>
            )}
            {savedProjects.map((proj, index) => {
              const TILT_ANGLES = [-1.2, 0.9, -0.8, 1.2, -1.0];
              const tilt = TILT_ANGLES[index % TILT_ANGLES.length];

              const THEMES = [
                { bg: "bg-[#2a1a14]", border: "border-[#4a2e22]", spine: "bg-[#1a0f0b]", accent: "#8c503c" },
                { bg: "bg-[#381c16]", border: "border-[#55271d]", spine: "bg-[#230f0a]", accent: "#a64228" },
                { bg: "bg-[#182330]", border: "border-[#25394e]", spine: "bg-[#0e1620]", accent: "#3a607e" },
                { bg: "bg-[#17252d]", border: "border-[#243d4a]", spine: "bg-[#0c161c]", accent: "#36687a" },
                { bg: "bg-[#332212]", border: "border-[#4e3419]", spine: "bg-[#1f1409]", accent: "#966224" },
              ];
              const theme = THEMES[index % THEMES.length];
              const isSelected = selectedProjectId === proj.id;
              const progress = Math.round(
                ((proj.currentWords || 0) / (proj.wordGoal || 75000)) * 100,
              );

              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(\`/project/\${proj.id}\`)}
                  onMouseEnter={() => setSelectedProjectId(proj.id)}
                  style={{
                    zIndex: isSelected ? 25 : index + 2,
                    transform: \`rotate(\${tilt}deg)\`,
                  }}
                  className={cn(
                    "snap-center sm:snap-start shrink-0 group cursor-pointer transition-all duration-300 relative select-none",
                    index > 0 && "-ml-5 sm:-ml-6 lg:-ml-7",
                    "hover:!z-40 hover:!rotate-0 hover:-translate-y-3.5 hover:scale-[1.02]",
                    isSelected && "-translate-y-1.5 !rotate-0 shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
                  )}
                >
                  <div
                    className={cn(
                      "relative w-[165px] h-[195px] sm:w-[190px] sm:h-[215px] lg:w-[215px] lg:h-[235px] rounded-r-md rounded-l-[3px] transition-all duration-300",
                      "shadow-[-4px_4px_14px_rgba(0,0,0,0.35),_4px_8px_20px_rgba(0,0,0,0.45)]",
                      "group-hover:shadow-[-6px_10px_24px_rgba(0,0,0,0.45),_6px_16px_36px_rgba(0,0,0,0.65)]",
                      "border",
                      theme.bg,
                      theme.border,
                      isSelected ? "ring-2 ring-[#c99846]/80 ring-offset-1 ring-offset-[#2a1a14]" : ""
                    )}
                  >
                    {/* Spine Binding (Distinct book spine with embossed horizontal bands) */}
                    <div className="absolute left-0 top-0 bottom-0 w-[20px] lg:w-[24px] bg-gradient-to-r from-black/60 via-black/40 to-black/20 border-r border-black/80 rounded-l-[3px] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.6)] flex flex-col justify-between py-5 px-[3px] z-20">
                      {/* Embossed spine ribs/bands */}
                      <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                      <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                      <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                      <div className="w-full h-[2.5px] bg-black/50 border-t border-white/10 rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
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

                    {/* Selected Archive Bookmark Ribbon */}
                    {isSelected && (
                      <div className="absolute -top-1.5 right-4 w-3.5 h-6 bg-[#8c503c] shadow-md flex items-center justify-center rounded-b-xs pointer-events-none z-30">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#fcead0]" />
                      </div>
                    )}

                    {/* Integrated Archival Case File Cover Plate */}
                    <div className="absolute inset-0 ml-[22px] lg:ml-[26px] mr-[8px] my-[8px] h-[calc(100%-16px)] z-10 pointer-events-none flex flex-col">
                      <div className="h-full bg-[#faf6ed] border border-[#dad1be] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),_1px_2px_6px_rgba(0,0,0,0.15)] rounded-[2px] p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden">
                        {/* Archival Tape on Top */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-white/60 border-t border-b border-black/5 rotate-[-0.5deg] pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.06)]" />

                        {/* Top: Case File Header */}
                        <div>
                          <div className="flex items-center justify-between border-b border-[#e8ded0] pb-1 mb-1.5">
                            <span className="block text-[7.5px] lg:text-[8.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8c503c]">
                              Case File {index < 9 ? \`· No. 0\${index + 1}\` : \`· No. \${index + 1}\`}
                            </span>
                          </div>

                          {/* Large Readable Book Title */}
                          <h2 className="text-xs sm:text-[13px] lg:text-[14.5px] font-serif font-bold leading-[1.25] text-[#2c1b13] line-clamp-3 text-left tracking-tight">
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
                  </div>
                </div>
              );
            })}
          </div>
        </section>
\n`;

  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Successfully reverted");
} else {
  console.error("Could not find start or end block");
}
