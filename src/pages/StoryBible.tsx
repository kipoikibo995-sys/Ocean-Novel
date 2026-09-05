import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_PROJECT } from "@/mockData";

export default function StoryBible() {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="flex-1 overflow-auto bg-transparent p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">Story Bible</h1>
            <p className="text-stone-500 mt-2">The foundation and rules of your universe.</p>
          </div>
          <Button className="bg-[#965A5A] hover:bg-[#965A5A]/90 text-white rounded-xl">Save Changes</Button>
        </div>

        <Tabs className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger active={activeTab === "details"} onClick={() => setActiveTab("details")}>Book Details</TabsTrigger>
            <TabsTrigger active={activeTab === "core"} onClick={() => setActiveTab("core")}>Story Core</TabsTrigger>
            <TabsTrigger active={activeTab === "world"} onClick={() => setActiveTab("world")}>World</TabsTrigger>
            <TabsTrigger active={activeTab === "style"} onClick={() => setActiveTab("style")}>Writing Style</TabsTrigger>
          </TabsList>

          <TabsContent active={activeTab === "details"} className="space-y-6 bg-[#F9F6ED] p-6 rounded-xl border border-[#E5E0D5] shadow-md mt-0">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Title</Label>
                <Input defaultValue={MOCK_PROJECT.title} className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Genre</Label>
                <Input defaultValue={MOCK_PROJECT.genre} className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Subgenre</Label>
                <Input defaultValue="Mystery / Suspense" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Target Audience</Label>
                <Input defaultValue="Adult" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">POV</Label>
                <Input defaultValue="First Person" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Tone</Label>
                <Input defaultValue="Dark, Suspenseful" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
            </div>
          </TabsContent>

          <TabsContent active={activeTab === "core"} className="space-y-6 bg-[#F9F6ED] p-6 rounded-xl border border-[#E5E0D5] shadow-md mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Premise</Label>
                <Textarea className="min-h-[100px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue={MOCK_PROJECT.premise} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Main Conflict</Label>
                <Textarea className="min-h-[100px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue="Sarah must uncover the truth about her sister's disappearance while navigating the hostility of her estranged family and a town that wants its secrets buried." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Story Goal</Label>
                <Input defaultValue="Discover what happened to Emily Cole." className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Themes</Label>
                <Input defaultValue="Grief, memory, isolation, family secrets." className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
            </div>
          </TabsContent>

          <TabsContent active={activeTab === "world"} className="space-y-6 bg-[#F9F6ED] p-6 rounded-xl border border-[#E5E0D5] shadow-md mt-0">
             <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Time Period</Label>
                  <Input defaultValue="Present Day" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Primary Setting</Label>
                  <Input defaultValue="Greyhaven (Fictional coastal town, Maine)" className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">World Description</Label>
                <Textarea className="min-h-[100px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue="An isolated, fading fishing town characterized by dense fog, jagged cliffs, and a close-knit, secretive community." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Important Rules / Laws</Label>
                <Textarea className="min-h-[80px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue="The town operates on its own unspoken social rules; outsiders are not trusted. The local police force is small and often turns a blind eye to influential families." />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent active={activeTab === "style"} className="space-y-6 bg-[#F9F6ED] p-6 rounded-xl border border-[#E5E0D5] shadow-md mt-0">
             <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Narrative Style</Label>
                <Textarea className="min-h-[80px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue="Introspective, slightly unreliable narrator. Focus on sensory details related to cold, dampness, and isolation." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Dialogue Style</Label>
                <Textarea className="min-h-[80px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue="Clipped, evasive. Characters rarely say exactly what they mean." />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Pacing</Label>
                <Input defaultValue="Slow burn building to a fast-paced climax." className="rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">AI Writing Instructions</Label>
                <Textarea className="min-h-[100px] rounded-xl border-[#E5E0D5] focus-visible:ring-[#965A5A]" defaultValue="When assisting with writing, favor shorter, punchier sentences during suspenseful moments. Avoid melodrama. Emphasize the harsh environment." />
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
