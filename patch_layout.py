import re

with open('src/components/layout/layouts.tsx', 'r') as f:
    content = f.read()

# Replace hardcoded 1 with dynamic param
content = content.replace('onClick={() => navigate("/project/1/settings")}', 'onClick={() => navigate(`/project/${location.pathname.split("/")[2] || "1"}/settings`)}')

with open('src/components/layout/layouts.tsx', 'w') as f:
    f.write(content)
