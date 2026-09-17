import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# 1. Fix Scroll Issue
content = content.replace(
    'className="flex-1 h-[100dvh] w-full overflow-hidden bg-[#F4F1EA] flex flex-col relative font-sans"',
    'className="flex-1 min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#F4F1EA] flex flex-col relative font-sans"'
)

# 2. Fix Bookshelf layout
shelf_search = """<div className="relative pt-12 pb-0 px-2 sm:px-4 z-10 w-full overflow-hidden shrink-0 flex flex-col items-center">
          {/* Container cho kệ sách, căn giữa nếu ít sách */}
          <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
            
            {/* Wooden Shelf Base */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c371d] to-[#3a2211] rounded-t-[2px] shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] z-0" />
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#26150a] shadow-xl z-0" />
            
            <div className="flex items-end h-[380px] gap-[2px] lg:gap-[3px] overflow-x-auto overflow-y-visible custom-scrollbar pb-6 relative z-10 px-4 w-full justify-start md:justify-center">"""

shelf_replace = """<div className="relative pt-12 pb-0 px-2 sm:px-4 z-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar flex justify-start md:justify-center">
          {/* Container cho kệ sách, ôm sát content */}
          <div className="relative flex flex-col items-center shrink-0 min-w-min">
            
            {/* Wooden Shelf Base */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c371d] to-[#3a2211] rounded-t-[2px] shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] z-0" />
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#26150a] shadow-xl z-0" />
            
            <div className="flex items-end h-[380px] gap-[2px] lg:gap-[3px] pb-6 relative z-10 px-4">"""

content = content.replace(shelf_search, shelf_replace)

# 3. Fix Book heights (smooth skyline)
height_search = """const spineVariant = index % 4;
                
                const titleLength = proj.title.length;
                const baseHeight = Math.max(220, Math.min(360, 100 + titleLength * 6.5));
                const bookHeight = isSelected ? baseHeight + 20 : baseHeight;"""

height_replace = """const spineVariant = index % 4;
                
                // Varied but smooth skyline
                const HEIGHT_MAP = [230, 245, 235, 225, 250];
                const baseHeight = HEIGHT_MAP[index % HEIGHT_MAP.length];
                const bookHeight = isSelected ? baseHeight + 20 : baseHeight;"""

content = content.replace(height_search, height_replace)

# 4. Make sure text containers fit inside the baseHeight so text won't overflow the book
# We already had baseHeight - 64 etc. Let's make sure it still works.
# Wait, actually with max 250px height, the book is much shorter than 360. 
# We should probably set text width dynamically based on baseHeight - 70, which is around 160-180px.
# This was already done previously, and it dynamically uses baseHeight.

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
print("Patched dashboard successfully")
