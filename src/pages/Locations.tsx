import { useState } from "react";
import { Plus, MoreVertical, Search, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_LOCATIONS } from "@/mockData";

export default function Locations() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-transparent relative">
      <div className="p-8 border-b border-[#E5E0D5] bg-[#F9F6ED] shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">Locations</h1>
            <p className="text-stone-500 mt-1">Build the settings for your world.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <Input className="pl-9 rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" placeholder="Search locations..." />
            </div>
            <Button className="bg-[#965A5A] hover:bg-[#965A5A]/90 text-white rounded-xl shrink-0" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_LOCATIONS.map((loc) => (
            <Card key={loc.id} className="overflow-hidden flex flex-col rounded-xl border-[#E5E0D5] shadow-md">
              <div className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E5E0D5] border border-[#E5E0D5] shrink-0 flex items-center justify-center text-stone-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-stone-800 truncate">{loc.name}</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5]">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge variant="outline" className="mt-1 font-bold tracking-widest uppercase text-[10px] border-[#E5E0D5] text-stone-500 bg-[#E5E0D5] rounded-xl">
                    {loc.type}
                  </Badge>
                </div>
              </div>
              <div className="px-5 pb-5 flex-1">
                <p className="text-sm text-stone-600 mb-4">{loc.description}</p>
              </div>
              <div className="p-4 bg-transparent border-t border-[#E5E0D5] flex justify-end">
                <Button variant="outline" size="sm" className="rounded-xl border-[#E5E0D5] text-stone-800 hover:bg-[#E5E0D5]" onClick={() => setIsModalOpen(true)}>Edit Location</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#965A5A]/20 backdrop-blur-sm p-4">
          <div className="bg-[#F9F6ED] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#E5E0D5]">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E0D5]">
              <h2 className="text-xl font-bold text-stone-800">Add Location</h2>
              <Button variant="ghost" size="icon" className="text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] rounded-xl" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-auto flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Location Name</Label>
                  <Input placeholder="e.g. Old Lighthouse" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Location Type</Label>
                  <Input placeholder="e.g. Landmark, Town, Building" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Short Description</Label>
                <Input placeholder="One sentence summary" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Atmosphere / Mood</Label>
                <Input placeholder="e.g. Cold, damp, imposing, silent" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Important Details (Sights, Sounds, Smells)</Label>
                <Textarea className="min-h-[100px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Events That Happen Here</Label>
                <Textarea className="min-h-[80px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" placeholder="Briefly note key scenes..." />
              </div>

            </div>
            <div className="p-6 border-t border-[#E5E0D5] flex justify-end gap-3 bg-transparent">
              <Button variant="ghost" className="rounded-xl text-stone-600 hover:text-stone-800 hover:bg-[#E5E0D5]" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#965A5A] hover:bg-[#965A5A]/90 text-white rounded-xl" onClick={() => setIsModalOpen(false)}>Save Location</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
