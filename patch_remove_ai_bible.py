import re

with open('src/pages/StoryBible.tsx', 'r') as f:
    content = f.read()

# 1. Remove AI Writing Instructions
ai_rules = """              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">AI Writing Instructions</Label>
                <Textarea 
                  placeholder="E.g., Maintain a bleak, atmospheric tone. Never use modern slang. Emphasize sensory details of the ocean..." 
                  className="min-h-[100px] bg-white border-[#E5E0D5] rounded-sm text-sm"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>"""
content = content.replace(ai_rules, "")

# 2. Remove AI Generate Rules button
ai_btn = """                <Button variant="outline" className="border-[#E5E0D5] text-[#8C503C] hover:bg-[#F4F1EA] rounded-sm text-xs shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Auto-Extract Rules
                </Button>"""
content = content.replace(ai_btn, "")

with open('src/pages/StoryBible.tsx', 'w') as f:
    f.write(content)
