import re

with open('src/pages/Plot.tsx', 'r') as f:
    content = f.read()

# 1. Remove AI Plot Generator button
gen_plot_btn = """          <Button className="bg-[#4A3225] text-[#F4F1EA] hover:bg-[#332218] rounded-sm text-xs px-4 h-9 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            AI Plot Generator
          </Button>"""
content = content.replace(gen_plot_btn, "")

with open('src/pages/Plot.tsx', 'w') as f:
    f.write(content)
