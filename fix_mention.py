import re

with open('src/components/MentionEditor.tsx', 'r') as f:
    content = f.read()

# Replace return component.ref?.onKeyDown(props);
content = content.replace("return component.ref?.onKeyDown(props);", "return (component.ref as any)?.onKeyDown(props);")

with open('src/components/MentionEditor.tsx', 'w') as f:
    f.write(content)
