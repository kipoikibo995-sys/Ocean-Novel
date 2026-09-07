import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

autosave_logic = """  // Auto-save logic
  useEffect(() => {
    if (!activeContent) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      // Simulate saving delay
      setIsSaving(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeContent]);

  // Exit Focus Mode on Esc"""

content = content.replace("  // Exit Focus Mode on Esc", autosave_logic)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
