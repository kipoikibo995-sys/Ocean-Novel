const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

// The anchor elementsFromPoint issue is because we release pointer capture on document, but wait we need elementsFromPoint!
const oldUp = `  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    if(drawingEdge) {
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
  };`;
  
const newUp = `  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    if (drawingEdge) {
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
  };`;
// Actually, wait, when we click the Anchor in handleStartDrawEdge, we are setting capture on the anchor!
// So onPointerUp on the canvas WILL NOT FIRE.
// We need a global window pointer up? No, the onPointerUp is on the Canvas.
// If we setPointerCapture on the anchor, we should listen to onPointerUp on the anchor, OR remove setPointerCapture.

// Let's modify handleStartDrawEdge to set capture on the CANVAS, not the target.
const oldStart = `const handleStartDrawEdge = (e: React.PointerEvent, sourceId: string) => {
    e.stopPropagation();
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch(e) {}`;

const newStart = `const handleStartDrawEdge = (e: React.PointerEvent, sourceId: string) => {
    e.stopPropagation();
    try { canvasRef.current?.setPointerCapture(e.pointerId); } catch(err) {}`;

code = code.replace(oldStart, newStart);


// Also make sure map node has data-node-id
code = code.replace(/<div\n                    key=\{node\.id\}\n                    className="group absolute/g, '<div\n                    key={node.id}\n                    data-node-id={node.id}\n                    className="group absolute');
fs.writeFileSync('src/pages/Locations.tsx', code);
