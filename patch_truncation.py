import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Replace overflow-visible with overflow-hidden truncate
content = content.replace('whitespace-nowrap overflow-visible', 'whitespace-nowrap overflow-hidden text-ellipsis')

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
