import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

old_outer = """<div className="relative pt-12 pb-0 px-2 sm:px-4 z-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar flex justify-start md:justify-center">
          {/* Container cho kệ sách, ôm sát content */}
          <div className="relative flex flex-col items-center shrink-0 min-w-min">"""

new_outer = """<div className="relative pt-12 pb-0 z-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
          {/* Container cho kệ sách trải dài */}
          <div className="relative flex flex-col shrink-0 min-w-full w-max">"""

content = content.replace(old_outer, new_outer)

old_inner = """<div className="flex items-end h-[280px] gap-[2px] lg:gap-[3px] pb-6 relative z-10 px-4">"""
new_inner = """<div className="flex items-end h-[280px] gap-[2px] lg:gap-[3px] pb-6 relative z-10 px-4 lg:px-8 justify-start">"""

content = content.replace(old_inner, new_inner)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)

print("Applied shelf left-align and stretch patch")
