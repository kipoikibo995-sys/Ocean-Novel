const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// Update locations state
const locState1 = `  const [locations, setLocations] = useState(() => MOCK_LOCATIONS.map(loc => ({
    ...loc,
    atmosphere: (loc as any).atmosphere || "Mysterious",
    region: (loc as any).region || "Unknown Region"
  })));`;
const locState2 = `  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('story_locations');
    return saved ? JSON.parse(saved) : MOCK_LOCATIONS.map(loc => ({
      ...loc,
      atmosphere: (loc as any).atmosphere || "Mysterious",
      region: (loc as any).region || "Unknown Region"
    }));
  });`;
code = code.replace(locState1, locState2);

// Update nodes state
const nodesState1 = `  const [nodes, setNodes] = useState<{id: string, x: number, y: number}[]>(initialNodes);`;
const nodesState2 = `  const [nodes, setNodes] = useState<{id: string, x: number, y: number}[]>(() => {
    const saved = localStorage.getItem('story_nodes');
    return saved ? JSON.parse(saved) : initialNodes;
  });`;
code = code.replace(nodesState1, nodesState2);

// Update edges state
const edgesState1 = `  const [edges, setEdges] = useState<{id: string, source: string, target: string, label: string}[]>([
    { id: "e1", source: "1", target: "2", label: "2 days by boat" },
    { id: "e2", source: "1", target: "3", label: "Mountain pass" },
  ]);`;
const edgesState2 = `  const [edges, setEdges] = useState<{id: string, source: string, target: string, label: string}[]>(() => {
    const saved = localStorage.getItem('story_edges');
    return saved ? JSON.parse(saved) : [
      { id: "e1", source: "1", target: "2", label: "2 days by boat" },
      { id: "e2", source: "1", target: "3", label: "Mountain pass" },
    ];
  });`;
code = code.replace(edgesState1, edgesState2);

// Update unmappedLocations state
const unmappedState1 = `  const [unmappedLocations, setUnmappedLocations] = useState([
    { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg" },
    { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg" }
  ]);`;
const unmappedState2 = `  const [unmappedLocations, setUnmappedLocations] = useState(() => {
    const saved = localStorage.getItem('story_unmapped');
    return saved ? JSON.parse(saved) : [
      { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg" },
      { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg" }
    ];
  });`;
code = code.replace(unmappedState1, unmappedState2);

// Add useEffects for saving
const anchor = 'const handleWheel = (e: React.WheelEvent) => {';
const useEffects = `
  React.useEffect(() => { localStorage.setItem('story_locations', JSON.stringify(locations)); }, [locations]);
  React.useEffect(() => { localStorage.setItem('story_nodes', JSON.stringify(nodes)); }, [nodes]);
  React.useEffect(() => { localStorage.setItem('story_edges', JSON.stringify(edges)); }, [edges]);
  React.useEffect(() => { localStorage.setItem('story_unmapped', JSON.stringify(unmappedLocations)); }, [unmappedLocations]);
`;
code = code.replace(anchor, useEffects + '\n  ' + anchor);

fs.writeFileSync('src/pages/Locations.tsx', code);
