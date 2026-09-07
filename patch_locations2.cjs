const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

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
              onWheel={(e) => {
                const zoomFactor = 0.1;
                if (e.deltaY < 0) {
                  setScale(s => Math.min(s + zoomFactor, 2));
                } else {
                  setScale(s => Math.max(s - zoomFactor, 0.3));
                }
              }}
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
                        <rect x={midX - 10} y={midY - 12} width={edge.label.length * 6 + 20} height="24" fill="#fcfaf5" rx="4" stroke="#d49a89" />
                        <text x={midX + (edge.label.length * 3) } y={midY + 4} fontSize="9" fill="#8a5b46" fontWeight="bold" textAnchor="middle" letterSpacing="0.1em">
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
                      className="absolute bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[160px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors"
                      style={{ transform: \`translate(\${node.x}px, \${node.y}px)\` }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingNode(node.id);
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onDoubleClick={() => handleOpenEdit(loc)}
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
        </div>
      </div>
`;

code = code.replace(/              \}\)\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, mapCodeEnd);
fs.writeFileSync('src/pages/Locations.tsx', code);
