import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { storage } from "@/lib/storage";
import { Plus, MoreVertical, GripVertical, Clock, LayoutList, CheckCircle2, ChevronRight, Tags, MapPin, Users, Edit3, Trash2, Calendar, Columns, X, Spline, GitBranch, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { MOCK_CHARACTERS, MOCK_LOCATIONS } from "@/mockData";

type PlotArc = {
  id: string;
  name: string;
  color: string;
};

type StoryEvent = {
  id: string;
  title: string;
  date: string;
  description: string;
  characters: string[];
  locationId: string | null;
  arcId: string;
  act: number;
  parentId: string | null;
  x: number;
  y: number;
};

const DEFAULT_ARCS: PlotArc[] = [
  { id: "a1", name: "Main Plot", color: "#965A5A" },
  { id: "a2", name: "Character Arc", color: "#5A7A96" },
  { id: "a3", name: "Political Subplot", color: "#5A9672" }
];

const DEFAULT_EVENTS: StoryEvent[] = [
  {
    id: "e1",
    title: "The Fall of Eldoria",
    date: "14 Moonfall – Year 302",
    description: "The northern army attacks Eldoria unexpectedly during the night. The castle is breached and the royal family must flee.",
    characters: ["1", "3"],
    locationId: "1",
    arcId: "a1",
    act: 1,
    parentId: null,
    x: 500,
    y: 80
  },
  {
    id: "e2",
    title: "A Secret Meeting",
    date: "18 Moonfall – Year 302",
    description: "In the ruins of the old temple, an alliance is forged between former enemies who realize they share a common threat.",
    characters: ["1", "2"],
    locationId: "2",
    arcId: "a2",
    act: 1,
    parentId: "e1",
    x: 250,
    y: 350
  },
  {
    id: "e3",
    title: "The Great Betrayal",
    date: "25 Moonfall – Year 302",
    description: "A trusted advisor turns against the group, stealing the artifact and leaving them trapped in the canyon.",
    characters: ["2", "3"],
    locationId: "3",
    arcId: "a3",
    act: 2,
    parentId: "e1",
    x: 750,
    y: 350
  }
];

export default function Plot() {
  const { id } = useParams();
  const [view, setView] = useState<"list" | "board" | "tree">("tree");
  
  const [arcs, setArcs] = useState<PlotArc[]>(() => {
    if (id) {
      const data = storage.getProjectData(id);
      if (data?.plotArcs && data.plotArcs.length > 0) return data.plotArcs;
    }
    return DEFAULT_ARCS;
  });

  const [events, setEvents] = useState<StoryEvent[]>(() => {
    if (id) {
      const data = storage.getProjectData(id);
      if (data?.plotEvents && data.plotEvents.length > 0) return data.plotEvents.map((e: any) => ({...e, x: e.x || 500, y: e.y || 100, parentId: e.parentId || null}));
    }
    return DEFAULT_EVENTS;
  });

  useEffect(() => {
    if (id && arcs.length > 0) {
      storage.saveProjectData(id, { plotArcs: arcs });
    }
  }, [arcs, id]);

  useEffect(() => {
    if (id && events.length > 0) {
      storage.saveProjectData(id, { plotEvents: events });
    }
  }, [events, id]);

  const [editingEvent, setEditingEvent] = useState<StoryEvent | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = (event: StoryEvent) => {
    setEditingEvent(event);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingEvent({
      id: Date.now().toString(),
      title: "",
      date: "",
      description: "",
      characters: [],
      locationId: null,
      arcId: arcs[0]?.id || "",
      act: 1,
      parentId: null,
      x: 500,
      y: Math.max(100, ...events.map(e => e.y)) + 150
    });
    setIsEditorOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    const parent = events.find(e => e.id === parentId);
    const children = events.filter(e => e.parentId === parentId);
    const offsetX = children.length * 350 - 175; 
    
    setEditingEvent({
      id: Date.now().toString(),
      title: "",
      date: "",
      description: "",
      characters: [],
      locationId: null,
      arcId: parent?.arcId || arcs[0]?.id || "",
      act: parent ? Math.min(parent.act, 3) : 1,
      parentId: parentId,
      x: parent ? parent.x + offsetX : 500,
      y: parent ? parent.y + 300 : 400
    });
    setIsEditorOpen(true);
  };

  const saveEvent = () => {
    if (!editingEvent) return;
    setEvents(prev => {
      const exists = prev.find(e => e.id === editingEvent.id);
      if (exists) {
        return prev.map(e => e.id === editingEvent.id ? editingEvent : e);
      }
      return [...prev, editingEvent];
    });
    setIsEditorOpen(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id && e.parentId !== id)); 
    setEvents(prev => prev.map(e => e.parentId === id ? {...e, parentId: null} : e).filter(e => e.id !== id));
    setIsEditorOpen(false);
  };

  // Tree Canvas Logic
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const node = events.find((ev) => ev.id === id);
    if (node) {
      setDraggingNode(id);
      setNodeDragOffset({
        x: e.clientX / scale - node.x,
        y: e.clientY / scale - node.y,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (draggingNode) {
      setEvents(prev => prev.map(ev => 
        ev.id === draggingNode 
          ? { ...ev, x: e.clientX / scale - nodeDragOffset.x, y: e.clientY / scale - nodeDragOffset.y }
          : ev
      ));
    }
  };

  const handlePointerUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNode(null);
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const getArcColor = (arcId: string) => arcs.find(a => a.id === arcId)?.color || "#999";
  const getArcName = (arcId: string) => arcs.find(a => a.id === arcId)?.name || "Unknown Arc";

  const eventsByAct = {
    1: events.filter(e => e.act === 1),
    2: events.filter(e => e.act === 2),
    3: events.filter(e => e.act === 3),
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F1EA]">
      {/* Header */}
      <div className="p-6 lg:px-12 lg:py-8 shrink-0 relative z-20 border-b border-[#E5E0D5] bg-white/40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#4A3225]">Plot & Timeline</h1>
            <p className="text-sm font-serif italic text-stone-500 mt-1">Map your narrative arcs, acts, and chronological events.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-[#E5E0D5] rounded-sm p-1 shadow-sm">
              <button 
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${view === "list" ? "bg-[#E5E0D5] text-[#4A3225]" : "text-stone-500 hover:bg-stone-50"}`}
                onClick={() => setView("list")}
              >
                Act View
              </button>
              <button 
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${view === "board" ? "bg-[#E5E0D5] text-[#4A3225]" : "text-stone-500 hover:bg-stone-50"}`}
                onClick={() => setView("board")}
              >
                Arc Board
              </button>
              <button 
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${view === "tree" ? "bg-[#E5E0D5] text-[#4A3225]" : "text-stone-500 hover:bg-stone-50"}`}
                onClick={() => setView("tree")}
              >
                Branch Tree
              </button>
            </div>
            <button 
              onClick={handleAddNew}
              className="px-6 py-2 bg-[#8C503C] hover:bg-[#6E3F2D] text-white text-[10px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-0">
        {view === "list" && (
          <div className="absolute inset-0 overflow-auto p-6 lg:p-12">
            <div className="max-w-[1400px] mx-auto">
              <div className="max-w-4xl mx-auto space-y-12">
                {[1, 2, 3].map(act => (
                  <div key={act} className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px bg-[#D49A89] flex-1 opacity-50" />
                      <h2 className="font-serif text-2xl font-bold text-[#4A3225]">
                        Act {act === 1 ? "I" : act === 2 ? "II" : "III"}
                      </h2>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#8C503C]">
                        {act === 1 ? "Setup & Inciting Incident" : act === 2 ? "Rising Action & Midpoint" : "Climax & Resolution"}
                      </span>
                      <div className="h-px bg-[#D49A89] flex-1 opacity-50" />
                    </div>

                    <div className="space-y-4 relative">
                      <div className="absolute left-[27px] top-4 bottom-4 w-px bg-[#E5E0D5] -z-10" />

                      {eventsByAct[act as keyof typeof eventsByAct].length === 0 ? (
                        <div className="text-center py-8 text-stone-400 text-sm font-serif italic border-2 border-dashed border-[#E5E0D5] rounded-sm bg-white/30">
                          No events plotted for this act yet.
                        </div>
                      ) : (
                        eventsByAct[act as keyof typeof eventsByAct].map((event, idx) => (
                          <div key={event.id} className="flex gap-6 group">
                            <div className="flex flex-col items-center mt-2 shrink-0">
                              <div 
                                className="w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125" 
                                style={{ backgroundColor: getArcColor(event.arcId) }}
                              />
                            </div>

                            <div 
                              className="flex-1 bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm p-5 shadow-sm hover:shadow-md hover:border-[#D49A89] transition-all cursor-pointer relative"
                              onClick={() => handleEdit(event)}
                            >
                              <div className="absolute top-5 right-5 text-stone-300 group-hover:text-[#8C503C] transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span 
                                  className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-sm border"
                                  style={{ color: getArcColor(event.arcId), borderColor: getArcColor(event.arcId) + '40', backgroundColor: getArcColor(event.arcId) + '10' }}
                                >
                                  {getArcName(event.arcId)}
                                </span>
                                {event.date && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-stone-500">
                                    <Calendar className="w-3 h-3" />
                                    {event.date}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-serif text-xl font-bold text-[#4A3225] mb-2">{event.title}</h3>
                              <p className="text-sm text-stone-600 font-serif leading-relaxed mb-4">{event.description}</p>

                              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#E5E0D5]">
                                {event.locationId && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C503C]">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {MOCK_LOCATIONS.find(l => l.id === event.locationId)?.name || 'Unknown Location'}
                                  </div>
                                )}
                                
                                {event.characters.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-stone-400" />
                                    <div className="flex -space-x-1.5">
                                      {event.characters.map((charId) => {
                                        const char = MOCK_CHARACTERS.find(c => c.id === charId);
                                        if (!char) return null;
                                        return (
                                          <div key={charId} className="w-5 h-5 rounded-full bg-[#E5E0D5] border border-white flex items-center justify-center text-[8px] font-bold text-stone-600 shadow-sm" title={char.name}>
                                            {char.name.charAt(0)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={handleAddNew}
                  className="w-full py-4 border-2 border-dashed border-[#E5E0D5] rounded-sm text-stone-500 font-bold uppercase tracking-widest text-[10px] hover:border-[#D49A89] hover:text-[#4A3225] hover:bg-white/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Plot New Event
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "board" && (
          <div className="absolute inset-0 overflow-auto p-6 lg:p-12">
            <div className="max-w-[1400px] mx-auto">
              <div className="bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm shadow-sm overflow-x-auto p-6 min-h-[600px]">
                <div className="min-w-max space-y-8">
                  {arcs.map(arc => {
                    const arcEvents = events.filter(e => e.arcId === arc.id).sort((a, b) => a.act - b.act);
                    
                    return (
                      <div key={arc.id} className="relative">
                        <div className="flex items-center gap-3 w-48 shrink-0 mb-4 sticky left-0 z-10 bg-[#FCFAF5] py-2">
                          <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: arc.color }} />
                          <h3 className="font-serif font-bold text-[#4A3225]">{arc.name}</h3>
                        </div>
                        
                        <div className="relative h-[220px] bg-stone-50/50 border border-[#E5E0D5] rounded-sm p-4 flex items-center gap-6">
                          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 opacity-20" style={{ backgroundColor: arc.color }} />
                          
                          {arcEvents.length === 0 ? (
                            <div className="w-full text-center text-stone-400 text-xs italic font-serif z-10">No events on this arc yet.</div>
                          ) : (
                            arcEvents.map(event => (
                              <div 
                                key={event.id}
                                onClick={() => handleEdit(event)}
                                className="w-72 shrink-0 bg-white border border-[#E5E0D5] shadow-md rounded-sm p-4 relative z-10 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                              >
                                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-sm opacity-80" style={{ backgroundColor: arc.color }} />
                                
                                <div className="flex justify-between items-start mb-2 mt-1">
                                  <span className="text-[9px] font-bold tracking-widest uppercase text-stone-500">Act {event.act}</span>
                                  <span className="text-[9px] text-stone-400 italic truncate max-w-[100px]">{event.date}</span>
                                </div>
                                <h4 className="font-serif font-bold text-[#4A3225] text-sm leading-tight mb-2 group-hover:text-[#8C503C] transition-colors line-clamp-2">{event.title}</h4>
                                <p className="text-xs text-stone-500 line-clamp-3 mb-3">{event.description}</p>
                                
                                <div className="flex justify-between items-center mt-auto pt-2 border-t border-stone-100">
                                  {event.locationId ? (
                                    <span className="text-[10px] text-stone-400 flex items-center gap-1 truncate max-w-[120px]">
                                      <MapPin className="w-3 h-3" />
                                      {MOCK_LOCATIONS.find(l => l.id === event.locationId)?.name}
                                    </span>
                                  ) : <span />}
                                  
                                  {event.characters.length > 0 && (
                                    <div className="flex -space-x-1">
                                      {event.characters.slice(0, 3).map((charId) => (
                                        <div key={charId} className="w-4 h-4 rounded-full bg-[#E5E0D5] border border-white flex items-center justify-center text-[7px] font-bold text-stone-600 shadow-sm">
                                          {MOCK_CHARACTERS.find(c => c.id === charId)?.name.charAt(0)}
                                        </div>
                                      ))}
                                      {event.characters.length > 3 && (
                                        <div className="w-4 h-4 rounded-full bg-stone-200 border border-white flex items-center justify-center text-[7px] font-bold text-stone-600 shadow-sm">
                                          +{event.characters.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                          
                          <button 
                            onClick={() => {
                              setEditingEvent({
                                id: Date.now().toString(),
                                title: "",
                                date: "",
                                description: "",
                                characters: [],
                                locationId: null,
                                arcId: arc.id,
                                act: 1,
                                parentId: null,
                                x: 500,
                                y: 100
                              });
                              setIsEditorOpen(true);
                            }}
                            className="w-12 h-12 shrink-0 rounded-full bg-white border-2 border-dashed border-[#E5E0D5] flex items-center justify-center text-stone-400 hover:text-[#8C503C] hover:border-[#D49A89] transition-all z-10 hover:scale-110 shadow-sm"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "tree" && (
          <div 
            className="absolute inset-0 bg-[#E5E0D5]/10 overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY * -0.001;
              setScale(Math.min(Math.max(0.2, scale + delta), 2));
            }}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: "0 0",
              }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Background Grid */}
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(#E5E0D5 1px, transparent 1px)', 
                backgroundSize: '40px 40px',
                width: '10000px',
                height: '10000px',
                left: '-5000px',
                top: '-5000px'
              }} />

              {/* SVG Lines */}
              <svg className="absolute inset-0 overflow-visible z-0" style={{ width: '10000px', height: '10000px', left: '-5000px', top: '-5000px' }}>
                <g transform="translate(5000, 5000)">
                  {events.map(event => {
                    if (!event.parentId) return null;
                    const parent = events.find(e => e.id === event.parentId);
                    if (!parent) return null;
                    
                    const sx = parent.x + 160;
                    const sy = parent.y + 100;
                    const tx = event.x + 160;
                    const ty = event.y + 20;

                    return (
                      <path
                        key={`line-${event.id}`}
                        d={`M ${sx} ${sy} C ${sx} ${sy + 100}, ${tx} ${ty - 100}, ${tx} ${ty}`}
                        fill="none"
                        stroke={getArcColor(event.arcId)}
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-40"
                      />
                    )
                  })}
                </g>
              </svg>

              {/* Nodes */}
              <div className="absolute inset-0 z-10" style={{ width: '10000px', height: '10000px', left: '-5000px', top: '-5000px' }}>
                <div className="absolute inset-0 transform translate-x-[5000px] translate-y-[5000px]">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group"
                      style={{
                        left: event.x,
                        top: event.y,
                        width: 320,
                        touchAction: "none"
                      }}
                      onPointerDown={(e) => handleNodePointerDown(e, event.id)}
                    >
                      <div 
                        className="bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm p-5 shadow-sm hover:shadow-xl hover:border-[#D49A89] transition-all relative"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-sm opacity-80" style={{ backgroundColor: getArcColor(event.arcId) }} />
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: getArcColor(event.arcId) }} />

                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                            className="text-stone-300 hover:text-[#8C503C] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2 mt-1">
                          <span 
                            className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-sm border"
                            style={{ color: getArcColor(event.arcId), borderColor: getArcColor(event.arcId) + '40', backgroundColor: getArcColor(event.arcId) + '10' }}
                          >
                            {getArcName(event.arcId)}
                          </span>
                          {event.date && (
                            <span className="text-[9px] text-stone-400 italic">
                              {event.date}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-serif text-lg font-bold text-[#4A3225] mb-2 pr-6 leading-tight">{event.title}</h3>
                        <p className="text-xs text-stone-600 font-serif leading-relaxed line-clamp-3 mb-3">{event.description}</p>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddChild(event.id); }}
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-[#E5E0D5] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:border-[#D49A89] hover:text-[#8C503C] text-stone-400 z-20"
                          title="Add child event"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-8 left-8 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#E5E0D5] p-2 rounded-xl shadow-sm z-50">
              <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))} className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-stone-500 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(2, s + 0.2))} className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-stone-200 mx-1" />
              <button onClick={resetView} className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors" title="Reset View">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Editor Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#FCFAF5] shadow-[0_0_40px_rgba(0,0,0,0.2)] border-l border-[#E5E0D5] z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isEditorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {isEditorOpen && editingEvent && (
          <>
            <div className="p-6 border-b border-[#E5E0D5] bg-white flex justify-between items-center shrink-0">
              <h2 className="font-serif text-xl font-bold text-[#4A3225]">
                {editingEvent.title ? 'Edit Event' : 'New Plot Event'}
              </h2>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Title & Date */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Event Title</label>
                  <input 
                    type="text"
                    value={editingEvent.title}
                    onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                    placeholder="e.g. The King's Assassination"
                    className="w-full mt-1 bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm font-bold text-[#4A3225] focus:outline-none focus:border-[#D49A89] shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">In-Universe Date</label>
                  <input 
                    type="text"
                    value={editingEvent.date}
                    onChange={e => setEditingEvent({...editingEvent, date: e.target.value})}
                    placeholder="e.g. 14 Moonfall – Year 302"
                    className="w-full mt-1 bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-[#4A3225] focus:outline-none focus:border-[#D49A89] shadow-inner"
                  />
                </div>
              </div>

              {/* Arc & Act Classification */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white border border-[#E5E0D5] rounded-sm shadow-sm">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Spline className="w-3 h-3" /> Plot Arc</label>
                  <select 
                    value={editingEvent.arcId}
                    onChange={e => setEditingEvent({...editingEvent, arcId: e.target.value})}
                    className="w-full bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm px-2 py-1.5 text-xs text-[#4A3225] focus:outline-none focus:border-[#D49A89]"
                  >
                    {arcs.map(arc => <option key={arc.id} value={arc.id}>{arc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Columns className="w-3 h-3" /> Story Act</label>
                  <select 
                    value={editingEvent.act}
                    onChange={e => setEditingEvent({...editingEvent, act: Number(e.target.value)})}
                    className="w-full bg-[#FCFAF5] border border-[#E5E0D5] rounded-sm px-2 py-1.5 text-xs text-[#4A3225] focus:outline-none focus:border-[#D49A89]"
                  >
                    <option value={1}>Act I (Setup)</option>
                    <option value={2}>Act II (Rising Action)</option>
                    <option value={3}>Act III (Resolution)</option>
                  </select>
                </div>
              </div>

              {/* Parent Branch */}
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><GitBranch className="w-3 h-3" /> Parent Event (Branch)</label>
                <select 
                  value={editingEvent.parentId || ""}
                  onChange={e => setEditingEvent({...editingEvent, parentId: e.target.value || null})}
                  className="w-full bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-[#4A3225] focus:outline-none focus:border-[#D49A89] shadow-inner"
                >
                  <option value="">-- Main Trunk (No Parent) --</option>
                  {events.filter(e => e.id !== editingEvent.id).map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={editingEvent.description}
                  onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                  rows={5}
                  placeholder="What happens in this event?"
                  className="w-full mt-1 bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-[#4A3225] focus:outline-none focus:border-[#D49A89] shadow-inner resize-none font-serif"
                />
              </div>

              {/* Location Selection */}
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><MapPin className="w-3 h-3" /> Location</label>
                <select 
                  value={editingEvent.locationId || ""}
                  onChange={e => setEditingEvent({...editingEvent, locationId: e.target.value || null})}
                  className="w-full bg-white border border-[#E5E0D5] rounded-sm px-3 py-2 text-sm text-[#4A3225] focus:outline-none focus:border-[#D49A89] shadow-inner"
                >
                  <option value="">-- No specific location --</option>
                  {MOCK_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Character Selection */}
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Users className="w-3 h-3" /> Involved Characters</label>
                <div className="bg-white border border-[#E5E0D5] rounded-sm shadow-inner p-2 flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {MOCK_CHARACTERS.map(char => {
                    const isSelected = editingEvent.characters.includes(char.id);
                    return (
                      <button
                        key={char.id}
                        onClick={() => {
                          setEditingEvent(prev => ({
                            ...prev!,
                            characters: isSelected 
                              ? prev!.characters.filter(id => id !== char.id)
                              : [...prev!.characters, char.id]
                          }))
                        }}
                        className={`px-2 py-1 rounded-sm text-xs font-bold transition-colors border ${isSelected ? 'bg-[#E5E0D5] text-[#4A3225] border-[#D49A89]' : 'bg-transparent text-stone-500 border-transparent hover:bg-stone-50'}`}
                      >
                        {char.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E0D5] bg-white flex justify-between shrink-0">
              <button 
                onClick={() => deleteEvent(editingEvent.id)}
                className="px-4 py-2 text-rose-600 hover:bg-rose-50 text-[10px] font-bold tracking-widest uppercase rounded-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="px-6 py-2 text-[#8C503C] text-[10px] font-bold tracking-widest uppercase hover:bg-stone-50 rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEvent}
                  disabled={!editingEvent.title.trim()}
                  className={`px-6 py-2 text-white text-[10px] font-bold tracking-widest uppercase rounded-sm shadow-md transition-all ${!editingEvent.title.trim() ? 'bg-stone-300' : 'bg-[#8C503C] hover:bg-[#6E3F2D]'}`}
                >
                  Save Event
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Backdrop for Editor */}
      {isEditorOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] transition-opacity"
          onClick={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
