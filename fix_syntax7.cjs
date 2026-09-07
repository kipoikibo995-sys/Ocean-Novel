const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// BubbleMenu and FloatingMenu are now in @tiptap/react/menus ?? No, wait. 
// "For bubble menus and floating menus, import them separately from `@tiptap/react/menus`"
// Let's change the import.
code = code.replace(/import \{ useEditor, EditorContent, ReactRenderer \} from '@tiptap\/react';\nimport \{ BubbleMenu \} from '@tiptap\/react';\nimport \{ FloatingMenu \} from '@tiptap\/react';/, "import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';\nimport { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';");

fs.writeFileSync('src/components/MentionEditor.tsx', code);
