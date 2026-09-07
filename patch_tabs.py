import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

content = content.replace(">Chars<", ">Characters<")
content = content.replace(">Locs<", ">Locations<")

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
