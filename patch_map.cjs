const fs = require('fs');
const file = './src/components/RelationshipMap.tsx';

let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /hover:bg-zinc-50/g, replace: 'hover:bg-[#F9F6ED]' },
  { search: /bg-zinc-200/g, replace: 'bg-[#E5E0D5]' },
  { search: /text-zinc-500/g, replace: 'text-stone-500' },
  { search: /text-zinc-600/g, replace: 'text-stone-600' },
  { search: /text-zinc-800/g, replace: 'text-stone-800' },
  { search: /text-zinc-900/g, replace: 'text-stone-800' },
  { search: /border-zinc-200\/50/g, replace: 'border-[#E5E0D5]/50' },
  { search: /border-zinc-200/g, replace: 'border-[#E5E0D5]' },
  { search: /border-zinc-100/g, replace: 'border-[#E5E0D5]' },
  { search: /bg-white\/60/g, replace: 'bg-[#F9F6ED]/60' },
  { search: /bg-white\/80/g, replace: 'bg-[#F9F6ED]/80' },
  { search: /bg-white/g, replace: 'bg-[#F9F6ED]' },
  { search: /border-white\/50/g, replace: 'border-[#F9F6ED]/50' },
  { search: /border-white/g, replace: 'border-[#F9F6ED]' },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated ${file}`);
