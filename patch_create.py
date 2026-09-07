import re

with open('src/pages/CreateProject.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { storage } from "@/lib/storage";')

# Update handleCreate
old_handle = """  const handleCreate = () => {
    setIsSubmitting(true);
    // Simulate creation delay
    setTimeout(() => {
      navigate("/project/1/workspace/studio");
    }, 300);
  };"""

new_handle = """  const handleCreate = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newId = Date.now().toString();
      
      // Save project meta
      storage.saveProject({
        id: newId,
        title: title || 'Untitled Project',
        author: author || 'Unknown Author',
        genre,
        audience,
        logline,
        wordGoal: wordCount ? Number(wordCount) : 50000,
        lastModified: Date.now(),
        themeColor: colorStyle.bg
      });

      // Save initial project data
      storage.saveProjectData(newId, {
        manuscript: [
          {
            id: 'part-1',
            type: 'part',
            title: 'Part I',
            children: [
              {
                id: 'chap-1',
                type: 'chapter',
                title: 'Chapter 1',
                children: [
                  {
                    id: 'scene-1',
                    type: 'scene',
                    title: 'Scene 1',
                    content: '<h1>Chapter 1</h1><p>Start writing here...</p>'
                  }
                ]
              }
            ]
          }
        ],
        characters: [],
        locations: []
      });

      navigate(`/project/${newId}/workspace/studio`);
    }, 300);
  };"""

content = content.replace(old_handle, new_handle)

with open('src/pages/CreateProject.tsx', 'w') as f:
    f.write(content)
