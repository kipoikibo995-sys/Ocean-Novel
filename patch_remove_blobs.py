import re

with open('src/pages/CreateProject.tsx', 'r') as f:
    content = f.read()

blob_regex = r'\{\/\* Abstract Artistic Background - Matches Dashboard \*\/\}\n\s*<div className="absolute inset-0 overflow-hidden pointer-events-none">\n.*?\n.*?\n\s*<\/div>'
content = re.sub(blob_regex, '', content, flags=re.DOTALL)

with open('src/pages/CreateProject.tsx', 'w') as f:
    f.write(content)
