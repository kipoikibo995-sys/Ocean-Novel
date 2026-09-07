import re

with open('src/mockData.ts', 'r') as f:
    content = f.read()

content = content.replace("currentWords: 284,", "currentWords: 925,")
content = content.replace("progress: 1,", "progress: 2,")

with open('src/mockData.ts', 'w') as f:
    f.write(content)
