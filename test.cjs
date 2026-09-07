const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');
console.log(code.includes("handleStartDrawEdge"));
