import re

with open('src/components/MentionEditor.tsx', 'r') as f:
    content = f.read()

# 1. Update text alignment to justify by default
content = content.replace("TextAlign.configure({ types: ['heading', 'paragraph'] })", "TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'justify' })")

# 2. Remove FloatingMenu completely
floating_menu_block = r'\{/\*\ 2\.\ FLOATING MENU\ \(Shows\ on\ empty\ lines\)\ \*/\}.*?\{editor\ &&\ \(\n\s*<FloatingMenu.*?</FloatingMenu>\n\s*\)\}'
content = re.sub(floating_menu_block, '', content, flags=re.DOTALL)
content = content.replace("import { FloatingMenu } from '@tiptap/react/menus';", "")

# 3. Modify EditorContent area to include the new static floating toolbar
editor_content_block = r'<div className="relative flex-grow overflow-y-auto">\n\s*<EditorContent editor=\{editor\} className="h-full" />\n\s*\{editor\?\.isEmpty && \(\n\s*<div className="absolute top-8 left-8 pointer-events-none text-stone-400 font-serif text-lg opacity-70">\n\s*Start writing chapter 1\.\.\. Type @ to mention a character\.\n\s*</div>\n\s*\)\}\n\s*</div>'

static_toolbar = """<div className="relative flex-grow overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
        
        {editor?.isEmpty && (
          <div className="absolute top-8 left-8 pointer-events-none text-stone-400 font-serif text-lg opacity-70">
            Start writing chapter 1... Type @ to mention a character.
          </div>
        )}

        {/* Static Bottom Toolbar */}
        {editor && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-[#FCFAF5] border border-[#E5E0D5] rounded-full shadow-lg z-50 transition-opacity">
            <MenuButton action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough className="w-4 h-4" /></MenuButton>
            
            <div className="w-px h-5 bg-[#E5E0D5] mx-1" />
            
            <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></MenuButton>
            
            <div className="w-px h-5 bg-[#E5E0D5] mx-1" />
            
            <MenuButton action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></MenuButton>
            
            <div className="w-px h-5 bg-[#E5E0D5] mx-1" />

            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#E5E0D5] rounded-full transition-colors flex items-center justify-center"
              title="Scene Break"
            >
              <Scissors className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>"""

content = re.sub(editor_content_block, static_toolbar, content, flags=re.DOTALL)

# 4. Change MenuButton to a light theme style since it's now on a light pill
old_menu_btn = """const MenuButton = ({ action, isActive, children }: { action: () => void, isActive: boolean, children: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); action(); }}
    className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
      isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </button>
);"""

new_menu_btn = """const MenuButton = ({ action, isActive, children }: { action: () => void, isActive: boolean, children: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); action(); }}
    className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
      isActive ? 'bg-[#E5E0D5] text-[#4A3225] shadow-inner' : 'text-stone-500 hover:text-[#4A3225] hover:bg-[#F4F1EA]'
    }`}
  >
    {children}
  </button>
);"""

content = content.replace(old_menu_btn, new_menu_btn)

with open('src/components/MentionEditor.tsx', 'w') as f:
    f.write(content)
