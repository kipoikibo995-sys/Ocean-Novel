const fs = require('fs');
let code = fs.readFileSync('src/pages/WritingStudio.tsx', 'utf8');
code = code.replace(/import { Maximize2/, 'import { Maximize2, Plus');
fs.writeFileSync('src/pages/WritingStudio.tsx', code);
