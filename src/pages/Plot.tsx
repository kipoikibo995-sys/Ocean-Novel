import { useState } from "react";
import { Plus, MoreVertical, GripVertical, CheckCircle2, CircleDashed, LayoutList, Columns, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_CHARACTERS } from "@/mockData";

type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  characters: string[];
};

const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    title: "The Fall of Eldoria",
    date: "14 Moonfall – Year 302",
    description: "The northern army attacks Eldoria unexpectedly during the night. The castle is breached.",
    characters: ["1", "3"]
  },
  {
    id: "e2",
    title: "A Secret Meeting",
    date: "18 Moonfall – Year 302",
    description: "In the ruins of the old temple, an alliance is forged between former enemies.",
    characters: ["1", "2"]
  },
  {
    id: "e3",
    title: "The Great Betrayal",
    date: "25 Moonfall – Year 302",
    description: "A trusted advisor turns against the group, stealing the artifact.",
    characters: ["2", "3"]
  }
];

export default function Plot() {
  const [view, setView] = useState<"list" | "timeline">("timeline");
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-transparent relative">
      <div className="p-8 border-b border-[#E5E0D5] bg-[#F9F6ED] shrink-0 z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">Plot & Events</h1>
            <p className="text-stone-500 mt-1">Plan your story's chronological timeline.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#E5E0D5] rounded-xl bg-[#F9F6ED] p-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-xl ${view === "list" ? "bg-[#E5E0D5] text-stone-800" : "text-stone-500"}`}
                onClick={() => setView("list")}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-xl ${view === "timeline" ? "bg-[#E5E0D5] text-stone-800" : "text-stone-500"}`}
                onClick={() => setView("timeline")}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
            <Button className="bg-[#965A5A] hover:bg-[#965A5A]/90 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        <div className="max-w-6xl mx-auto">
          {view === "list" ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {events.map((event) => (
                <Card key={event.id} className="p-0 overflow-hidden group hover:border-[#965A5A] transition-colors rounded-xl border-[#E5E0D5] shadow-md bg-[#F9F6ED]">
                  <div className="flex">
                    <div className="w-10 bg-transparent border-r border-[#E5E0D5] flex items-center justify-center text-stone-300 cursor-grab active:cursor-grabbing hover:text-stone-600 group-hover:bg-[#E5E0D5]">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
                            {event.date}
                          </span>
                          <h3 className="font-semibold text-lg text-stone-800">{event.title}</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-stone-600">{event.description}</p>
                      
                      {event.characters.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E5E0D5]">
                          <span className="text-xs text-stone-500">Characters:</span>
                          <div className="flex -space-x-2">
                            {event.characters.map((charId) => {
                              const char = MOCK_CHARACTERS.find(c => c.id === charId);
                              if (!char) return null;
                              return (
                                <div key={charId} className="w-6 h-6 rounded-full bg-[#E5E0D5] border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-600 shadow-sm" title={char.name}>
                                  {char.name.charAt(0)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              <button className="w-full py-4 border-2 border-dashed border-[#E5E0D5] rounded-xl text-stone-500 font-bold uppercase tracking-widest text-xs hover:border-[#965A5A] hover:text-stone-800 hover:bg-[#E5E0D5] transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Event
              </button>
            </div>
          ) : (
            <div className="relative py-10 overflow-x-auto min-h-full flex items-center">
              {/* Horizontal Timeline Line */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-[#E5E0D5] -translate-y-1/2 rounded-full min-w-[800px]" />
              
              <div className="flex items-center gap-12 relative z-10 px-10 min-w-max">
                {events.map((event, index) => {
                  const isTop = index % 2 === 0;
                  return (
                    <div key={event.id} className={`relative flex flex-col items-center w-72 ${isTop ? 'mb-64' : 'mt-64'}`}>
                      {/* Timeline Dot */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#965A5A] ring-4 ring-[#E5E0D5] shadow-md z-20" 
                           style={isTop ? { top: 'calc(100% + 8rem)' } : { top: '-8rem' }} />
                      
                      {/* Connection Line */}
                      <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#E5E0D5] z-0"
                           style={isTop ? { top: '100%', height: '8rem' } : { bottom: '100%', height: '8rem' }} />

                      {/* Event Card */}
                      <Card className="w-full p-4 bg-[#F9F6ED] shadow-lg border-[#E5E0D5] rounded-xl hover:shadow-xl hover:border-[#D3BFA9] transition-all cursor-pointer relative z-10 group">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#965A5A] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          {index + 1}
                        </div>
                        <span className="inline-block px-2 py-1 bg-[#E5E0D5] text-stone-600 rounded-md text-[10px] font-bold tracking-widest uppercase mb-3 border border-[#E5E0D5]">
                          {event.date}
                        </span>
                        <h4 className="font-bold text-stone-800 text-base mb-2 leading-tight">{event.title}</h4>
                        <p className="text-xs text-stone-600 line-clamp-3 mb-4">{event.description}</p>
                        
                        <div className="flex -space-x-1">
                          {event.characters.map((charId) => {
                            const char = MOCK_CHARACTERS.find(c => c.id === charId);
                            if (!char) return null;
                            return (
                              <div key={charId} className="w-6 h-6 rounded-full bg-[#E5E0D5] border-2 border-white flex items-center justify-center text-[9px] font-bold text-stone-600" title={char.name}>
                                {char.name.charAt(0)}
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </div>
                  );
                })}
                
                <div className="relative flex flex-col items-center justify-center w-24">
                  <button className="w-12 h-12 rounded-full bg-[#F9F6ED] border-2 border-dashed border-[#D3BFA9] flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-[#965A5A] transition-colors shadow-sm z-20 hover:scale-110">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
