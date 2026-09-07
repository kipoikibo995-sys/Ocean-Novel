const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// 1. Update imports to include Pen
code = code.replace(
  'import { Plus, MoreVertical, Search, X, MapPin, Map as MapIcon, Compass, Mountain, TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move } from "lucide-react";',
  'import { Plus, MoreVertical, Search, X, MapPin, Map as MapIcon, Compass, Mountain, TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move, Pen } from "lucide-react";'
);

// 2. Add new states inside component
const stateInjectionPoint = 'const canvasRef = React.useRef<HTMLDivElement>(null);';
const newStates = `
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [mapMode, setMapMode] = useState<"pan" | "draw">("pan");
  const [drawingEdge, setDrawingEdge] = useState<{source: string, x: number, y: number} | null>(null);
  const [newEdgePopup, setNewEdgePopup] = useState<{source: string, target: string, label: string} | null>(null);
`;
code = code.replace(stateInjectionPoint, newStates);

// 3. Update pointer handlers
const handlersStart = 'const handleCanvasPointerDown = (e: React.PointerEvent) => {';
const handlersEndRegex = /const handlePointerUp = \(e: React\.PointerEvent\) => \{[\s\S]*?\};/;

const newHandlers = `const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target === canvasRef.current) {
      if (mapMode === "pan") {
        setIsPanning(true);
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    } else if (draggingNode && mapMode === "pan") {
      setNodes(prev => prev.map(n => 
        n.id === draggingNode 
          ? { ...n, x: n.x + e.movementX / scale, y: n.y + e.movementY / scale }
          : n
      ));
    } else if (drawingEdge && mapMode === "draw") {
      setDrawingEdge(prev => prev ? {
        ...prev,
        x: prev.x + e.movementX / scale,
        y: prev.y + e.movementY / scale
      } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    setDraggingNode(null);
    setDrawingEdge(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };`;
code = code.replace(new RegExp(`const handleCanvasPointerDown = \\(e: React\\.PointerEvent\\) => \\{[\\s\\S]*?const handlePointerUp = \\(e: React\\.PointerEvent\\) => \\{[\\s\\S]*?\\};`), newHandlers);

// 4. Update Grid View Item to show image
const gridItemStart = `<div className="h-1 w-full bg-[#a66850] opacity-80" />`;
const newGridItem = `<div className="h-1 w-full bg-[#a66850] opacity-80" />
                  
                  {(loc as any).imageUrl && (
                    <div className="h-40 w-full overflow-hidden shrink-0 border-b border-[#d49a89]/40 relative bg-black/10">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#F6F0E7] via-[#F6F0E7]/20 to-transparent z-10" />
                      <img src={(loc as any).imageUrl} alt={loc.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}`;
code = code.replace(gridItemStart, newGridItem);

// 5. Update Map SVG and Nodes
const mapNodeContentStart = `<div className="h-1 w-full bg-[#a66850]" />
                    <div className="p-3 text-center pointer-events-none">`;
const newMapNodeContent = `<div className="h-1 w-full bg-[#a66850]" />
                    {(loc as any).imageUrl && (
                      <div className="h-24 w-full overflow-hidden border-b border-[#d49a89]/40 bg-black/10">
                        <img src={(loc as any).imageUrl} alt={loc.name} className="w-full h-full object-cover mix-blend-multiply pointer-events-none" draggable={false} />
                      </div>
                    )}
                    <div className="p-3 text-center pointer-events-none">`;

code = code.replace(mapNodeContentStart, newMapNodeContent);

// Update Map node pointer down
const mapNodePointerDownStart = `onPointerDown={(e) => {
                      e.stopPropagation();
                      setDraggingNode(node.id);
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }}`;
const newMapNodePointerDown = `onPointerDown={(e) => {
                      e.stopPropagation();
                      if (mapMode === "pan") {
                        setDraggingNode(node.id);
                        e.currentTarget.setPointerCapture(e.pointerId);
                      } else if (mapMode === "draw") {
                        const rect = canvasRef.current?.getBoundingClientRect();
                        if (rect) {
                          const x = (e.clientX - rect.left - pan.x) / scale;
                          const y = (e.clientY - rect.top - pan.y) / scale;
                          setDrawingEdge({ source: node.id, x, y });
                        }
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      if (mapMode === "draw" && drawingEdge && drawingEdge.source !== node.id) {
                        setNewEdgePopup({ source: drawingEdge.source, target: node.id, label: "" });
                      }
                      setDraggingNode(null);
                      setDrawingEdge(null);
                      e.currentTarget.releasePointerCapture(e.pointerId);
                    }}`;
code = code.replace(mapNodePointerDownStart, newMapNodePointerDown);


// Adjust node line positions in SVG
code = code.replace(/x1=\{sourceNode\.x \+ 80\} y1=\{sourceNode\.y \+ 30\}/g, `x1={sourceNode.x + 90} y1={sourceNode.y + (locations.find(l => l.id === sourceNode.id)?.imageUrl ? 70 : 30)}`);
code = code.replace(/x2=\{targetNode\.x \+ 80\} y2=\{targetNode\.y \+ 30\}/g, `x2={targetNode.x + 90} y2={targetNode.y + (locations.find(l => l.id === targetNode.id)?.imageUrl ? 70 : 30)}`);

// Add drawing line inside SVG
const drawingLine = `
                {drawingEdge && (() => {
                  const sourceNode = nodes.find(n => n.id === drawingEdge.source);
                  if (!sourceNode) return null;
                  const sourceHasImg = !!locations.find(l => l.id === sourceNode.id)?.imageUrl;
                  return (
                    <line 
                      x1={sourceNode.x + 90} y1={sourceNode.y + (sourceHasImg ? 70 : 30)} 
                      x2={drawingEdge.x} y2={drawingEdge.y} 
                      stroke="#b8785e" strokeWidth="3" strokeDasharray="6 6" opacity="0.8"
                    />
                  );
                })()}
`;
code = code.replace('</svg>', `${drawingLine}</svg>`);

// Fix Map Node width
code = code.replace(`className="absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[160px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors"`, `className="absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[180px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors overflow-hidden"`);


// 6. Add Mode Toolbar to map view
const canvasStart = `<div 
            ref={canvasRef}
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#3d261d]"`;
const mapToolbar = `
          {/* Map Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex bg-[#2a1a14]/90 p-1.5 rounded-full border border-[#5d3f32] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setMapMode("pan")}
              className={\`px-4 py-2 flex items-center gap-2 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all \${mapMode === "pan" ? "bg-[#b8785e] text-white" : "text-[#a66850] hover:text-white"}\`}
            >
              <Move className="w-4 h-4" /> Move Nodes
            </button>
            <button 
              onClick={() => setMapMode("draw")}
              className={\`px-4 py-2 flex items-center gap-2 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all \${mapMode === "draw" ? "bg-[#b8785e] text-white" : "text-[#a66850] hover:text-white"}\`}
            >
              <Pen className="w-4 h-4" /> Draw Route
            </button>
          </div>
`;
code = code.replace(canvasStart, `${mapToolbar}\n          <div \n            ref={canvasRef}\n            className={\`flex-1 relative overflow-hidden bg-[#3d261d] \${mapMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}\`}`);


// 7. Add Route Label Popup
const newEdgePopupUI = `
      {newEdgePopup && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="bg-[#fcfaf5] rounded-sm shadow-[8px_16px_48px_rgba(0,0,0,0.5)] w-full max-w-sm flex flex-col overflow-hidden border border-[#e5e0d5] relative animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-sm bg-[#f4efe6] border border-[#e5e0d5] flex items-center justify-center text-[#8a5b46]">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#4a3225]">New Route</h3>
                  <p className="text-[9px] font-bold text-[#a66850] tracking-widest uppercase mt-0.5">Connect Locations</p>
                </div>
              </div>
              
              <div className="bg-white border border-stone-200 rounded-sm p-3 shadow-inner flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-600 truncate">{locations.find(l => l.id === newEdgePopup.source)?.name}</span>
                <Move className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="text-xs font-bold text-stone-600 truncate">{locations.find(l => l.id === newEdgePopup.target)?.name}</span>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Route Label / Distance</label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="e.g. 5 days by horse"
                  className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                  value={newEdgePopup.label}
                  onChange={e => setNewEdgePopup({...newEdgePopup, label: e.target.value})}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newEdgePopup.label.trim()) {
                      setEdges(prev => [...prev, {
                        id: Date.now().toString(),
                        source: newEdgePopup.source,
                        target: newEdgePopup.target,
                        label: newEdgePopup.label
                      }]);
                      setNewEdgePopup(null);
                    }
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#e5e0d5] flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setNewEdgePopup(null)}
                className="px-6 py-2 text-[#8a5b46] text-[11px] font-bold tracking-widest uppercase hover:bg-stone-100 rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newEdgePopup.label.trim()) {
                    setEdges(prev => [...prev, {
                      id: Date.now().toString(),
                      source: newEdgePopup.source,
                      target: newEdgePopup.target,
                      label: newEdgePopup.label
                    }]);
                  }
                  setNewEdgePopup(null);
                }}
                disabled={!newEdgePopup.label.trim()}
                className={\`px-6 py-2 text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all \${!newEdgePopup.label.trim() ? 'bg-stone-300' : 'bg-[#b8785e] hover:bg-[#a66850]'}\`}
              >
                Save Route
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace('</div>\n  );\n}\n', `${newEdgePopupUI}    </div>\n  );\n}\n`);


fs.writeFileSync('src/pages/Locations.tsx', code);
