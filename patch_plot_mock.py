import re

with open("src/pages/Plot.tsx", "r") as f:
    content = f.read()

# Remove mock imports
content = re.sub(r'import\s*\{\s*MOCK_CHARACTERS,\s*MOCK_LOCATIONS\s*\}\s*from\s*"@/mockData";',
                 '', content)

content = content.replace("MOCK_LOCATIONS", "(projectData?.locations || [])")
content = content.replace("MOCK_CHARACTERS", "(projectData?.characters || [])")

with open("src/pages/Plot.tsx", "w") as f:
    f.write(content)

print("Plot patched")
