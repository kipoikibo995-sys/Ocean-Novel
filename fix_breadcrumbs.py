import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# 1. Remove the misplaced block
misplaced_block = """  const getBreadcrumbs = (items: ManuscriptItem[], targetId: string, currentPath: ManuscriptItem[] = []): ManuscriptItem[] | null => {
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
  const parentDoc = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;"""

content = content.replace(misplaced_block, "")

# 2. Insert it before the main component return
main_return = """  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F1EA]">"""

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

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F1EA]">"""

content = content.replace(main_return, good_block)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
