const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// In Tiptap v2/v3, sometimes the extensions are in a different module. 
// However, the error says: "BubbleMenu" is not exported by "node_modules/@tiptap/react/dist/index.js"
// Actually, BubbleMenu was moved to `@tiptap/extension-bubble-menu` in some setups, but `@tiptap/react` DOES export `<BubbleMenu />`.
// Let's check package.json for @tiptap/extension-bubble-menu. It's not installed.

code = code.replace(/import \{ useEditor, EditorContent, ReactRenderer, BubbleMenu, FloatingMenu \} from '@tiptap\/react';/, "import { useEditor, EditorContent, ReactRenderer, BubbleMenu, FloatingMenu } from '@tiptap/react';");

fs.writeFileSync('src/components/MentionEditor.tsx', code);
