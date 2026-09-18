import re

with open("src/pages/WritingStudio.tsx", "r") as f:
    content = f.read()

# Remove mock imports
content = re.sub(r'import\s*\{\s*MOCK_CHARACTERS,\s*MOCK_LOCATIONS,\s*MOCK_MANUSCRIPT,\s*ManuscriptItem\s*\}\s*from\s*"@/mockData";',
                 'import { ManuscriptItem } from "@/mockData";', content)

content = content.replace("? data.characters : MOCK_CHARACTERS", "? data.characters : []")
content = content.replace("? data.locations : MOCK_LOCATIONS", "? data.locations : []")
content = content.replace("? data.manuscript : MOCK_MANUSCRIPT", "? data.manuscript : []")
content = content.replace("const [characters, setCharacters] = useState<any[]>(MOCK_CHARACTERS);", "const [characters, setCharacters] = useState<any[]>([]);")
content = content.replace("const [locations, setLocations] = useState<any[]>(MOCK_LOCATIONS);", "const [locations, setLocations] = useState<any[]>([]);")
content = content.replace("const [manuscript, setManuscript] = useState<ManuscriptItem[]>(MOCK_MANUSCRIPT);", "const [manuscript, setManuscript] = useState<ManuscriptItem[]>([]);")
content = content.replace("setManuscript(MOCK_MANUSCRIPT);", "setManuscript([]);")

with open("src/pages/WritingStudio.tsx", "w") as f:
    f.write(content)

print("WritingStudio patched")
