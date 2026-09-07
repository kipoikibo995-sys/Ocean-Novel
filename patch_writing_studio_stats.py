import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# Replace Stats block
old_stats = """  // Stats
  const plainText = activeContent.replace(/<[^>]*>?/gm, ' ');
  const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 wpm"""

new_stats = """  // Stats (Active Scene)
  const plainText = activeContent.replace(/<[^>]*>?/gm, ' ');
  const wordCount = plainText.trim().split(/\\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 wpm
  
  // Stats (Project Total)
  const getTotalWords = (items: ManuscriptItem[]): number => {
    let total = 0;
    for (const item of items) {
       if (item.type === 'scene' && item.content) {
         const plainText = item.content.replace(/<[^>]*>?/gm, ' ');
         total += plainText.trim().split(/\\s+/).filter(w => w.length > 0).length;
       }
       if (item.children) total += getTotalWords(item.children);
    }
    return total;
  };
  const totalProjectWords = getTotalWords(manuscript);
  
  const currentProjectMeta = projectId ? storage.getProjects().find(p => p.id === projectId) : null;
  const targetWords = currentProjectMeta?.wordGoal || 50000;
  const progressPercent = Math.min(100, Math.round((totalProjectWords / targetWords) * 100));"""

content = content.replace(old_stats, new_stats)

# Find bottom status bar Daily Goal and replace with Project Goal
old_bottom = """<span className="text-[10px] font-bold tracking-widest uppercase">Daily Goal: {Math.min(100, Math.round((wordCount / 1000) * 100))}%</span>
            <div className="w-24 h-1.5 bg-[#E5E0D5] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5A9672] transition-all duration-500"
                style={{ width: `${Math.min(100, (wordCount / 1000) * 100)}%` }}
              />
            </div>"""

new_bottom = """<span className="text-[10px] font-bold tracking-widest uppercase">Project Goal: {progressPercent}%</span>
            <div className="w-24 h-1.5 bg-[#E5E0D5] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5A9672] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>"""

content = content.replace(old_bottom, new_bottom)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
