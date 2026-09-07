const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// Remove mapMode state
code = code.replace(/const \[mapMode, setMapMode\] = useState<"pan" \| "draw">\(.*?;\n/, '');

// Fix Lucide icons
code = code.replace(/import \{.*?\} from "lucide-react";/, 'import { Plus, MoreVertical, Search, X, MapPin, Map as MapIcon, Compass, Mountain, TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move, Pen, Link2 } from "lucide-react";');

// Update drawingEdge state shape
code = code.replace(/const \[drawingEdge, setDrawingEdge\] = useState<\{source: string, x: number, y: number\} \| null>\(null\);/, 'const [drawingEdge, setDrawingEdge] = useState<{source: string, currentX: number, currentY: number} | null>(null);');

// Replace handleCanvasPointerDown
const handlersOld = /const handleCanvasPointerDown = \(e: React\.PointerEvent\) => \{[\s\S]*?try \{ e\.currentTarget\.releasePointerCapture\(e\.pointerId\); \} catch\(err\) \{\}\n  \}\};/;

const newHandlers = `const handleStartDrawEdge = (e: React.PointerEvent, sourceId: string) => {
    e.stopPropagation();
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch(e) {}
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      setDrawingEdge({ source: sourceId, currentX: x, currentY: y });
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
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
    } else if (drawingEdge && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      setDrawingEdge(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };`;
code = code.replace(handlersOld, newHandlers);


// Replace SVG drawing line
const oldDrawingLine = /\{drawingEdge && \(\(\) => \{[\s\S]*?\}\)\(\)\}/;
const newDrawingLine = `{drawingEdge && (() => {
                  const sourceNode = nodes.find(n => n.id === drawingEdge.source);
                  if (!sourceNode) return null;
                  const sourceHasImg = !!locations.find(l => l.id === sourceNode.id)?.imageUrl;
                  return (
                    <line 
                      x1={sourceNode.x + 90} y1={sourceNode.y + (sourceHasImg ? 70 : 30)} 
                      x2={drawingEdge.currentX} y2={drawingEdge.currentY} 
                      stroke="#b8785e" strokeWidth="3" strokeDasharray="6 6" opacity="0.8"
                    />
                  );
                })()}`;
code = code.replace(oldDrawingLine, newDrawingLine);

// Update Map Toolbar: remove it entirely since we use anchors now
const toolbarRegex = /\{\/\* Map Toolbar \*\/\}\s*<div className="absolute bottom-6 left-1\/2 -translate-x-1\/2 z-10 flex[\s\S]*?<\/div>\s*<div/m;
code = code.replace(toolbarRegex, '<div');

// Remove mapMode references from canvas
code = code.replace(/className=\{`flex-1 relative overflow-hidden bg-\\[#3d261d\\] \$\{mapMode === "pan" \? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"\}`\}/, 'className="flex-1 relative overflow-hidden bg-[#3d261d] cursor-grab active:cursor-grabbing"');


// Update map node event handlers
const mapNodePointerDownStart = /onPointerDown=\{\(e\) => \{[\s\S]*?try \{ e\.currentTarget\.releasePointerCapture\(e\.pointerId\); \} catch\(err\) \{\}\n                    \}\}/;

const newMapNodePointerDown = `onPointerDown={(e) => {
                      e.stopPropagation();
                      setDraggingNode(node.id);
                      try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      setDraggingNode(null);
                      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                    }}`;
code = code.replace(mapNodePointerDownStart, newMapNodePointerDown);

// Add anchor to map node (must add group class to the container)
const nodeContainerStart = `className="absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[180px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors overflow-hidden"`;
const newNodeContainerStart = `className="group absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[180px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors overflow-visible"`;
code = code.replace(nodeContainerStart, newNodeContainerStart);


// Append the anchor to the end of the node container
const nodeTitleEnd = `                      </h3>
                    </div>
                  </div>`;
const newNodeTitleEnd = `                      </h3>
                    </div>
                    {/* Link Anchor (shows on hover) */}
                    <div 
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#fcfaf5] border border-[#d49a89] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair hover:bg-[#8c503c] hover:text-white shadow-sm z-30"
                      onPointerDown={(e) => handleStartDrawEdge(e, node.id)}
                      onPointerUp={(e) => {
                        e.stopPropagation();
                        if (drawingEdge && drawingEdge.source !== node.id) {
                          setNewEdgePopup({ source: drawingEdge.source, target: node.id, label: "" });
                        }
                        setDrawingEdge(null);
                        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                      }}
                    >
                      <Link2 className="w-3 h-3" />
                    </div>
                  </div>`;
code = code.replace(nodeTitleEnd, newNodeTitleEnd);


fs.writeFileSync('src/pages/Locations.tsx', code);
