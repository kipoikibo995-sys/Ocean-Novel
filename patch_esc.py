import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

esc_effect = """
  // Exit Focus Mode on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        setIsContextOpen(true);
        setIsManuscriptOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);
"""

# Insert right before the first return in WritingStudio
content = content.replace("  const renderManuscriptTree =", esc_effect + "\n  const renderManuscriptTree =")

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
