const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// Thay đổi className của container để bỏ viền và làm nền trong suốt
code = code.replace(
  /<div className={`\\flex flex-col h-full w-full bg-white border border-\\[#E5E0D5\\] rounded-xl overflow-hidden custom-editor-container \$\{className\}\\`}>/,
  "<div className={`flex flex-col h-full w-full bg-transparent overflow-hidden custom-editor-container ${className}`}>"
);

// Thay đổi className của toolbar để nó hòa vào nền tốt hơn, bỏ viền, thêm padding nhẹ
code = code.replace(
  /<div className="flex flex-wrap items-center gap-1 p-2 bg-\\[#FCFAF5\\] border-b border-\\[#E5E0D5\\]">/,
  "<div className=\"flex flex-wrap items-center gap-1 py-3 px-6 bg-transparent border-b border-stone-200/50 mb-4\">"
);

// Cập nhật className của thẻ bao bọc EditorContent để rộng rãi hơn
code = code.replace(
  /class: `\\prose prose-stone prose-lg max-w-none w-full h-full p-8 outline-none focus:outline-none overflow-y-auto\\`,/,
  "class: `prose prose-stone prose-lg max-w-3xl mx-auto w-full h-full p-6 outline-none focus:outline-none overflow-y-auto pb-32`,"
);


fs.writeFileSync('src/components/MentionEditor.tsx', code);
