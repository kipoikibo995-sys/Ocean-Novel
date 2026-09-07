const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

const oldStr = 'className={`flex-1 relative overflow-hidden bg-[#3d261d] ${mapMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}`}';
const newStr = 'className="flex-1 relative overflow-hidden bg-[#3d261d] cursor-grab active:cursor-grabbing"';

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/pages/Locations.tsx', code);
