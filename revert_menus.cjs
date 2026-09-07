const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// Replace imports
code = code.replace(
  /import \{ useEditor, EditorContent, ReactRenderer \} from '@tiptap\/react';/,
  "import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';\nimport { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';"
);

// Replace the return statement
const newReturn = `return (
    <div className={\`flex flex-col h-full w-full bg-transparent overflow-hidden custom-editor-container \${className}\`}>
      
      {/* 1. BUBBLE MENU (Shows when text is selected) */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100, placement: 'top' }} 
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
        </BubbleMenu>
      )}

      {/* 2. FLOATING MENU (Shows on empty lines) */}
      {editor && (
        <FloatingMenu 
          editor={editor} 
          tippyOptions={{ duration: 100, placement: 'left' }} 
          className="flex items-center gap-1 p-1 bg-[#FCFAF5] border border-[#E5E0D5] rounded-xl shadow-lg z-50 -ml-10 transition-opacity"
        >
          <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-2 py-1 mr-1 border-r border-[#E5E0D5]">Thêm</div>
          <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}><Heading3 className="w-4 h-4" /></MenuButton>
          
          <div className="w-px h-5 bg-[#E5E0D5] mx-1" />
          
          <MenuButton action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></MenuButton>
          <MenuButton action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote className="w-4 h-4" /></MenuButton>
        </FloatingMenu>
      )}

      <div className="relative flex-grow overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
        
        {editor?.isEmpty && (
          <div className="absolute top-8 left-8 pointer-events-none text-stone-400 font-serif text-lg opacity-70">
            Start writing chapter 1... Type @ to mention a character.
          </div>
        )}
      </div>
    </div>
  );
}`;

code = code.replace(/return \(\s*<div className=\{`\\?flex flex-col[\s\S]*?<\/div>\s*\);\s*\}$/m, newReturn);
code = code.replace(/return \(\s*<div className=\{\`flex flex-col h-full w-full bg-transparent overflow-hidden custom-editor-container \$\{className\}\`\}>([\s\S]*?)\}\s*$/m, newReturn + '\n}');

fs.writeFileSync('src/components/MentionEditor.tsx', code);
