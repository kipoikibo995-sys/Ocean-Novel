import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Add inline-block to text-ellipsis
content = content.replace('overflow-hidden text-ellipsis transition-opacity', 'overflow-hidden text-ellipsis transition-opacity inline-block')

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
