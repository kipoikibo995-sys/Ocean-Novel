import { useState } from "react";
import { X, FileText, Download, CheckCircle, File, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { storage } from "@/lib/storage";
import { ManuscriptItem } from "@/mockData";

type ExportFormat = "pdf" | "docx" | "txt";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ExportModal({ isOpen, onClose, projectId }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("docx");
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const project = storage.getProjects().find((p) => p.id === projectId);
  const projectData = storage.getProjectData(projectId);

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      const manuscript = projectData?.manuscript || [];
      const title = project?.title || "Untitled Manuscript";
      const profile = storage.getUserProfile();
      const author = profile.penName || profile.name || "Author";

      if (format === "txt") {
        await exportTxt(manuscript, title, author);
      } else if (format === "docx") {
        await exportDocx(manuscript, title, author);
      } else if (format === "pdf") {
        await exportPdf(manuscript, title, author);
      }

      setExportComplete(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => setExportComplete(false), 300);
      }, 2000);
    } catch (error) {
      console.error("Export failed", error);
      alert("An error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Build a linear list of scenes from the nested manuscript
  const extractScenes = (items: ManuscriptItem[]): { title: string; content: string }[] => {
    let scenes: { title: string; content: string }[] = [];
    for (const item of items) {
      if (item.type === "scene" && item.content) {
        scenes.push({ title: item.title, content: stripHtml(item.content) });
      }
      if (item.children) {
        scenes = scenes.concat(extractScenes(item.children));
      }
    }
    return scenes;
  };

  const exportTxt = async (manuscript: ManuscriptItem[], title: string, author: string) => {
    const scenes = extractScenes(manuscript);
    let content = "";

    if (includeTitlePage) {
      content += `\n\n\n\n`;
      content += `${title.toUpperCase()}\n\n`;
      content += `By ${author}\n\n\n\n`;
      content += `=========================================\n\n\n`;
    }

    scenes.forEach((scene, index) => {
      content += `Chapter ${index + 1}: ${scene.title}\n\n`;
      content += `${scene.content}\n\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${title.replace(/\s+/g, "_")}.txt`);
  };

  const exportDocx = async (manuscript: ManuscriptItem[], title: string, author: string) => {
    const scenes = extractScenes(manuscript);
    const children = [];

    if (includeTitlePage) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 48 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 4000, after: 400 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `By ${author}`, size: 28 })],
          alignment: AlignmentType.CENTER,
        })
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    scenes.forEach((scene, index) => {
      children.push(
        new Paragraph({
          text: `Chapter ${index + 1}: ${scene.title}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 400 },
        })
      );
      
      const paragraphs = scene.content.split('\n').filter(p => p.trim());
      paragraphs.forEach(p => {
        children.push(
          new Paragraph({
            text: p,
            spacing: { after: 200 },
          })
        );
      });
      children.push(new Paragraph({ children: [new PageBreak()] }));
    });

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
  };

  const exportPdf = async (manuscript: ManuscriptItem[], title: string, author: string) => {
    // For PDF, we'll create a temporary iframe and use window.print to export it as PDF
    // A more robust solution could use jspdf, but this provides good native styling.
    const scenes = extractScenes(manuscript);
    
    let htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; color: black; }
            h1 { text-align: center; font-size: 2.5em; margin-top: 20vh; margin-bottom: 0.5em; }
            .author { text-align: center; font-size: 1.5em; margin-bottom: 30vh; page-break-after: always; }
            h2 { page-break-before: always; font-size: 1.8em; margin-bottom: 1em; }
            p { margin-bottom: 1em; text-indent: 1.5em; }
            p:first-of-type { text-indent: 0; }
            @media print {
              body { padding: 0; }
              @page { margin: 1in; }
            }
          </style>
        </head>
        <body>
    `;

    if (includeTitlePage) {
      htmlContent += `
        <h1>${title.toUpperCase()}</h1>
        <div class="author">By ${author}</div>
      `;
    }

    scenes.forEach((scene, index) => {
      htmlContent += `<h2>Chapter ${index + 1}: ${scene.title}</h2>`;
      const paragraphs = scene.content.split('\n').filter(p => p.trim());
      paragraphs.forEach(p => {
        htmlContent += `<p>${p}</p>`;
      });
    });

    htmlContent += `</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[#F4F1EA] rounded-2xl shadow-2xl border border-[#E5E0D5] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E5E0D5] bg-white/50">
              <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#965A5A]" /> Export Manuscript
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFormat("docx")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      format === "docx"
                        ? "border-[#965A5A] bg-[#965A5A]/5 text-[#965A5A]"
                        : "border-[#E5E0D5] bg-white text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase">DOCX</span>
                  </button>
                  <button
                    onClick={() => setFormat("pdf")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      format === "pdf"
                        ? "border-[#965A5A] bg-[#965A5A]/5 text-[#965A5A]"
                        : "border-[#E5E0D5] bg-white text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <File className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase">PDF</span>
                  </button>
                  <button
                    onClick={() => setFormat("txt")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      format === "txt"
                        ? "border-[#965A5A] bg-[#965A5A]/5 text-[#965A5A]"
                        : "border-[#E5E0D5] bg-white text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase">TXT</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
                  Options
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeTitlePage}
                    onChange={(e) => setIncludeTitlePage(e.target.checked)}
                    className="w-4 h-4 text-[#965A5A] rounded border-stone-300 focus:ring-[#965A5A]"
                  />
                  <span className="text-sm font-medium text-stone-700">Include Title Page</span>
                </label>
              </div>

              <div className="bg-[#E5E0D5]/30 p-4 rounded-xl">
                <p className="text-xs text-stone-500 leading-relaxed">
                  Export includes {extractScenes(projectData?.manuscript || []).length} scenes totaling ~{project?.currentWords?.toLocaleString() || 0} words.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-[#E5E0D5] bg-white/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || exportComplete}
                className="flex-1 px-4 py-2 bg-[#965A5A] text-white text-sm font-bold rounded-lg hover:bg-[#7A4A4A] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {exportComplete ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Done
                  </>
                ) : isExporting ? (
                  <span className="animate-pulse">Exporting...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
