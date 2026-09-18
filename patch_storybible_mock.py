import re

with open("src/pages/StoryBible.tsx", "r") as f:
    content = f.read()

# Remove mock imports
content = re.sub(r'import\s*\{\s*MOCK_PROJECT\s*\}\s*from\s*"@/mockData";',
                 '', content)

content = content.replace("|| MOCK_PROJECT.title", "|| 'Untitled Project'")
content = content.replace("|| MOCK_PROJECT.genre", "|| 'Fantasy'")
content = content.replace("|| MOCK_PROJECT.premise", "|| 'No logline provided.'")

with open("src/pages/StoryBible.tsx", "w") as f:
    f.write(content)

print("StoryBible patched")
