import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

# Update import
old_import = """import {
  MOCK_PROJECTS,
  MOCK_MANUSCRIPT,
  MOCK_CHARACTERS,
  ManuscriptItem,
} from "@/mockData";"""

new_import = """import {
  MOCK_PROJECT,
  MOCK_PROJECTS,
  MOCK_MANUSCRIPT,
  MOCK_CHARACTERS,
  MOCK_LOCATIONS,
  ManuscriptItem,
} from "@/mockData";"""

content = content.replace(old_import, new_import)

# Update useEffect
old_effect = """  useEffect(() => {
    setSavedProjects(storage.getProjects().sort((a, b) => b.lastModified - a.lastModified));
  }, []);"""

new_effect = """  useEffect(() => {
    let projects = storage.getProjects();
    
    // Seed sample project on first load if empty
    if (projects.length === 0) {
      const sampleId = 'sample-' + Date.now();
      
      storage.saveProject({
        id: sampleId,
        title: MOCK_PROJECT.title,
        author: 'Sarah Cole',
        genre: MOCK_PROJECT.genre,
        audience: 'Adult',
        logline: MOCK_PROJECT.premise,
        wordGoal: MOCK_PROJECT.targetWords,
        currentWords: MOCK_PROJECT.currentWords,
        lastModified: Date.now(),
        themeColor: 'bg-[#2a1a14]'
      });

      storage.saveProjectData(sampleId, {
        manuscript: MOCK_MANUSCRIPT,
        characters: MOCK_CHARACTERS,
        locations: MOCK_LOCATIONS
      });
      
      projects = storage.getProjects();
    }
    
    setSavedProjects(projects.sort((a, b) => b.lastModified - a.lastModified));
  }, []);"""

content = content.replace(old_effect, new_effect)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
