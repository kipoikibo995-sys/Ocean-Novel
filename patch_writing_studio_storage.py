import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace('import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";', 'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\nimport { storage, ProjectData } from "@/lib/storage";\nimport { useParams } from "react-router-dom";')

# Update state initialization
old_init = """  // Manuscript state
  const [manuscript, setManuscript] = useState(MOCK_MANUSCRIPT);"""

new_init = """  const { id: projectId } = useParams();

  // Manuscript state
  const [manuscript, setManuscript] = useState<ManuscriptItem[]>([]);
  
  // Load data on mount
  useEffect(() => {
    if (projectId) {
      const data = storage.getProjectData(projectId);
      if (data && data.manuscript && data.manuscript.length > 0) {
        setManuscript(data.manuscript);
        
        // Find first scene to activate
        const findFirstScene = (items: ManuscriptItem[]): string | null => {
           for (const item of items) {
             if (item.type === 'scene') return item.id;
             if (item.children) {
                const found = findFirstScene(item.children);
                if (found) return found;
             }
           }
           return null;
        };
        const first = findFirstScene(data.manuscript);
        if (first) setActiveDocId(first);
      } else {
        setManuscript(MOCK_MANUSCRIPT);
      }
    }
  }, [projectId]);"""
content = content.replace(old_init, new_init)

# Sync manuscript state to localStorage when it changes
old_handleContentChange = """        return updateNode(prev);
      });
      setIsSaving(false);
    }, 1000);"""

new_handleContentChange = """        const updated = updateNode(prev);
        if (projectId) storage.saveProjectData(projectId, { manuscript: updated });
        return updated;
      });
      setIsSaving(false);
    }, 1000);"""
content = content.replace(old_handleContentChange, new_handleContentChange)

# Need to update saveRename, handleDrop, handleAddNew to persist too.
# Let's add an effect that watches `manuscript` and saves it! Wait, `manuscript` changes on every keystroke if we aren't careful, but we only update it via `setManuscript`.
# Actually, an easier way is just to add a `useEffect` on `manuscript`. BUT `handleContentChange` already saves it via the callback.
# Let's just create a wrapper around `setManuscript`.

content = content.replace("setManuscript(newManuscript);", "setManuscript(newManuscript); if (projectId) storage.saveProjectData(projectId, { manuscript: newManuscript });")

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
