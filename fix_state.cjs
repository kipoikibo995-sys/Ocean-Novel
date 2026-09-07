const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

const anchor = 'const [unmappedLocations, setUnmappedLocations] = useState([';
const insertion = `  const [mapMode, setMapMode] = useState<"pan" | "draw">("pan");
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [edgeToDelete, setEdgeToDelete] = useState<string | null>(null);
  
  `;

code = code.replace(anchor, insertion + anchor);
fs.writeFileSync('src/pages/Locations.tsx', code);
