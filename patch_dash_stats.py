import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

# Replace fake streak and session time
old_stats_header = """                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Streak
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-stone-800 leading-none">
                      5 Days
                    </p>
                  </div>
                </div>

                <div className="w-px h-4 lg:h-5 bg-stone-300/50" />

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8c503c] border border-[#e5e0d5]">
                    <Coffee className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  </div>
                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Session
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-[#4a3225] leading-none">
                      14h 20m
                    </p>
                  </div>"""

new_stats_header = """                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Streak
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-stone-800 leading-none">
                      {savedProjects.length > 0 ? "1 Day" : "0 Days"}
                    </p>
                  </div>
                </div>

                <div className="w-px h-4 lg:h-5 bg-stone-300/50" />

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8c503c] border border-[#e5e0d5]">
                    <Coffee className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  </div>
                  <div>
                    <p className="text-[7px] lg:text-[8px] font-bold uppercase tracking-widest text-stone-500 leading-none mb-0.5">
                      Words Written
                    </p>
                    <p className="text-[10px] lg:text-xs font-bold text-[#4a3225] leading-none">
                      {savedProjects.reduce((sum, p) => sum + (p.currentWords || 0), 0).toLocaleString()}
                    </p>
                  </div>"""

content = content.replace(old_stats_header, new_stats_header)

# Replace the [project].map with savedProjects.map
old_map = """            {/* Render the single project from context */}
            {[project].map((proj) => {"""

new_map = """            {/* Render all projects from local storage */}
            {savedProjects.length === 0 && (
               <div className="flex items-center justify-center w-full h-[200px] border border-dashed border-[#e5e0d5] rounded-md bg-white/50">
                 <p className="text-stone-500 text-sm font-medium">No archives found. Start a new project.</p>
               </div>
            )}
            {savedProjects.map((proj) => {"""
content = content.replace(old_map, new_map)

# Replace proj.stats.totalWords with proj.currentWords
content = content.replace("proj.stats.totalWords", "(proj.currentWords || 0)")
content = content.replace("proj.stats.targetWords", "proj.wordGoal")

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
