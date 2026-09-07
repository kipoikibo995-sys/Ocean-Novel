import re

with open('src/pages/CreateProject.tsx', 'r') as f:
    content = f.read()

content = content.replace("wordGoal: wordCount ? Number(wordCount) : 50000,", "wordGoal: wordCount ? Number(wordCount) : 50000,\n        currentWords: 0,")

with open('src/pages/CreateProject.tsx', 'w') as f:
    f.write(content)
