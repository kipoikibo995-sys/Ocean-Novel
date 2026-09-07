import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

bad_jsx = """  const getBreadcrumbs = (items: ManuscriptItem[], targetId: string, currentPath: ManuscriptItem[] = []): ManuscriptItem[] | null => {
    for (const item of items) {
      const path = [...currentPath, item];
      if (item.id === targetId) return path;
      if (item.children) {
        const found = getBreadcrumbs(item.children, targetId, path);
        if (found) return found;
      }
    }
    return null;
  };
  
  const breadcrumbs = getBreadcrumbs(manuscript, activeDocId) || [];
  const currentDoc = breadcrumbs[breadcrumbs.length - 1];
  const parentDoc = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

        {/* Editor Header */}"""

# We need to move the const getBreadcrumbs block up before the `return (` statement.

# 1. Remove the bad block
content = content.replace(bad_jsx, "        {/* Editor Header */}")

# 2. Insert it before `return (`
good_block = """  const getBreadcrumbs = (items: ManuscriptItem[], targetId: string, currentPath: ManuscriptItem[] = []): ManuscriptItem[] | null => {
    for (const item of items) {
      const path = [...currentPath, item];
      if (item.id === targetId) return path;
      if (item.children) {
        const found = getBreadcrumbs(item.children, targetId, path);
        if (found) return found;
      }
    }
    return null;
  };
  
  const breadcrumbs = getBreadcrumbs(manuscript, activeDocId) || [];
  const currentDoc = breadcrumbs[breadcrumbs.length - 1];
  const parentDoc = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

  return ("""

content = content.replace("  return (", good_block, 1)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
