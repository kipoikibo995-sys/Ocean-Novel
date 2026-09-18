import re

with open("src/pages/WritingStudio.tsx", "r") as f:
    content = f.read()

# Pass mentionItems to MentionEditor
content = content.replace("<MentionEditor \n                key={activeDocId}\n                initialValue={activeContent}",
"""<MentionEditor 
                key={activeDocId}
                initialValue={activeContent}
                mentionItems={[...characters, ...locations]}""")

with open("src/pages/WritingStudio.tsx", "w") as f:
    f.write(content)
print("WritingStudio mentions patched")
