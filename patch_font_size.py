import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

helper_logic = """const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;
                
                const calculateFont = (maxW: number, defaultSize: number, charRatio: number = 0.8) => {
                  const size = Math.floor(maxW / (Math.max(1, proj.title.length) * charRatio));
                  const finalSize = Math.max(7.5, Math.min(defaultSize, size));
                  let tracking = '0.1em';
                  if (finalSize < 9) tracking = '0.05em';
                  else if (finalSize >= 11) tracking = '0.2em';
                  return { fontSize: `${finalSize}px`, letterSpacing: tracking };
                };
"""

content = content.replace("const isComplete = progressRatio >= 1 && (proj.wordGoal || 0) > 0;", helper_logic)

# Style 0
style0_old = """<span className={cn(
                              "font-serif text-[12px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 70}px`, textAlign: 'center' }}>"""
style0_new = """<span className={cn(
                              "font-serif font-bold uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 70}px`, textAlign: 'center', ...calculateFont(baseHeight - 70, 12) }}>"""
content = content.replace(style0_old, style0_new)

# Style 1
style1_old = """<span className={cn(
                              "font-serif text-[10px] font-bold tracking-[0.1em] text-[#2c1b13] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 64}px`, textAlign: 'center' }}>"""
style1_new = """<span className={cn(
                              "font-serif font-bold text-[#2c1b13] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 64}px`, textAlign: 'center', ...calculateFont(baseHeight - 64, 10, 0.75) }}>"""
content = content.replace(style1_old, style1_new)

# Style 2
style2_old = """<span className={cn(
                              "font-serif text-[12px] font-medium tracking-[0.15em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 100}px`, textAlign: 'center' }}>"""
style2_new = """<span className={cn(
                              "font-serif font-medium uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-[#ebdcd0]",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 100}px`, textAlign: 'center', ...calculateFont(baseHeight - 100, 12, 0.75) }}>"""
content = content.replace(style2_old, style2_new)


# Style 3
style3_old = """<span className={cn(
                              "font-serif text-[11px] font-bold tracking-[0.2em] uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-white/80",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 50}px`, textAlign: 'center' }}>"""
style3_new = """<span className={cn(
                              "font-serif font-bold uppercase transform -rotate-90 origin-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity inline-block duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              isComplete ? "text-[#e8c678]" : "text-white/80",
                              isSelected ? "opacity-0" : "opacity-100"
                            )} style={{ width: `${baseHeight - 50}px`, textAlign: 'center', ...calculateFont(baseHeight - 50, 11) }}>"""
content = content.replace(style3_old, style3_new)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
print("Font sizes patched")
