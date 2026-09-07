const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

const oldClasses = "'inline-flex items-center bg-[#8C503C]/10 text-[#8C503C] border border-[#8C503C]/20 rounded-md px-1.5 py-0 mx-0.5 font-bold cursor-pointer hover:bg-[#8C503C]/20 transition-colors select-none text-[0.9em] mention'";
const newClasses = "'text-[#8C503C] font-semibold cursor-pointer underline decoration-dotted underline-offset-4 decoration-[#8C503C]/40 hover:decoration-[#8C503C] transition-colors select-none mention'";

code = code.replace(oldClasses, newClasses);
fs.writeFileSync('src/components/MentionEditor.tsx', code);
