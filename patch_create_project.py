import re

with open('src/pages/CreateProject.tsx', 'r') as f:
    content = f.read()

# Replace general colors
content = content.replace('bg-[#965A5A]', 'bg-[#8C503C]')
content = content.replace('selection:bg-[#965A5A]', 'selection:bg-[#8C503C]')
content = content.replace('border-[#965A5A]', 'border-[#8C503C]')
content = content.replace('focus:border-[#965A5A]', 'focus:border-[#8C503C]')
content = content.replace('focus-within:border-[#965A5A]', 'focus-within:border-[#8C503C]')

# Headings and main text
content = content.replace('text-stone-800', 'text-[#4A3225]')
content = content.replace('text-stone-700', 'text-[#4A3225]')

# Borders
content = content.replace('border-stone-200', 'border-[#E5E0D5]')
content = content.replace('border-stone-300', 'border-[#D49A89]')

# Primary button
content = content.replace('bg-stone-900', 'bg-[#4A3225]')

# Audience active button
content = content.replace('bg-stone-700 text-white border-stone-700', 'bg-[#4A3225] text-white border-[#4A3225]')

# Abstract blobs (lighten them to match clean studio)
content = content.replace('bg-[#E8E3D7]', 'bg-[#E5E0D5]')
content = content.replace('bg-[#E2D9C8]', 'bg-[#F9F6ED]')

# Textarea bg
content = content.replace('bg-white/40', 'bg-[#FCFAF5]')

# Label color
content = content.replace('text-stone-400', 'text-stone-500/80')

with open('src/pages/CreateProject.tsx', 'w') as f:
    f.write(content)
