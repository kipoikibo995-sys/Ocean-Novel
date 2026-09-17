import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Make the grid min-h-[400px] instead of min-h-0
content = content.replace(
    'className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0"',
    'className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-[400px]"'
)

# Also ensure the wrapper of the Investigation Board doesn't clip
content = content.replace(
    '<section className="flex-1 flex flex-col min-h-0 pb-2">',
    '<section className="flex-1 flex flex-col min-h-[450px] pb-2">'
)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
