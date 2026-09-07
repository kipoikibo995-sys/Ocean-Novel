with open('src/pages/ProjectOverview.tsx', 'r') as f:
    content = f.read()

content = content.replace("project.id", "(id || '1')")

with open('src/pages/ProjectOverview.tsx', 'w') as f:
    f.write(content)
