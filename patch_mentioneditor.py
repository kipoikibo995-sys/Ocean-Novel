import re

with open("src/components/MentionEditor.tsx", "r") as f:
    content = f.read()

# Remove mock import
content = content.replace("import { MOCK_CHARACTERS } from '@/mockData';", "")

# Update MentionEditorProps
new_props = """interface MentionEditorProps {
  initialValue: string;
  onEntityClick: (entityId: string, entityType: 'character' | 'location') => void;
  onChange?: (value: string) => void;
  className?: string;
  mentionItems?: any[];
}"""
content = content.replace("""interface MentionEditorProps {
  initialValue: string;
  onEntityClick: (entityId: string, entityType: 'character' | 'location') => void;
  onChange?: (value: string) => void;
  className?: string;
}""", new_props)

content = content.replace("export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '' }: MentionEditorProps) {", 
                          "export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '', mentionItems = [] }: MentionEditorProps) {")


# Now we need to update Mention.configure to use dynamic mentionItems
# Currently suggestion is statically defined. We can modify `suggestion` to read from a global ref, or move suggestion inside the component.
# Moving suggestion inside the component might recreate the extension on every render, but useEditor doesn't react to extension changes unless we recreate the editor.
# Better way: Modify suggestion.items to read from a global variable, or just use a ref.
