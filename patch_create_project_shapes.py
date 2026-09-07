import re

with open('src/pages/CreateProject.tsx', 'r') as f:
    content = f.read()

# Make buttons square-ish like WritingStudio
content = content.replace('rounded-xl', 'rounded-sm')
content = content.replace('rounded-lg', 'rounded-sm')

# Update Genre and Audience buttons to use rounded-sm instead of rounded-full
content = re.sub(r'px-3 py-1 rounded-full text-\[9px\] font-bold tracking-widest uppercase transition-all duration-300 border', 
                 'px-3 py-1.5 rounded-sm text-[9px] font-bold tracking-widest uppercase transition-all duration-300 border', 
                 content)

# Update logline textarea classes
old_textarea = 'className="w-full bg-[#FCFAF5] border border-[#E5E0D5] focus:border-[#8C503C] focus:bg-white rounded-sm outline-none p-2.5 text-xs font-serif text-[#4A3225] placeholder:text-stone-400 transition-colors resize-none shadow-sm"'
new_textarea = 'className="w-full bg-[#FCFAF5] border border-[#E5E0D5] focus:border-[#8C503C] focus:bg-white rounded-sm outline-none p-3 text-xs font-serif text-[#4A3225] placeholder:text-stone-400 transition-colors resize-none shadow-sm leading-relaxed"'
content = content.replace(old_textarea, new_textarea)

# Update primary Create button
old_btn = 'className="w-full relative overflow-hidden group bg-[#4A3225] text-white py-3.5 rounded-sm text-sm font-medium tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"'
new_btn = 'className="w-full bg-[#4A3225] text-[#F4F1EA] py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-[#332218] transition-all disabled:opacity-50 disabled:cursor-not-allowed"'
content = content.replace(old_btn, new_btn)

# Remove the gradients and sparkles from the primary button to make it minimalist
btn_content_old = r'<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-\[-100%\] group-hover:translate-x-\[100%\] transition-transform duration-700 ease-in-out" />\s*<span className="relative z-10 flex items-center justify-center gap-2">\s*\{isSubmitting \? \(\s*<Sparkles className="w-4 h-4 animate-spin" />\s*\) : \(\s*<>Create Manuscript</>\s*\)\}\s*</span>'
btn_content_new = """<span className="flex items-center justify-center gap-2">
                  {isSubmitting ? 'Creating...' : 'Create Manuscript'}
                </span>"""
content = re.sub(btn_content_old, btn_content_new, content)

with open('src/pages/CreateProject.tsx', 'w') as f:
    f.write(content)
