const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');
code = code.replace(/\\flex/g, 'flex');
fs.writeFileSync('src/components/MentionEditor.tsx', code);
