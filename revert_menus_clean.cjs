const fs = require('fs');
const content = `import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import tippy from 'tippy.js';
import { MOCK_CHARACTERS } from '@/mockData';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, 
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Sparkles 
} from 'lucide-react';

// Suggestion list component
const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-[#F9F6ED] shadow-xl border border-[#E5E0D5] rounded-xl overflow-hidden py-2 min-w-[240px] z-50">
      <div className="px-3 pb-2 mb-2 border-b border-[#E5E0D5] text-[10px] font-bold text-stone-400 uppercase tracking-widest">
        Link Character
      </div>
      {props.items.length ? (
        <div className="max-h-48 overflow-y-auto">
          {props.items.map((item: any, index: number) => (
            <button
              className={\`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors \${
                index === selectedIndex ? 'bg-[#E5E0D5]' : 'hover:bg-[#E5E0D5]/50'
              }\`}
              key={item.id}
              onClick={() => selectItem(index)}
            >
              <div className="w-6 h-6 rounded-full bg-[#D3BFA9] flex items-center justify-center text-[10px] font-serif text-stone-800">
                {item.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-800">{item.name}</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider">{item.role}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-2 text-sm text-stone-500">No result</div>
      )}
    </div>
  );
});
MentionList.displayName = 'MentionList';

// Suggestion configuration
const suggestion = {
  items: ({ query }: { query: string }) => {
    return MOCK_CHARACTERS.filter(item => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  },
  render: () => {
    let component: ReactRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup && popup[0]) popup[0].destroy();
        if (component) component.destroy();
      },
    };
  },
};

// Menu Button Component
function MenuButton({ children, action, isActive }: any) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        action();
      }}
      className={\`p-1.5 rounded-lg transition-colors \${
        isActive ? 'bg-[#8C503C] text-white shadow-inner' : 'text-stone-600 hover:bg-[#E5E0D5] hover:text-[#4A3225]'
      }\`}
      type="button"
    >
      {children}
    </button>
  );
}

// Main component
interface MentionEditorProps {
  initialValue: string;
  onEntityClick: (entityId: string, entityType: 'character' | 'location') => void;
  onChange?: (value: string) => void;
  className?: string;
}

export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '' }: MentionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Mention.configure({
        HTMLAttributes: {
          class: 'inline-flex items-center bg-[#8C503C]/10 text-[#8C503C] border border-[#8C503C]/20 rounded-md px-1.5 py-0 mx-0.5 font-bold cursor-pointer hover:bg-[#8C503C]/20 transition-colors select-none text-[0.9em] mention',
        },
        suggestion,
      }),
    ],
    content: initialValue,
    editorProps: {
      attributes: {
        class: \`prose prose-stone prose-lg max-w-none w-full h-full px-4 outline-none focus:outline-none overflow-y-auto pb-32\`,
        style: 'min-height: 100%;',
      },
      handleClick(view, pos, event) {
        const target = event.target as HTMLElement;
        if (target && target.classList.contains('mention')) {
          const id = target.getAttribute('data-id');
          if (id) {
            onEntityClick(id, 'character');
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync when active scene changes (initialValue changes)
  useEffect(() => {
    if (editor && initialValue !== editor.getHTML()) {
      setTimeout(() => {
        if (initialValue !== editor.getHTML()) {
          editor.commands.setContent(initialValue);
        }
      }, 0);
    }
  }, [initialValue, editor]);

  return (
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
}
`;
fs.writeFileSync('src/components/MentionEditor.tsx', content);
