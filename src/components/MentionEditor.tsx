import React, { useState, useRef, useEffect } from 'react';
import { MOCK_CHARACTERS } from '@/mockData';
import { Card } from '@/components/ui/card';

interface MentionEditorProps {
  initialValue: string;
  onEntityClick: (entityId: string, entityType: 'character' | 'location') => void;
  onChange?: (value: string) => void;
}

export default function MentionEditor({ initialValue, onEntityClick, onChange }: MentionEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const filteredCharacters = MOCK_CHARACTERS.filter(c => 
    c.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Sync when active scene changes
  useEffect(() => {
    setContent(initialValue);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    setContent(html);
    if (onChange) onChange(html);

    // Check for @
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || '';
    
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentions(true);
      savedSelectionRef.current = range.cloneRange();
      
      // Calculate position
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current?.getBoundingClientRect();
      if (editorRect) {
        setMentionPosition({
          top: rect.bottom - editorRect.top + 8,
          left: rect.left - editorRect.left
        });
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (char: typeof MOCK_CHARACTERS[0]) => {
    if (!savedSelectionRef.current || !editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;

    // Restore selection
    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);

    // Delete the @query text
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const startOffset = range.startOffset;
    
    const textContent = textNode.textContent || '';
    const matchIndex = textContent.lastIndexOf('@', startOffset);
    if (matchIndex !== -1) {
      range.setStart(textNode, matchIndex);
      range.deleteContents();
    }

    // Insert the mention badge
    const span = document.createElement('span');
    span.contentEditable = 'false';
    span.className = 'inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm';
    span.dataset.id = char.id;
    span.dataset.type = 'character';
    span.textContent = `@${char.name}`;
    
    range.insertNode(span);
    
    // Move cursor after span
    range.setStartAfter(span);
    range.setEndAfter(span);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Add a zero-width space after so user can continue typing normally
    const zws = document.createTextNode('\u200B');
    range.insertNode(zws);
    range.setStartAfter(zws);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    setShowMentions(false);
    const newHtml = editorRef.current.innerHTML;
    setContent(newHtml);
    if (onChange) onChange(newHtml);
  };

  // Event delegation for clicks on mentions
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'SPAN' && target.dataset.id && target.dataset.type) {
      onEntityClick(target.dataset.id, target.dataset.type as 'character' | 'location');
    }
  };

  return (
    <div className="relative h-full w-full">
      <div 
        ref={editorRef}
        className="w-full h-full p-8 outline-none font-serif text-lg leading-relaxed text-stone-800 overflow-y-auto"
        contentEditable
        onInput={handleInput}
        onClick={handleClick}
        suppressContentEditableWarning
        data-placeholder="Start writing chapter 1... Type @ to mention a character."
      />
      {content === '' && (
        <div className="absolute top-8 left-8 pointer-events-none text-stone-400 font-serif text-lg">
          Start writing chapter 1... Type @ to mention a character.
        </div>
      )}

      {showMentions && filteredCharacters.length > 0 && (
        <Card 
          className="absolute z-50 w-64 bg-[#F9F6ED] shadow-xl border-[#E5E0D5] rounded-xl overflow-hidden py-2"
          style={{ top: mentionPosition.top, left: mentionPosition.left }}
        >
          <div className="px-3 pb-2 mb-2 border-b border-[#E5E0D5] text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Link Entity
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCharacters.map(char => (
              <button
                key={char.id}
                className="w-full px-4 py-2 text-left hover:bg-[#E5E0D5] flex items-center gap-3 transition-colors"
                onClick={() => insertMention(char)}
              >
                <div className="w-6 h-6 rounded-full bg-[#D3BFA9] flex items-center justify-center text-[10px] font-serif text-stone-800">
                  {char.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">{char.name}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider">{char.role}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
