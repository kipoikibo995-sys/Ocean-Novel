import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

old_effect = """  useEffect(() => {
    const findContent = (items: ManuscriptItem[]): string | null => {
      for (const item of items) {
        if (item.id === activeDocId) return item.content || '';
        if (item.children) {
          const found = findContent(item.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    
    const content = findContent(manuscript);
    setActiveContent(content || '');
  }, [activeDocId]);"""

new_effect = """  useEffect(() => {
    const findContent = (items: ManuscriptItem[]): string | null => {
      for (const item of items) {
        if (item.id === activeDocId) return item.content || '';
        if (item.children) {
          const found = findContent(item.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    
    const content = findContent(manuscript);
    // Only update if it actually changed to prevent cursor jumping
    setActiveContent(prev => prev !== (content || '') ? (content || '') : prev);
  }, [activeDocId, manuscript]);"""

content = content.replace(old_effect, new_effect)

# Also add key={activeDocId} to MentionEditor
content = content.replace("<MentionEditor \n                initialValue={activeContent}", "<MentionEditor \n                key={activeDocId}\n                initialValue={activeContent}")

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
