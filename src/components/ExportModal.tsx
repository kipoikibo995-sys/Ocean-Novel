import { useState } from "react";
import { X, FileText, Download, CheckCircle, File, FileDown, BookOpen, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { storage } from "@/lib/storage";
import { ManuscriptItem } from "@/mockData";
import { exportToEpub } from "@/lib/epubExport";

type ExportFormat = "epub" | "docx" | "pdf" | "txt";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ExportModal({ isOpen, onClose, projectId }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("epub");
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [stripInternalMentions, setStripInternalMentions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const project = storage.getProjects().find((p) => p.id === projectId);
  const projectData = storage.getProjectData(projectId);

  /**
   * Cleans HTML and removes internal software @mentions (e.g. "@Lyra" -> "Lyra")
   * while preserving standard emails (e.g. "contact@author.com").
   */
  const cleanManuscriptText = (html: string, shouldStripMentions: boolean = true): string => {
    if (!html) return "";

    const container = document.createElement("div");
    container.innerHTML = html;

    if (shouldStripMentions) {
      // 1. Target TipTap mention nodes & custom mention tags
      const mentionElements = container.querySelectorAll(
        'span[data-type="mention"], span.mention, [data-mention="true"]'
      );
      mentionElements.forEach((el) => {
        let text = el.textContent || "";
        if (text.startsWith("@")) {
          text = text.substring(1);
        }
        el.textContent = text;
      });
    }

    // Replace block elements with clean line breaks
    const blockElements = container.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li");
    blockElements.forEach((el) => {
      el.appendChild(document.createTextNode("\n"));
    });

    const brElements = container.querySelectorAll("br");
    brElements.forEach((el) => {
      el.replaceWith(document.createTextNode("\n"));
    });

    let rawText = container.textContent || container.innerText || "";

    if (shouldStripMentions) {
      // 2. Strip any remaining inline @ mentions (e.g. "@Lyra turned around", "@Alden", "(@Kaelen)")
      // Preserves valid email addresses because @ in emails is preceded by word characters without space
      rawText = rawText.replace(
        /(^|[\s\(\[\{"'“‘—–\.,;:!?-])@([A-Za-z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/g,
        "$1$2"
      );
    }

    return rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
      .join("\n");
  };

  // Build a linear list of scenes from the nested manuscript
  const extractScenes = (
    items: ManuscriptItem[],
    shouldStripMentions: boolean = stripInternalMentions
  ): { title: string; content: string }[] => {
    let scenes: { title: string; content: string }[] = [];
    for (const item of items) {
      if (item.type === "scene" && item.content) {
        const cleanTitle = shouldStripMentions ? item.title.replace(/^@/, "").trim() : item.title;
        scenes.push({
          title: cleanTitle,
          content: cleanManuscriptText(item.content, shouldStripMentions),
        });
      }
      if (item.children) {
        scenes = scenes.concat(extractScenes(item.children, shouldStripMentions));
      }
    }
    return scenes;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setExportError(null);

    try {
      const manuscript = projectData?.manuscript || [];
      const title = project?.title || "Untitled Manuscript";
      const profile = storage.getUserProfile();
      const author = profile.penName || profile.name || "Author";

      const scenes = extractScenes(manuscript, stripInternalMentions);

      if (format === "epub") {
        await exportToEpub({
          title,
          author,
          includeTitlePage,
          chapters: scenes.map((s) => ({ title: s.title, content: s.content })),
        });
      } else if (format === "txt") {
        await exportTxt(scenes, title, author);
      } else if (format === "docx") {
        await exportDocx(scenes, title, author);
      } else if (format === "pdf") {
        await exportPdf(scenes, title, author);
      }

      setExportComplete(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => setExportComplete(false), 300);
      }, 1800);
    } catch (error: any) {
      console.error("Export failed", error);
      setExportError(error?.message || "An error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportTxt = async (
    scenes: { title: string; content: string }[],
    title: string,
    author: string
  ) => {
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

  const exportDocx = async (
    scenes: { title: string; content: string }[],
    title: string,
    author: string
  ) => {
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

      const paragraphs = scene.content.split("\n").filter((p) => p.trim());
      paragraphs.forEach((p) => {
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

  const exportPdf = async (
    scenes: { title: string; content: string }[],
    title: string,
    author: string
  ) => {
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
      const paragraphs = scene.content.split("\n").filter((p) => p.trim());
      paragraphs.forEach((p) => {
        htmlContent += `<p>${p}</p>`;
      });
    });

    htmlContent += `</body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

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
            className="relative w-full max-w-lg bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E5E0D5] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E5E0D5] bg-white/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8C503C]/10 text-[#8C503C] flex items-center justify-center font-bold">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-stone-900 leading-tight">
                    Export Manuscript
                  </h2>
                  <p className="text-[11px] text-stone-500 font-serif">
                    Publish-ready format for Kindle KDP, print, or developmental editing
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2.5">
                  Publishing Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* EPUB Option */}
                  <button
                    onClick={() => setFormat("epub")}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      format === "epub"
                        ? "border-[#8C503C] bg-[#8C503C]/10 text-[#8C503C] ring-1 ring-[#8C503C] shadow-xs"
                        : "border-[#E5E0D5] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span className="absolute -top-2 right-1.5 bg-[#8C503C] text-white text-[8px] font-bold font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs">
                      Kindle KDP
                    </span>
                    <BookOpen className="w-5 h-5 mt-1" />
                    <span className="text-xs font-bold font-mono uppercase">EPUB</span>
                    <span className="text-[9px] text-stone-500 font-sans">Amazon E-book</span>
                  </button>

                  {/* DOCX Option */}
                  <button
                    onClick={() => setFormat("docx")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      format === "docx"
                        ? "border-[#8C503C] bg-[#8C503C]/10 text-[#8C503C] ring-1 ring-[#8C503C] shadow-xs"
                        : "border-[#E5E0D5] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <FileText className="w-5 h-5 mt-1" />
                    <span className="text-xs font-bold font-mono uppercase">DOCX</span>
                    <span className="text-[9px] text-stone-500 font-sans">Word & Editors</span>
                  </button>

                  {/* PDF Option */}
                  <button
                    onClick={() => setFormat("pdf")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      format === "pdf"
                        ? "border-[#8C503C] bg-[#8C503C]/10 text-[#8C503C] ring-1 ring-[#8C503C] shadow-xs"
                        : "border-[#E5E0D5] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <File className="w-5 h-5 mt-1" />
                    <span className="text-xs font-bold font-mono uppercase">PDF</span>
                    <span className="text-[9px] text-stone-500 font-sans">Print & Proof</span>
                  </button>

                  {/* TXT Option */}
                  <button
                    onClick={() => setFormat("txt")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      format === "txt"
                        ? "border-[#8C503C] bg-[#8C503C]/10 text-[#8C503C] ring-1 ring-[#8C503C] shadow-xs"
                        : "border-[#E5E0D5] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <FileText className="w-5 h-5 mt-1" />
                    <span className="text-xs font-bold font-mono uppercase">TXT</span>
                    <span className="text-[9px] text-stone-500 font-sans">Plain Text</span>
                  </button>
                </div>
              </div>

              {/* Format Explanatory Note */}
              <div className="p-3 bg-white rounded-xl border border-[#E5E0D5] text-xs font-serif text-stone-600 space-y-1">
                {format === "epub" && (
                  <p className="leading-relaxed">
                    <strong className="text-[#8C503C]">EPUB (Electronic Publication)</strong> is the industry standard format required for uploading to <strong>Amazon Kindle Direct Publishing (KDP)</strong>, Apple Books, and Kobo. It includes automated Table of Contents (NCX & Nav) and reflowable typography.
                  </p>
                )}
                {format === "docx" && (
                  <p className="leading-relaxed">
                    <strong className="text-stone-800">Microsoft Word (.docx)</strong>: Ideal for sending to human developmental editors, line proofreaders, or importing into Kindle Create.
                  </p>
                )}
                {format === "pdf" && (
                  <p className="leading-relaxed">
                    <strong className="text-stone-800">Printable Document (.pdf)</strong>: Generates an automatic print preview layout with page breaks for physical manuscript proofreading.
                  </p>
                )}
                {format === "txt" && (
                  <p className="leading-relaxed">
                    <strong className="text-stone-800">Plain Text (.txt)</strong>: Lightweight, raw text file compatible with every text editor and archival system.
                  </p>
                )}
              </div>

              {/* Manuscript Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500">
                  Manuscript Publishing Options
                </label>

                {/* Option 1: Clean @ Mentions */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={stripInternalMentions}
                    onChange={(e) => setStripInternalMentions(e.target.checked)}
                    className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-[#8C503C]" />
                      <span>Remove Internal '@' Entity Mentions (Recommended for Publishing)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                      Automatically strips the <code className="text-[#8C503C] font-mono font-bold">@</code> symbol from internal tag mentions (e.g. <span className="font-mono text-stone-700">@Lyra</span> becomes <span className="font-mono text-emerald-800 font-bold">Lyra</span>, <span className="font-mono text-stone-700">@The Citadel</span> becomes <span className="font-mono text-emerald-800 font-bold">The Citadel</span>) while leaving email addresses intact.
                    </p>
                  </div>
                </label>

                {/* Option 2: Front Matter Title Page */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeTitlePage}
                    onChange={(e) => setIncludeTitlePage(e.target.checked)}
                    className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-stone-900">
                      Include Front Matter / Title Page
                    </div>
                    <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                      Adds an opening title page displaying the book title and author pen name.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-[#E5E0D5]/30 p-3.5 rounded-xl">
                <p className="text-xs text-stone-500 font-serif leading-relaxed">
                  Export will compile{" "}
                  <strong className="text-stone-800">
                    {extractScenes(projectData?.manuscript || [], stripInternalMentions).length} scenes
                  </strong>{" "}
                  totaling ~
                  <strong className="text-stone-800">
                    {project?.currentWords?.toLocaleString() || 0} words
                  </strong>
                  .
                </p>
              </div>

              {exportError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {exportError}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#E5E0D5] bg-white/70 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || exportComplete}
                className="flex-1 px-4 py-2.5 bg-[#8C503C] hover:bg-[#733D2D] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-70 cursor-pointer"
              >
                {exportComplete ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Ready & Downloaded
                  </>
                ) : isExporting ? (
                  <span className="animate-pulse">Building {format.toUpperCase()}...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export {format.toUpperCase()}
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
