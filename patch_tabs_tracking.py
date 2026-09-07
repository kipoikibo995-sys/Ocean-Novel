import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

content = content.replace("tracking-widest rounded-sm transition-all", "tracking-wider rounded-sm transition-all")

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
