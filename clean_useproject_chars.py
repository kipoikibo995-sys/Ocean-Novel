import re

with open("src/pages/Characters.tsx", "r") as f:
    content = f.read()

content = content.replace("import { useProject } from \"@/context/ProjectContext\";", "")
content = content.replace("  const { project } = useProject();", "")

with open("src/pages/Characters.tsx", "w") as f:
    f.write(content)

print("Characters cleaned")
