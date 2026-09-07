import re

with open('src/components/MentionEditor.tsx', 'r') as f:
    content = f.read()

# Remove BubbleMenu import
content = content.replace("import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';", "import { FloatingMenu } from '@tiptap/react/menus';")

# Remove the entire BubbleMenu block
bubble_block = r'\{/\*\ 1\.\ BUBBLE MENU\ \(Shows\ when\ text\ is\ selected\)\ \*/\}.*?\{editor\ &&\ \(\n\s*<BubbleMenu.*?</BubbleMenu>\n\s*\)\}'
content = re.sub(bubble_block, '', content, flags=re.DOTALL)

with open('src/components/MentionEditor.tsx', 'w') as f:
    f.write(content)
