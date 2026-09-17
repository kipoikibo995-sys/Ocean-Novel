const fs = require('fs');
let code = fs.readFileSync('src/pages/ProjectOverview.tsx', 'utf8');

if (!code.includes('import { ExportModal }')) {
  code = code.replace(
    'import { storage } from "@/lib/storage";',
    'import { storage } from "@/lib/storage";\nimport { Download } from "lucide-react";\nimport { ExportModal } from "@/components/ExportModal";'
  );
}

if (!code.includes('const [showExportModal, setShowExportModal] = useState(false);')) {
  code = code.replace(
    '  const [coverUrl, setCoverUrl] = useState(',
    '  const [showExportModal, setShowExportModal] = useState(false);\n  const [coverUrl, setCoverUrl] = useState('
  );
}

const buttonsStr = `          <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col gap-3">
            <button
              onClick={() =>
                navigate(\`/project/\${(id || '1')}/workspace/studio\`)
              }
              className="w-full py-4 bg-[#965A5A] hover:bg-[#7A4A4A] text-white rounded-xl font-bold tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 uppercase text-sm group/btn"
            >
              <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              Open Studio
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-3 uppercase text-xs"
            >
              <Download className="w-4 h-4" />
              Export Manuscript
            </button>
          </div>`;

const originalButtonsStr = `          <div className="absolute bottom-8 left-8 right-8 z-20">
            <button
              onClick={() =>
                navigate(\`/project/\${(id || '1')}/workspace/studio\`)
              }
              className="w-full py-4 bg-[#965A5A] hover:bg-[#7A4A4A] text-white rounded-xl font-bold tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 uppercase text-sm group/btn"
            >
              <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              Open Studio
            </button>
          </div>`;

if (code.includes(originalButtonsStr)) {
  code = code.replace(originalButtonsStr, buttonsStr);
}

if (!code.includes('<ExportModal')) {
  code = code.replace(
    '    </div>\n  );\n}\n',
    '      <ExportModal\n        isOpen={showExportModal}\n        onClose={() => setShowExportModal(false)}\n        projectId={id || "1"}\n      />\n    </div>\n  );\n}\n'
  );
}

fs.writeFileSync('src/pages/ProjectOverview.tsx', code);
console.log("Patched successfully");
