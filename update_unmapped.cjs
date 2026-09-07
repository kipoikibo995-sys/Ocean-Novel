const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// 1. Add unmappedLocations state
const stateHook = '  const [draggingNode, setDraggingNode] = useState<string | null>(null);';
const newStates = `  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  
  const [unmappedLocations, setUnmappedLocations] = useState([
    { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine" },
    { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain" }
  ]);

  const handleMapLocation = (unmapped: any) => {
    const newId = Date.now().toString();
    const newLoc = {
      id: newId,
      name: unmapped.name,
      type: unmapped.type,
      description: "Needs description...",
      atmosphere: "Unknown",
      region: "Unmapped Lands",
      imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769185/08_serene_monastery_in_the_autumn_mountains_pazt8b.jpg" // placeholder
    };
    
    // Add to locations
    setLocations(prev => [...prev, newLoc]);
    
    // Calculate center of current map view
    let centerX = 400;
    let centerY = 300;
    if(canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        centerX = (rect.width / 2 - pan.x) / scale;
        centerY = (rect.height / 2 - pan.y) / scale;
    }
    
    // Add to nodes
    setNodes(prev => [...prev, { id: newId, x: centerX, y: centerY }]);
    
    // Remove from unmapped
    setUnmappedLocations(prev => prev.filter(l => l.id !== unmapped.id));
    
    // Switch to map view to show it
    setViewMode("map");
  };
`;
code = code.replace(stateHook, newStates);

// 2. Replace the Unmapped Lands UI
const oldSidebar = `<h4 className="text-[9px] font-bold text-[#8a5b46] tracking-[0.2em] uppercase px-3 mb-2">Unmapped Lands</h4>
              <button className="w-full text-left px-3 py-2 text-sm font-serif text-stone-400 hover:text-[#e5e0d5] hover:bg-[#3d261d]/50 rounded-sm transition-colors flex items-center gap-3 group">
                <TreePine className="w-4 h-4 text-stone-500 group-hover:text-[#d49a89] transition-colors" />
                Whispering Woods
              </button>
              <button className="w-full text-left px-3 py-2 text-sm font-serif text-stone-400 hover:text-[#e5e0d5] hover:bg-[#3d261d]/50 rounded-sm transition-colors flex items-center gap-3 group">
                <Mountain className="w-4 h-4 text-stone-500 group-hover:text-[#d49a89] transition-colors" />
                Dragon's Peak
              </button>`;
              
const newSidebar = `<h4 className="text-[9px] font-bold text-[#8a5b46] tracking-[0.2em] uppercase px-3 mb-2">Unmapped Lands</h4>
              {unmappedLocations.length === 0 ? (
                <p className="px-3 text-xs italic text-stone-500">All lands mapped.</p>
              ) : (
                unmappedLocations.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => handleMapLocation(u)}
                    className="w-full text-left px-3 py-2 text-sm font-serif text-stone-400 hover:text-[#e5e0d5] hover:bg-[#3d261d]/50 rounded-sm transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {u.icon === 'TreePine' && <TreePine className="w-4 h-4 text-stone-500 group-hover:text-[#d49a89] transition-colors" />}
                      {u.icon === 'Mountain' && <Mountain className="w-4 h-4 text-stone-500 group-hover:text-[#d49a89] transition-colors" />}
                      {u.name}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-stone-600 group-hover:text-[#d49a89] opacity-0 group-hover:opacity-100 transition-opacity">
                      Add to Map
                    </div>
                  </button>
                ))
              )}`;

code = code.replace(oldSidebar, newSidebar);

fs.writeFileSync('src/pages/Locations.tsx', code);
