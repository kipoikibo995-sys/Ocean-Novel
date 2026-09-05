const fs = require('fs');

const replacements = [
  { search: /bg-zinc-50/g, replace: 'bg-transparent' },
  { search: /bg-zinc-100/g, replace: 'bg-[#E5E0D5]' },
  { search: /hover:bg-zinc-100/g, replace: 'hover:bg-[#E5E0D5]' },
  { search: /bg-white/g, replace: 'bg-[#F9F6ED]' },
  { search: /border-zinc-200/g, replace: 'border-[#E5E0D5]' },
  { search: /border-zinc-300/g, replace: 'border-[#D3BFA9]' },
  { search: /hover:border-zinc-900/g, replace: 'hover:border-[#965A5A]' },
  { search: /text-zinc-900/g, replace: 'text-stone-800' },
  { search: /hover:text-zinc-900/g, replace: 'hover:text-[#965A5A]' },
  { search: /text-zinc-800/g, replace: 'text-stone-800' },
  { search: /text-zinc-600/g, replace: 'text-stone-600' },
  { search: /text-zinc-500/g, replace: 'text-stone-500' },
  { search: /text-zinc-400/g, replace: 'text-stone-400' },
  { search: /text-zinc-300/g, replace: 'text-stone-300' },
  { search: /bg-zinc-900/g, replace: 'bg-[#965A5A]' },
  { search: /hover:bg-zinc-900\/90/g, replace: 'hover:bg-[#7D4A4A]' },
  { search: /ring-zinc-100/g, replace: 'ring-[#E5E0D5]' },
  { search: /ring-zinc-900/g, replace: 'ring-[#965A5A]' },
  { search: /bg-zinc-200/g, replace: 'bg-[#E5E0D5]' },
  { search: /border-zinc-100/g, replace: 'border-[#E5E0D5]' },
  // WritingStudio sidebar tabs specific fixes:
  { search: /bg-indigo-50/g, replace: 'bg-[#965A5A]/10' },
  { search: /border-indigo-200/g, replace: 'border-[#965A5A]' },
  { search: /ring-indigo-500\/20/g, replace: 'ring-[#965A5A]/20' },
  { search: /border-indigo-100/g, replace: 'border-[#965A5A]/30' },
];

const files = [
  './src/pages/Characters.tsx',
  './src/pages/Locations.tsx',
  './src/pages/Plot.tsx',
  './src/pages/StoryBible.tsx',
  './src/pages/WritingStudio.tsx',
  './src/components/MentionEditor.tsx',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
