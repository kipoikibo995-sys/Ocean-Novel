import re

with open("src/pages/Characters.tsx", "r") as f:
    content = f.read()

# Replace CATALOG_CHARACTERS with empty array logic
content = re.sub(r'const CATALOG_CHARACTERS = \[\s*\{[\s\S]*?\];', 'const CATALOG_CHARACTERS: any[] = [];', content)

# Remove MOCK_NODES and MOCK_EDGES
content = re.sub(r'const MOCK_NODES = \[\s*\{[\s\S]*?\];', 'const MOCK_NODES: any[] = [];', content)
content = re.sub(r'const MOCK_EDGES = \[\s*\{[\s\S]*?\];', 'const MOCK_EDGES: any[] = [];', content)

with open("src/pages/Characters.tsx", "w") as f:
    f.write(content)

print("Characters patched")
