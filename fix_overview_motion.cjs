const fs = require('fs');

let poCode = fs.readFileSync('src/pages/ProjectOverview.tsx', 'utf8');

poCode = poCode.replace(/<motion\.div\s+initial={{ opacity: 0 }}\s+animate={{ opacity: 1 }}\s+exit={{ opacity: 0 }}\s+transition={{ duration: 0\.25 }}/g, '<div');
poCode = poCode.replace(/<\/motion\.div>\s*$/g, '</div>\n');
poCode = poCode.replace(/<\/motion\.div>\s*\);\s*}/g, '</div>\n  );\n}'); // In case there are other motion.div tags

fs.writeFileSync('src/pages/ProjectOverview.tsx', poCode);
