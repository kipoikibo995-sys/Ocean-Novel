const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// Add LayoutGrid and Route to imports
code = code.replace(/import \{ Plus,.*\} from "lucide-react";/, 
`import { Plus, MoreVertical, Search, X, MapPin, Map, Compass, Mountain, TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move } from "lucide-react";`);

// Add state for viewMode, nodes, edges, pan, scale, drag
const stateVars = `
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [nodes, setNodes] = useState<{id: string, x: number, y: number}[]>([
    { id: "1", x: 200, y: 150 },
    { id: "2", x: 500, y: 300 },
    { id: "3", x: 300, y: 500 },
  ]);
  const [edges, setEdges] = useState<{id: string, source: string, target: string, label: string}[]>([
    { id: "e1", source: "1", target: "2", label: "2 days by boat" },
    { id: "e2", source: "1", target: "3", label: "Mountain pass" },
  ]);
  
  // Canvas State
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    } else if (draggingNode) {
      setNodes(prev => prev.map(n => 
        n.id === draggingNode 
          ? { ...n, x: n.x + e.movementX / scale, y: n.y + e.movementY / scale }
          : n
      ));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    setDraggingNode(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
`;

code = code.replace(/const \[editingLocId, setEditingLocId\] = useState<string \| null>\(null\);/, stateVars + '\n  const [editingLocId, setEditingLocId] = useState<string | null>(null);');

// Add View Switcher to Top Nav
const viewSwitcher = `
            {/* View Switcher */}
            <div className="flex bg-[#2a1a14]/60 p-1 rounded-full border border-[#5d3f32] backdrop-blur-sm shadow-inner shrink-0 mr-4">
              <button
                onClick={() => setViewMode("grid")}
                className={\`px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all shadow-sm \${viewMode === "grid" ? "bg-[#b8785e] text-white" : "text-white/50 hover:text-white/80"}\`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={\`px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all shadow-sm \${viewMode === "map" ? "bg-[#b8785e] text-white" : "text-white/50 hover:text-white/80"}\`}
              >
                <Route className="w-3.5 h-3.5" />
                Map
              </button>
            </div>
`;

code = code.replace(/(<button \s*onClick=\{handleOpenCreate\})/, viewSwitcher + '\n            $1');

// Replace Grid View and add Map View
const gridViewStart = `{/* Atlas Cards Grid */}`;
const mapCanvasCode = `
          {viewMode === "grid" ? (
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
`;
code = code.replace(gridViewStart, mapCanvasCode);

const mapCodeEnd = `
              ))}
            </div>
          </div>
          ) : (
            <div 
              ref={canvasRef}
              className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                className="absolute inset-0 origin-top-left"
                style={{
                  transform: \`translate(\${pan.x}px, \${pan.y}px) scale(\${scale})\`,
                }}
              >
                {/* SVG Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  {edges.map(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    
                    const dx = targetNode.x - sourceNode.x;
                    const dy = targetNode.y - sourceNode.y;
                    const midX = sourceNode.x + dx / 2;
                    const midY = sourceNode.y + dy / 2;
                    
                    return (
                      <g key={edge.id}>
                        <line 
                          x1={sourceNode.x + 80} y1={sourceNode.y + 30} 
                          x2={targetNode.x + 80} y2={targetNode.y + 30} 
                          stroke="#a66850" strokeWidth="2" strokeDasharray="6 6" opacity="0.6"
                        />
                        <rect x={midX + 20} y={midY + 15} width={edge.label.length * 7 + 20} height="24" fill="#fcfaf5" rx="4" stroke="#d49a89" />
                        <text x={midX + 30 + (edge.label.length * 3.5)} y={midY + 31} fontSize="10" fill="#8a5b46" fontWeight="bold" textAnchor="middle" letterSpacing="0.1em">
                          {edge.label.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const loc = locations.find(l => l.id === node.id);
                  if (!loc) return null;
                  
                  return (
                    <div 
                      key={node.id}
                      className="absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[160px] cursor-pointer"
                      style={{ transform: \`translate(\${node.x}px, \${node.y}px)\` }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingNode(node.id);
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                    >
                      <div className="h-1 w-full bg-[#a66850]" />
                      <div className="p-3 text-center pointer-events-none">
                        <div className="flex justify-center mb-1 text-[#8a5b46]">
                          {getTypeIcon(loc.type)}
                        </div>
                        <h4 className="font-serif font-bold text-[#3d261d] leading-tight text-sm">
                          {loc.name}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
`;

code = code.replace(/              \}\)\)\}\n            <\/div>\n          <\/div>/, mapCodeEnd);

fs.writeFileSync('src/pages/Locations.tsx', code);
