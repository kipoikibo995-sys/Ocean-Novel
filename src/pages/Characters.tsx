import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowDownUp,
  Folder,
  Grid,
  Users,
  Upload,
  Download,
  Copy,
  Trash2,
  Edit3,
  Plus,
  Home,
  Shield,
  Heart,
  Swords,
  UserPlus,
  X,
  Bookmark,
  Clock,
  Image as ImageIcon,
  Star,
  LayoutGrid,
  FileText,
  ClipboardCopy,
  Check,
  Scissors,
  Link2,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { storage } from "@/lib/storage";
import ImageDropzoneCard from "@/components/ImageDropzoneCard";
import ImagePickerModal from "@/components/ImagePickerModal";
import { FANTASY_PRESET_PORTRAITS } from "@/lib/imageUtils";

// Define exact mock characters based on the provided image
const CATALOG_CHARACTERS: any[] = [];

const MOCK_NODES: any[] = [];

const MOCK_EDGES: any[] = [];

export const RELATION_OPTIONS = [
  { label: "ALLY", color: "#78c3b4", icon: UserPlus },
  { label: "ENEMY", color: "#e15b64", icon: Swords },
  { label: "FAMILY", color: "#6184d8", icon: Shield },
  { label: "LOVER", color: "#f9a8d4", icon: Heart },
  { label: "FRIEND", color: "#fca311", icon: Users },
  { label: "RIVAL", color: "#9c27b0", icon: Swords },
];

export function getEdgeIconComponent(edge: any) {
  // If edge.icon is an actual function or valid React component
  if (typeof edge?.icon === "function") {
    return edge.icon;
  }
  if (
    edge?.icon &&
    typeof edge.icon === "object" &&
    (typeof edge.icon.render === "function" ||
      ("$$typeof" in edge.icon && typeof (edge.icon as any).$$typeof === "symbol"))
  ) {
    return edge.icon;
  }
  // Lookup from RELATION_OPTIONS by label
  if (edge?.label) {
    const found = RELATION_OPTIONS.find(
      (r) => r.label.toUpperCase() === String(edge.label).toUpperCase()
    );
    if (found?.icon) return found.icon;
  }
  if (edge?.label === "CUSTOM") return Bookmark;
  return Swords;
}

export function buildDefaultProjectGraph(projectId: string | undefined, chars: any[]) {
  // If stored in project data, validate and return
  if (projectId) {
    const data = storage.getProjectData(projectId);
    if (data?.characterGraphs && data.characterGraphs.length > 0) {
      const firstGraph = data.characterGraphs[0];
      const hasMatchingNode = firstGraph.nodes.some((n: any) => chars.some((c: any) => c.id === n.id));
      if (hasMatchingNode) {
        return data.characterGraphs;
      }
    }
  }

  // Pre-configured relationships for the 5 fantasy books
  if (projectId === "book-golden-oasis") {
    return [
      {
        id: "1",
        name: "Main Plot",
        nodes: [
          { id: "char-amira", x: 420, y: 260 },
          { id: "char-tariq", x: 680, y: 200 },
          { id: "char-zahir", x: 230, y: 240 },
          { id: "char-maheera", x: 480, y: 470 },
        ],
        edges: [
          { id: "e1", source: "char-amira", target: "char-tariq", label: "ALLY", color: "#78c3b4" },
          { id: "e2", source: "char-amira", target: "char-zahir", label: "FAMILY", color: "#6184d8" },
          { id: "e3", source: "char-amira", target: "char-maheera", label: "ENEMY", color: "#e15b64" },
          { id: "e4", source: "char-tariq", target: "char-maheera", label: "RIVAL", color: "#9c27b0" },
        ],
      },
    ];
  }

  if (projectId === "book-sunken-crown") {
    return [
      {
        id: "1",
        name: "Main Plot",
        nodes: [
          { id: "char-valen", x: 420, y: 260 },
          { id: "char-lyra", x: 680, y: 200 },
          { id: "char-garrick", x: 230, y: 240 },
          { id: "char-morath", x: 480, y: 470 },
        ],
        edges: [
          { id: "e1", source: "char-valen", target: "char-lyra", label: "ALLY", color: "#78c3b4" },
          { id: "e2", source: "char-valen", target: "char-garrick", label: "FRIEND", color: "#fca311" },
          { id: "e3", source: "char-valen", target: "char-morath", label: "ENEMY", color: "#e15b64" },
          { id: "e4", source: "char-lyra", target: "char-morath", label: "RIVAL", color: "#9c27b0" },
        ],
      },
    ];
  }

  if (projectId === "book-astral-spire") {
    return [
      {
        id: "1",
        name: "Main Plot",
        nodes: [
          { id: "char-alistair", x: 420, y: 260 },
          { id: "char-sylvia", x: 680, y: 200 },
          { id: "char-kaelen", x: 230, y: 240 },
          { id: "char-inquisitor", x: 480, y: 470 },
        ],
        edges: [
          { id: "e1", source: "char-alistair", target: "char-sylvia", label: "FRIEND", color: "#fca311" },
          { id: "e2", source: "char-alistair", target: "char-kaelen", label: "ALLY", color: "#78c3b4" },
          { id: "e3", source: "char-alistair", target: "char-inquisitor", label: "ENEMY", color: "#e15b64" },
          { id: "e4", source: "char-kaelen", target: "char-inquisitor", label: "RIVAL", color: "#9c27b0" },
        ],
      },
    ];
  }

  if (projectId === "book-frostgate") {
    return [
      {
        id: "1",
        name: "Main Plot",
        nodes: [
          { id: "char-torvin", x: 420, y: 260 },
          { id: "char-freyja", x: 680, y: 200 },
          { id: "char-astrid", x: 230, y: 240 },
          { id: "char-malakor", x: 480, y: 470 },
        ],
        edges: [
          { id: "e1", source: "char-torvin", target: "char-freyja", label: "ALLY", color: "#78c3b4" },
          { id: "e2", source: "char-torvin", target: "char-astrid", label: "FAMILY", color: "#6184d8" },
          { id: "e3", source: "char-torvin", target: "char-malakor", label: "ENEMY", color: "#e15b64" },
          { id: "e4", source: "char-freyja", target: "char-malakor", label: "RIVAL", color: "#9c27b0" },
        ],
      },
    ];
  }

  if (projectId === "book-silent-harbor" || (!projectId && chars.some((c) => c.id === "1"))) {
    return [
      {
        id: "1",
        name: "Main Plot",
        nodes: [
          { id: "1", x: 420, y: 280 },
          { id: "2", x: 680, y: 220 },
          { id: "3", x: 260, y: 440 },
        ],
        edges: [
          { id: "e1", source: "1", target: "2", label: "ALLY", color: "#78c3b4" },
          { id: "e2", source: "1", target: "3", label: "FAMILY", color: "#6184d8" },
        ],
      },
    ];
  }

  // Dynamic layout for any custom characters
  if (chars && chars.length > 0) {
    const layoutPositions = [
      { x: 420, y: 260 },
      { x: 680, y: 200 },
      { x: 230, y: 240 },
      { x: 480, y: 470 },
      { x: 720, y: 450 },
      { x: 200, y: 450 },
    ];
    const dynNodes = chars.map((c, i) => {
      const pos = layoutPositions[i % layoutPositions.length];
      return { id: c.id, x: pos.x, y: pos.y };
    });
    const dynEdges: any[] = [];
    if (chars.length >= 2) {
      dynEdges.push({ id: "e1", source: chars[0].id, target: chars[1].id, label: "ALLY", color: "#78c3b4" });
    }
    if (chars.length >= 3) {
      dynEdges.push({ id: "e2", source: chars[0].id, target: chars[2].id, label: "FAMILY", color: "#6184d8" });
    }
    if (chars.length >= 4) {
      dynEdges.push({ id: "e3", source: chars[0].id, target: chars[3].id, label: "ENEMY", color: "#e15b64" });
    }
    return [{ id: "1", name: "Main Plot", nodes: dynNodes, edges: dynEdges }];
  }

  return [{ id: "1", name: "Main Plot", nodes: MOCK_NODES, edges: MOCK_EDGES }];
}

export default function Characters() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();


  const [viewMode, setViewMode] = useState<"registry" | "connections" | "editor">(
    "connections",
  );
  const [previousViewMode, setPreviousViewMode] = useState<"registry" | "connections">("connections");
  const [characters, setCharacters] = useState<Array<any>>(() => {
    if (id) {
      const data = storage.getProjectData(id);
      if (data?.characters && data.characters.length > 0) {
        return data.characters;
      }
    }
    return CATALOG_CHARACTERS;
  });

  useEffect(() => {
    if (id) {
      const data = storage.getProjectData(id);
      if (data?.characters && data.characters.length > 0) {
        let hasChanges = false;
        const updatedCharacters = data.characters.map((char: any, index: number) => {
          let hasModified = false;
          let backstory = char.backstory;
          let description = char.description;
          if (!backstory && description) {
            backstory = description;
            hasModified = true;
          } else if (!description && backstory) {
            description = backstory;
            hasModified = true;
          }

          let traits = char.traits;
          if (!Array.isArray(traits)) {
            traits = typeof traits === 'string' && traits.trim() ? traits.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
            hasModified = true;
          }

          let imageUrl = char.imageUrl;
          if (!imageUrl || imageUrl.includes("unsplash.com") || imageUrl.includes(".webp")) {
            hasModified = true;
            const fallbackPreset = FANTASY_PRESET_PORTRAITS[index % FANTASY_PRESET_PORTRAITS.length];
            imageUrl = fallbackPreset ? fallbackPreset.url : "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/02_regal_paladin_in_the_cathedral_kmo5lz.jpg";
          }

          if (hasModified) hasChanges = true;

          return {
            ...char,
            backstory: backstory || "",
            description: description || backstory || "",
            traits,
            imageUrl,
          };
        });

        if (hasChanges) {
          storage.saveProjectData(id, { characters: updatedCharacters });
        }

        setCharacters(updatedCharacters);
        const projectGraphs = buildDefaultProjectGraph(id, updatedCharacters);
        setGraphs(projectGraphs);
        setActiveGraphId(projectGraphs[0]?.id || "1");
      }
    }
  }, [id]);

  // Editor State
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aliasInput, setAliasInput] = useState("");
  const [traitInput, setTraitInput] = useState("");
  const [showAttributeDropdown, setShowAttributeDropdown] = useState(false);

  // Registry State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("name_asc");
  const [registryView, setRegistryView] = useState<"grid" | "folder" | "gallery">("grid");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [showClearGraphConfirm, setShowClearGraphConfirm] = useState(false);
  const [copiedCharId, setCopiedCharId] = useState<string | null>(null);
  const [copiedEditor, setCopiedEditor] = useState(false);
  const [quickImageChar, setQuickImageChar] = useState<any | null>(null);
  const [showPortraitGalleryModal, setShowPortraitGalleryModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    age: "",
    status: "",
    aliases: [] as string[],
    backstory: "",
    traits: [] as string[],
    imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/02_regal_paladin_in_the_cathedral_kmo5lz.jpg",
    mbti: "",
    archetype: "",
    conflict: "",
    goal: "",
    trauma: "",
    group: "none",
    customAttributes: [] as { key: string, value: string }[],
  });

  const handleOpenEditorNew = () => {
    setPreviousViewMode(viewMode === "editor" ? previousViewMode : viewMode);
    setEditingCharId(null);
    setAliasInput("");
    setTraitInput("");
    setShowAttributeDropdown(false);
    setFormData({
      name: "",
      role: "",
      age: "",
      status: "ALIVE",
      aliases: [],
      backstory: "",
      traits: [],
      imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/02_regal_paladin_in_the_cathedral_kmo5lz.jpg",
      mbti: "",
      archetype: "",
      conflict: "",
      goal: "",
      trauma: "",
      group: "none",
      customAttributes: [],
    });
    setViewMode("editor");
  };

  const handleOpenEditorEdit = (char: any) => {
    setPreviousViewMode(viewMode === "editor" ? previousViewMode : viewMode);
    setEditingCharId(char.id);
    setAliasInput("");
    setTraitInput("");
    setShowAttributeDropdown(false);

    let charTraits: string[] = [];
    if (Array.isArray(char.traits)) {
      charTraits = char.traits.filter(Boolean);
    } else if (typeof char.traits === 'string' && char.traits.trim()) {
      charTraits = char.traits.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    setFormData({
      name: char.name || "",
      role: char.role || "",
      age: char.age || "",
      status: char.status || "ALIVE",
      aliases: char.aliases || [],
      backstory: char.backstory || char.description || char.shortBio || "",
      traits: charTraits,
      imageUrl: char.imageUrl || "",
      mbti: char.mbti || "",
      archetype: char.archetype || "",
      conflict: char.conflict || "",
      goal: char.goal || "",
      trauma: char.trauma || "",
      group: char.group || "none",
      customAttributes: char.customAttributes || [],
    });
    setViewMode("editor");
  };

  const handleSaveEditor = () => {
    if (!formData.name.trim()) return;

    // Flush any pending trait input that user typed without pressing Enter
    const currentTraits = [...formData.traits];
    if (traitInput.trim()) {
      const splitTraits = traitInput.split(',').map(s => s.trim()).filter(Boolean);
      for (const t of splitTraits) {
        if (!currentTraits.includes(t)) {
          currentTraits.push(t);
        }
      }
      setTraitInput("");
      setFormData(prev => ({ ...prev, traits: currentTraits }));
    }

    const backstoryContent = formData.backstory || "";

    const newChar = {
      id: editingCharId || Date.now().toString(),
      name: formData.name.trim() || "New Character",
      role: formData.role || "PROTAGONIST",
      age: formData.age || "",
      status: formData.status || "ALIVE",
      aliases: formData.aliases || [],
      backstory: backstoryContent,
      description: backstoryContent, // Synchronize for all AI prompts, search, and overview widgets
      traits: currentTraits,
      imageUrl: formData.imageUrl || "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/02_regal_paladin_in_the_cathedral_kmo5lz.jpg",
      mbti: formData.mbti || "",
      archetype: formData.archetype || "",
      conflict: formData.conflict || "",
      goal: formData.goal || "",
      trauma: formData.trauma || "",
      group: formData.group || "none",
      customAttributes: formData.customAttributes || [],
    };

    let updatedCharacters: any[];
    if (editingCharId) {
      updatedCharacters = characters.map((c) => (c.id === editingCharId ? newChar : c));
    } else {
      updatedCharacters = [...characters, newChar];
      setNodes((prev: any) => [...prev, { id: newChar.id, x: 200, y: 200 }]);
    }
    
    setCharacters(updatedCharacters);

    if (id) {
      storage.saveProjectData(id, { characters: updatedCharacters });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleDeleteCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCharacterToDelete(id);
  };

  const confirmDelete = () => {
    if (characterToDelete) {
      const updatedChars = characters.filter((c) => c.id !== characterToDelete);
      setCharacters(updatedChars);
      setNodes((prev) => prev.filter((n) => n.id !== characterToDelete));
      if (id) {
        storage.saveProjectData(id, { characters: updatedChars });
      }
      setCharacterToDelete(null);
    }
  };

  const handleCopyText = (char: any, e: React.MouseEvent) => {
    e.stopPropagation();

    let traitsList = "None recorded";
    if (Array.isArray(char.traits) && char.traits.length > 0) {
      traitsList = char.traits.filter(Boolean).join(', ');
    } else if (typeof char.traits === 'string' && char.traits.trim()) {
      traitsList = char.traits.trim();
    }

    const backstoryText = char.backstory || char.description || char.shortBio || "No backstory recorded.";

    let textContent = `Name: ${char.name || 'Unknown'}
Role: ${char.role || 'Unknown'}
Age: ${char.age || 'Unknown'}
Status: ${char.status || 'Active'}
${char.mbti ? `MBTI: ${char.mbti}\n` : ''}${char.archetype ? `Archetype: ${char.archetype}\n` : ''}Traits: ${traitsList}

Backstory:
${backstoryText}`;

    const extras: string[] = [];
    if (char.goal) extras.push(`Goal: ${char.goal}`);
    if (char.conflict) extras.push(`Conflict: ${char.conflict}`);
    if (char.trauma) extras.push(`Trauma: ${char.trauma}`);
    if (extras.length > 0) {
      textContent += `\n\nPsychology & Drive:\n${extras.join('\n')}`;
    }

    textContent += '\n';

    navigator.clipboard.writeText(textContent).then(() => {
      setCopiedCharId(char.id);
      setTimeout(() => setCopiedCharId(null), 2000);
    }).catch(err => {
      console.error("Clipboard copy failed:", err);
    });
  };

  const handleCopyEditor = () => {
    // Flush any pending trait input
    const currentTraits = [...formData.traits];
    if (traitInput.trim()) {
      const split = traitInput.split(',').map(s => s.trim()).filter(Boolean);
      for (const t of split) {
        if (!currentTraits.includes(t)) currentTraits.push(t);
      }
    }

    const traitsList = currentTraits.length > 0 ? currentTraits.join(', ') : "None recorded";
    const backstoryText = formData.backstory || "No backstory recorded.";

    let textContent = `Name: ${formData.name || 'Unknown'}
Role: ${formData.role || 'Unknown'}
Age: ${formData.age || 'Unknown'}
Status: ${formData.status || 'Active'}
${formData.mbti ? `MBTI: ${formData.mbti}\n` : ''}${formData.archetype ? `Archetype: ${formData.archetype}\n` : ''}Traits: ${traitsList}

Backstory:
${backstoryText}`;

    const extras: string[] = [];
    if (formData.goal) extras.push(`Goal: ${formData.goal}`);
    if (formData.conflict) extras.push(`Conflict: ${formData.conflict}`);
    if (formData.trauma) extras.push(`Trauma: ${formData.trauma}`);
    if (extras.length > 0) {
      textContent += `\n\nPsychology & Drive:\n${extras.join('\n')}`;
    }

    textContent += '\n';

    navigator.clipboard.writeText(textContent).then(() => {
      setCopiedEditor(true);
      setTimeout(() => setCopiedEditor(false), 2000);
    }).catch(err => {
      console.error("Clipboard copy failed:", err);
    });
  };

  const handleDuplicateCharacter = (char: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = {
      ...char,
      id: Date.now().toString(),
      name: char.name + " (Copy)",
    };
    setCharacters((prev) => [...prev, duplicated]);
    setNodes((prev) => [...prev, { id: duplicated.id, x: 200, y: 200 }]);
  };

  const [graphs, setGraphs] = useState(() => {
    const initialChars = (() => {
      if (id) {
        const data = storage.getProjectData(id);
        if (data?.characters && data.characters.length > 0) return data.characters;
      }
      return CATALOG_CHARACTERS;
    })();
    return buildDefaultProjectGraph(id, initialChars);
  });
  const [activeGraphId, setActiveGraphId] = useState("1");
  const [showNewGraphModal, setShowNewGraphModal] = useState(false);
  const [newGraphName, setNewGraphName] = useState("");

  // Persist graphs to storage whenever graphs changes
  useEffect(() => {
    if (id && graphs.length > 0) {
      storage.saveProjectData(id, { characterGraphs: graphs });
    }
  }, [id, graphs]);

  useEffect(() => {
    if (id && characters) {
      storage.saveProjectData(id, { characters });
    }
  }, [id, characters]);

  const activeGraph = graphs.find(g => g.id === activeGraphId) || graphs[0] || { id: "1", name: "Main Plot", nodes: [], edges: [] };

  const nodes = activeGraph.nodes || [];
  const setNodes = (action: any) => {
    setGraphs(prev => prev.map(g => {
      if (g.id === activeGraphId) {
        const nextNodes = typeof action === 'function' ? action(g.nodes || []) : action;
        return { ...g, nodes: nextNodes };
      }
      return g;
    }));
  };

  const edges = activeGraph.edges || [];
  const setEdges = (action: any) => {
    setGraphs(prev => prev.map(g => {
      if (g.id === activeGraphId) {
        const nextEdges = typeof action === 'function' ? action(g.edges || []) : action;
        return { ...g, edges: nextEdges };
      }
      return g;
    }));
  };
  
  // Drawing Edges State
  const [drawingEdge, setDrawingEdge] = useState<{ source: string, currentX: number, currentY: number } | null>(null);
  const [pendingEdge, setPendingEdge] = useState<{ source: string, target: string, edgeId?: string } | null>(null);

  // Drag, Pan & Zoom State
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panHasDragged, setPanHasDragged] = useState(false);
  
  // Selection State
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    startX: number;
    startY: number;
    hasDragged: boolean;
  } | null>(null);

  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch(e) {}
    setDraggingNode({ id, startX: e.clientX, startY: e.clientY, hasDragged: false });
  };

  const handleNodePointerMove = (e: React.PointerEvent) => {
    if (!draggingNode) return;
    e.stopPropagation();
    
    const dxReal = e.clientX - draggingNode.startX;
    const dyReal = e.clientY - draggingNode.startY;
    
    if (!draggingNode.hasDragged && (Math.abs(dxReal) > 3 || Math.abs(dyReal) > 3)) {
      setDraggingNode(prev => prev ? { ...prev, hasDragged: true } : null);
    }
    
    if (draggingNode.hasDragged) {
      const dx = (e.clientX - draggingNode.startX) / scale;
      const dy = (e.clientY - draggingNode.startY) / scale;
      setNodes((ns) =>
        ns.map((n) =>
          n.id === draggingNode.id ? { ...n, x: n.x + dx, y: n.y + dy } : n,
        ),
      );
      setDraggingNode({
        id: draggingNode.id,
        startX: e.clientX,
        startY: e.clientY,
        hasDragged: true
      });
    }
  };

  const handleStartDrawEdge = (e: React.PointerEvent, sourceId: string) => {
    e.stopPropagation();
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch(e) {}
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      setDrawingEdge({ source: sourceId, currentX: x, currentY: y });
    }
  };

  const handleDrawEdgeMove = (e: React.PointerEvent) => {
    if (!drawingEdge || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;
    setDrawingEdge({ ...drawingEdge, currentX: x, currentY: y });
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch(e) {}
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setPanHasDragged(false);
    setSelectedCharId(null);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (drawingEdge) {
      handleDrawEdgeMove(e);
      return;
    }
    if (!isPanning) return;
    
    const dxReal = e.clientX - panStart.x;
    const dyReal = e.clientY - panStart.y;
    if (!panHasDragged && (Math.abs(dxReal) > 3 || Math.abs(dyReal) > 3)) {
      setPanHasDragged(true);
    }

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (drawingEdge) {
      try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch(e) {}
      
      const dropX = drawingEdge.currentX;
      const dropY = drawingEdge.currentY;
      
      const targetNode = nodes.find(n => {
        if (n.id === drawingEdge.source) return false;
        // The center of the polaroid is roughly node.x, node.y + 40
        const dist = Math.sqrt(Math.pow(n.x - dropX, 2) + Math.pow((n.y + 40) - dropY, 2));
        return dist < 80;
      });

      if (targetNode) {
        setPendingEdge({ source: drawingEdge.source, target: targetNode.id });
      }
      setDrawingEdge(null);
    }
    
    if (draggingNode) {
      try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch(e) {}
      if (!draggingNode.hasDragged) {
         setSelectedCharId(draggingNode.id === selectedCharId ? null : draggingNode.id);
      }
      setDraggingNode(null);
    }
    if (isPanning) {
      try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch(e) {}
      setIsPanning(false);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.3, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.3, 0.2));

  const filteredAndSortedCharacters = React.useMemo(() => {
    let result = [...characters];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.role && c.role.toLowerCase().includes(q)) || 
        (c.aliases && c.aliases.some((a: string) => a.toLowerCase().includes(q))) ||
        (c.traits && c.traits.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Filter by role
    if (filterRole !== "ALL") {
      result = result.filter(c => c.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== "ALL") {
      result = result.filter(c => c.status === filterStatus);
    }

    // Sort
    if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "recent") {
      // Assuming ID is timestamp-based or just roughly sort by string
      result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    return result;
  }, [characters, searchQuery, filterRole, filterStatus, sortBy]);

  if (viewMode === "editor") {
    return (
      <div className="flex-1 flex flex-col w-full h-full bg-[#fcfaf5] overflow-y-auto selection:bg-[#c17a7a]/20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-track]:bg-transparent relative">
        {/* Success Toast */}
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 bg-[#fcfaf5] text-[#8a5b46] px-6 py-3 rounded-md shadow-lg border border-[#e5e0d5] font-bold text-[10px] tracking-widest uppercase transition-all duration-300 z-50 ${saveSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          Character Saved Successfully
        </div>
        
        {/* Top Nav */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-[#fcfaf5]/90 backdrop-blur-sm border-b border-[#e5e0d5]/50">
          <div className="flex items-center gap-4 text-[#8a5b46]"></div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopyEditor}
              title="Copy Info (For ChatGPT)"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-[#8a5b46] hover:bg-[#e5e0d5]/40 hover:text-[#b8785e] transition-colors border border-[#e5e0d5]/50 shadow-sm bg-[#fcfaf5]"
            >
              {copiedEditor ? <Check className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 stroke-[1.5]" />}
            </button>
            <button
              onClick={handleSaveEditor}
              disabled={!formData.name.trim()}
              className={`px-6 py-1.5 text-white text-[11px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${
                !formData.name.trim() 
                ? "bg-stone-300 cursor-not-allowed opacity-50" 
                : "bg-[#b8785e] hover:bg-[#a66850] hover:shadow-lg"
              }`}
            >
              Save
            </button>
            <div className="w-px h-6 bg-[#e5e0d5] mx-1" />
            <button
              onClick={() => setViewMode(previousViewMode)}
              className="w-8 h-8 flex items-center justify-center rounded-sm text-stone-400 hover:text-[#b8785e] transition-colors"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto px-8 lg:px-16 pt-12 pb-32 gap-16 lg:gap-24">
          
          {/* Left Column (Forms) */}
          <div className="flex-1 max-w-[800px] space-y-16">
            
            {/* Identity Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-2 text-[#a66850] opacity-80 mb-2">
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase">Identity</h3>
                <div className="w-4 h-4 border border-current rounded-full flex items-center justify-center text-[10px] cursor-help">?</div>
              </div>
              
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="New Character"
                className="w-full text-5xl lg:text-7xl font-serif font-bold text-stone-300 focus:text-[#8a5b46] placeholder-stone-200 bg-transparent outline-none transition-colors"
              />

              <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase block">Age</label>
                  <input 
                    type="text" 
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g. 25" 
                    className="w-full bg-transparent border-b border-stone-200 border-dotted pb-2 text-xs font-bold text-stone-600 uppercase tracking-widest outline-none focus:border-[#8a5b46] transition-colors"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase block">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-transparent border-b border-stone-200 border-dotted pb-2 text-xs font-bold text-[#a66850] uppercase tracking-widest outline-none focus:border-[#8a5b46] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select Status</option>
                    <option value="ALIVE">Alive</option>
                    <option value="DECEASED">Deceased</option>
                    <option value="UNKNOWN">Unknown</option>
                    <option value="IN PROGRESS">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase block">Group</label>
                  <select 
                    value={formData.group}
                    onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full bg-transparent border-b border-stone-200 border-dotted pb-2 text-xs font-bold text-stone-400 uppercase tracking-widest outline-none focus:border-[#8a5b46] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="divinities">Divinities</option>
                  </select>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase block">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-transparent border-b border-stone-200 border-dotted pb-2 text-xs font-bold text-[#a66850] uppercase tracking-widest outline-none focus:border-[#8a5b46] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="PROTAGONIST">Protagonist</option>
                    <option value="ANTAGONIST">Antagonist</option>
                    <option value="SUPPORTING">Supporting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col gap-2 border-b border-stone-200 border-dotted pb-2">
                  <div className="flex items-baseline gap-4">
                    <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase shrink-0">Aliases:</label>
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && aliasInput.trim()) {
                          e.preventDefault();
                          if (!formData.aliases.includes(aliasInput.trim())) {
                            setFormData(prev => ({ ...prev, aliases: [...prev.aliases, aliasInput.trim()] }));
                          }
                          setAliasInput("");
                        }
                      }}
                      placeholder="+ ADD NOTE (Press Enter)..."
                      className="flex-1 bg-transparent text-xs font-serif italic text-stone-300 placeholder-stone-200 outline-none focus:text-stone-600"
                    />
                  </div>
                  {formData.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-16">
                      {formData.aliases.map((alias, idx) => (
                        <span key={idx} className="bg-stone-200 text-stone-600 text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1 group">
                          {alias}
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, aliases: prev.aliases.filter((_, i) => i !== idx) }))}
                            className="hover:text-red-500 opacity-50 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Backstory Section */}
            <section id="backstory" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#a66850] tracking-[0.2em] uppercase">Backstory</h3>
                <span className="text-[10px] text-stone-400 font-serif italic">Included in AI Prompts & Clipboard</span>
              </div>
              <textarea
                value={formData.backstory}
                onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
                placeholder="Write the character's backstory, origins, life history, and formative experiences..."
                className="w-full h-44 bg-transparent text-sm font-serif leading-relaxed text-[#332218] placeholder-stone-300 outline-none resize-none border-b border-stone-300 border-dotted focus:border-[#8a5b46] transition-colors"
              />
            </section>

            {/* MBTI & Traits Section */}
            <section id="mbti-traits" className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-[#a66850] tracking-[0.2em] uppercase">MBTI & Traits</h3>
              <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
                <div className="flex-1 space-y-2 border-b border-stone-200 border-dotted pb-2">
                  <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase block">MBTI</label>
                  <input 
                    type="text" 
                    value={formData.mbti}
                    onChange={(e) => setFormData(prev => ({ ...prev, mbti: e.target.value }))}
                    placeholder="e.g. INTJ"
                    className="w-full bg-transparent text-sm font-serif text-[#332218] placeholder-stone-300 outline-none focus:text-stone-800" 
                  />
                </div>
                <div className="flex-1 space-y-2 border-b border-stone-200 border-dotted pb-2 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase block">Traits</label>
                    <span className="text-[9px] text-stone-400 italic">Press Enter or comma to add</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      id="trait-input"
                      type="text" 
                      value={traitInput}
                      onChange={(e) => setTraitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ',') && traitInput.trim()) {
                          e.preventDefault();
                          const newTraits = traitInput.split(',').map(s => s.trim()).filter(Boolean);
                          setFormData(prev => {
                            const updated = [...prev.traits];
                            for (const nt of newTraits) {
                              if (!updated.includes(nt)) updated.push(nt);
                            }
                            return { ...prev, traits: updated };
                          });
                          setTraitInput("");
                        }
                      }}
                      onBlur={() => {
                        if (traitInput.trim()) {
                          const newTraits = traitInput.split(',').map(s => s.trim()).filter(Boolean);
                          setFormData(prev => {
                            const updated = [...prev.traits];
                            for (const nt of newTraits) {
                              if (!updated.includes(nt)) updated.push(nt);
                            }
                            return { ...prev, traits: updated };
                          });
                          setTraitInput("");
                        }
                      }}
                      placeholder="+ Add trait (e.g. Brave, Loyal)..." 
                      className="flex-1 bg-transparent text-sm font-serif text-[#332218] placeholder-stone-300 outline-none focus:text-stone-800" 
                    />
                    {traitInput.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          const newTraits = traitInput.split(',').map(s => s.trim()).filter(Boolean);
                          setFormData(prev => {
                            const updated = [...prev.traits];
                            for (const nt of newTraits) {
                              if (!updated.includes(nt)) updated.push(nt);
                            }
                            return { ...prev, traits: updated };
                          });
                          setTraitInput("");
                        }}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#8c503c] text-white rounded-xs hover:bg-[#a66850] transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  {formData.traits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.traits.map((trait, idx) => (
                        <span key={idx} className="bg-[#ede8dc] text-[#5d3f32] border border-[#e5e0d5] text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1.5 group">
                          {trait}
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, traits: prev.traits.filter((_, i) => i !== idx) }))}
                            className="hover:text-red-600 opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-12">
            
            {/* Character Image */}
            <ImageDropzoneCard
              type="character"
              aspectRatio="portrait"
              imageUrl={formData.imageUrl}
              onImageChange={(newUrl) => setFormData(prev => ({ ...prev, imageUrl: newUrl }))}
              label="Character Portrait"
            />

            {/* Table of Contents */}
            <div className="space-y-4 hidden lg:block sticky top-24">
              <label className="text-[10px] font-bold text-[#a66850] tracking-[0.2em] uppercase block border-b border-stone-200 pb-2">Table of Contents</label>
              <ul className="space-y-3 pt-2">
                <li><a href="#backstory" onClick={(e) => { e.preventDefault(); document.getElementById('backstory')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] font-serif italic text-stone-400 hover:text-[#a66850] uppercase tracking-widest transition-colors">— Backstory</a></li>
                <li><a href="#mbti-traits" onClick={(e) => { e.preventDefault(); document.getElementById('mbti-traits')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] font-serif italic text-stone-400 hover:text-[#a66850] uppercase tracking-widest transition-colors">— MBTI & Traits</a></li>
                <li><a href="#physical-appearance" onClick={(e) => { e.preventDefault(); document.getElementById('physical-appearance')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] font-serif italic text-stone-400 hover:text-[#a66850] uppercase tracking-widest transition-colors">— Physical Appearance</a></li>
              </ul>
            </div>

            {/* Relationships */}
            <div className="space-y-4 hidden lg:block">
              <label className="text-[10px] font-bold text-[#a66850] tracking-[0.2em] uppercase block border-b border-stone-200 pb-2">Relationships</label>
              <div className="pt-2 space-y-2">
                {edges.filter(e => e.source === editingCharId || e.target === editingCharId).map(edge => {
                  const relatedId = edge.source === editingCharId ? edge.target : edge.source;
                  const relatedChar = characters.find(c => c.id === relatedId);
                  if (!relatedChar) return null;
                  return (
                    <div key={edge.id} className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-sm hover:border-[#d49a89] transition-colors group">
                      <div className="flex items-center gap-3">
                        <img src={relatedChar.imageUrl} alt={relatedChar.name} className="w-8 h-8 rounded-sm object-cover border border-[#e5e0d5]" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#4a3225] uppercase tracking-wider">{relatedChar.name}</span>
                          <span className="text-[9px] font-bold text-[#a66850] uppercase tracking-widest">{edge.label || "Connected"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {edges.filter(e => e.source === editingCharId || e.target === editingCharId).length === 0 && (
                  <p className="text-[10px] font-serif italic text-stone-500 mb-2">No relationships recorded.</p>
                )}
                <button 
                  onClick={() => setViewMode("connections")}
                  className="w-full py-2.5 bg-[#fcfaf5] border border-stone-200 text-stone-400 text-[9px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-[#a66850] hover:border-[#a66850] transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <Plus className="w-3 h-3" /> Go to Board to link
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative bg-[#3d261d]">
      {/* Immersive Vintage Wallpaper Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236e4b3b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#8c503c] rounded-full mix-blend-color-dodge blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[#d49a89] rounded-full mix-blend-overlay blur-[120px] opacity-10" />
      </div>

      <div className="flex-1 relative z-10 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-hidden">
        {/* Top Header */}
        <div className={`flex flex-col shrink-0 ${viewMode === "registry" ? "p-6 lg:p-10 pb-6 max-w-[1600px] mx-auto w-full" : "p-4 border-b border-[#5d3f32] bg-[#2a1a14]/80 backdrop-blur-md"}`}>
          {viewMode === "registry" && (
            <h1 className="text-4xl lg:text-5xl font-serif text-[#fcfaf5] tracking-wide mb-6 uppercase drop-shadow-md">
              Character Sheets
            </h1>
          )}

          {/* Toolbar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {viewMode === "registry" ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center bg-[#2a1a14]/60 rounded-sm px-4 py-2 border border-[#5d3f32] w-64 backdrop-blur-sm shadow-inner">
                  <Search className="w-4 h-4 text-[#d49a89]/60 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH..."
                    className="bg-transparent border-none outline-none text-xs text-[#fcfaf5] placeholder:text-[#d49a89]/40 font-medium tracking-wider w-full uppercase"
                  />
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`w-9 h-9 flex items-center justify-center rounded-sm transition-all border backdrop-blur-sm shadow-sm ${filterRole !== 'ALL' || filterStatus !== 'ALL' ? 'bg-[#b8785e] text-[#fcfaf5] border-[#b8785e]' : 'bg-[#2a1a14]/60 hover:bg-[#3d261d] text-[#d49a89] border-[#5d3f32]'}`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  {showFilterMenu && (
                    <div className="absolute top-full mt-2 w-48 bg-white rounded-sm shadow-xl border border-stone-200 z-50 py-2">
                      <div className="px-3 pb-2 mb-2 border-b border-stone-100">
                        <label className="text-[9px] font-bold text-stone-400 tracking-widest uppercase block mb-1">Role</label>
                        <select 
                          value={filterRole} 
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="w-full text-xs text-stone-600 bg-transparent outline-none cursor-pointer"
                        >
                          <option value="ALL">All Roles</option>
                          <option value="PROTAGONIST">Protagonist</option>
                          <option value="ANTAGONIST">Antagonist</option>
                          <option value="SUPPORTING">Supporting</option>
                        </select>
                      </div>
                      <div className="px-3">
                        <label className="text-[9px] font-bold text-stone-400 tracking-widest uppercase block mb-1">Status</label>
                        <select 
                          value={filterStatus} 
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full text-xs text-stone-600 bg-transparent outline-none cursor-pointer"
                        >
                          <option value="ALL">All Status</option>
                          <option value="ALIVE">Alive</option>
                          <option value="DECEASED">Deceased</option>
                          <option value="UNKNOWN">Unknown</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors border backdrop-blur-sm ${sortBy !== 'name_asc' ? 'bg-[#b8785e] text-white border-[#b8785e]' : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/5'}`}
                  >
                    <ArrowDownUp className="w-4 h-4" />
                  </button>
                  {showSortMenu && (
                    <div className="absolute top-full mt-2 w-32 bg-white rounded-sm shadow-xl border border-stone-200 z-50 py-1">
                      <button onClick={() => { setSortBy('name_asc'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${sortBy === 'name_asc' ? 'text-[#b8785e] bg-stone-50' : 'text-stone-500 hover:text-[#b8785e] hover:bg-stone-50'}`}>A to Z</button>
                      <button onClick={() => { setSortBy('name_desc'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${sortBy === 'name_desc' ? 'text-[#b8785e] bg-stone-50' : 'text-stone-500 hover:text-[#b8785e] hover:bg-stone-50'}`}>Z to A</button>
                      <button onClick={() => { setSortBy('recent'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${sortBy === 'recent' ? 'text-[#b8785e] bg-stone-50' : 'text-stone-500 hover:text-[#b8785e] hover:bg-stone-50'}`}>Newest</button>
                    </div>
                  )}
                </div>

                <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/5 backdrop-blur-sm ml-4">
                  <button onClick={() => setRegistryView("grid")} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${registryView === "grid" ? "bg-[#b8785e] text-white shadow-sm" : "text-white/50 hover:text-white/80"}`} title="Grid View">
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setRegistryView("gallery")} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${registryView === "gallery" ? "bg-[#b8785e] text-white shadow-sm" : "text-white/50 hover:text-white/80"}`} title="Gallery View">
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setRegistryView("folder")} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${registryView === "folder" ? "bg-[#b8785e] text-white shadow-sm" : "text-white/50 hover:text-white/80"}`} title="Folder View">
                    <Folder className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowPortraitGalleryModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5d3f32]/40 hover:bg-[#5d3f32]/70 text-[#d49a89] hover:text-[#fcfaf5] border border-[#8c503c]/50 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all shadow-sm ml-2"
                  title="Browse Character Portrait Library (25 presets)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d49a89]" />
                  <span className="hidden sm:inline">Portrait Library</span>
                  <span className="bg-[#b8785e] text-white text-[9px] px-1.5 py-0.2 rounded-full font-sans font-semibold">25</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {graphs.map(g => (
                  <button 
                    key={g.id}
                    onClick={() => setActiveGraphId(g.id)}
                    className={`px-4 py-1.5 text-[10px] font-bold rounded-sm flex items-center gap-2 uppercase tracking-widest transition-all ${activeGraphId === g.id ? 'bg-[#c17a7a] text-white shadow-sm' : 'text-white/60 hover:text-white/90'}`}
                  >
                    {activeGraphId === g.id ? <Home className="w-3.5 h-3.5" /> : null}
                    {g.name}
                  </button>
                ))}
                
                <button 
                  onClick={() => setShowNewGraphModal(true)}
                  className="px-4 py-1.5 text-white/40 hover:text-white/80 text-[10px] font-bold rounded-sm flex items-center gap-1.5 uppercase tracking-widest transition-colors ml-4"
                >
                  <Plus className="w-3.5 h-3.5" /> NEW GRAPH
                </button>
              </div>
            )}

            <div className="flex bg-black/20 rounded-full p-1 border border-white/5 backdrop-blur-sm w-fit">
              <button
                onClick={() => setViewMode("registry")}
                className={`px-6 py-1.5 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all shadow-sm ${viewMode === "registry" ? "bg-[#b8785e] text-white" : "text-white/50 hover:text-white/80"}`}
              >
                Registry
              </button>
              <button
                onClick={() => setViewMode("connections")}
                className={`px-6 py-1.5 text-[10px] font-bold tracking-widest rounded-full uppercase transition-all shadow-sm ${viewMode === "connections" ? "bg-[#b8785e] text-white" : "text-white/50 hover:text-white/80"}`}
              >
                Connections
              </button>
            </div>
          </div>
        </div>

        {viewMode === "registry" ? (
          <div className="p-6 lg:p-10 pt-4 max-w-[1600px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* New Character Card */}
            <div 
              onClick={handleOpenEditorNew}
              className="relative group cursor-pointer h-[420px] rounded-sm bg-[#5d3f32]/20 backdrop-blur-sm border-2 border-dashed border-[#8c503c]/40 transition-all flex flex-col items-center justify-center hover:bg-[#5d3f32]/40 hover:border-[#8c503c]/70 hover:-translate-y-1 mt-4"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d49a89]/40 flex items-center justify-center mb-4 text-[#d49a89]/60 group-hover:text-[#d49a89] group-hover:border-[#d49a89]/60 transition-all duration-300">
                <Plus className="w-6 h-6 stroke-[1.5]" />
              </div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-[#d49a89]/60 group-hover:text-[#d49a89] transition-colors">
                New Character
              </span>
            </div>

            {/* Folder View vs Grid/List View */}
            {registryView === "folder" ? (
              // Group by folders
              Object.entries(
                filteredAndSortedCharacters.reduce((acc, char) => {
                  const group = char.group || "none";
                  if (!acc[group]) acc[group] = [];
                  acc[group].push(char);
                  return acc;
                }, {} as Record<string, any[]>)
              ).map(([groupName, groupChars]: [string, any[]]) => (
                <div key={groupName} className="bg-[#fcfaf5] rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex flex-col relative h-[420px] cursor-pointer group mt-4 border border-[#e5e0d5]">
                  {/* Fake Folder Tab */}
                  <div
                    className={`absolute -top-4 left-0 w-[140px] h-5 ${groupName === 'none' ? 'bg-[#a39486]' : 'bg-[#b8785e]'}`}
                    style={{ clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)" }}
                  />
                  <div className="absolute -top-1 left-1 right-1 h-2 bg-[#f4efe6] rounded-t-sm z-0 shadow-inner" />
                      
                  <div className="flex-1 flex flex-col z-10 relative bg-[#fcfaf5] p-6 border border-[#e5e0d5] rounded-sm shadow-sm hover:shadow-[4px_8px_24px_rgba(0,0,0,0.3)] transition-shadow">
                    <h2 className="font-serif text-2xl font-bold text-[#4a3225] uppercase tracking-widest mb-4 border-b border-stone-200/50 pb-2">
                      {groupName === 'none' ? 'UNGROUPED' : groupName}
                    </h2>
                    <p className="text-[12px] font-serif italic text-[#5d3f32] leading-relaxed line-clamp-3">
                      {groupChars.length} characters assigned to this folder.
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-200/50">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-[#b8785e] tracking-widest uppercase">
                          {groupChars.length} File{groupChars.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex -space-x-2">
                          {groupChars.slice(0, 4).map((c, i) => (
                            <img
                              key={i}
                              src={c.imageUrl}
                              className="w-8 h-8 rounded-full border-[2px] border-[#fcfaf5] shadow-sm object-cover grayscale-[30%] sepia-[20%]"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#f4efe6] border border-[#e5e0d5] flex items-center justify-center text-[#8c503c] group-hover:bg-[#b8785e] group-hover:text-white transition-colors">
                        <Folder className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : registryView === "gallery" ? (
              // Gallery View
              filteredAndSortedCharacters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleOpenEditorEdit(char)}
                  className="group cursor-pointer relative bg-[#fcfaf5] p-3 pb-4 rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[4px_8px_24px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 mt-4 border border-[#e5e0d5] flex flex-col"
                >
                  {/* Pin Decoration */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#8c503c] shadow-md z-10 opacity-80" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d49a89] z-20" />

                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm border border-stone-200 shrink-0">
                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-full h-full object-cover grayscale-[30%] sepia-[20%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3d261d]/80 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                  </div>
                  
                  <div className="mt-3 flex-1 flex items-center justify-center min-h-[32px]">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#4a3225] uppercase tracking-widest truncate text-center w-full px-1">
                      {char.name}
                    </h3>
                  </div>
                </div>
              ))
            ) : (
              // Grid View
              filteredAndSortedCharacters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleOpenEditorEdit(char)}
                  className="bg-[#fcfaf5] mt-4 rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.2)] flex flex-col p-6 h-[420px] group border border-[#e5e0d5] hover:-translate-y-1 hover:shadow-[4px_8px_24px_rgba(0,0,0,0.3)] transition-all cursor-pointer relative"
                >
                  {/* Pin/Tape Decoration */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 backdrop-blur-sm shadow-sm rotate-2 z-10 opacity-70 group-hover:opacity-100 transition-opacity" style={{ clipPath: 'polygon(5% 0, 95% 5%, 100% 95%, 0 100%)' }} />

                  {/* Header (Portrait + Info) */}
                  <div className="flex gap-5 mb-5 relative z-0">
                    {/* Polaroid-style Portrait */}
                    <div 
                      className="w-[85px] shrink-0 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setQuickImageChar(char); }}
                      title="Click to change portrait (Upload / URL / Library)"
                    >
                      <div className="bg-white p-1.5 pb-4 shadow-sm rounded-sm border border-stone-200 rotate-[-3deg] group-hover:rotate-0 transition-transform origin-bottom-left relative">
                        <img
                          src={char.imageUrl}
                          alt={char.name}
                          className="w-full aspect-[3/4] object-cover grayscale-[30%] sepia-[20%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500"
                        />
                      </div>
                    </div>
                          
                    <div className="flex-1 min-w-0 flex flex-col pt-2 justify-center">
                      <h3 className="font-serif text-2xl font-bold text-[#4a3225] uppercase tracking-widest truncate drop-shadow-sm">
                        {char.name}
                      </h3>
                      <p className="text-[10px] font-bold text-[#b8785e] tracking-widest uppercase mt-1.5 mb-0.5">
                        {char.role}
                      </p>
                      <p className="text-[10px] font-serif italic text-stone-500 mb-2 uppercase">
                        Age: {char.age}
                      </p>
                    </div>
                  </div>

                  {/* Backstory */}
                  <div className="mb-4 mt-2 flex-1 relative z-0">
                    <p className="text-[9px] font-bold text-stone-400 tracking-widest uppercase mb-1.5">
                      Backstory:
                    </p>
                    <p className="font-serif text-[12px] leading-relaxed text-[#5d3f32] italic line-clamp-4">
                      {char.backstory || char.description || char.shortBio || "No backstory recorded."}
                    </p>
                  </div>

                  {/* Traits & Actions Footer */}
                  <div className="mt-auto flex flex-col relative z-0">
                    <div className="mb-4 border-t border-stone-200/50 pt-4">
                      <p className="text-[9px] font-bold text-stone-400 tracking-widest uppercase mb-2">
                        Traits:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(char.traits) && char.traits.length > 0 ? (
                          char.traits.map((trait: string, traitIdx: number) => (
                            <span
                              key={`char-trait-${char.id}-${trait}-${traitIdx}`}
                              className="px-2 py-1 text-[#8c503c] text-[8px] font-bold tracking-widest uppercase bg-[#f4efe6] rounded-sm border border-[#e5e0d5]"
                            >
                              {trait}
                            </span>
                          ))
                        ) : typeof char.traits === 'string' && char.traits.trim() ? (
                          <span className="px-2 py-1 text-[#8c503c] text-[8px] font-bold tracking-widest uppercase bg-[#f4efe6] rounded-sm border border-[#e5e0d5]">
                            {char.traits}
                          </span>
                        ) : (
                          <span className="text-[10px] italic text-stone-400 font-serif">No traits added</span>
                        )}
                      </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center justify-end gap-1 text-stone-400 shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => handleCopyText(char, e)} className="p-1.5 hover:text-[#b8785e] transition-colors" title="Copy Info (For ChatGPT)">
                        {copiedCharId === char.id ? <Check className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenEditorEdit(char); }} className="p-1.5 hover:text-[#b8785e] transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDuplicateCharacter(char, e)} className="p-1.5 hover:text-[#b8785e] transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDeleteCharacter(char.id, e)} className="p-1.5 hover:text-[#c17a7a] transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-black/20 overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar (CAST) */}
              <div className="w-72 border-r border-[#5d3f32] bg-[#2a1a14]/80 backdrop-blur-md flex flex-col z-20">
                <div className="p-4 text-[10px] font-bold text-[#b8785e] tracking-widest uppercase flex items-center gap-2 border-b border-[#5d3f32]">
                  <Users className="w-3.5 h-3.5" /> CAST
                </div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-3 space-y-2">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/char-id", char.id);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="flex items-center gap-3 p-2.5 bg-[#3d261d]/50 hover:bg-[#5d3f32]/60 rounded-sm cursor-grab border border-[#5d3f32]/50 transition-colors group shadow-inner"
                      title={char.name}
                    >
                      <img
                        src={char.imageUrl}
                        className="w-9 h-9 shrink-0 rounded-full object-cover border border-[#8c503c]/40 group-hover:border-[#d49a89] grayscale-[20%] sepia-[10%] group-hover:grayscale-0 group-hover:sepia-0 transition-all"
                      />
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="text-[11px] font-bold text-[#fcfaf5] uppercase line-clamp-2 leading-tight tracking-wider group-hover:text-white transition-colors">
                          {char.name}
                        </div>
                        <div className="text-[8.5px] font-bold text-[#d49a89]/70 uppercase truncate mt-0.5">
                          {char.role}
                        </div>
                      </div>
                      <button 
                        className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 text-[#d49a89]/50 hover:text-[#fcfaf5] transition-all"
                        onClick={() => {
                          const existingNode = nodes.find(n => n.id === char.id);
                          if (!existingNode) {
                            setNodes(prev => [...prev, { id: char.id, x: 200 - (pan.x / scale), y: 200 - (pan.y / scale) }]);
                          }
                        }}
                        title={nodes.find(n => n.id === char.id) ? "Already on board" : "Add to board"}
                      >
                        {nodes.find(n => n.id === char.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleOpenEditorNew}
                    className="w-full mt-2 py-3 border border-dashed border-[#8c503c]/30 rounded-sm text-[#d49a89]/60 text-[10px] font-bold uppercase tracking-widest hover:bg-[#5d3f32]/40 hover:border-[#8c503c]/60 hover:text-[#fcfaf5] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Add Character
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div
                ref={canvasRef}
                className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#3d261d]"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const charId = e.dataTransfer.getData("application/char-id");
                  if (charId && !nodes.find(n => n.id === charId) && canvasRef.current) {
                    const rect = canvasRef.current.getBoundingClientRect();
                    const dropX = (e.clientX - rect.left - pan.x) / scale;
                    const dropY = (e.clientY - rect.top - pan.y) / scale;
                    setNodes(prev => [...prev, { id: charId, x: dropX, y: dropY }]);
                  }
                }}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={(e) => {
                  if (drawingEdge) handleCanvasPointerMove(e);
                  else if (isPanning) handleCanvasPointerMove(e);
                  else if (draggingNode) handleNodePointerMove(e);
                }}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={(e) => {
                  if (e.deltaY < 0) handleZoomIn();
                  else handleZoomOut();
                }}
              >
                {/* Immersive Vintage Wallpaper Background */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236e4b3b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#8c503c] rounded-full mix-blend-color-dodge blur-[150px] opacity-20" />
                  <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[#d49a89] rounded-full mix-blend-overlay blur-[120px] opacity-10" />
                </div>
                
                <div
                  className="absolute inset-0 w-full h-full origin-top-left"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  }}
                >
                  {/* SVG Edges */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    {edges.map((edge) => {
                      const sourceNode = nodes.find(
                        (n) => n.id === edge.source,
                      );
                      const targetNode = nodes.find(
                        (n) => n.id === edge.target,
                      );
                      if (!sourceNode || !targetNode) return null;

                      // Safeguard: Ensure both source and target characters exist in the current project
                      const sourceChar = characters.find((c) => c.id === edge.source);
                      const targetChar = characters.find((c) => c.id === edge.target);
                      if (!sourceChar || !targetChar) return null;

                      // Coordinates now map exactly to the avatar's center point
                      const sx = sourceNode.x;
                      const sy = sourceNode.y + 20;
                      const tx = targetNode.x;
                      const ty = targetNode.y + 20;
                      
                      const dist = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
                      const sag = dist * 0.15; // Gravity sag
                      const cx = (sx + tx) / 2;
                      const cy = (sy + ty) / 2 + sag;
                      
                      const mx = (sx + tx) / 2;
                      const my = (sy + ty) / 2 + (sag * 0.5);

                      const EdgeIcon = getEdgeIconComponent(edge);

                      return (
                        <g key={edge.id}>
                          <path
                            d={`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`}
                            stroke={edge.color}
                            strokeWidth="2.5"
                            opacity="0.9"
                            fill="none"
                            strokeDasharray="4 2"
                            strokeLinecap="round"
                            className="drop-shadow-sm"
                          />

                          {/* Badge for relation (Paper Label style) */}
                          <g
                            transform={`translate(${mx}, ${my})`}
                            className="pointer-events-auto cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingEdge({ source: edge.source, target: edge.target, edgeId: edge.id });
                            }}
                          >
                            {/* Tape decoration */}
                            <rect x="-15" y="-14" width="30" height="6" fill="white" opacity="0.4" transform="rotate(-5)" />
                            
                            <rect
                              x="-35"
                              y="-10"
                              width="70"
                              height="20"
                              fill="#f4efe6"
                              stroke="#e5e0d5"
                              strokeWidth="1"
                              rx="1"
                              className="shadow-sm group-hover:stroke-[#d49a89] transition-colors"
                            />
                            <foreignObject
                              x="-32"
                              y="-7"
                              width="14"
                              height="14"
                            >
                              <div className="w-full h-full flex items-center justify-center">
                                <EdgeIcon
                                  className="w-3 h-3"
                                  style={{ color: edge.color }}
                                />
                              </div>
                            </foreignObject>
                            <text
                              x="-14"
                              y="3"
                              fontSize="8"
                              fontWeight="800"
                              fill="#4a3225"
                              alignmentBaseline="middle"
                              letterSpacing="0.5"
                            >
                              {edge.label}
                            </text>
                            
                            {/* Hover Scissors Icon */}
                            <foreignObject x="35" y="-12" width="20" height="20" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="w-5 h-5 bg-white border border-rose-200 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:scale-110 shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEdges(prev => prev.filter(eItem => eItem.id !== edge.id));
                                }}
                              >
                                <Scissors className="w-2.5 h-2.5" />
                              </button>
                            </foreignObject>
                          </g>
                        </g>
                      );
                    })}
                    
                    {/* Drawing Edge */}
                    {drawingEdge && (() => {
                      const sourceNode = nodes.find((n) => n.id === drawingEdge.source);
                      if (!sourceNode) return null;
                      const sx = sourceNode.x;
                      const sy = sourceNode.y + 20;
                      const tx = drawingEdge.currentX;
                      const ty = drawingEdge.currentY;
                      
                      const dist = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
                      const sag = dist * 0.15;
                      const cx = (sx + tx) / 2;
                      const cy = (sy + ty) / 2 + sag;
                      
                      return (
                        <path
                          d={`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`}
                          stroke="#ef4444"
                          strokeWidth="3"
                          opacity="0.8"
                          fill="none"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                          className="drop-shadow-sm animate-pulse"
                        />
                      );
                    })()}
                  </svg>

                  {/* HTML Nodes */}
                  {nodes.map((node) => {
                    const char = characters.find((c) => c.id === node.id);
                    if (!char) return null;
                    
                    // Generate a stable random rotation based on ID string
                    const charCodeSum = node.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                    const rotation = (charCodeSum % 7) - 3; // -3 to +3 degrees

                    return (
                      <div
                        key={node.id}
                        className="absolute flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing hover:z-20 group"
                        style={{
                          left: node.x,
                          top: node.y,
                          transform: `translate(-50%, -44px) rotate(${rotation}deg)`,
                          touchAction: "none",
                        }}
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        onPointerMove={handleNodePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                      >
                        {/* Hover Full Name Tooltip */}
                        <div className="absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-40 transform translate-y-1 group-hover:translate-y-0 shadow-lg">
                          <div className="bg-[#241610] text-[#fcfaf5] text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-xs border border-[#8c503c]/70 whitespace-nowrap flex items-center gap-1.5 shadow-md">
                            <span>{char.name}</span>
                            {char.role && (
                              <span className="text-[9px] text-[#d49a89] font-normal tracking-normal capitalize">
                                • {char.role}
                              </span>
                            )}
                          </div>
                          <div className="w-1.5 h-1.5 bg-[#241610] border-r border-b border-[#8c503c]/70 rotate-45 mx-auto -mt-1" />
                        </div>

                        <div 
                          className="w-[114px] h-[142px] shrink-0 bg-[#fcfaf5] p-1.5 pb-8 rounded-sm border border-[#e5e0d5] shadow-[2px_4px_14px_rgba(0,0,0,0.35)] hover:shadow-[3px_6px_18px_rgba(0,0,0,0.45)] transition-shadow relative"
                          title={char.name}
                        >
                          {/* Pin */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#8c503c] shadow-sm z-10 opacity-95" />
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d49a89] z-20" />
                          
                          <img
                            src={char.imageUrl}
                            className="w-full h-full object-cover border border-stone-200 grayscale-[15%] sepia-[10%] pointer-events-none rounded-[1px]"
                          />
                          <div className="absolute bottom-1 left-1 right-1 h-7 flex items-center justify-center pointer-events-none text-center px-0.5">
                            <span className="text-[9.5px] font-bold text-[#4a3225] uppercase tracking-wider line-clamp-2 leading-[1.15] break-words">
                              {char.name}
                            </span>
                          </div>
                          
                          {/* Link Anchor (shows on hover) */}
                          <div 
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#fcfaf5] border border-[#d49a89] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair hover:bg-[#8c503c] hover:text-white shadow-sm z-30"
                            onPointerDown={(e) => handleStartDrawEdge(e, node.id)}
                            title="Connect relationship wire"
                          >
                            <Link2 className="w-3 h-3" />
                          </div>

                          {/* Dossier Popup Card */}
                          {selectedCharId === node.id && (
                            <div 
                              className="absolute left-[110%] top-[-20%] w-72 bg-[#fcfaf5] rounded-sm shadow-[8px_16px_32px_rgba(0,0,0,0.4)] border border-[#e5e0d5] p-5 cursor-auto z-50 animate-in fade-in zoom-in-95 duration-200 text-left"
                              style={{ 
                                touchAction: 'auto',
                                transform: `rotate(${-rotation}deg)` // Counteract the polaroid rotation to make card straight
                              }}
                              onPointerDown={e => e.stopPropagation()} // prevent drag
                            >
                              {/* Tape decoration */}
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/60 rotate-2 opacity-70 shadow-sm border border-[#e5e0d5]/50" />
                              
                              <div className="flex gap-4 mb-4">
                                <div className="w-[70px] h-[90px] shrink-0 bg-white p-1 pb-3 rounded-sm border border-[#e5e0d5] shadow-sm relative rotate-[-2deg]">
                                  <img src={char.imageUrl} className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <h3 className="font-serif text-xl font-bold text-[#4a3225] truncate">
                                    {char.name}
                                  </h3>
                                  <div className="text-[10px] font-bold text-[#8c503c] uppercase tracking-widest mt-1 truncate">
                                    {char.role}
                                  </div>
                                  <div className="text-[10px] font-medium text-stone-500 uppercase mt-0.5">
                                    AGE: {char.age || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Backstory:</h4>
                                <p className="font-serif italic text-sm text-[#4a3225] line-clamp-4 leading-relaxed">
                                  {char.backstory || char.description || char.shortBio || "No backstory recorded in the archives."}
                                </p>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Traits:</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {Array.isArray(char.traits) && char.traits.length > 0 ? (
                                    char.traits.map((trait: string, tIdx: number) => (
                                      <span key={`char-modal-trait-${char.id}-${trait}-${tIdx}`} className="px-2 py-0.5 bg-[#f4efe6] border border-[#e5e0d5] text-[#8c503c] text-[9px] font-bold uppercase tracking-widest rounded-sm">
                                        {trait}
                                      </span>
                                    ))
                                  ) : typeof char.traits === 'string' && char.traits.trim() ? (
                                    <span className="px-2 py-0.5 bg-[#f4efe6] border border-[#e5e0d5] text-[#8c503c] text-[9px] font-bold uppercase tracking-widest rounded-sm">
                                      {char.traits}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] italic text-stone-400 font-serif">None specified</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Relationships:</h4>
                                <div className="space-y-1.5">
                                  {edges.filter(e => e.source === char.id || e.target === char.id).map(edge => {
                                    const relatedId = edge.source === char.id ? edge.target : edge.source;
                                    const relatedChar = characters.find(c => c.id === relatedId);
                                    if (!relatedChar) return null;
                                    return (
                                      <div key={edge.id} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8c503c]" />
                                        <span className="text-[10px] font-bold text-[#4a3225] uppercase tracking-wider">{relatedChar.name}</span>
                                        <span className="text-[9px] font-medium text-stone-500 uppercase italic">— {edge.label || "Connected"}</span>
                                      </div>
                                    );
                                  })}
                                  {edges.filter(e => e.source === char.id || e.target === char.id).length === 0 && (
                                    <p className="text-[10px] font-serif italic text-stone-500">No relationships recorded.</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e0d5] mt-2 text-stone-400">
                                <button 
                                  className="hover:text-[#8c503c] transition-colors" 
                                  title="Copy Info (For ChatGPT)"
                                  onClick={(e) => handleCopyText(char, e)}
                                >
                                  {copiedCharId === char.id ? <Check className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4" />}
                                </button>
                                <button 
                                  className="hover:text-[#8c503c] transition-colors" 
                                  title="Edit Profile"
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditorEdit(char); }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  className="hover:text-rose-600 transition-colors" 
                                  title="Delete"
                                  onClick={(e) => { e.stopPropagation(); setCharacterToDelete(char.id); }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 bg-[#fcfaf5] rounded-sm p-1.5 border border-[#e5e0d5] shadow-[2px_4px_12px_rgba(0,0,0,0.2)]">
                  <button
                    onClick={handleZoomIn}
                    className="w-7 h-7 flex items-center justify-center text-[#8c503c] hover:bg-[#b8785e] hover:text-white rounded-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="w-full h-px bg-stone-200" />
                  <button
                    onClick={handleZoomOut}
                    className="w-7 h-7 flex items-center justify-center text-[#8c503c] hover:bg-[#b8785e] hover:text-white rounded-sm transition-colors"
                  >
                    <div className="w-3 h-[2px] bg-current" />
                  </button>
                </div>

                {/* Relationship Select Modal */}
                {pendingEdge && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onPointerDown={e => e.stopPropagation()}>
                    <div className="bg-[#fcfaf5] p-6 rounded-sm border border-[#e5e0d5] shadow-[4px_8px_24px_rgba(0,0,0,0.4)] max-w-sm w-full mx-4">
                      <h3 className="font-serif text-lg font-bold text-[#4a3225] mb-4 uppercase tracking-widest text-center border-b border-[#e5e0d5] pb-3">
                        {pendingEdge.edgeId ? "Update Link" : "Establish Link"}
                      </h3>
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {RELATION_OPTIONS.map(opt => {
                          const OptIcon = opt.icon;
                          return (
                            <button
                              key={opt.label}
                              className="w-full flex items-center gap-3 p-3 rounded-sm border border-transparent hover:border-[#d49a89] transition-all bg-white shadow-sm hover:shadow-md"
                              onClick={() => {
                                if (pendingEdge.edgeId) {
                                  setEdges(prev => prev.map(e => e.id === pendingEdge.edgeId ? { ...e, label: opt.label, color: opt.color } : e));
                                } else {
                                  setEdges(prev => [...prev, {
                                    id: Date.now().toString(),
                                    source: pendingEdge.source,
                                    target: pendingEdge.target,
                                    label: opt.label,
                                    color: opt.color,
                                  }]);
                                }
                                setPendingEdge(null);
                              }}
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ backgroundColor: opt.color + '15', color: opt.color, borderColor: opt.color + '40' }}>
                                <OptIcon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-[#4a3225] tracking-widest text-sm">{opt.label}</span>
                            </button>
                          )
                        })}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-[#e5e0d5]">
                        <p className="text-[10px] font-bold text-[#8c503c] uppercase tracking-widest mb-2">Or type custom relation:</p>
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="e.g. MASTERMIND (Press Enter)" 
                          className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm font-bold text-[#4a3225] focus:outline-none focus:border-[#d49a89] uppercase placeholder:normal-case placeholder:font-normal placeholder:text-stone-400 shadow-inner"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const val = e.currentTarget.value.trim().toUpperCase();
                              if (pendingEdge.edgeId) {
                                setEdges(prev => prev.map(edge => edge.id === pendingEdge.edgeId ? { ...edge, label: val, color: "#8c503c" } : edge));
                              } else {
                                setEdges(prev => [...prev, {
                                  id: Date.now().toString(),
                                  source: pendingEdge.source,
                                  target: pendingEdge.target,
                                  label: val,
                                  color: "#8c503c",
                                }]);
                              }
                              setPendingEdge(null);
                            }
                          }}
                        />
                      </div>

                      <button 
                        className="mt-4 w-full py-3 text-sm font-bold text-[#8c503c] uppercase tracking-widest hover:bg-[#8c503c]/10 rounded-sm transition-colors border border-transparent hover:border-[#8c503c]/20"
                        onClick={() => setPendingEdge(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {characterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#fcfaf5] border border-[#e5e0d5] rounded-sm shadow-2xl p-6 max-w-sm w-full relative">
            <h2 className="text-xl font-serif font-bold text-[#4a3225] mb-2 uppercase tracking-wide">Confirm Deletion</h2>
            <p className="text-sm text-stone-600 mb-6">
              Are you sure you want to delete this character? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCharacterToDelete(null)}
                className="px-4 py-2 text-xs font-bold tracking-widest uppercase text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold tracking-widest uppercase bg-[#c17a7a] text-white rounded-sm shadow-sm hover:bg-[#a66850] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Graph Modal */}
      {showNewGraphModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#fcfaf5] border border-[#e5e0d5] rounded-sm shadow-2xl p-6 max-w-sm w-full relative">
            <h2 className="text-xl font-serif font-bold text-[#4a3225] mb-2 uppercase tracking-wide">New Graph</h2>
            <p className="text-sm text-stone-600 mb-4">
              Enter a name for the new graph.
            </p>
            <input 
              type="text" 
              value={newGraphName}
              onChange={(e) => setNewGraphName(e.target.value)}
              placeholder="e.g. Royal Family"
              className="w-full bg-white border border-[#e5e0d5] rounded-sm px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-[#b8785e] mb-6"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowNewGraphModal(false);
                  setNewGraphName("");
                }}
                className="px-4 py-2 text-xs font-bold tracking-widest uppercase text-stone-500 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={!newGraphName.trim()}
                onClick={() => {
                  const newGraph = {
                    id: Date.now().toString(),
                    name: newGraphName.trim(),
                    nodes: [],
                    edges: []
                  };
                  setGraphs(prev => [...prev, newGraph]);
                  setActiveGraphId(newGraph.id);
                  setShowNewGraphModal(false);
                  setNewGraphName("");
                }}
                className={`px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-sm shadow-sm transition-colors ${
                  !newGraphName.trim() ? "bg-stone-300 text-white cursor-not-allowed" : "bg-[#c17a7a] text-white hover:bg-[#a66850]"
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Image Picker Modal for Character */}
      <ImagePickerModal
        isOpen={!!quickImageChar}
        onClose={() => setQuickImageChar(null)}
        type="character"
        title={`Change Portrait for ${quickImageChar?.name || "Character"}`}
        currentImage={quickImageChar?.imageUrl || ""}
        onSelectImage={(newUrl) => {
          if (quickImageChar) {
            setCharacters(prev => prev.map(c => c.id === quickImageChar.id ? { ...c, imageUrl: newUrl } : c));
            if (id) {
              const updated = characters.map(c => c.id === quickImageChar.id ? { ...c, imageUrl: newUrl } : c);
              storage.saveProjectData(id, { characters: updated });
            }
          }
        }}
      />

      {/* Portrait Gallery Modal to browse presets and create/assign */}
      <ImagePickerModal
        isOpen={showPortraitGalleryModal}
        onClose={() => setShowPortraitGalleryModal(false)}
        type="character"
        title="Preset Character Portrait Library (25 Portraits)"
        defaultTab="presets"
        currentImage=""
        onSelectImage={(selectedUrl) => {
          setShowPortraitGalleryModal(false);
          const found = FANTASY_PRESET_PORTRAITS.find(p => p.url === selectedUrl);
          
          setPreviousViewMode(viewMode === "registry" ? "registry" : "connections");
          setEditingCharId(null);
          setAliasInput("");
          setTraitInput("");
          setShowAttributeDropdown(false);
          setFormData({
            name: found ? found.label.split("/")[0].trim() : "New Character",
            role: "PROTAGONIST",
            age: "",
            status: "ALIVE",
            aliases: [],
            backstory: found?.description || "",
            traits: found?.tags?.slice(0, 4) || [],
            imageUrl: selectedUrl,
            mbti: "",
            archetype: found?.category || "",
            conflict: "",
            goal: "",
            trauma: "",
            group: "none",
            customAttributes: [],
          });
          setViewMode("editor");
        }}
      />
    </div>
  );
}
