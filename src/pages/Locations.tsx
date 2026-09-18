import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { storage } from "@/lib/storage";
import { 
  Plus, MoreVertical, Search, X, MapPin, Map as MapIcon, Compass, Mountain, 
  TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move, 
  Pen, Link2, ZoomIn, ZoomOut, Maximize2, Image as ImageIcon,
  Users, BookOpen, HelpCircle, Check, ClipboardCopy, Feather, Info 
} from "lucide-react";
import ImageDropzoneCard from "@/components/ImageDropzoneCard";

export interface LocationNode {
  id: string;
  x: number;
  y: number;
}

export interface LocationEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

// Helper to build project-specific location nodes and edges
export function buildDefaultProjectLocationMap(projectId: string | undefined, locList: any[]) {
  // Clean up old legacy global keys that leaked across books
  try {
    localStorage.removeItem('story_nodes');
    localStorage.removeItem('story_edges');
    localStorage.removeItem('story_unmapped');
    localStorage.removeItem('story_locations');
  } catch (e) {}

  // 1. If stored in project data, validate that nodes and edges match current locations
  if (projectId) {
    const data = storage.getProjectData(projectId);
    if (data?.locationMap?.nodes && data.locationMap.nodes.length > 0) {
      const validNodes = data.locationMap.nodes.filter(n => locList.some(l => l.id === n.id));
      if (validNodes.length > 0) {
        const validEdges = (data.locationMap.edges || []).filter(e =>
          validNodes.some(n => n.id === e.source) && validNodes.some(n => n.id === e.target)
        );
        return {
          nodes: validNodes,
          edges: validEdges,
          unmapped: data.locationMap.unmapped || []
        };
      }
    }
  }

  // 2. Pre-configured relationships for each fantasy book
  if (projectId === "book-golden-oasis") {
    return {
      nodes: [
        { id: "loc-golden-oasis", x: 240, y: 200 },
        { id: "loc-volcano-desert", x: 620, y: 160 },
        { id: "loc-harbor-desert", x: 430, y: 440 },
      ],
      edges: [
        { id: "e1", source: "loc-golden-oasis", target: "loc-volcano-desert", label: "Dune Caravan (4 days)" },
        { id: "e2", source: "loc-golden-oasis", target: "loc-harbor-desert", label: "Dry Riverbed Trail" },
      ],
      unmapped: []
    };
  }

  if (projectId === "book-sunken-crown") {
    return {
      nodes: [
        { id: "loc-volcano", x: 240, y: 200 },
        { id: "loc-oasis", x: 620, y: 160 },
        { id: "loc-peak", x: 430, y: 440 },
      ],
      edges: [
        { id: "e1", source: "loc-volcano", target: "loc-oasis", label: "Trade Caravan (5 days)" },
        { id: "e2", source: "loc-volcano", target: "loc-peak", label: "Dragon Flight Path" },
      ],
      unmapped: []
    };
  }

  if (projectId === "book-astral-spire") {
    return {
      nodes: [
        { id: "loc-astral", x: 440, y: 160 },
        { id: "loc-woods", x: 220, y: 440 },
        { id: "loc-lighthouse-astral", x: 660, y: 440 },
      ],
      edges: [
        { id: "e1", source: "loc-astral", target: "loc-woods", label: "Enchanted Trail" },
        { id: "e2", source: "loc-astral", target: "loc-lighthouse-astral", label: "Celestial Ley Line" },
      ],
      unmapped: []
    };
  }

  if (projectId === "book-frostgate") {
    return {
      nodes: [
        { id: "loc-frostgate", x: 240, y: 200 },
        { id: "loc-harbor-frost", x: 620, y: 160 },
        { id: "loc-woods-frost", x: 430, y: 440 },
      ],
      edges: [
        { id: "e1", source: "loc-frostgate", target: "loc-harbor-frost", label: "Glacial Sled Route" },
        { id: "e2", source: "loc-frostgate", target: "loc-woods-frost", label: "Snowshoe Pass" },
      ],
      unmapped: []
    };
  }

  if (projectId === "book-silent-harbor" || (!projectId && locList.some(l => l.id === "1"))) {
    return {
      nodes: [
        { id: "1", x: 240, y: 200 },
        { id: "2", x: 620, y: 160 },
        { id: "3", x: 430, y: 440 },
      ],
      edges: [
        { id: "e1", source: "1", target: "2", label: "2 days by boat" },
        { id: "e2", source: "1", target: "3", label: "Mountain pass" },
      ],
      unmapped: []
    };
  }

  // 3. Dynamic layout fallback for custom books / locations
  if (locList && locList.length > 0) {
    const layoutPositions = [
      { x: 240, y: 200 },
      { x: 620, y: 160 },
      { x: 430, y: 440 },
      { x: 740, y: 440 },
      { x: 180, y: 440 },
    ];
    const dynNodes = locList.map((l, i) => {
      const pos = layoutPositions[i % layoutPositions.length];
      return { id: l.id, x: pos.x, y: pos.y };
    });
    const dynEdges: LocationEdge[] = [];
    if (locList.length >= 2) {
      dynEdges.push({ id: "e1", source: locList[0].id, target: locList[1].id, label: "Direct Route" });
    }
    if (locList.length >= 3) {
      dynEdges.push({ id: "e2", source: locList[0].id, target: locList[2].id, label: "Mountain Pass" });
    }
    return { nodes: dynNodes, edges: dynEdges, unmapped: [] };
  }

  return { nodes: [], edges: [], unmapped: [] };
}

export const LOCATION_CREATION_AI_PROMPT = `I want you to help me create a new location for my novel project.

First, ask me to provide:

1. NOVEL / STORY CONTEXT
A short description of my novel, premise, genre, or current story world.

2. LOCATION IDEA
What kind of location I want to create.
This can be very simple, such as:
- capital city
- ancient forest
- hidden temple
- abandoned library
- mountain fortress
- magical tower
- small village

3. LOCATION NAME
Optional. If I already have a name, preserve it exactly.
If I do not provide one, create a suitable name.

After I provide this information, generate ONLY the following information for my Ocean Novel New Location form:

1. Location Name
Create a suitable and memorable location name only if I did not provide one.

2. Type
Choose a concise location type, such as:
- City
- Village
- Kingdom
- Forest
- Castle
- Fortress
- Temple
- Library
- Landmark
- Ruins
- Mountain
- Island
- Underground Location
- Magical Realm

Use the most appropriate type for the location.

3. Short Description
Write a concise 25–60 word description explaining what the location is and why it matters to the story.

4. Atmosphere / Mood
Provide 3–5 concise words describing the location's atmosphere.
Examples:
Mysterious, ancient, dangerous
Cold, isolated, imposing
Warm, peaceful, rustic

5. Region / Parent
State the larger region, kingdom, city, forest, territory, or parent location this place belongs to.
If no parent location is established, create a simple suitable region that fits the story.
If none is needed, write:
None

IMPORTANT RULES:
- Keep the location consistent with the novel context I provide.
- Preserve any location facts or names I already provide.
- Do not create characters, chapters, scenes, dialogue, plot outlines, or unrelated worldbuilding.
- Do not add excessive lore.
- Keep every field concise and easy to copy into a form.

After I provide the information, return ONLY this format:

Location Name:
...

Type:
...

Short Description:
...

Atmosphere / Mood:
...

Region / Parent:
...`;

export default function Locations() {
  const { id } = useParams<{ id: string }>();

  const getAssociatedScenes = (locId: string) => {
    if (!id || !locId) return [];
    const scenes: { title: string; content: string }[] = [];
    const data = storage.getProjectData(id);
    const manuscript = data?.manuscript || [];
    const loc = locations.find(l => l.id === locId);
    const locName = loc?.name?.toLowerCase();
    
    const searchItems = (items: any[]) => {
      for (const item of items) {
        if (item.type === 'scene' && item.content) {
          const contentLower = item.content.toLowerCase();
          if (
            item.content.includes(`data-id="${locId}"`) || 
            (locName && contentLower.includes(locName))
          ) {
            scenes.push(item);
          }
        }
        if (item.children) {
          searchItems(item.children);
        }
      }
    };
    
    searchItems(manuscript);
    return scenes;
  };

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const projectCharacters = React.useMemo(() => {
    if (!id) return [];
    const data = storage.getProjectData(id);
    return data?.characters || [];
  }, [id]);

  // Initialize project-specific locations and map state
  const initialBundle = React.useMemo(() => {
    let locs: any[] = [];
    if (id) {
      const data = storage.getProjectData(id);
      if (data?.locations && data.locations.length > 0) {
        locs = data.locations.map(loc => ({
          ...loc,
          atmosphere: (loc as any).atmosphere || "Mysterious",
          region: (loc as any).region || "Ancient Realm"
        }));
      }
    }
    if (locs.length === 0) {
      locs = [];
    }
    const map = buildDefaultProjectLocationMap(id, locs);
    return { locs, map };
  }, [id]);

  const [locations, setLocations] = useState(initialBundle.locs);
  const [nodes, setNodes] = useState<LocationNode[]>(initialBundle.map.nodes);
  const [edges, setEdges] = useState<LocationEdge[]>(initialBundle.map.edges);
  const [unmappedLocations, setUnmappedLocations] = useState<any[]>(initialBundle.map.unmapped);

  const availableRegions = React.useMemo(() => {
    const set = new Set<string>();
    locations.forEach(loc => {
      if ((loc as any).region) set.add((loc as any).region);
    });
    return Array.from(set);
  }, [locations]);

  const displayLocations = React.useMemo(() => {
    if (!selectedRegion) return locations;
    return locations.filter(l => (l as any).region === selectedRegion);
  }, [locations, selectedRegion]);

  // Synchronize when active project ID changes
  React.useEffect(() => {
    if (id) {
      const data = storage.getProjectData(id);
      const locs = (data?.locations && data.locations.length > 0)
        ? data.locations.map(loc => ({
            ...loc,
            atmosphere: (loc as any).atmosphere || "Mysterious",
            region: (loc as any).region || "Ancient Realm"
          }))
        : [];
      setLocations(locs);

      const map = buildDefaultProjectLocationMap(id, locs);
      setNodes(map.nodes);
      setEdges(map.edges);
      setUnmappedLocations(map.unmapped || []);
    }
  }, [id]);

  // Persist location map changes to project storage
  React.useEffect(() => {
    if (id) {
      storage.saveProjectData(id, {
        locations,
        locationMap: {
          nodes,
          edges,
          unmapped: unmappedLocations
        }
      });
    }
  }, [id, locations, nodes, edges, unmappedLocations]);

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
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

  const [showLocationGuideModal, setShowLocationGuideModal] = useState(false);
  const [isLocationPromptCopied, setIsLocationPromptCopied] = useState(false);

  const handleCopyLocationPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LOCATION_CREATION_AI_PROMPT);
      setIsLocationPromptCopied(true);
      setTimeout(() => setIsLocationPromptCopied(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = LOCATION_CREATION_AI_PROMPT;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsLocationPromptCopied(true);
      setTimeout(() => setIsLocationPromptCopied(false), 2500);
    }
  };

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


  // Helper to draw bezier curve between two points
  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    // Control point distance based on how far apart they are
    const offset = Math.max(dx * 0.4, dy * 0.4, 50); 
    
    return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
  };

  const handleMapLocation = (unmapped: any) => {
    const newId = Date.now().toString();
    const newLoc = {
      id: newId,
      name: unmapped.name,
      type: unmapped.type,
      description: "Needs description...",
      atmosphere: "Unknown",
      region: "Unmapped Lands",
      imageUrl: unmapped.imageUrl
    };
    
    // Add to locations
    setLocations(prev => [...prev, newLoc]);
    
    // Calculate center of current map view
    let centerX = 400;
    let centerY = 300;
    if(canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        centerX = (rect.width / 2 - pan.x) / scale;
        centerY = (rect.height / 2 - pan.y) / scale;
    }
    
    // Add to nodes
    setNodes(prev => [...prev, { id: newId, x: centerX, y: centerY }]);
    
    // Remove from unmapped
    setUnmappedLocations(prev => prev.filter(l => l.id !== unmapped.id));
    
    // Switch to map view to show it
    setViewMode("map");
  };


  const handleStartDrawEdge = (e: React.PointerEvent, sourceId: string) => {
    e.stopPropagation();
    try { canvasRef.current?.setPointerCapture(e.pointerId); } catch(err) {}
    
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
  };

  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    atmosphere: "",
    region: "",
    imageUrl: "",
  });

  const handleOpenCreate = () => {
    setEditingLocId(null);
    setFormData({ name: "", type: "", description: "", atmosphere: "", region: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: any) => {
    setEditingLocId(loc.id);
    setFormData({
      name: loc.name || "",
      type: loc.type || "",
      description: loc.description || "",
      atmosphere: loc.atmosphere || "",
      region: loc.region || "",
      imageUrl: (loc as any).imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const [locToDelete, setLocToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setLocToDelete(id);
  };

  const confirmDelete = () => {
    if (locToDelete) {
      setLocations(prev => prev.filter(l => l.id !== locToDelete));
      setNodes(prev => prev.filter(n => n.id !== locToDelete));
      setEdges(prev => prev.filter(e => e.source !== locToDelete && e.target !== locToDelete));
      setLocToDelete(null);
    }
  };

  const getTypeIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes('town') || t.includes('city') || t.includes('village')) return <Building className="w-3.5 h-3.5" />;
    if (t.includes('house') || t.includes('home') || t.includes('tavern') || t.includes('inn')) return <Home className="w-3.5 h-3.5" />;
    if (t.includes('forest') || t.includes('woods')) return <TreePine className="w-3.5 h-3.5" />;
    if (t.includes('mountain') || t.includes('peak')) return <Mountain className="w-3.5 h-3.5" />;
    if (t.includes('castle') || t.includes('keep') || t.includes('fort')) return <Castle className="w-3.5 h-3.5" />;
    return <MapPin className="w-3.5 h-3.5" />;
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingLocId) {
      setLocations(prev => prev.map(loc => 
        loc.id === editingLocId ? { ...loc, ...formData } : loc
      ));
    } else {
      const newLoc = {
        id: Date.now().toString(),
        ...formData
      };
      setLocations(prev => [newLoc, ...prev]);
      setNodes(prev => [...prev, { id: newLoc.id, x: 200, y: 200 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative bg-[#3d261d]">
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236e4b3b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#8c503c] rounded-full mix-blend-color-dodge blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#d49a89] rounded-full mix-blend-overlay blur-[120px] opacity-10" />
      </div>

      <div className="p-4 lg:p-6 border-b border-[#5d3f32] bg-[#2a1a14]/80 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl text-[#e5e0d5] font-bold">World Atlas</h1>
            <button
              type="button"
              onClick={() => setShowLocationGuideModal(true)}
              className="w-7 h-7 rounded-full bg-[#5d3f32]/50 hover:bg-[#5d3f32]/80 border border-[#8c503c]/50 hover:border-[#8c503c]/90 text-[#d49a89] hover:text-[#fcfaf5] flex items-center justify-center transition-all shadow-sm group hover:scale-105"
              title="World Atlas & Location Guide & AI Prompt"
              aria-label="Location Guide & AI Prompt"
            >
              <HelpCircle className="w-4 h-4 transition-transform group-hover:rotate-12" />
            </button>
          </div>
          <p className="text-[#a66850] text-[11px] font-bold uppercase tracking-widest mt-1">Chart the regions and landmarks</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a66850]" />
            <input 
              type="text" 
              placeholder="Search atlas..." 
              className="w-full pl-9 pr-4 py-2 bg-[#1a0f0a]/60 border border-[#5d3f32] rounded-sm text-[#e5e0d5] text-sm font-serif italic placeholder:text-[#8a5b46] focus:outline-none focus:border-[#a66850] transition-colors shadow-inner"
            />
          </div>

          {/* View Switcher */}
          <div className="flex bg-[#2a1a14]/60 p-1 rounded-full border border-[#5d3f32] backdrop-blur-sm shadow-inner shrink-0 mr-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all shadow-sm ${viewMode === "grid" ? "bg-[#b8785e] text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all shadow-sm ${viewMode === "map" ? "bg-[#b8785e] text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <Route className="w-3.5 h-3.5" />
              Map
            </button>
          </div>

          <button 
            onClick={handleOpenCreate}
            className="px-6 py-2 bg-[#b8785e] hover:bg-[#a66850] text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-3 h-3" />
            Add Location
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 shrink-0 bg-[#2a1a14]/60 backdrop-blur-md border-r border-[#5d3f32] flex flex-col hidden md:flex">
          <div className="p-4 border-b border-[#5d3f32]">
            <h3 className="text-[10px] font-bold text-[#a66850] tracking-[0.2em] uppercase">Regions</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <button 
              onClick={() => setSelectedRegion(null)}
              className={`w-full text-left px-3 py-2 text-sm font-serif rounded-sm transition-colors flex items-center justify-between group ${
                selectedRegion === null 
                  ? 'bg-[#b8785e] text-white' 
                  : 'text-stone-400 hover:text-[#e5e0d5] hover:bg-[#3d261d]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4" />
                All Regions
              </div>
              <span className="text-[10px] font-bold opacity-75">{locations.length}</span>
            </button>

            {availableRegions.map(region => (
              <button 
                key={region}
                onClick={() => setSelectedRegion(region === selectedRegion ? null : region)}
                className={`w-full text-left px-3 py-2 text-sm font-serif rounded-sm transition-colors flex items-center justify-between group ${
                  selectedRegion === region 
                    ? 'bg-[#b8785e] text-white' 
                    : 'text-stone-400 hover:text-[#e5e0d5] hover:bg-[#3d261d]/50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Castle className="w-4 h-4 shrink-0 text-stone-500 group-hover:text-[#d49a89] transition-colors" />
                  <span className="truncate">{region}</span>
                </div>
                <span className="text-[10px] font-bold opacity-75 shrink-0">
                  {locations.filter(l => (l as any).region === region).length}
                </span>
              </button>
            ))}

            {availableRegions.length === 0 && (
              <p className="px-3 py-2 text-xs italic text-stone-500">No regions categorized yet.</p>
            )}

            <div className="pt-4 mt-4 border-t border-[#5d3f32]/50">
              <h4 className="text-[9px] font-bold text-[#8a5b46] tracking-[0.2em] uppercase px-3 mb-2">Unmapped Lands</h4>
              {unmappedLocations.length === 0 ? (
                <p className="px-3 text-xs italic text-stone-500">All lands mapped.</p>
              ) : (
                unmappedLocations.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => handleMapLocation(u)}
                    className="w-full text-left px-3 py-2 text-sm font-serif text-stone-400 hover:text-[#e5e0d5] hover:bg-[#3d261d]/50 rounded-sm transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {u.icon === 'TreePine' && <TreePine className="w-4 h-4 text-stone-500 group-hover:text-[#d49a89] transition-colors" />}
                      {u.icon === 'Mountain' && <Mountain className="w-4 h-4 text-stone-500 group-hover:text-[#d49a89] transition-colors" />}
                      {u.name}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-stone-600 group-hover:text-[#d49a89] opacity-0 group-hover:opacity-100 transition-opacity">
                      Add to Map
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add Location Card */}
              <div 
                onClick={handleOpenCreate}
                className="relative group cursor-pointer min-h-[320px] rounded-sm bg-[#5d3f32]/20 backdrop-blur-sm border-2 border-dashed border-[#8c503c]/40 transition-all flex flex-col items-center justify-center hover:bg-[#5d3f32]/40 hover:border-[#8c503c]/70 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#d49a89]/40 flex items-center justify-center mb-3 text-[#d49a89]/60 group-hover:text-[#d49a89] group-hover:border-[#d49a89]/60 transition-all duration-300">
                  <Plus className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#d49a89]/60 group-hover:text-[#d49a89] transition-colors">
                  Add Location
                </span>
              </div>

              {displayLocations.map((loc, idx) => (
                <div 
                  key={`loc-card-${loc.id || idx}`} 
                  className="relative group bg-[#F6F0E7] border border-[#d49a89]/40 rounded-sm shadow-[0_4px_12px_rgba(25,10,5,0.15)] hover:shadow-[0_8px_20px_rgba(25,10,5,0.2)] hover:-translate-y-[2px] hover:border-[#b8785e] transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                  onClick={() => handleOpenEdit(loc)}
                >
                  <div className="h-1 w-full bg-[#a66850] opacity-80" />
                  
                  {(loc as any).imageUrl && (
                    <div className="h-40 w-full overflow-hidden shrink-0 border-b border-[#d49a89]/40 relative bg-black/10">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#F6F0E7] via-[#F6F0E7]/20 to-transparent z-10" />
                      <img src={(loc as any).imageUrl} alt={loc.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col h-full gap-4 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(loc); }}
                        className="p-1.5 text-stone-500 hover:text-[#8a5b46] transition-colors rounded-sm hover:bg-[#e5e0d5]/60"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }}
                        className="p-1.5 text-stone-500 hover:text-rose-600 transition-colors rounded-sm hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pr-16">
                      <h3 className="font-serif text-[22px] font-bold text-[#3d261d] leading-tight mb-2" title={loc.name}>
                        {loc.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[#8a5b46] text-[10px] font-bold tracking-[0.2em] uppercase">
                        {getTypeIcon(loc.type)}
                        <span className="truncate">{loc.type || 'Unknown Type'}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="font-serif text-[15px] text-[#4a3225]/90 leading-relaxed line-clamp-4">
                        {loc.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#8c503c] text-[10px] font-bold mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-widest truncate">{loc.region || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <>
<div 
            ref={canvasRef}
            className="flex-1 relative overflow-hidden bg-[#3d261d] cursor-grab active:cursor-grabbing"
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
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {edges.map(edge => {
                  const sourceLoc = locations.find(l => l.id === edge.source);
                  const targetLoc = locations.find(l => l.id === edge.target);
                  // SAFEGUARD: Both locations must exist in the active project to prevent orphan/ghost connection lines
                  if (!sourceLoc || !targetLoc) return null;

                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  
                  const sHasImg = !!sourceLoc.imageUrl;
                  const tHasImg = !!targetLoc.imageUrl;
                  const x1 = sourceNode.x + 90;
                  const y1 = sourceNode.y + (sHasImg ? 70 : 40);
                  const x2 = targetNode.x + 90;
                  const y2 = targetNode.y + (tHasImg ? 70 : 40);

                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  const pillWidth = Math.max(edge.label.length * 7 + 28, 76);
                  
                  return (
                    <g 
                      key={edge.id} 
                      className="pointer-events-auto group/edge cursor-pointer" 
                      onClick={() => setEdgeToDelete(edge.id)}
                    >
                      <line 
                        x1={x1} y1={y1} 
                        x2={x2} y2={y2} 
                        stroke="#a66850" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.75"
                        className="group-hover/edge:stroke-[#e28868] group-hover/edge:stroke-[3.5] transition-all"
                      />
                      <rect 
                        x={midX - pillWidth / 2} 
                        y={midY - 13} 
                        width={pillWidth} 
                        height="26" 
                        fill="#fcfaf5" 
                        rx="5" 
                        stroke="#d49a89" 
                        className="group-hover/edge:stroke-[#8c503c] group-hover/edge:fill-[#fff5ee] transition-all shadow-md"
                      />
                      <text 
                        x={midX} 
                        y={midY + 4} 
                        fontSize="9.5" 
                        fill="#8a5b46" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        letterSpacing="0.08em"
                        className="select-none pointer-events-none group-hover/edge:fill-[#4a3225]"
                      >
                        {edge.label.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              
                {drawingEdge && (() => {
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
                })()}
</svg>

              {nodes.map(node => {
                const loc = locations.find(l => l.id === node.id);
                if (!loc) return null;
                
                return (
                  <div 
                    key={node.id}
                    data-node-id={node.id}
                    className="group absolute select-none bg-[#F6F0E7] border border-[#d49a89] rounded-sm shadow-[0_8px_20px_rgba(25,10,5,0.3)] w-[180px] cursor-pointer hover:border-[#b8785e] hover:shadow-[0_12px_24px_rgba(25,10,5,0.4)] transition-colors overflow-visible"
                    style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDraggingNode(node.id);
                      try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      setDraggingNode(null);
                      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                    }}
                    onDoubleClick={() => handleOpenEdit(loc)}
                  >
                    <div className="h-1 w-full bg-[#a66850]" />
                    {(loc as any).imageUrl && (
                      <div className="h-24 w-full overflow-hidden border-b border-[#d49a89]/40 bg-black/10">
                        <img src={(loc as any).imageUrl} alt={loc.name} className="w-full h-full object-cover mix-blend-multiply pointer-events-none" draggable={false} />
                      </div>
                    )}
                    <div className="p-3 text-center pointer-events-none">
                      <div className="flex justify-center mb-1 text-[#8a5b46]">
                        {getTypeIcon(loc.type)}
                      </div>
                      <h4 className="font-serif font-bold text-[#3d261d] leading-tight text-sm">
                        {loc.name}
                      </h4>
                    </div>
                    {/* Link Anchor (shows on hover) */}
                    <div 
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#fcfaf5] border border-[#d49a89] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair hover:bg-[#8c503c] hover:text-white shadow-sm z-30"
                      onPointerDown={(e) => handleStartDrawEdge(e, node.id)}
                    >
                      <Link2 className="w-3 h-3 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
            
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
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="bg-[#fcfaf5] rounded-sm shadow-[8px_16px_48px_rgba(0,0,0,0.5)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e5e0d5] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#e5e0d5] bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#f4efe6] border border-[#e5e0d5] flex items-center justify-center text-[#8a5b46]">
                  <MapIcon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#4a3225]">
                    {editingLocId ? "Edit Location" : "Cartographer's Log"}
                  </h2>
                  <p className="text-[10px] font-bold text-[#a66850] tracking-widest uppercase mt-0.5">
                    {editingLocId ? "Update existing records" : "Record a New Location"}
                  </p>
                </div>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-sm text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#fcfaf5]">
              
              {/* Layout for 2 columns: Form (Left) & Cross-Linking (Right) */}
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <h3 className="text-sm font-bold text-[#4a3225] border-b border-[#e5e0d5] pb-2">General Information</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Location Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. The Old Lighthouse" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Type (City, Landmark...)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Landmark" 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Short Description</label>
                    <textarea 
                      className="w-full h-24 bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-serif italic text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner resize-none" 
                      placeholder="Describe the setting and its significance..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Atmosphere / Mood</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cold, damp, imposing" 
                        value={formData.atmosphere}
                        onChange={(e) => setFormData({...formData, atmosphere: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Region / Parent</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Whispering Woods" 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                  <h3 className="text-sm font-bold text-[#4a3225] border-b border-[#e5e0d5] pb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#a66850]" />
                    Location Artwork
                  </h3>
                  <ImageDropzoneCard
                    type="location"
                    aspectRatio="landscape"
                    imageUrl={formData.imageUrl}
                    onImageChange={(newUrl) => setFormData(prev => ({ ...prev, imageUrl: newUrl }))}
                    label="Illustration / Map View"
                  />

                  {editingLocId && (
                    <>
                      {/* Residents */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-[#a66850] uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Residents
                        </h4>
                        <div className="space-y-2">
                          {projectCharacters.filter((c: any) => c.locationId === editingLocId).length > 0 ? (
                            projectCharacters.filter((c: any) => c.locationId === editingLocId).map((char: any, rIdx: number) => (
                              <div key={`loc-res-${char.id || rIdx}`} className="bg-white border border-[#e5e0d5] rounded-sm p-2 flex items-center gap-2 shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                  {char.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#4a3225] truncate">{char.name}</p>
                                  <p className="text-[9px] text-stone-400 uppercase tracking-wider truncate">{char.role}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-stone-400 italic">No known residents.</p>
                          )}
                        </div>
                      </div>

                      {/* Associated Events */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-[#a66850] uppercase tracking-widest flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" />
                          Plot Events
                        </h4>
                        <div className="space-y-2">
                          {getAssociatedScenes(editingLocId).length > 0 ? (
                            getAssociatedScenes(editingLocId).map((scene, idx) => (
                              <div key={idx} className="bg-white border border-[#e5e0d5] rounded-sm p-2 shadow-sm">
                                <p className="text-xs font-bold text-[#4a3225] truncate">{scene.title}</p>
                                <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 italic">
                                  Appears in manuscript scene.
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-stone-400 italic">No events recorded here.</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#e5e0d5] flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-[#8a5b46] text-[11px] font-bold tracking-widest uppercase hover:bg-stone-100 rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className={`px-6 py-2 text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${
                  !formData.name.trim() 
                    ? 'bg-stone-300 cursor-not-allowed' 
                    : 'bg-[#b8785e] hover:bg-[#a66850]'
                }`}
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {locToDelete && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="bg-[#fcfaf5] rounded-sm shadow-[8px_16px_48px_rgba(0,0,0,0.5)] w-full max-w-sm flex flex-col overflow-hidden border border-[#e5e0d5] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4a3225]">Delete Location</h3>
              <p className="text-sm font-serif italic text-stone-500">
                Are you sure you want to delete this location? This action cannot be undone.
              </p>
            </div>
            
            <div className="p-4 border-t border-[#e5e0d5] flex justify-center gap-3 bg-white">
              <button 
                onClick={() => setLocToDelete(null)}
                className="px-6 py-2 text-[#8a5b46] text-[11px] font-bold tracking-widest uppercase hover:bg-stone-100 rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    
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
                className={`px-6 py-2 text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${!newEdgePopup.label.trim() ? 'bg-stone-300' : 'bg-[#b8785e] hover:bg-[#a66850]'}`}
              >
                Save Route
              </button>
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
      {/* World Atlas & Location Workflow Guide Modal */}
      {showLocationGuideModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowLocationGuideModal(false)}
        >
          <div 
            className="bg-[#fcfaf5] border border-[#e5e0d5] rounded-sm shadow-[8px_24px_64px_rgba(0,0,0,0.5)] max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden text-stone-800 relative my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e5e0d5] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-[#f4efe6] border border-[#e5e0d5] flex items-center justify-center text-[#8a5b46] shrink-0">
                  <Compass className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#4a3225] uppercase tracking-wide">
                    World Atlas & Location Guide
                  </h2>
                  <p className="text-xs font-serif text-stone-500">
                    Step-by-step workflow for realm building, geographic cartography, and AI ideation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationGuideModal(false)}
                className="w-8 h-8 rounded-sm text-stone-400 hover:text-[#b8785e] hover:bg-[#f4efe6] flex items-center justify-center transition-colors"
                aria-label="Close guide modal"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 custom-scrollbar bg-[#fcfaf5]">
              {/* Section 1: Workflow Steps */}
              <div className="space-y-3">
                <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-[#8a5b46] flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  What steps do you take in World Atlas?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-sm bg-white border border-[#e5e0d5] shadow-xs space-y-1.5 hover:border-[#b8785e]/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#f4efe6] text-[#8a5b46] border border-[#e5e0d5] text-[10px] font-bold flex items-center justify-center font-serif shrink-0">1</span>
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#4a3225]">Catalogue Realms & Sites</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed font-sans pl-7">
                      Click <strong className="text-[#4a3225] font-semibold">Add Location</strong> in the Atlas toolbar to record name, category (City, Castle, Forest, Temple, etc.), parent region, atmosphere, and description.
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-[#e5e0d5] shadow-xs space-y-1.5 hover:border-[#b8785e]/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#f4efe6] text-[#8a5b46] border border-[#e5e0d5] text-[10px] font-bold flex items-center justify-center font-serif shrink-0">2</span>
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#4a3225]">Attach Setting Artworks</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed font-sans pl-7">
                      Upload atmospheric scenery illustrations, concept landscapes, or choose curated environment presets to give each location distinct visual presence.
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-[#e5e0d5] shadow-xs space-y-1.5 hover:border-[#b8785e]/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#f4efe6] text-[#8a5b46] border border-[#e5e0d5] text-[10px] font-bold flex items-center justify-center font-serif shrink-0">3</span>
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#4a3225]">Cartographic Map View</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed font-sans pl-7">
                      Switch to <strong className="text-[#4a3225] font-semibold">Map</strong> view to arrange locations across an interactive canvas, pan, zoom, and organize territorial borders.
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-[#e5e0d5] shadow-xs space-y-1.5 hover:border-[#b8785e]/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#f4efe6] text-[#8a5b46] border border-[#e5e0d5] text-[10px] font-bold flex items-center justify-center font-serif shrink-0">4</span>
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#4a3225]">Connect Routes & Trails</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed font-sans pl-7">
                      Link settlements and landmarks with custom travel routes, caravan highways, perilous sea channels, and mountain passes labeled with travel duration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: AI Location Architect Prompt */}
              <div className="space-y-3 pt-4 border-t border-[#e5e0d5]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-[#8a5b46] flex items-center gap-2">
                      <Feather className="w-4 h-4" />
                      Unsure what to write? Copy this AI Location Prompt
                    </h3>
                    <p className="text-xs font-serif text-stone-500 mt-0.5">
                      Send this prompt to ChatGPT, Claude, or Gemini alongside your novel premise to generate an authentic location profile:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLocationPrompt}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                      isLocationPromptCopied
                        ? "bg-emerald-700 text-white"
                        : "bg-[#b8785e] hover:bg-[#a66850] text-white"
                    }`}
                  >
                    {isLocationPromptCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="w-3.5 h-3.5" />
                        <span>Copy Prompt to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prompt Code Block Preview */}
                <div className="relative">
                  <pre className="p-4 rounded-sm bg-white border border-[#e5e0d5] text-xs font-mono leading-relaxed text-stone-700 max-h-56 overflow-y-auto whitespace-pre-wrap select-all selection:bg-[#c17a7a]/20 custom-scrollbar shadow-xs">
{LOCATION_CREATION_AI_PROMPT}
                  </pre>
                </div>

                <div className="p-3.5 rounded-sm bg-[#f4efe6] border border-[#e5e0d5] text-xs text-[#5c4033] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#8a5b46] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="font-semibold text-[#4a3225]">Tip:</strong> Once the AI returns your location details, click <em className="font-serif">"+ Add Location"</em> in the World Atlas and paste the generated name, type, atmosphere, and description directly into the form.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#e5e0d5] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLocationGuideModal(false)}
                className="px-5 py-2 rounded-sm bg-[#f4efe6] hover:bg-[#eae3d5] text-[#4a3225] border border-[#e5e0d5] text-xs font-bold uppercase tracking-widest transition-colors shadow-xs"
              >
                Got it, return to Atlas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
