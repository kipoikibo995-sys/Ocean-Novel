with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

start = content.find('{/* Right Panel: Context & AI */}')
end = content.find('{/* Bottom Status Bar */}', start)

if start != -1 and end != -1:
    content = content[:start] + content[end:]

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
