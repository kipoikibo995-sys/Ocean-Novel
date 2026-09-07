import re

with open('src/components/MentionEditor.tsx', 'r') as f:
    content = f.read()

# Add MessageSquare to lucide-react imports if not there
if 'MessageSquare' not in content:
    content = content.replace("from 'lucide-react';", "MessageSquare, \n} from 'lucide-react';")
if 'Scissors' not in content:
    content = content.replace("from 'lucide-react';", "Scissors, \n} from 'lucide-react';")

# Replace bubble menu
old_bubble = """        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100, placement: 'bottom', offset: [0, 8] }} 
          className="flex items-center gap-1 p-1.5 bg-[#FCFAF5] border border-[#E5E0D5] rounded-xl shadow-xl z-50"
        >
          {/* AI Magic Button Stub */}
          <button
            onClick={(e) => { e.preventDefault(); alert("Tính năng AI sẽ phân tích đoạn văn này!"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#D49A89]/20 to-[#8C503C]/20 text-[#8C503C] hover:from-[#D49A89]/30 hover:to-[#8C503C]/30 rounded-lg text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Assist
          </button>

          <div className="w-px h-5 bg-[#E5E0D5] mx-1" />
          
          <MenuButton action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}><UnderlineIcon className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')}><Highlighter className="w-4 h-4" /></MenuButton>
          
          <div className="w-px h-5 bg-[#E5E0D5] mx-1" />
          
          <MenuButton action={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="w-4 h-4" /></MenuButton>
        </BubbleMenu>"""

new_bubble = """        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100, placement: 'top', offset: [0, 8] }} 
          className="flex items-center gap-1 p-1.5 bg-[#2E2825] border border-[#1A1614] rounded-full shadow-2xl z-50 text-white"
        >
          <MenuButton action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" /></MenuButton>
          
          <div className="w-px h-4 bg-white/20 mx-1" />
          
          <button
            onClick={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
            title="Chapter Break"
          >
            <Scissors className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/20 mx-1" />
          
          <button
            onClick={(e) => { e.preventDefault(); alert("AI Rewrite stub"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#D49A89] to-[#8C503C] text-white hover:opacity-90 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Rewrite
          </button>

          <button
            onClick={(e) => { e.preventDefault(); alert("Comment stub"); }}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center ml-1"
            title="Comment"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </BubbleMenu>"""

content = content.replace(old_bubble, new_bubble)

# We need to update MenuButton for the new dark theme
old_menu_btn = """const MenuButton = ({ action, isActive, children }: { action: () => void, isActive: boolean, children: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); action(); }}
    className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
      isActive ? 'bg-[#E5E0D5] text-[#4A3225]' : 'text-stone-500 hover:bg-stone-100'
    }`}
  >
    {children}
  </button>
);"""

new_menu_btn = """const MenuButton = ({ action, isActive, children }: { action: () => void, isActive: boolean, children: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); action(); }}
    className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
      isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </button>
);"""

content = content.replace(old_menu_btn, new_menu_btn)

with open('src/components/MentionEditor.tsx', 'w') as f:
    f.write(content)

