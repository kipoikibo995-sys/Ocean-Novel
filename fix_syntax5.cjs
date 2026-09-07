const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// If the build fails because it still can't find BubbleMenu, we'll try to re-structure it.
// Tiptap React exports it. Wait, the error was: "BubbleMenu" is not exported by "node_modules/@tiptap/react/dist/index.js".
// In @tiptap/react 3.x maybe they changed it?
// Let's check node_modules.

