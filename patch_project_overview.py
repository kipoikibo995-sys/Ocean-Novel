import re

with open('src/pages/ProjectOverview.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace('import { useProject } from "@/context/ProjectContext";', 'import { useProject } from "@/context/ProjectContext";\nimport { storage } from "@/lib/storage";\nimport { useParams } from "react-router-dom";')

# Get param and local storage project
old_init = """  const { project } = useProject();
  const navigate = useNavigate();"""

new_init = """  const { id } = useParams();
  const navigate = useNavigate();
  
  const savedProject = id ? storage.getProjects().find(p => p.id === id) : null;
  const projectStats = {
    totalWords: savedProject?.currentWords || 0,
    targetWords: savedProject?.wordGoal || 50000,
  };
  
  // Use savedProject if available, else fallback
  const displayTitle = savedProject?.title || "Untitled";
  const displayGenre = savedProject?.genre || "Fiction";"""

content = content.replace(old_init, new_init)

# Replace project.title
content = content.replace("{project.title}", "{displayTitle}")

# Replace project.stats.totalWords
content = content.replace("project.stats.totalWords", "projectStats.totalWords")
content = content.replace("project.stats.targetWords", "projectStats.targetWords")

with open('src/pages/ProjectOverview.tsx', 'w') as f:
    f.write(content)
