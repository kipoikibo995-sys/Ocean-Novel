with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

content = content.replace("        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}", "        </section>\n\n        {/* SECTION 2: STUDIO INTELLIGENCE (Bento Grid) */}")

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
