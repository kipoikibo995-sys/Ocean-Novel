import React, { useState, useRef, useEffect } from 'react';
import { Home, Swords, Heart, Handshake, Info, Shield, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
  age: string;
  motivation: string;
};

type Node = {
  id: string;
  charId: string;
  x: number;
  y: number;
};

type Edge = {
  id: string;
  source: string;
  target: string;
  type: 'Family' | 'Enemy' | 'Lover' | 'Ally' | 'Rival' | 'Friend';
};

const RELATIONSHIP_TYPES = {
  Family: { color: '#3b82f6', icon: Home }, // blue-500
  Enemy: { color: '#ef4444', icon: Swords }, // red-500
  Lover: { color: '#ec4899', icon: Heart }, // pink-500
  Ally: { color: '#06b6d4', icon: Shield }, // cyan-500
  Rival: { color: '#f59e0b', icon: Swords }, // amber-500
  Friend: { color: '#10b981', icon: Handshake }, // emerald-500
};

export default function RelationshipMap({ characters }: { characters: Character[] }) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'n1', charId: '1', x: 400, y: 250 },
    { id: 'n2', charId: '2', x: 200, y: 450 },
    { id: 'n3', charId: '3', x: 600, y: 450 },
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1', source: 'n1', target: 'n2', type: 'Enemy' },
    { id: 'e2', source: 'n1', target: 'n3', type: 'Family' },
    { id: 'e3', source: 'n2', target: 'n3', type: 'Ally' },
  ]);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-populate nodes if missing characters
  useEffect(() => {
    // Only add if not already in nodes to avoid resetting layout
    const existingCharIds = new Set(nodes.map(n => n.charId));
    const newNodes = characters
      .filter(c => !existingCharIds.has(c.id))
      .map((c, i) => ({
        id: `n_${Date.now()}_${i}`,
        charId: c.id,
        x: 100 + (i * 50),
        y: 100 + (i * 50)
      }));
    
    if (newNodes.length > 0 && nodes.length === 0) {
      setNodes(prev => [...prev, ...newNodes]);
    }
  }, [characters, nodes]);

  // Canvas Panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current && (e.target as HTMLElement).tagName !== 'svg') return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    setConnectingFrom(null); // Cancel connecting
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    } else if (draggedNode) {
      // Node dragging
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const newX = (e.clientX - rect.left - transform.x) / transform.scale;
      const newY = (e.clientY - rect.top - transform.y) / transform.scale;
      
      setNodes(prev => prev.map(n => 
        n.id === draggedNode ? { ...n, x: newX, y: newY } : n
      ));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.002;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.2, transform.scale + delta), 3);
      setTransform(prev => ({ ...prev, scale: newScale }));
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        // Create edge
        const typeKeys = Object.keys(RELATIONSHIP_TYPES) as Array<keyof typeof RELATIONSHIP_TYPES>;
        const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        
        // Check if edge already exists
        const exists = edges.some(edge => 
          (edge.source === connectingFrom && edge.target === nodeId) ||
          (edge.target === connectingFrom && edge.source === nodeId)
        );

        if (!exists) {
          setEdges(prev => [...prev, {
            id: `e_${Date.now()}`,
            source: connectingFrom,
            target: nodeId,
            type: randomType
          }]);
        }
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(nodeId);
    }
  };

  const handleNodeDelete = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (connectingFrom === nodeId) setConnectingFrom(null);
  };

  // Drag and drop from sidebar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const charId = e.dataTransfer.getData("newCharId");
    if (!charId) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dropX = (e.clientX - rect.left - transform.x) / transform.scale;
    const dropY = (e.clientY - rect.top - transform.y) / transform.scale;

    setNodes(prev => [...prev, {
      id: `n_${Date.now()}`,
      charId,
      x: dropX,
      y: dropY
    }]);
  };

  const toggleEdgeType = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    const types = Object.keys(RELATIONSHIP_TYPES) as Array<keyof typeof RELATIONSHIP_TYPES>;
    
    setEdges(prev => prev.map(edge => {
      if (edge.id === edgeId) {
        const currentIndex = types.indexOf(edge.type);
        const nextIndex = (currentIndex + 1) % types.length;
        return { ...edge, type: types[nextIndex] };
      }
      return edge;
    }));
  };

  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;

      // Calculate centers (assuming node is approx 120x150)
      const sx = sourceNode.x + 60;
      const sy = sourceNode.y + 75;
      const tx = targetNode.x + 60;
      const ty = targetNode.y + 75;

      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2;
      
      const relInfo = RELATIONSHIP_TYPES[edge.type];
      const Icon = relInfo.icon;

      return (
        <g key={edge.id} className="cursor-pointer" onClick={(e) => toggleEdgeType(e, edge.id)}>
          <line 
            x1={sx} y1={sy} x2={tx} y2={ty} 
            stroke={relInfo.color} strokeWidth="2" 
            opacity="0.6"
          />
          {/* Label background */}
          <rect 
            x={midX - 45} y={midY - 12} 
            width="90" height="24" rx="12" 
            fill="white" stroke={relInfo.color} strokeWidth="1.5"
          />
          {/* Label content using foreignObject for simpler layout */}
          <foreignObject x={midX - 45} y={midY - 12} width="90" height="24">
            <div 
              className="w-full h-full flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider select-none hover:bg-[#F9F6ED] rounded-full transition-colors"
              style={{ color: relInfo.color }}
            >
              <Icon className="w-3 h-3" />
              {edge.type}
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-[#E8D9CF] to-[#D5C1BA] overflow-hidden relative">
      {/* Sidebar / Cast List */}
      <div className="w-64 bg-[#F9F6ED]/60 backdrop-blur-md border-r border-[#F9F6ED]/50 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-[#F9F6ED]/50 flex items-center gap-2">
          <Badge variant="outline" className="bg-[#F9F6ED]/80 border-rose-200 text-rose-800 rounded-full px-3 py-1 text-xs">
            CAST
          </Badge>
          <span className="text-xs font-semibold text-stone-500">{characters.length} total</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {characters.map(char => (
            <div 
              key={char.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("newCharId", char.id);
              }}
              className="bg-[#F9F6ED]/80 hover:bg-[#F9F6ED] p-2 rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing border border-[#F9F6ED] transition-all shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#E5E0D5] flex items-center justify-center text-stone-500 font-serif shrink-0 shadow-inner overflow-hidden">
                {char.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-stone-800 text-sm truncate">{char.name}</h4>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest truncate">{char.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-[#F9F6ED]/50 text-[10px] text-stone-500 text-center font-medium leading-relaxed">
          Drag a character to the board.<br/>
          Click two characters to link them.<br/>
          Click a link to change its type.
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div 
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
        >
          {/* SVG Layer for Connections */}
          <svg className="absolute inset-0 overflow-visible pointer-events-none z-0">
            <g className="pointer-events-auto">
              {renderEdges()}
            </g>
          </svg>

          {/* HTML Layer for Nodes */}
          {nodes.map(node => {
            const char = characters.find(c => c.id === node.charId);
            if (!char) return null;
            
            const isConnecting = connectingFrom === node.id;
            
            return (
              <div 
                key={node.id}
                className={`absolute flex flex-col items-center gap-2 select-none z-10`}
                style={{ 
                  left: node.x, 
                  top: node.y,
                  width: 120
                }}
              >
                {/* Delete button (shows on hover) */}
                <button 
                  onClick={(e) => handleNodeDelete(e, node.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[#F9F6ED] rounded-full shadow-md text-red-500 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 border border-red-100"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Avatar Circle */}
                <div 
                  onMouseDown={(e) => { e.stopPropagation(); setDraggedNode(node.id); }}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  className={`w-20 h-20 rounded-full bg-[#E5E0D5] border-[3px] flex items-center justify-center text-3xl font-serif text-stone-600 shadow-xl cursor-pointer hover:scale-105 transition-transform overflow-hidden ${isConnecting ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-[#F9F6ED]'}`}
                >
                  {char.name.charAt(0)}
                </div>
                
                {/* Name & Role Plate */}
                <div className="bg-[#F9F6ED] px-3 py-2 rounded-xl shadow-md border border-[#E5E0D5] text-center w-full relative">
                  <h3 className="font-bold text-stone-800 text-xs truncate leading-tight">{char.name}</h3>
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest truncate mt-0.5">{char.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 left-72 bg-[#F9F6ED] rounded-xl shadow-lg border border-[#E5E0D5] flex flex-col overflow-hidden z-20">
        <button onClick={() => setTransform(p => ({ ...p, scale: p.scale * 1.2 }))} className="p-2 hover:bg-[#F9F6ED] text-stone-600 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-[#E5E0D5] w-full" />
        <button onClick={() => setTransform(p => ({ ...p, scale: p.scale / 1.2 }))} className="p-2 hover:bg-[#F9F6ED] text-stone-600 transition-colors">
          <div className="w-4 h-0.5 bg-current mx-auto rounded-full" />
        </button>
      </div>
    </div>
  );
}
