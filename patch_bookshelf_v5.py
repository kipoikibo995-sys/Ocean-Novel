import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# 1. Remove the legend
legend_pattern = r"\{/\* Legend cho thể loại \(Idea 2\) \*/\}.*?</div>"
content = re.sub(legend_pattern, "", content, flags=re.DOTALL)

# 2. Modify heights based on title length
# Find: isSelected ? "h-[240px]" : "h-[220px]"
# and replace with style-based heights. Wait, earlier we have:
# const spineVariant = index % 4;

replacement_logic = """const spineVariant = index % 4;
                
                const titleLength = proj.title.length;
                const baseHeight = Math.max(220, Math.min(360, 100 + titleLength * 6.5));
                const bookHeight = isSelected ? baseHeight + 20 : baseHeight;
                
                const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;"""

content = content.replace("const spineVariant = index % 4;\n                \n                const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;", replacement_logic)

# Replace the flex container to allow taller books.
# from h-[260px] to h-[400px]
content = content.replace("h-[260px] gap-[2px]", "h-[380px] gap-[2px]")

# Remove fixed heights from classNames and apply it dynamically.
# Find: "isSelected ? "h-[240px]" : "h-[220px]""
content = content.replace('isSelected ? "h-[240px]" : "h-[220px]"', '""')

# Find: style={{ width: isSelected ? '260px' : `${spineWidth}px` }}
# Replace with: style={{ width: isSelected ? '260px' : `${spineWidth}px`, height: `${bookHeight}px` }}
content = content.replace("style={{ width: isSelected ? '260px' : `${spineWidth}px` }}", "style={{ width: isSelected ? '260px' : `${spineWidth}px`, height: `${bookHeight}px` }}")


# Adjust text widths so it doesn't truncate. 
# Style 0: style={{ width: '200px', textAlign: 'center' }} -> style={{ width: `${baseHeight - 64}px`, textAlign: 'center' }}
content = content.replace("style={{ width: '200px', textAlign: 'center' }}", "style={{ width: `${baseHeight - 70}px`, textAlign: 'center' }}")
# Remove truncation
content = content.replace('{proj.title.length > 25 ? proj.title.substring(0, 25) + "..." : proj.title}', '{proj.title}')

# Style 1: style={{ width: '160px', textAlign: 'center' }}
content = content.replace("style={{ width: '160px', textAlign: 'center' }}", "style={{ width: `${baseHeight - 64}px`, textAlign: 'center' }}")

# Style 2: style={{ width: '120px', textAlign: 'center' }}
content = content.replace("style={{ width: '120px', textAlign: 'center' }}", "style={{ width: `${baseHeight - 100}px`, textAlign: 'center' }}")
content = content.replace('{proj.title.length > 18 ? proj.title.substring(0, 18) + "..." : proj.title}', '{proj.title}')

# Style 3: style={{ width: '170px', textAlign: 'center' }}
content = content.replace("style={{ width: '170px', textAlign: 'center' }}", "style={{ width: `${baseHeight - 50}px`, textAlign: 'center' }}")
content = content.replace('{proj.title.length > 22 ? proj.title.substring(0, 22) + "..." : proj.title}', '{proj.title}')

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
print("Patched heights and legend successfully")
