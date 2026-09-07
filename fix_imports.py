import re

with open('src/components/MentionEditor.tsx', 'r') as f:
    content = f.read()

# Fix the broken lucide-react import
broken_import = "AlignLeft, AlignCenter, AlignRight, AlignJustify, Sparkles \n} MessageSquare, \n} Scissors, \n} from 'lucide-react';"
fixed_import = "AlignLeft, AlignCenter, AlignRight, AlignJustify, Sparkles, MessageSquare, Scissors \n} from 'lucide-react';"

content = content.replace(broken_import, fixed_import)
# Just in case the previous string replace didn't match exactly, let's use regex
content = re.sub(r'\} MessageSquare, \n\} Scissors, \n\} from \'lucide-react\';', '', content)
content = re.sub(r'AlignJustify, Sparkles \n\} from \'lucide-react\';', fixed_import, content)

with open('src/components/MentionEditor.tsx', 'w') as f:
    f.write(content)
