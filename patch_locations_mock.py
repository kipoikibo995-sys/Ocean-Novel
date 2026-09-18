import re

with open("src/pages/Locations.tsx", "r") as f:
    content = f.read()

# Remove mock imports
content = re.sub(r'import\s*\{\s*MOCK_LOCATIONS,\s*MOCK_CHARACTERS,\s*MOCK_MANUSCRIPT\s*\}\s*from\s*"@/mockData";',
                 '', content)

content = content.replace("searchItems(MOCK_MANUSCRIPT);", "") # Might need to replace this intelligently
content = content.replace("locs = MOCK_LOCATIONS.map(loc => ({", "locs = []; // MOCK_LOCATIONS removed")
content = content.replace(": MOCK_LOCATIONS.map(loc => ({", ": []")

# For MOCK_CHARACTERS in Locations.tsx:
content = content.replace("MOCK_CHARACTERS", "(projectData?.characters || [])")

with open("src/pages/Locations.tsx", "w") as f:
    f.write(content)

print("Locations patched")
