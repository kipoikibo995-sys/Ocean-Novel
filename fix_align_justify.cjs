const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');
code = code.replace(/import { \n  Bold/g, 'import {\n  AlignJustify, Bold');
fs.writeFileSync('src/components/MentionEditor.tsx', code);
