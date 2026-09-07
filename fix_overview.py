import re

with open('src/pages/ProjectOverview.tsx', 'r') as f:
    content = f.read()

old_init = """  const navigate = useNavigate();
  const { project } = useProject();"""

new_init = """  const { id } = useParams();
  const navigate = useNavigate();
  
  const savedProject = id ? storage.getProjects().find(p => p.id === id) : null;
  const projectStats = {
    totalWords: savedProject?.currentWords || 0,
    targetWords: savedProject?.wordGoal || 50000,
  };
  
  const displayTitle = savedProject?.title || "Untitled";
  const displayGenre = savedProject?.genre || "Fiction";"""

content = content.replace(old_init, new_init)

with open('src/pages/ProjectOverview.tsx', 'w') as f:
    f.write(content)
