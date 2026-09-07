import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

# Replace Editor Header structure
old_header = r'<div className=\{`shrink-0 p-4 flex items-center justify-between transition-opacity duration-300 \$\{isFocusMode \? \'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-\[#FCFAF5\] to-transparent pt-6\' : \'border-b border-\[#E5E0D5\] bg-white/40 backdrop-blur-md relative z-10\'\}`\}>\n\s*<div className="flex items-center gap-3">'

new_header = """<div className={`shrink-0 p-4 grid grid-cols-3 items-center transition-opacity duration-300 ${isFocusMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#FCFAF5] to-transparent pt-6' : 'border-b border-[#E5E0D5] bg-white/40 backdrop-blur-md relative z-10'}`}>
          <div className="flex items-center gap-3 justify-self-start">"""

content = re.sub(old_header, new_header, content)

# We also need to add the portal target in the middle, and wrap the right side
# Wait, let's find the second div (right part) and insert the portal target before it.
old_right_part = r'<div className="flex items-center gap-2">\n\s*\{/\* Auto-save \*/\}'

new_right_part = """<div id="editor-toolbar-portal-target" className="flex items-center justify-center justify-self-center"></div>

          <div className="flex items-center gap-2 justify-self-end">
            {/* Auto-save */}"""

content = re.sub(old_right_part, new_right_part, content)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)

