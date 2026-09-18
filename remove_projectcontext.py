import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("import { ProjectProvider } from \"./context/ProjectContext\";\n", "")
content = content.replace("<ProjectProvider>\n", "")
content = content.replace("</ProjectProvider>\n", "")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("App.tsx cleaned")
