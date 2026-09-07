import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { storage, ProjectMeta } from "@/lib/storage";\nimport { useEffect } from "react";')

# Add state
old_tasks = """  // Mock To-Do Tasks
  const [tasks, setTasks] = useState(["""

new_tasks = """  const [savedProjects, setSavedProjects] = useState<ProjectMeta[]>([]);
  
  useEffect(() => {
    setSavedProjects(storage.getProjects().sort((a, b) => b.lastModified - a.lastModified));
  }, []);

  // Mock To-Do Tasks
  const [tasks, setTasks] = useState(["""
content = content.replace(old_tasks, new_tasks)

# Replace mapping of MOCK_PROJECTS
old_map = """          {MOCK_PROJECTS.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              onClick={() => navigate(`/project/${p.id}/workspace/studio`)}
              className="bg-white border border-[#E5E0D5] p-5 rounded-sm cursor-pointer hover:border-[#D49A89] hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F4F1EA] to-transparent rounded-bl-full -z-0 opacity-50" />

              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#4A3225] group-hover:text-[#8C503C] transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {p.genre}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span className="text-[10px] text-stone-500">
                      Edited {p.lastEdited}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-sm bg-[#FCFAF5] border border-[#E5E0D5] flex items-center justify-center text-stone-400 group-hover:text-[#8C503C] group-hover:border-[#D49A89] transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] text-stone-500 font-medium">
                    <span className="text-stone-800 font-bold">
                      {(p.currentWords / 1000).toFixed(1)}k
                    </span>{" "}
                    / {(p.targetWords / 1000).toFixed(1)}k words
                  </div>
                  <div className="text-[10px] font-bold text-[#8C503C]">
                    {p.progress}%
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#E5E0D5] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-[#8C503C] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}"""

new_map = """          {savedProjects.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 border border-dashed border-[#E5E0D5] rounded-sm bg-[#FCFAF5]">
              <p className="text-stone-500 text-sm mb-3">No projects yet.</p>
              <Button onClick={() => navigate('/create')} className="bg-[#4A3225] text-[#F4F1EA] hover:bg-[#332218] rounded-sm text-xs px-6">
                Start a New Project
              </Button>
            </div>
          )}
          {savedProjects.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              onClick={() => navigate(`/project/${p.id}/workspace/studio`)}
              className="bg-white border border-[#E5E0D5] p-5 rounded-sm cursor-pointer hover:border-[#D49A89] hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F4F1EA] to-transparent rounded-bl-full -z-0 opacity-50" />

              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#4A3225] group-hover:text-[#8C503C] transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {p.genre}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span className="text-[10px] text-stone-500">
                      Edited {new Date(p.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-sm bg-[#FCFAF5] border border-[#E5E0D5] flex items-center justify-center text-stone-400 group-hover:text-[#8C503C] group-hover:border-[#D49A89] transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] text-stone-500 font-medium">
                    <span className="text-stone-800 font-bold">
                      Goal:
                    </span>{" "}
                    {(p.wordGoal / 1000).toFixed(1)}k words
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#E5E0D5] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `0%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-[#8C503C] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}"""
content = content.replace(old_map, new_map)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
