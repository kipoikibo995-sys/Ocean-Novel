const fs = require('fs');
const path = require('path');

const dir = './src/pages';
const layoutFile = './src/components/layout/layouts.tsx';

const replacements = [
  { regex: /bg-\[\#FBFBFA\]/g, replacement: 'bg-zinc-50' },
  { regex: /bg-\[\#F7F6F4\]/g, replacement: 'bg-zinc-100' },
  { regex: /text-\[\#1A1A1A\]/g, replacement: 'text-zinc-900' },
  { regex: /text-\[\#5E5D5A\]/g, replacement: 'text-zinc-600' },
  { regex: /text-\[\#8E8D8A\]/g, replacement: 'text-zinc-500' },
  { regex: /border-\[\#E5E4E1\]/g, replacement: 'border-zinc-200' },
  { regex: /border-\[\#1A1A1A\]/g, replacement: 'border-zinc-900' },
  { regex: /bg-\[\#1A1A1A\]/g, replacement: 'bg-zinc-900' },
  { regex: /ring-\[\#1A1A1A\]/g, replacement: 'ring-zinc-900' },
  { regex: /rounded-none/g, replacement: 'rounded-xl' },
  { regex: /bg-\[\#D1D1CF\]/g, replacement: 'bg-zinc-300' },
  { regex: /text-xs uppercase tracking-widest font-bold/g, replacement: 'text-xs font-semibold' },
  { regex: /text-\[10px\] uppercase tracking-widest font-bold/g, replacement: 'text-xs font-medium text-zinc-500' },
  { regex: /text-\[11px\] font-bold text-zinc-500 uppercase tracking-widest/g, replacement: 'text-xs font-semibold text-zinc-500' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  // Custom touches for ForgeTales cozy aesthetic
  content = content.replace(/shadow-sm/g, 'shadow-md');
  // Make cards rounded-2xl if they were rounded-xl
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// Read all files in pages
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.forEach(f => processFile(path.join(dir, f)));
processFile(layoutFile);
