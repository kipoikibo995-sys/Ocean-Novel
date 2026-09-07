const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// add className to interface
code = code.replace(/onChange\?: \(value: string\) => void;/g, "onChange?: (value: string) => void;\n  className?: string;");

// add className to destructuring
code = code.replace(/export default function MentionEditor\({ initialValue, onEntityClick, onChange }: MentionEditorProps\) {/g, "export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '' }: MentionEditorProps) {");

// add className to div
code = code.replace(/className="w-full h-full p-8 outline-none font-serif text-lg leading-relaxed text-stone-800 overflow-y-auto"/g, 'className={`w-full h-full p-8 outline-none overflow-y-auto ${className}`}');

fs.writeFileSync('src/components/MentionEditor.tsx', code);
