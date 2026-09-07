import re

with open('src/pages/CreateProject.tsx', 'r') as f:
    content = f.read()

# Change navigation after create
content = content.replace('navigate("/project/1");', 'navigate("/project/1/workspace/studio");')

# Change handleBack navigation to Dashboard
content = content.replace('navigate(-1);', 'navigate("/dashboard");')
content = content.replace('Back to Studio', 'Back to Dashboard')

with open('src/pages/CreateProject.tsx', 'w') as f:
    f.write(content)
