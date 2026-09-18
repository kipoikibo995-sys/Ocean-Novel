import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import tippy from 'tippy.js';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, 
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, MessageSquare, Scissors 
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
              className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                index === selectedIndex ? 'bg-[#E5E0D5]' : 'hover:bg-[#E5E0D5]/50'
              }`}
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

let currentMentionItems: any[] = [];

const suggestion = {
  items: ({ query }: { query: string }) => {
    return currentMentionItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
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
        return (component.ref as any)?.onKeyDown(props);
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
      className={`p-1.5 rounded-lg transition-colors ${
        isActive ? 'bg-[#8C503C] text-white shadow-inner' : 'text-stone-600 hover:bg-[#E5E0D5] hover:text-[#4A3225]'
      }`}
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
  mentionItems?: any[];
}

export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '', mentionItems = [] }: MentionEditorProps) {
  useEffect(() => {
    currentMentionItems = mentionItems;
  }, [mentionItems]);
  currentMentionItems = mentionItems;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'justify' }),
      Mention.configure({
        HTMLAttributes: {
          class: 'text-[#8C503C] font-semibold cursor-pointer underline decoration-dotted underline-offset-4 decoration-[#8C503C]/40 hover:decoration-[#8C503C] transition-colors select-none mention',
        },
        suggestion,
      }),
    ],
    content: initialValue,
    editorProps: {
      attributes: {
        class: `prose prose-stone prose-lg max-w-none w-full h-full px-4 outline-none focus:outline-none overflow-y-auto pb-32`,
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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalTarget(document.getElementById('editor-toolbar-portal-target'));
  }, []);


  // Sync when active scene changes (initialValue changes)
  useEffect(() => {
    if (editor && !editor.isDestroyed && initialValue !== editor.getHTML()) {
      editor.commands.setContent(initialValue);
    }
  }, [initialValue, editor]);

  return (
    <div className={`flex flex-col h-full w-full bg-transparent overflow-hidden custom-editor-container ${className}`}>
      
      

      

      <div className="relative flex-grow overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
        
        {editor?.isEmpty && (
          <div className="absolute top-8 left-8 pointer-events-none text-stone-400 font-serif text-lg opacity-70">
            Start writing chapter 1... Type @ to mention a character.
          </div>
        )}

        {/* Static Header Toolbar via Portal */}
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
        )}
      </div>
    </div>
  );
}
