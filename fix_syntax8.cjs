const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// I also need to replace the original imports if they are still there because my previous replacement might not have matched if it had been changed
code = code.replace(/import \{ useEditor, EditorContent, ReactRenderer, BubbleMenu, FloatingMenu \} from '@tiptap\/react';/, "import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';\nimport { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';");

fs.writeFileSync('src/components/MentionEditor.tsx', code);
