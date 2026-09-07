import re

with open('src/lib/storage.ts', 'r') as f:
    content = f.read()

# Add currentWords to ProjectMeta
content = content.replace("wordGoal: number;", "wordGoal: number;\n  currentWords: number;")

# Add logic to calculate words
calc_logic = """  saveProjectData: (id: string, data: Partial<ProjectData>) => {
    const existing = storage.getProjectData(id) || { manuscript: [], characters: [], locations: [] };
    const newData = { ...existing, ...data };
    localStorage.setItem(PROJECT_DATA_PREFIX + id, JSON.stringify(newData));
    
    // Update last modified on the meta object
    const projects = storage.getProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      project.lastModified = Date.now();
      
      // Calculate total words if manuscript is provided
      if (data.manuscript) {
        let totalWords = 0;
        const countWords = (items: ManuscriptItem[]) => {
          for (const item of items) {
            if (item.type === 'scene' && item.content) {
              const plainText = item.content.replace(/<[^>]*>?/gm, ' ');
              const words = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
              totalWords += words;
            }
            if (item.children) {
              countWords(item.children);
            }
          }
        };
        countWords(data.manuscript);
        project.currentWords = totalWords;
      }
      
      storage.saveProject(project);
    }
  }"""
content = re.sub(r'saveProjectData: \(id: string, data: Partial<ProjectData>\) => \{.*?\n  \}', calc_logic, content, flags=re.DOTALL)

with open('src/lib/storage.ts', 'w') as f:
    f.write(content)
