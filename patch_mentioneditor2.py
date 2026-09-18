import re

with open("src/components/MentionEditor.tsx", "r") as f:
    content = f.read()

# Make suggestion dynamic
content = content.replace("""const suggestion = {
  items: ({ query }: { query: string }) => {
    return MOCK_CHARACTERS.filter(item => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  },""", """
let currentMentionItems: any[] = [];

const suggestion = {
  items: ({ query }: { query: string }) => {
    return currentMentionItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  },""")

content = content.replace("export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '', mentionItems = [] }: MentionEditorProps) {", 
"""export default function MentionEditor({ initialValue, onEntityClick, onChange, className = '', mentionItems = [] }: MentionEditorProps) {
  useEffect(() => {
    currentMentionItems = mentionItems;
  }, [mentionItems]);
  // Also set initially
  currentMentionItems = mentionItems;
""")

with open("src/components/MentionEditor.tsx", "w") as f:
    f.write(content)

print("MentionEditor patched fully")
