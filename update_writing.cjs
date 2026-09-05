const fs = require('fs');
const path = './src/pages/WritingStudio.tsx';

let content = fs.readFileSync(path, 'utf8');

// Add MentionEditor import
content = content.replace(
  'import { MOCK_CHAPTERS, MOCK_CHARACTERS, MOCK_LOCATIONS } from "@/mockData";',
  'import { MOCK_CHAPTERS, MOCK_CHARACTERS, MOCK_LOCATIONS } from "@/mockData";\nimport MentionEditor from "@/components/MentionEditor";'
);

// Add state for selected entity
content = content.replace(
  'const [isContextOpen, setIsContextOpen] = useState(true);',
  `const [isContextOpen, setIsContextOpen] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string, type: 'character' | 'location' } | null>(null);

  const handleEntityClick = (id: string, type: 'character' | 'location') => {
    setSelectedEntity({ id, type });
    setIsContextOpen(true);
    setActiveTab(type === 'character' ? 'chars' : 'locs');
  };`
);

// Replace the contentEditable div with MentionEditor
const initialText = `<h1 class="text-4xl font-bold font-sans text-zinc-900 mb-8 tracking-tight">The Lighthouse</h1>
              
              <p class="mb-6">The wind whipped against the jagged edges of the northern cliffs, carrying with it the bitter sting of sea salt and the smell of ancient decay. <span contenteditable="false" class="inline-flex items-center bg-zinc-200 text-zinc-900 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-zinc-300 transition-colors select-none text-sm" data-id="1" data-type="character">@Emma</span> pulled her coat tighter, her boots slipping occasionally on the slick, moss-covered path that wound upward.</p>
              
              <p class="mb-6">Ahead, the Old Lighthouse loomed like a rotting tooth against the bruised, twilight sky. It had been abandoned since before she was born, but tonight, as she had watched from the window of her childhood bedroom, a solitary light had flickered in its highest tower.</p>`;

const divRegex = /<div[^>]*contentEditable[\s\S]*?<\/div>\s*<div className="h-32" \/>/m;

content = content.replace(
  divRegex,
  `<div className="h-[70vh]">
              <MentionEditor 
                initialValue={\`${initialText}\`}
                onEntityClick={handleEntityClick}
              />
            </div>`
);

// Update chars tab to highlight or filter by selected entity
content = content.replace(
  /{MOCK_CHARACTERS\.map\(char => \(/g,
  `{MOCK_CHARACTERS.map(char => (
                  <div key={char.id} className={\`p-3 rounded-xl border shadow-md transition-all \${selectedEntity?.id === char.id ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-zinc-200'}\`} id={\`char-\${char.id}\`}>
                    <h4 className="text-sm font-semibold text-zinc-900">{char.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">{char.role}</p>
                    <p className="text-xs text-zinc-600 line-clamp-3">{char.description}</p>
                    {selectedEntity?.id === char.id && (
                       <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-end">
                         <Button size="sm" variant="outline" className="h-6 text-[10px]">Full Profile</Button>
                       </div>
                    )}
                  </div>
                ))}
                {/* original map removed */}`
);

// We need to just do a precise replace for chars
content = content.replace(/<div key=\{char\.id\}.*?<\/div>\s*<\/div>\s*\)\)}/s, 
`<div key={char.id} className={\`p-3 rounded-xl border shadow-md transition-all \${selectedEntity?.id === char.id && selectedEntity.type === 'character' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-zinc-200'}\`}>
                    <h4 className="text-sm font-semibold text-zinc-900">{char.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">{char.role}</p>
                    <p className="text-xs text-zinc-600 leading-relaxed">{char.description}</p>
                    {selectedEntity?.id === char.id && selectedEntity.type === 'character' && (
                       <div className="mt-3 pt-3 border-t border-indigo-100/50 flex justify-end">
                         <Button size="sm" variant="outline" className="h-6 text-[10px] bg-white">Full Profile</Button>
                       </div>
                    )}
                  </div>
                ))}`);


fs.writeFileSync(path, content, 'utf8');
