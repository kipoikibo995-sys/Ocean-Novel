const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// In Tiptap React v3, they might have moved BubbleMenu and FloatingMenu to @tiptap/react? Wait, maybe @tiptap/react doesn't export them anymore in v3.
// Let's replace:
// import { useEditor, EditorContent, ReactRenderer, BubbleMenu, FloatingMenu } from '@tiptap/react';
// with:
// import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
// import { BubbleMenu } from '@tiptap/extension-bubble-menu';
// import { FloatingMenu } from '@tiptap/extension-floating-menu';

// But wait, the React components for BubbleMenu and FloatingMenu are usually in @tiptap/react. Let's check node_modules/@tiptap/react/dist/index.d.ts

code = code.replace(/import \{ useEditor, EditorContent, ReactRenderer, BubbleMenu, FloatingMenu \} from '@tiptap\/react';/, "import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';\nimport { BubbleMenu } from '@tiptap/react';\nimport { FloatingMenu } from '@tiptap/react';");

fs.writeFileSync('src/components/MentionEditor.tsx', code);
