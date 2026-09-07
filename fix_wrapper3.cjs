const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

const returnBlockRegex = /return \(\s*<div className=\{`\\?flex flex-col h-full w-full bg-white border border-\\[#E5E0D5\\] rounded-xl overflow-hidden custom-editor-container \$\{className\}\\?`\}>([\s\S]*?)<\/div>\s*\);\s*\}\s*$/;

// Well, string matching might be easier:
code = code.split('bg-white border border-[#E5E0D5] rounded-xl overflow-hidden').join('bg-transparent overflow-hidden');
code = code.split('p-2 bg-[#FCFAF5] border-b border-[#E5E0D5]').join('py-3 px-4 bg-transparent border-b border-stone-200/50 mb-4 sticky top-0 z-10 backdrop-blur-sm');
code = code.split('class: `\\prose prose-stone prose-lg max-w-none w-full h-full p-8 outline-none focus:outline-none overflow-y-auto`,').join('class: `prose prose-stone prose-lg max-w-none w-full h-full px-4 outline-none focus:outline-none overflow-y-auto pb-32`,');
// Also fallback if no backslash
code = code.split('class: `prose prose-stone prose-lg max-w-none w-full h-full p-8 outline-none focus:outline-none overflow-y-auto`,').join('class: `prose prose-stone prose-lg max-w-none w-full h-full px-4 outline-none focus:outline-none overflow-y-auto pb-32`,');


fs.writeFileSync('src/components/MentionEditor.tsx', code);
