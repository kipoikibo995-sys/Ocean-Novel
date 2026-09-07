import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# Replace binder overflow-y-auto
content = content.replace('className="flex-1 overflow-y-auto p-2"', 'className="flex-1 overflow-y-auto p-2 custom-scrollbar"')

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
