const fs = require('fs');
let code = fs.readFileSync('src/components/MentionEditor.tsx', 'utf8');

// Loại bỏ hoàn toàn bg-white, border, rounded-xl ở container chính. 
// Chú ý regex bắt \flex bị lỗi, ta dùng thay thế chuỗi linh hoạt hơn:
code = code.replace(
  /<div className=\{\`\\?flex flex-col h-full w-full bg-white border border-\\[#E5E0D5\\] rounded-xl overflow-hidden custom-editor-container \$\{className\}\\?`\}>/,
  "<div className={`flex flex-col h-full w-full bg-transparent overflow-hidden custom-editor-container ${className}`}>"
);

// Bỏ background của Toolbar, làm cho nó sticky (tuỳ chọn) hoặc chỉ là thanh mờ
code = code.replace(
  /<div className="flex flex-wrap items-center gap-1 p-2 bg-\\[#FCFAF5\\] border-b border-\\[#E5E0D5\\]">/,
  "<div className=\"flex flex-wrap items-center gap-1 py-3 px-4 bg-transparent border-b border-stone-200/50 mb-4 sticky top-0 z-10 backdrop-blur-sm\">"
);

// Mở rộng EditorContent để nó bung đều ra
code = code.replace(
  /class: `\\?prose prose-stone prose-lg max-w-none w-full h-full p-8 outline-none focus:outline-none overflow-y-auto\\?`,/,
  "class: `prose prose-stone prose-lg max-w-none w-full h-full px-4 outline-none focus:outline-none overflow-y-auto pb-32`,"
);


fs.writeFileSync('src/components/MentionEditor.tsx', code);
