import re

with open('src/mockData.ts', 'r') as f:
    content = f.read()

# Let's count words in MOCK_MANUSCRIPT
# The Arrival is ~275 words.
# The Old Lighthouse is ~25 words (if empty).
# Let's just set MOCK_PROJECT.currentWords to 284.

content = content.replace("currentWords: 42530,", "currentWords: 284,")
content = content.replace("progress: 61,", "progress: 1,")

with open('src/mockData.ts', 'w') as f:
    f.write(content)
