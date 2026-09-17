import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Remove overflow-hidden text-ellipsis and replace with overflow-visible
content = content.replace("overflow-hidden text-ellipsis", "overflow-visible")

# If there's inline-block, keep it or let it be. Wait, let's just make it block or inline-block, doesn't matter much.
# Let's add minWidth so it doesn't get squished by flexbox.
# style={{ width: `${baseHeight - 70}px`, textAlign: 'center', ...calculateFont(baseHeight - 70, 12) }}>

content = re.sub(
    r"width: `\$\{baseHeight - (\d+)\}px`",
    r"width: `${baseHeight - \1}px`, minWidth: `${baseHeight - \1}px`",
    content
)

# And to make sure calculateFont is aggressive enough to fit everything:
old_calc = """const calculateFont = (maxW: number, defaultSize: number, charRatio: number = 0.8) => {
                  const size = Math.floor(maxW / (Math.max(1, proj.title.length) * charRatio));
                  const finalSize = Math.max(7.5, Math.min(defaultSize, size));
                  let tracking = '0.1em';
                  if (finalSize < 9) tracking = '0.05em';
                  else if (finalSize >= 11) tracking = '0.2em';
                  return { fontSize: `${finalSize}px`, letterSpacing: tracking };
                };"""

new_calc = """const calculateFont = (maxW: number, defaultSize: number, charRatio: number = 0.8) => {
                  // A more aggressive scaling to ensure it fits
                  // Calculate required font size based on string length and available width.
                  // Average character width is approx 0.6 of font size for serif bold.
                  // Add tracking to the character width.
                  const estimatedCharWidthMultiplier = 0.6;
                  const estimatedWidth = proj.title.length * (defaultSize * estimatedCharWidthMultiplier);
                  let finalSize = defaultSize;
                  let tracking = '0.15em';
                  
                  if (estimatedWidth > maxW) {
                     finalSize = Math.max(7, Math.floor((maxW / proj.title.length) / estimatedCharWidthMultiplier));
                     tracking = '0.05em';
                  }
                  
                  if (finalSize < 8.5) tracking = '0em';

                  return { fontSize: `${finalSize}px`, letterSpacing: tracking };
                };"""

content = content.replace(old_calc, new_calc)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
print("Fixed spine text truncation issue")
