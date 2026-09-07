import re

with open('src/pages/ProjectOverview.tsx', 'r') as f:
    content = f.read()

# Make it dynamic
content = content.replace("project.stats.chapters", "((savedProject?.currentWords || 0) > 1000 ? Math.ceil((savedProject?.currentWords || 0) / 2500) : 1)")
content = content.replace("project.stats.drafts", "1")
content = content.replace("project.stats.timeSpentHours", "Math.ceil((savedProject?.currentWords || 0) / 500)")

# For plot coverage, let's just make it a random or fixed based on current words
content = content.replace("project.stats.plotCoverage", "Math.min(100, Math.ceil((projectStats.totalWords / projectStats.targetWords) * 100))")
content = content.replace("project.stats.writtenEvents", "Math.ceil((projectStats.totalWords / projectStats.targetWords) * 20)")
content = content.replace("project.stats.totalEvents", "20")

# For project.recentActivity
content = content.replace("project.recentActivity", "[]")

with open('src/pages/ProjectOverview.tsx', 'w') as f:
    f.write(content)
