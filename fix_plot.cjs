const fs = require('fs');
let code = fs.readFileSync('src/pages/Plot.tsx', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/Plot.tsx', code);
