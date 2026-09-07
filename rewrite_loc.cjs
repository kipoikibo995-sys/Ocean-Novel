const fs = require('fs');

let content = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// 1. Update imports
content = content.replace(
  'import { MOCK_LOCATIONS } from "@/mockData";',
  'import { MOCK_LOCATIONS, MOCK_CHARACTERS, MOCK_MANUSCRIPT } from "@/mockData";\nimport { Users, BookOpen } from "lucide-react";'
);

// 2. Add helpers inside the Locations component
const helperCode = `
  const getAssociatedScenes = (locId: string) => {
    const scenes: { title: string, content: string }[] = [];
    
    const searchItems = (items: any[]) => {
      for (const item of items) {
        if (item.type === 'scene' && item.content) {
          if (item.content.includes(\`data-id="\${locId}" data-type="location"\`)) {
            scenes.push(item);
          }
        }
        if (item.children) {
          searchItems(item.children);
        }
      }
    };
    
    searchItems(MOCK_MANUSCRIPT);
    return scenes;
  };
`;

content = content.replace(
  'export default function Locations() {',
  `export default function Locations() {\n${helperCode}`
);

// 3. Find the modal body and add tabs or sections
// Currently the modal has: <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#fcfaf5]">
// We will replace this with a tabbed interface or just add sections.
// Adding sections is easier.

const modalBodyStart = `<div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#fcfaf5]">`;
const oldBody = `<div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Location Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Old Lighthouse" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Type (City, Landmark...)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Landmark" 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Short Description</label>
                <textarea 
                  className="w-full h-24 bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-serif italic text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner resize-none" 
                  placeholder="Describe the setting and its significance..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Atmosphere / Mood</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cold, damp, imposing" 
                    value={formData.atmosphere}
                    onChange={(e) => setFormData({...formData, atmosphere: e.target.value})}
                    className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Region / Parent</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Whispering Woods" 
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                  />
                </div>
              </div>`;

const newBody = `
              {/* Layout for 2 columns: Form (Left) & Cross-Linking (Right) */}
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <h3 className="text-sm font-bold text-[#4a3225] border-b border-[#e5e0d5] pb-2">General Information</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Location Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. The Old Lighthouse" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Type (City, Landmark...)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Landmark" 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Short Description</label>
                    <textarea 
                      className="w-full h-24 bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-serif italic text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner resize-none" 
                      placeholder="Describe the setting and its significance..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Atmosphere / Mood</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cold, damp, imposing" 
                        value={formData.atmosphere}
                        onChange={(e) => setFormData({...formData, atmosphere: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Region / Parent</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Whispering Woods" 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {editingLocId && (
                  <div className="w-full lg:w-[280px] shrink-0 space-y-6">
                    <h3 className="text-sm font-bold text-[#4a3225] border-b border-[#e5e0d5] pb-2 flex items-center gap-2">
                      Cross-References
                    </h3>
                    
                    {/* Residents */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-[#a66850] uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Residents
                      </h4>
                      <div className="space-y-2">
                        {MOCK_CHARACTERS.filter((c: any) => c.locationId === editingLocId).length > 0 ? (
                          MOCK_CHARACTERS.filter((c: any) => c.locationId === editingLocId).map((char: any) => (
                            <div key={char.id} className="bg-white border border-[#e5e0d5] rounded-sm p-2 flex items-center gap-2 shadow-sm">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {char.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#4a3225] truncate">{char.name}</p>
                                <p className="text-[9px] text-stone-400 uppercase tracking-wider truncate">{char.role}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 italic">No known residents.</p>
                        )}
                      </div>
                    </div>

                    {/* Associated Events */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-[#a66850] uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        Plot Events
                      </h4>
                      <div className="space-y-2">
                        {getAssociatedScenes(editingLocId).length > 0 ? (
                          getAssociatedScenes(editingLocId).map((scene, idx) => (
                            <div key={idx} className="bg-white border border-[#e5e0d5] rounded-sm p-2 shadow-sm">
                              <p className="text-xs font-bold text-[#4a3225] truncate">{scene.title}</p>
                              <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 italic">
                                Appears in manuscript scene.
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 italic">No events recorded here.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
`;

content = content.replace(oldBody, newBody);

// Make modal wider to fit the columns
content = content.replace(
  'max-w-2xl max-h-[90vh]',
  'max-w-4xl max-h-[90vh]'
);


fs.writeFileSync('src/pages/Locations.tsx', content);
