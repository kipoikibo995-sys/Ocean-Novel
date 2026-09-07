const fs = require('fs');
let code = fs.readFileSync('src/pages/WritingStudio.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/WritingStudio.tsx', code);
