const fs = require('fs');
let code = fs.readFileSync('src/components/layout/layouts.tsx', 'utf8');

const navStart = '<nav className="flex-1 w-full flex flex-col gap-2">';
const newNavStart = '<nav className="flex-1 w-full flex flex-col gap-2 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">';

code = code.replace(navStart, newNavStart);

const bottomStart = '<div className="flex flex-col gap-2 mt-auto">';
const newBottomStart = '<div className="flex flex-col gap-2 mt-auto shrink-0 pt-2">';

code = code.replace(bottomStart, newBottomStart);

fs.writeFileSync('src/components/layout/layouts.tsx', code);
