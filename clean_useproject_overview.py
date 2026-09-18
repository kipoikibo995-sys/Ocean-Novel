import re

with open("src/pages/ProjectOverview.tsx", "r") as f:
    content = f.read()

content = content.replace("import { useProject } from \"@/context/ProjectContext\";\n", "")

with open("src/pages/ProjectOverview.tsx", "w") as f:
    f.write(content)

print("Overview cleaned")
