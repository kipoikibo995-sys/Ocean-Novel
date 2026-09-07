const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// Add data-node-id
code = code.replace(
  /<div \s*key=\{node\.id\}\s*className="absolute bg-\\[#F6F0E7\\]/,
  '<div \n                    key={node.id}\n                    data-node-id={node.id}\n                    className="absolute bg-[#F6F0E7]'
);

// Update handlePointerMove
const moveOld = `    } else if (drawingEdge && mapMode === "draw") {
      setDrawingEdge(prev => prev ? {
        ...prev,
        x: prev.x + e.movementX / scale,
        y: prev.y + e.movementY / scale
      } : null);
    }`;
const moveNew = `    } else if (drawingEdge && mapMode === "draw") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / scale;
        const y = (e.clientY - rect.top - pan.y) / scale;
        setDrawingEdge(prev => prev ? { ...prev, x, y } : null);
      }
    }`;
code = code.replace(moveOld, moveNew);

// Update onPointerUp
const upOld = `                    onPointerUp={(e) => {
                      e.stopPropagation();
                      if (mapMode === "draw" && drawingEdge && drawingEdge.source !== node.id) {
                        setNewEdgePopup({ source: drawingEdge.source, target: node.id, label: "" });
                      }
                      setDraggingNode(null);
                      setDrawingEdge(null);
                      e.currentTarget.releasePointerCapture(e.pointerId);
                    }}`;
const upNew = `                    onPointerUp={(e) => {
                      e.stopPropagation();
                      if (mapMode === "draw" && drawingEdge) {
                        const elements = document.elementsFromPoint(e.clientX, e.clientY);
                        const targetNodeEl = elements.find(el => el.getAttribute('data-node-id'));
                        if (targetNodeEl) {
                          const targetId = targetNodeEl.getAttribute('data-node-id');
                          if (targetId && targetId !== drawingEdge.source) {
                            setNewEdgePopup({ source: drawingEdge.source, target: targetId, label: "" });
                          }
                        }
                      }
                      setDraggingNode(null);
                      setDrawingEdge(null);
                      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                    }}`;
code = code.replace(upOld, upNew);

fs.writeFileSync('src/pages/Locations.tsx', code);
