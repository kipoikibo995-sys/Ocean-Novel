const fs = require('fs');
let code = fs.readFileSync('src/pages/WritingStudio.tsx', 'utf8');

// Trong WritingStudio.tsx, khu vực chứa Editor cũng đang có viền
// "bg-[#F9F6ED] flex-grow rounded-2xl overflow-hidden shadow-inner border border-[#E5E0D5]"
// Hãy đổi thành nền phẳng, bỏ viền
code = code.replace(
  /className="bg-\\[#F9F6ED\\] flex-grow rounded-2xl overflow-hidden shadow-inner border border-\\[#E5E0D5\\]"/,
  "className=\"bg-transparent flex-grow overflow-hidden flex flex-col relative\""
);

// Bỏ shadow-inner và viền ở container chính nếu cần
// code = code.replace(
//   /className="flex-grow flex gap-4 overflow-hidden p-4"/,
//   "className=\"flex-grow flex gap-8 overflow-hidden p-6\""
// );

fs.writeFileSync('src/pages/WritingStudio.tsx', code);
