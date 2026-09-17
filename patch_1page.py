import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# 1. Main container revert to h-screen
content = content.replace(
    'className="flex-1 min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#F4F1EA] flex flex-col relative font-sans"',
    'className="flex-1 h-[100dvh] w-full overflow-hidden bg-[#F4F1EA] flex flex-col relative font-sans"'
)

# 2. Bookshelf height optimization
content = content.replace(
    'h-[380px] gap-[2px]',
    'h-[280px] gap-[2px]'
)

# 3. Section 2 revert to min-h-0
content = content.replace(
    '<section className="flex-1 flex flex-col min-h-[450px] pb-2">',
    '<section className="flex-1 flex flex-col min-h-0 pb-2">'
)
content = content.replace(
    'className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-[400px]"',
    'className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0"'
)

# Fix right column min height just in case
content = content.replace(
    'className="lg:col-span-4 flex flex-row lg:flex-col gap-3 lg:gap-4 min-h-[140px] lg:min-h-0 h-full"',
    'className="lg:col-span-4 flex flex-row lg:flex-col gap-3 lg:gap-4 min-h-0 h-full"'
)


with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
