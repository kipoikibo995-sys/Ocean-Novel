import re

with open('src/pages/WritingStudio.tsx', 'r') as f:
    content = f.read()

old_title_rendering = r'<span className=\{`text-xs truncate \$\{isFolder \? \'font-bold uppercase tracking-widest text-\[9px\]\' : \'font-medium\'\}`\}>\n\s*\{item\.title\}\n\s*</span>'

new_title_rendering = """{isFolder && item.title.includes(':') ? (
                  <div className="flex flex-col flex-1 min-w-0 pr-1">
                    <span className="font-bold uppercase tracking-widest text-[8px] text-stone-400">
                      {item.title.split(':')[0]}:
                    </span>
                    <span className="font-bold uppercase tracking-widest text-[10px] text-[#4A3225] leading-tight mt-0.5">
                      {item.title.substring(item.title.indexOf(':') + 1).trim()}
                    </span>
                  </div>
                ) : (
                  <span className={`text-xs ${isFolder ? 'font-bold uppercase tracking-widest text-[9px] whitespace-normal leading-tight' : 'font-medium truncate'} flex-1`}>
                    {item.title}
                  </span>
                )}"""

content = re.sub(old_title_rendering, new_title_rendering, content)

with open('src/pages/WritingStudio.tsx', 'w') as f:
    f.write(content)
