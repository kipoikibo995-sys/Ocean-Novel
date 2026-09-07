const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// 1. Add data-node-id and select-none to the node container
const oldContainer = `className="group absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[180px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors overflow-visible"`;
const newContainer = `data-node-id={node.id}\n                    className="group absolute select-none bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[180px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors overflow-visible"`;

code = code.replace(oldContainer, newContainer);

// 2. Also, the image needs draggable={false} (it has it, but let's be sure).
// Look at the image: draggable={false} is there.
// We also want to make sure the title text is select-none. Added it to the container, should inherit for selection, but let's be safe.
// Wait, CSS \`select-none\` stops text selection entirely within the element.

// 3. Remove onPointerUp from the link anchor, since the Canvas handles it via elementFromPoint.
const oldAnchor = `                    <div 
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
                    </div>`;

const newAnchor = `                    <div 
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#fcfaf5] border border-[#d49a89] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair hover:bg-[#8c503c] hover:text-white shadow-sm z-30"
                      onPointerDown={(e) => handleStartDrawEdge(e, node.id)}
                    >
                      <Link2 className="w-3 h-3 pointer-events-none" />
                    </div>`;

code = code.replace(oldAnchor, newAnchor);

fs.writeFileSync('src/pages/Locations.tsx', code);
