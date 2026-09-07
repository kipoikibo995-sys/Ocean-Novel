const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// 1. ADD Zoom controls icon import
const iconImports = 'import { Plus, LayoutGrid, Map as MapIcon, Image as ImageIcon, MapPin, Building, Castle, TreePine, Mountain, Users, BookOpen, Trash2, Route, Move, Link2 } from "lucide-react";';
code = code.replace(iconImports, iconImports.replace('Move, Link2', 'Move, Link2, ZoomIn, ZoomOut, Maximize2, Trash'));

// 2. Modify State initialization to use localStorage
const initialNodesStr = `  const initialNodes = MOCK_LOCATIONS.map((loc, index) => ({
    id: loc.id,
    x: 100 + (index % 3) * 300,
    y: 100 + Math.floor(index / 3) * 200
  }));`;

const replaceStatesStr = `  const [locations, setLocations] = useState(() => MOCK_LOCATIONS.map(loc => ({
    ...loc,
    atmosphere: (loc as any).atmosphere || "Mysterious",
    region: (loc as any).region || "Unknown Region"
  })));
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const initialNodes = MOCK_LOCATIONS.map((loc, index) => ({
    id: loc.id,
    x: 100 + (index % 3) * 300,
    y: 100 + Math.floor(index / 3) * 200
  }));
  const [nodes, setNodes] = useState<{id: string, x: number, y: number}[]>(initialNodes);
  const [edges, setEdges] = useState<{id: string, source: string, target: string, label: string}[]>([
    { id: "e1", source: "1", target: "2", label: "2 days by boat" },
    { id: "e2", source: "1", target: "3", label: "Mountain pass" },
  ]);
  
  const canvasRef = React.useRef<HTMLDivElement>(null);
  
  const [drawingEdge, setDrawingEdge] = useState<{source: string, currentX: number, currentY: number} | null>(null);
  const [newEdgePopup, setNewEdgePopup] = useState<{source: string, target: string, label: string} | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  
  const [unmappedLocations, setUnmappedLocations] = useState([
    { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg" },
    { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg" }
  ]);`;

const newStatesStr = `  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('story_locations');
    return saved ? JSON.parse(saved) : MOCK_LOCATIONS.map(loc => ({
      ...loc,
      atmosphere: (loc as any).atmosphere || "Mysterious",
      region: (loc as any).region || "Unknown Region"
    }));
  });
  
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  
  const [nodes, setNodes] = useState<{id: string, x: number, y: number}[]>(() => {
    const saved = localStorage.getItem('story_map_nodes');
    if (saved) return JSON.parse(saved);
    return MOCK_LOCATIONS.map((loc, index) => ({
      id: loc.id,
      x: 100 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 200
    }));
  });
  
  const [edges, setEdges] = useState<{id: string, source: string, target: string, label: string}[]>(() => {
    const saved = localStorage.getItem('story_map_edges');
    if (saved) return JSON.parse(saved);
    return [
      { id: "e1", source: "1", target: "2", label: "2 days by boat" },
      { id: "e2", source: "1", target: "3", label: "Mountain pass" },
    ];
  });
  
  const [unmappedLocations, setUnmappedLocations] = useState(() => {
    const saved = localStorage.getItem('story_unmapped');
    if (saved) return JSON.parse(saved);
    return [
      { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg" },
      { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg" }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('story_locations', JSON.stringify(locations));
  }, [locations]);

  React.useEffect(() => {
    localStorage.setItem('story_map_nodes', JSON.stringify(nodes));
  }, [nodes]);

  React.useEffect(() => {
    localStorage.setItem('story_map_edges', JSON.stringify(edges));
  }, [edges]);

  React.useEffect(() => {
    localStorage.setItem('story_unmapped', JSON.stringify(unmappedLocations));
  }, [unmappedLocations]);

  const canvasRef = React.useRef<HTMLDivElement>(null);
  
  const [drawingEdge, setDrawingEdge] = useState<{source: string, currentX: number, currentY: number} | null>(null);
  const [newEdgePopup, setNewEdgePopup] = useState<{source: string, target: string, label: string} | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<"pan" | "draw">("pan");
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [edgeToDelete, setEdgeToDelete] = useState<string | null>(null);
`;
code = code.replace(replaceStatesStr, newStatesStr);

// 3. Add Wheel event handler for zooming
const beforeHandleMap = `  const handleMapLocation = (unmapped: any) => {`;
const zoomHandlerStr = `
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Zoom logic
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    
    setScale(prev => {
      const newScale = Math.min(Math.max(0.2, prev + delta), 3);
      return newScale;
    });
  };
`;
code = code.replace(beforeHandleMap, zoomHandlerStr + '\n' + beforeHandleMap);

// 4. Inject handleWheel onto the canvas div
const oldCanvasDiv = `          <div 
            ref={canvasRef}
            className={\`flex-1 relative overflow-hidden bg-[#3d261d] \${mapMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}\`}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >`;
const newCanvasDiv = `          <div 
            ref={canvasRef}
            className={\`flex-1 relative overflow-hidden bg-[#3d261d] \${mapMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}\`}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >`;
code = code.replace(oldCanvasDiv, newCanvasDiv);

// 5. Build bezier function and update SVG edges rendering
const beforeSVG = `            <div 
              className="absolute inset-0 origin-top-left"
              style={{ transform: \`translate(\${pan.x}px, \${pan.y}px) scale(\${scale})\` }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">`;

const drawBezierFunctionStr = `
  // Helper to draw bezier curve between two points
  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    // Control point distance based on how far apart they are
    const offset = Math.max(dx * 0.4, dy * 0.4, 50); 
    
    return \`M \${x1} \${y1} C \${x1 + offset} \${y1}, \${x2 - offset} \${y2}, \${x2} \${y2}\`;
  };
`;
code = code.replace(beforeHandleMap, drawBezierFunctionStr + '\n' + beforeHandleMap);

// The SVG drawing logic replace:
const oldSVGEdges = `              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {edges.map(edge => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  
                  // offset to center of node (180x150 approx)
                  const x1 = sourceNode.x + 90;
                  const y1 = sourceNode.y + 75;
                  const x2 = targetNode.x + 90;
                  const y2 = targetNode.y + 75;
                  
                  return (
                    <g key={edge.id}>
                      <line 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke="#8c503c" strokeWidth="2" strokeDasharray="8 8"
                      />
                      <rect 
                        x={(x1+x2)/2 - 50} y={(y1+y2)/2 - 12} 
                        width="100" height="24" rx="4"
                        fill="#fcfaf5" stroke="#d49a89"
                      />
                      <text 
                        x={(x1+x2)/2} y={(y1+y2)/2 + 4} 
                        textAnchor="middle" fontSize="10" 
                        fill="#8a5b46" fontWeight="bold" fontFamily="serif"
                        letterSpacing="1"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
                {drawingEdge && (
                  <line 
                    x1={nodes.find(n => n.id === drawingEdge.source)!.x + 90}
                    y1={nodes.find(n => n.id === drawingEdge.source)!.y + 75}
                    x2={drawingEdge.currentX}
                    y2={drawingEdge.currentY}
                    stroke="#d49a89" strokeWidth="2" strokeDasharray="4 4"
                  />
                )}
              </svg>`;

const newSVGEdges = `              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {edges.map(edge => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  
                  // offset to center of node (180x150 approx)
                  const x1 = sourceNode.x + 90;
                  const y1 = sourceNode.y + 75;
                  const x2 = targetNode.x + 90;
                  const y2 = targetNode.y + 75;
                  
                  const isHovered = hoveredEdge === edge.id;
                  
                  return (
                    <g key={edge.id} className="pointer-events-auto cursor-pointer" onMouseEnter={() => setHoveredEdge(edge.id)} onMouseLeave={() => setHoveredEdge(null)} onClick={() => setEdgeToDelete(edge.id)}>
                      {/* Invisible wider path for easier hovering/clicking */}
                      <path 
                        d={getBezierPath(x1, y1, x2, y2)}
                        stroke="transparent" strokeWidth="20" fill="none"
                      />
                      <path 
                        d={getBezierPath(x1, y1, x2, y2)}
                        stroke={isHovered ? "#b8785e" : "#8c503c"} 
                        strokeWidth={isHovered ? "3" : "2"} 
                        strokeDasharray={isHovered ? "none" : "8 8"}
                        fill="none"
                        className="transition-all duration-300"
                      />
                      <rect 
                        x={(x1+x2)/2 - 60} y={(y1+y2)/2 - 12} 
                        width="120" height="24" rx="4"
                        fill="#fcfaf5" stroke={isHovered ? "#b8785e" : "#d49a89"}
                        className="transition-colors duration-300"
                      />
                      <text 
                        x={(x1+x2)/2} y={(y1+y2)/2 + 4} 
                        textAnchor="middle" fontSize="10" 
                        fill={isHovered ? "#6e3f2d" : "#8a5b46"} 
                        fontWeight="bold" fontFamily="serif"
                        letterSpacing="1"
                        className="transition-colors duration-300"
                      >
                        {edge.label}
                      </text>
                      {isHovered && (
                        <g transform={\`translate(\${(x1+x2)/2 + 65}, \${(y1+y2)/2 - 10})\`}>
                           <circle cx="10" cy="10" r="10" fill="#rose-600" fillOpacity="0.8"/>
                           <text x="10" y="14" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">×</text>
                        </g>
                      )}
                    </g>
                  );
                })}
                {drawingEdge && (
                  <path 
                    d={getBezierPath(
                      nodes.find(n => n.id === drawingEdge.source)!.x + 90,
                      nodes.find(n => n.id === drawingEdge.source)!.y + 75,
                      drawingEdge.currentX,
                      drawingEdge.currentY
                    )}
                    stroke="#d49a89" strokeWidth="2" strokeDasharray="4 4" fill="none"
                  />
                )}
              </svg>`;
code = code.replace(oldSVGEdges, newSVGEdges);

// 6. Add Zoom controls overlay
const afterSVGNodes = `            </div>
          </div>
          </>
        )}
      </div>`;

const zoomControls = `            </div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-lg">
              <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors" title="Zoom In">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={() => { setScale(1); setPan({x:0, y:0}); }} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors" title="Reset View">
                <Maximize2 className="w-5 h-5" />
              </button>
              <button onClick={() => setScale(s => Math.max(s - 0.2, 0.2))} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors" title="Zoom Out">
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          </>
        )}
      </div>`;
code = code.replace(afterSVGNodes, zoomControls);

// 7. Add Delete Edge Modal
const afterNewEdgePopup = `              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

const deleteEdgeModal = `              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Edge Modal */}
      {edgeToDelete && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="bg-[#fcfaf5] rounded-sm shadow-[8px_16px_48px_rgba(0,0,0,0.5)] w-full max-w-sm flex flex-col overflow-hidden border border-[#e5e0d5] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4a3225]">Remove Route</h3>
              <p className="text-sm font-serif italic text-stone-500">
                Are you sure you want to remove this connection between locations?
              </p>
            </div>
            <div className="p-4 border-t border-[#e5e0d5] flex justify-center gap-3 bg-white">
              <button 
                onClick={() => setEdgeToDelete(null)}
                className="px-6 py-2 text-[#8a5b46] text-[11px] font-bold tracking-widest uppercase hover:bg-stone-100 rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setEdges(prev => prev.filter(e => e.id !== edgeToDelete));
                  setEdgeToDelete(null);
                  setHoveredEdge(null);
                }}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
code = code.replace(afterNewEdgePopup, deleteEdgeModal);

fs.writeFileSync('src/pages/Locations.tsx', code);
