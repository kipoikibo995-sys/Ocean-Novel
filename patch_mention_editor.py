import re

with open('src/components/MentionEditor.tsx', 'r') as f:
    content = f.read()

# Add import createPortal
if "createPortal" not in content:
    content = content.replace("import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';", "import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';\nimport { createPortal } from 'react-dom';")

# Add state for portal target
if "const [portalTarget, setPortalTarget] = useState" not in content:
    hook_str = """  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalTarget(document.getElementById('editor-toolbar-portal-target'));
  }, []);
"""
    # Insert right after const editor = useEditor({
    content = re.sub(r'(const editor = useEditor\(\{.*?\}\);)', r'\1\n' + hook_str, content, flags=re.DOTALL)

# Replace the Static Bottom Toolbar block with a portal
old_toolbar_block = r'\{/\*\ Static Bottom Toolbar\ \*/\}.*?\{editor\ &&\ \(\n\s*<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1\.5 p-2 bg-\[#FCFAF5\] border border-\[#E5E0D5\] rounded-full shadow-lg z-50 transition-opacity">.*?</button>\n\s*</div>\n\s*\)\}'

new_toolbar_block = """{/* Static Header Toolbar via Portal */}
        {editor && portalTarget && createPortal(
          <div className="flex items-center gap-0.5">
            <MenuButton action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough className="w-4 h-4" /></MenuButton>
            
            <div className="w-px h-4 bg-[#E5E0D5] mx-2" />
            
            <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></MenuButton>
            
            <div className="w-px h-4 bg-[#E5E0D5] mx-2" />
            
            <MenuButton action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" /></MenuButton>
            <MenuButton action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></MenuButton>
            
            <div className="w-px h-4 bg-[#E5E0D5] mx-2" />

            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }}
              className="p-1.5 text-stone-500 hover:text-[#4A3225] hover:bg-[#E5E0D5] rounded-sm transition-colors flex items-center justify-center"
              title="Scene Break"
            >
              <Scissors className="w-4 h-4" />
            </button>
          </div>,
          portalTarget
        )}"""

content = re.sub(old_toolbar_block, new_toolbar_block, content, flags=re.DOTALL)

# Modify MenuButton style to match the header buttons
old_menu_btn = """const MenuButton = ({ action, isActive, children }: { action: () => void, isActive: boolean, children: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); action(); }}
    className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
      isActive ? 'bg-[#E5E0D5] text-[#4A3225] shadow-inner' : 'text-stone-500 hover:text-[#4A3225] hover:bg-[#F4F1EA]'
    }`}
  >
    {children}
  </button>
);"""

new_menu_btn = """const MenuButton = ({ action, isActive, children }: { action: () => void, isActive: boolean, children: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); action(); }}
    className={`p-1.5 rounded-sm flex items-center justify-center transition-colors ${
      isActive ? 'bg-[#E5E0D5] text-[#4A3225]' : 'text-stone-500 hover:text-[#4A3225] hover:bg-[#E5E0D5]'
    }`}
  >
    {children}
  </button>
);"""

content = content.replace(old_menu_btn, new_menu_btn)

with open('src/components/MentionEditor.tsx', 'w') as f:
    f.write(content)
