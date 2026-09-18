import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Remove mock imports
content = re.sub(r'import\s*\{\s*MOCK_PROJECT,\s*MOCK_PROJECTS,\s*MOCK_MANUSCRIPT,\s*MOCK_CHARACTERS,\s*MOCK_LOCATIONS,\s*ManuscriptItem,\s*\}\s*from\s*"@/mockData";',
                 'import { ManuscriptItem } from "@/mockData";', content)

# Remove MOCK_CHARACTERS fallback
content = content.replace("? activeProjectData.characters\n      : MOCK_CHARACTERS;", "? activeProjectData.characters\n      : [];")

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)

print("Dashboard patched")
