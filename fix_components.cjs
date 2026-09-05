const fs = require('fs');
const path = require('path');

const dirs = ['./src/components/ui', './src/pages'];

const replacements = [
  { regex: /rounded-none/g, replacement: 'rounded-xl' },
  { regex: /bg-\[\#FBFBFA\]/g, replacement: 'bg-zinc-50' },
  { regex: /bg-\[\#F7F6F4\]/g, replacement: 'bg-zinc-100' },
  { regex: /text-\[\#1A1A1A\]/g, replacement: 'text-zinc-900' },
  { regex: /text-\[\#5E5D5A\]/g, replacement: 'text-zinc-600' },
  { regex: /text-\[\#8E8D8A\]/g, replacement: 'text-zinc-500' },
  { regex: /border-\[\#E5E4E1\]/g, replacement: 'border-zinc-200' },
  { regex: /border-\[\#1A1A1A\]/g, replacement: 'border-zinc-900' },
  { regex: /bg-\[\#1A1A1A\]/g, replacement: 'bg-zinc-900' },
  { regex: /ring-\[\#1A1A1A\]/g, replacement: 'ring-zinc-900' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDir);
