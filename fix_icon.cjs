const fs = require('fs');
let code = fs.readFileSync('src/pages/Plot.tsx', 'utf8');

code = code.replace(/LayoutColumns/g, 'Columns');

fs.writeFileSync('src/pages/Plot.tsx', code);
