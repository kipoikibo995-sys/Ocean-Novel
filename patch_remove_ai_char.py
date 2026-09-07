import re

with open('src/pages/Characters.tsx', 'r') as f:
    content = f.read()

# 1. Remove Generate Image button in Header
gen_img_btn = """              <Button variant="outline" className="border-[#E5E0D5] text-[#8C503C] hover:bg-[#F4F1EA] rounded-sm text-xs px-4 h-9 shadow-sm" onClick={() => {}}>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Generate Image
              </Button>"""
content = content.replace(gen_img_btn, "")

# 2. Remove AI Generate button in Form Modal
form_gen_btn = """            <Button variant="outline" className="border-[#E5E0D5] text-[#8C503C] hover:bg-[#F4F1EA] rounded-sm text-xs shadow-sm w-full mt-4" onClick={(e) => e.preventDefault()}>
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              AI: Generate Backstory
            </Button>"""
content = content.replace(form_gen_btn, "")

# 3. Remove AI Context Actions from Detail View
ai_ctx = """          {/* AI Context Actions */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button className="h-8 px-3 bg-white/80 backdrop-blur-md border border-white/40 rounded-sm text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:bg-white transition-colors flex items-center shadow-sm">
              <Sparkles className="w-3 h-3 mr-1.5 text-[#D49A89]" />
              Brainstorm Arc
            </button>
            <button className="h-8 w-8 bg-white/80 backdrop-blur-md border border-white/40 rounded-sm text-stone-600 hover:bg-white transition-colors flex items-center justify-center shadow-sm" onClick={() => setViewMode('grid')}>
              <X className="w-4 h-4" />
            </button>
          </div>"""
# Replace with just the close button
close_btn = """          {/* Close Action */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button className="h-8 w-8 bg-white/80 backdrop-blur-md border border-white/40 rounded-sm text-stone-600 hover:bg-white transition-colors flex items-center justify-center shadow-sm" onClick={() => setViewMode('grid')}>
              <X className="w-4 h-4" />
            </button>
          </div>"""
content = content.replace(ai_ctx, close_btn)

# 4. Remove Generate Avatar overlay
gen_avatar = """                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="h-7 text-[10px] bg-white/90 text-[#4A3225] hover:bg-white" onClick={(e) => { e.stopPropagation(); }}>
                        <Sparkles className="w-3 h-3 mr-1" /> Generate
                      </Button>
                    </div>"""
content = content.replace(gen_avatar, "")

with open('src/pages/Characters.tsx', 'w') as f:
    f.write(content)

