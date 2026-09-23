import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  CheckCircle,
  File,
  FileDown,
  BookOpen,
  AtSign,
  Shield,
  List,
  Heart,
  Sliders,
  RotateCcw,
  Sparkles,
  ExternalLink,
  BookCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { storage, FrontBackMatterData } from "@/lib/storage";
import { ManuscriptItem } from "@/mockData";
import { exportToEpub, cleanContentToParagraphs, parseChapterHeading } from "@/lib/epubExport";

type ExportFormat = "epub" | "docx" | "pdf" | "txt";
type ActiveTab = "format" | "matter";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ExportModal({ isOpen, onClose, projectId }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("format");
  const [format, setFormat] = useState<ExportFormat>("epub");
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [includeCopyright, setIncludeCopyright] = useState(true);
  const [includeTocPage, setIncludeTocPage] = useState(true);
  const [includeAboutAuthor, setIncludeAboutAuthor] = useState(true);
  const [includeAcknowledgments, setIncludeAcknowledgments] = useState(false);
  const [stripInternalMentions, setStripInternalMentions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const project = storage.getProjects().find((p) => p.id === projectId);
  const projectData = storage.getProjectData(projectId);
  const profile = storage.getUserProfile();

  const authorFallback = profile.penName || profile.name || "Author";
  const defaultYear = new Date().getFullYear().toString();

  const defaultMatter: FrontBackMatterData = {
    subtitle: "",
    publisher: "Ocean Novel Studio",
    edition: `First Digital Edition: ${defaultYear}`,
    copyrightYear: defaultYear,
    copyrightOwner: authorFallback,
    isbn: "",
    asin: "",
    disclaimerText:
      "This is a work of fiction. Names, characters, places, and incidents either are the product of the author's imagination or are used fictitiously. Any resemblance to actual persons, living or dead, events, or locales is entirely coincidental.",
    dedication: "",
    acknowledgmentsText:
      "To all the readers, early reviewers, and fellow storytellers who supported this journey from the very first draft. Thank you for bringing these characters to life in your imagination.",
    authorPenName: authorFallback,
    authorBioText:
      profile.bio ||
      `${authorFallback} is an independent author and novelist crafting immersive stories. When not writing the next chapter, you can find them plotting new worlds and connecting with readers worldwide.`,
    authorWebsiteOrNewsletter: "",
    reviewCtaHeading: "A Sincere Note to the Reader",
    reviewCtaText:
      `Thank you for reading ${project?.title || "this book"}! If you enjoyed this journey, please consider leaving an honest review on Amazon or Goodreads. Reviews are the lifeblood of independent authors and help fellow book lovers discover great new stories.`,
  };

  const [matter, setMatter] = useState<FrontBackMatterData>(
    projectData?.frontBackMatter || defaultMatter
  );

  useEffect(() => {
    if (projectData?.frontBackMatter) {
      setMatter(projectData.frontBackMatter);
    } else {
      setMatter(defaultMatter);
    }
  }, [projectId]);

  const updateMatterField = (key: keyof FrontBackMatterData, value: string) => {
    const updated = { ...matter, [key]: value };
    setMatter(updated);
    storage.saveProjectData(projectId, { frontBackMatter: updated });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetToStandard = () => {
    if (window.confirm("Reset all Front & Back Matter to standard publishing defaults?")) {
      setMatter(defaultMatter);
      storage.saveProjectData(projectId, { frontBackMatter: defaultMatter });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  /**
   * Cleans HTML and removes internal software @mentions (e.g. "@Lyra" -> "Lyra")
   */
  const cleanManuscriptText = (html: string, shouldStripMentions: boolean = true): string => {
    if (!html) return "";

    const container = document.createElement("div");
    container.innerHTML = html;

    if (shouldStripMentions) {
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

  interface ExportChapter {
    numberText: string;
    titleText: string;
    fullTitle: string;
    paragraphs: string[];
  }

  // Build structured list of chapters with title deduplication for Word, PDF, TXT
  const extractChaptersForExport = (
    items: ManuscriptItem[],
    shouldStripMentions: boolean = stripInternalMentions
  ): ExportChapter[] => {
    const chapters: ExportChapter[] = [];
    let count = 0;

    const traverse = (itemList: ManuscriptItem[]) => {
      for (const item of itemList) {
        if (item.type === "chapter") {
          count++;
          const rawTitle = shouldStripMentions ? item.title.replace(/^@/, "").trim() : item.title;
          const headingInfo = parseChapterHeading(rawTitle, count);
          const filterList = [item.title, headingInfo.numberText, headingInfo.titleText, headingInfo.fullTitle];

          let paras: string[] = [];
          if (item.content && item.content.trim()) {
            paras = paras.concat(cleanContentToParagraphs(item.content, shouldStripMentions, filterList));
          }
          if (item.children && item.children.length > 0) {
            item.children.forEach((child) => {
              if (child.content && child.content.trim()) {
                paras = paras.concat(
                  cleanContentToParagraphs(child.content, shouldStripMentions, [...filterList, child.title])
                );
              }
            });
          }

          chapters.push({
            numberText: headingInfo.numberText,
            titleText: headingInfo.titleText,
            fullTitle: headingInfo.fullTitle,
            paragraphs: paras,
          });
        } else if (item.type === "scene" && item.content && item.content.trim()) {
          count++;
          const rawTitle = shouldStripMentions ? item.title.replace(/^@/, "").trim() : item.title;
          const headingInfo = parseChapterHeading(rawTitle, count);
          chapters.push({
            numberText: headingInfo.numberText,
            titleText: headingInfo.titleText,
            fullTitle: headingInfo.fullTitle,
            paragraphs: cleanContentToParagraphs(item.content, shouldStripMentions, [
              rawTitle,
              headingInfo.numberText,
              headingInfo.titleText,
              headingInfo.fullTitle,
            ]),
          });
        } else if (item.type === "part" && item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(items);
    return chapters;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setExportError(null);

    try {
      const manuscript = projectData?.manuscript || [];
      const title = project?.title || "Untitled Manuscript";
      const author = matter.authorPenName || authorFallback;
      const exportChapters = extractChaptersForExport(manuscript, stripInternalMentions);

      if (format === "epub") {
        await exportToEpub({
          title,
          subtitle: matter.subtitle,
          author,
          coverImageUrl: project?.coverUrl,
          genre: project?.genre,
          includeTitlePage,
          includeCopyright,
          includeTocPage,
          includeAboutAuthor,
          includeAcknowledgments,
          authorBio: matter.authorBioText,
          manuscript,
          stripInternalMentions,
          matter,
        });
      } else if (format === "txt") {
        await exportTxt(exportChapters, title, author);
      } else if (format === "docx") {
        await exportDocx(exportChapters, title, author);
      } else if (format === "pdf") {
        await exportPdf(exportChapters, title, author);
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
    chapters: ExportChapter[],
    title: string,
    author: string
  ) => {
    let content = "";

    if (includeTitlePage) {
      content += `\n\n\n\n`;
      content += `${title.toUpperCase()}\n`;
      if (matter.subtitle) content += `${matter.subtitle}\n`;
      content += `\nBy ${author}\n\n`;
      if (matter.publisher) content += `Published by ${matter.publisher}\n`;
      content += `\n\n=========================================\n\n\n`;
    }

    if (includeCopyright) {
      content += `Copyright © ${matter.copyrightYear || defaultYear} by ${matter.copyrightOwner || author}\n`;
      if (matter.isbn) content += `ISBN: ${matter.isbn}\n`;
      if (matter.asin) content += `ASIN: ${matter.asin}\n`;
      content += `\n${matter.disclaimerText}\n\n`;
      content += `=========================================\n\n\n`;
    }

    chapters.forEach((chap) => {
      content += `${chap.fullTitle}\n\n`;
      chap.paragraphs.forEach((p) => {
        content += `${p}\n\n`;
      });
      content += `\n=========================================\n\n`;
    });

    if (includeAboutAuthor) {
      content += `\n=========================================\n\nABOUT THE AUTHOR\n\n`;
      content += `${author}\n\n${matter.authorBioText}\n\n`;
      if (matter.authorWebsiteOrNewsletter) {
        content += `Newsletter: ${matter.authorWebsiteOrNewsletter}\n\n`;
      }
      content += `-----------------------------------------\n`;
      content += `${matter.reviewCtaHeading}\n\n${matter.reviewCtaText}\n\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${title.replace(/\s+/g, "_")}.txt`);
  };

  const exportDocx = async (
    chapters: ExportChapter[],
    title: string,
    author: string
  ) => {
    const children = [];

    if (includeTitlePage) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 48 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 4000, after: matter.subtitle ? 200 : 400 },
        })
      );
      if (matter.subtitle) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: matter.subtitle, italics: true, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `By ${author}`, size: 28 })],
          alignment: AlignmentType.CENTER,
        })
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    if (includeCopyright) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${title}`, bold: true, size: 24 })],
          spacing: { before: 2000, after: 200 },
        })
      );
      children.push(
        new Paragraph({
          text: `Copyright © ${matter.copyrightYear || defaultYear} by ${matter.copyrightOwner || author}`,
          spacing: { after: 200 },
        })
      );
      if (matter.isbn) {
        children.push(new Paragraph({ text: `ISBN: ${matter.isbn}`, spacing: { after: 100 } }));
      }
      if (matter.disclaimerText) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: matter.disclaimerText, italics: true, size: 20 })],
            spacing: { after: 400 },
          })
        );
      }
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    chapters.forEach((chap) => {
      if (chap.numberText && chap.titleText) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chap.numberText,
                bold: true,
                size: 24,
                color: "8C503C",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 100 },
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chap.titleText,
                bold: true,
                size: 34,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chap.fullTitle,
                bold: true,
                size: 34,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 600 },
          })
        );
      }

      chap.paragraphs.forEach((p, pIdx) => {
        children.push(
          new Paragraph({
            text: p,
            indent: pIdx === 0 ? undefined : { firstLine: 400 },
            spacing: { after: 200 },
          })
        );
      });
      children.push(new Paragraph({ children: [new PageBreak()] }));
    });

    if (includeAboutAuthor) {
      children.push(
        new Paragraph({
          text: "About the Author",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 400 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: author, bold: true, size: 28 })],
          spacing: { after: 200 },
        })
      );
      if (matter.authorBioText) {
        children.push(
          new Paragraph({
            text: matter.authorBioText,
            spacing: { after: 400 },
          })
        );
      }
      if (matter.reviewCtaText) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: matter.reviewCtaHeading || "Note to Readers:", bold: true }),
              new TextRun({ text: ` ${matter.reviewCtaText}`, italics: true }),
            ],
            spacing: { before: 400, after: 200 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
  };

  const exportPdf = async (
    chapters: ExportChapter[],
    title: string,
    author: string
  ) => {
    let htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; color: black; }
            h1 { text-align: center; font-size: 2.5em; margin-top: 20vh; margin-bottom: 0.2em; }
            .subtitle { text-align: center; font-style: italic; font-size: 1.3em; margin-bottom: 1em; color: #444; }
            .author { text-align: center; font-size: 1.5em; margin-bottom: 30vh; page-break-after: always; }
            .copyright-page { padding-top: 30vh; font-size: 0.9em; page-break-after: always; }
            h2 { page-break-before: always; font-size: 1.8em; margin-bottom: 1em; }
            p { margin-bottom: 1em; text-indent: 1.5em; text-align: justify; }
            p:first-of-type { text-indent: 0; }
            .about-author { page-break-before: always; padding-top: 5vh; }
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
        ${matter.subtitle ? `<div class="subtitle">${matter.subtitle}</div>` : ""}
        <div class="author">By ${author}</div>
      `;
    }

    if (includeCopyright) {
      htmlContent += `
        <div class="copyright-page">
          <p style="font-weight: bold; text-indent: 0;">${title}</p>
          <p style="text-indent: 0;">Copyright © ${matter.copyrightYear || defaultYear} by ${matter.copyrightOwner || author}</p>
          ${matter.isbn ? `<p style="text-indent: 0;">ISBN: ${matter.isbn}</p>` : ""}
          <p style="text-indent: 0; font-style: italic;">${matter.disclaimerText}</p>
          <p style="text-indent: 0;">Published by ${matter.publisher}</p>
        </div>
      `;
    }

    chapters.forEach((chap) => {
      htmlContent += `
        <div style="page-break-before: always; padding-top: 5vh;">
          ${chap.numberText ? `<div style="text-align: center; color: #8C503C; font-weight: bold; letter-spacing: 2px; font-size: 0.9em; text-transform: uppercase;">${chap.numberText}</div>` : ""}
          <h2 style="text-align: center; margin-top: 6px; margin-bottom: 35px; font-weight: normal; font-size: 1.85em;">${chap.titleText || chap.fullTitle}</h2>
      `;
      chap.paragraphs.forEach((p, pIdx) => {
        const indent = pIdx === 0 ? "text-indent: 0;" : "text-indent: 1.5em;";
        htmlContent += `<p style="${indent} margin-bottom: 0.8em; text-align: justify;">${p}</p>`;
      });
      htmlContent += `</div>`;
    });

    if (includeAboutAuthor) {
      htmlContent += `
        <div class="about-author">
          <h2 style="text-align: center;">About the Author</h2>
          <p style="font-size: 1.2em; font-weight: bold; text-indent: 0;">${author}</p>
          <p style="text-indent: 0;">${matter.authorBioText}</p>
          <div style="margin-top: 2em; padding: 15px; border: 1px solid #ccc; background: #fafafa;">
            <p style="font-weight: bold; text-indent: 0; margin-bottom: 5px;">${matter.reviewCtaHeading}</p>
            <p style="font-style: italic; text-indent: 0;">${matter.reviewCtaText}</p>
          </div>
        </div>
      `;
    }

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
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E5E0D5] overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E0D5] bg-white/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8C503C]/10 text-[#8C503C] flex items-center justify-center font-bold">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-stone-900 leading-tight">
                    Export Novel Studio
                  </h2>
                  <p className="text-[11px] text-stone-500 font-serif">
                    Professional KDP EPUB 3, Print PDF, and Editorial DOCX
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {savedNotice && (
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 animate-pulse">
                    <CheckCircle className="w-3 h-3" /> Auto-saved
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#E5E0D5] bg-stone-100/70 px-4 pt-2 gap-2 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("format")}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "format"
                    ? "border-[#8C503C] text-[#8C503C]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Format & Scope</span>
              </button>

              <button
                onClick={() => setActiveTab("matter")}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "matter"
                    ? "border-[#8C503C] text-[#8C503C]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8C503C]" />
                <span>Customize Pages (Front & Back Matter)</span>
                <span className="bg-[#8C503C]/15 text-[#8C503C] text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                  KDP Ready
                </span>
              </button>
            </div>

            {/* Tab 1: Format & Scope */}
            {activeTab === "format" && (
              <div className="p-6 space-y-5 overflow-y-auto">
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
                        Gold KDP
                      </span>
                      <BookOpen className="w-5 h-5 mt-1" />
                      <span className="text-xs font-bold font-mono uppercase">EPUB 3</span>
                      <span className="text-[9px] text-stone-500 font-sans">Kindle & E-book</span>
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
                <div className="p-3.5 bg-white rounded-xl border border-[#E5E0D5] text-xs font-serif text-stone-600 space-y-1">
                  {format === "epub" && (
                    <p className="leading-relaxed">
                      <strong className="text-[#8C503C]">EPUB 3.3 Gold Package</strong>: Generates the strict commercial structure (<code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">EPUB/package.opf</code>, <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">text/</code>, <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">css/</code>, <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">images/</code>) with dual navigation (EPUB 3 Nav + Kindle NCX), Start Reading Location landmarks, and typography tailored for Kindle devices.
                    </p>
                  )}
                  {format === "docx" && (
                    <p className="leading-relaxed">
                      <strong className="text-stone-800">Microsoft Word (.docx)</strong>: Ideal for developmental editors, line proofreaders, or importing into Kindle Create.
                    </p>
                  )}
                  {format === "pdf" && (
                    <p className="leading-relaxed">
                      <strong className="text-stone-800">Printable Document (.pdf)</strong>: Generates an automatic print layout with page breaks for proofreading.
                    </p>
                  )}
                  {format === "txt" && (
                    <p className="leading-relaxed">
                      <strong className="text-stone-800">Plain Text (.txt)</strong>: Lightweight, raw text file compatible with every text editor.
                    </p>
                  )}
                </div>

                {/* Scope & Checkboxes */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500">
                    Included Sections & Publishing Controls
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
                        <span>Remove Internal '@' Mentions (Recommended for Publishing)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Converts internal tags like <span className="font-mono text-stone-700">@Sarah Cole</span> into <span className="font-mono text-emerald-800 font-bold">Sarah Cole</span> while preserving email addresses.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Title Page */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeTitlePage}
                      onChange={(e) => setIncludeTitlePage(e.target.checked)}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#8C503C]" />
                        <span>Include Title Page (Front Matter)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Displays book title, subtitle, author pen name, and publisher imprint.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Copyright Page */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeCopyright}
                      onChange={(e) => setIncludeCopyright(e.target.checked)}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#8C503C]" />
                        <span>Include Copyright Page & Fiction Disclaimer</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Legal copyright notice © {matter.copyrightYear || defaultYear}, edition, and fiction disclaimer.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: In-Book TOC (EPUB) */}
                  {format === "epub" && (
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={includeTocPage}
                        onChange={(e) => setIncludeTocPage(e.target.checked)}
                        className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <List className="w-3.5 h-3.5 text-[#8C503C]" />
                          <span>Include In-Book Table of Contents Page (<code className="font-mono text-[10px]">toc.xhtml</code>)</span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                          Clickable chapter list for readers browsing through the opening pages.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Option 5: About Author & Review Request */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeAboutAuthor}
                      onChange={(e) => setIncludeAboutAuthor(e.target.checked)}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#8C503C]" />
                        <span>Include Back Matter: About the Author & Amazon Review CTA</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Author bio, reader magnet newsletter link, and call-to-action note requesting reviews.
                      </p>
                    </div>
                  </label>

                  {/* Option 6: Acknowledgments */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeAcknowledgments}
                      onChange={(e) => setIncludeAcknowledgments(e.target.checked)}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <BookCheck className="w-3.5 h-3.5 text-[#8C503C]" />
                        <span>Include Acknowledgments Page</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Personal note thanking readers, editors, and supporters.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-[#E5E0D5]/30 p-3.5 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-stone-600 font-serif">
                    Manuscript contains{" "}
                    <strong className="text-stone-900 font-sans">
                      {extractChaptersForExport(projectData?.manuscript || [], stripInternalMentions).length} chapters
                    </strong>{" "}
                    (~
                    <strong className="text-stone-900 font-sans">
                      {project?.currentWords?.toLocaleString() || 0} words
                    </strong>
                    )
                  </p>
                  <button
                    onClick={() => setActiveTab("matter")}
                    className="text-xs text-[#8C503C] hover:text-[#733D2D] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Customize Page Texts</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Customize Pages (Front & Back Matter Studio) */}
            {activeTab === "matter" && (
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#E5E0D5]">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Front & Back Matter Customizer
                    </h3>
                    <p className="text-[11px] text-stone-500 font-serif">
                      Edit text and metadata. All changes are saved directly to this novel.
                    </p>
                  </div>
                  <button
                    onClick={handleResetToStandard}
                    className="flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-[#8C503C] bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Reset to standard KDP templates"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>

                {/* Section 1: Title & Imprint */}
                <div className="bg-white p-4 rounded-xl border border-[#E5E0D5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Title Page & Imprint</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Book Subtitle (Optional)
                      </label>
                      <input
                        type="text"
                        value={matter.subtitle || ""}
                        onChange={(e) => updateMatterField("subtitle", e.target.value)}
                        placeholder="e.g. A Gothic Coastal Fantasy Novel"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Publisher / Imprint Name
                      </label>
                      <input
                        type="text"
                        value={matter.publisher || ""}
                        onChange={(e) => updateMatterField("publisher", e.target.value)}
                        placeholder="e.g. Ocean Novel Studio"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Dedication (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={matter.dedication || ""}
                      onChange={(e) => updateMatterField("dedication", e.target.value)}
                      placeholder="e.g. For those who watch the fog roll in and wonder what lies beneath the waves."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-serif"
                    />
                  </div>
                </div>

                {/* Section 2: Copyright & Legal */}
                <div className="bg-white p-4 rounded-xl border border-[#E5E0D5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Copyright Page & Legal Metadata</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Copyright Year
                      </label>
                      <input
                        type="text"
                        value={matter.copyrightYear || ""}
                        onChange={(e) => updateMatterField("copyrightYear", e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Copyright Owner
                      </label>
                      <input
                        type="text"
                        value={matter.copyrightOwner || ""}
                        onChange={(e) => updateMatterField("copyrightOwner", e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        ISBN (Optional)
                      </label>
                      <input
                        type="text"
                        value={matter.isbn || ""}
                        onChange={(e) => updateMatterField("isbn", e.target.value)}
                        placeholder="978-3-16-148410-0"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        ASIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={matter.asin || ""}
                        onChange={(e) => updateMatterField("asin", e.target.value)}
                        placeholder="B0XXXXXXXX"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Fiction Work Disclaimer
                    </label>
                    <textarea
                      rows={2}
                      value={matter.disclaimerText || ""}
                      onChange={(e) => updateMatterField("disclaimerText", e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-serif"
                    />
                  </div>
                </div>

                {/* Section 3: About the Author & Reader Magnet */}
                <div className="bg-white p-4 rounded-xl border border-[#E5E0D5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>About the Author & Reader Gifts</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Author Pen Name
                      </label>
                      <input
                        type="text"
                        value={matter.authorPenName || ""}
                        onChange={(e) => updateMatterField("authorPenName", e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                        <span>Newsletter / Reader Gift Link</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </label>
                      <input
                        type="url"
                        value={matter.authorWebsiteOrNewsletter || ""}
                        onChange={(e) => updateMatterField("authorWebsiteOrNewsletter", e.target.value)}
                        placeholder="https://yourwebsite.com/free-novella"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Author Biography
                    </label>
                    <textarea
                      rows={3}
                      value={matter.authorBioText || ""}
                      onChange={(e) => updateMatterField("authorBioText", e.target.value)}
                      placeholder="Write your author story..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-serif"
                    />
                  </div>
                </div>

                {/* Section 4: Amazon Review CTA Box */}
                <div className="bg-white p-4 rounded-xl border border-[#E5E0D5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Amazon Review Call-to-Action (Back Matter)</span>
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Review Box Headline
                    </label>
                    <input
                      type="text"
                      value={matter.reviewCtaHeading || ""}
                      onChange={(e) => updateMatterField("reviewCtaHeading", e.target.value)}
                      placeholder="A Sincere Note to the Reader"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Review Invitation Message
                    </label>
                    <textarea
                      rows={3}
                      value={matter.reviewCtaText || ""}
                      onChange={(e) => updateMatterField("reviewCtaText", e.target.value)}
                      placeholder="Ask readers politely for an honest Amazon review..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-serif"
                    />
                  </div>
                </div>

                {/* Section 5: Acknowledgments */}
                <div className="bg-white p-4 rounded-xl border border-[#E5E0D5] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C] flex items-center gap-1.5">
                    <BookCheck className="w-3.5 h-3.5" />
                    <span>Acknowledgments (Optional)</span>
                  </h4>
                  <div>
                    <textarea
                      rows={2}
                      value={matter.acknowledgmentsText || ""}
                      onChange={(e) => updateMatterField("acknowledgmentsText", e.target.value)}
                      placeholder="Thank your editors, beta readers, and family..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8C503C] outline-none font-serif"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {exportError && (
              <div className="mx-6 mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {exportError}
              </div>
            )}

            {/* Footer */}
            <div className="p-5 border-t border-[#E5E0D5] bg-white/80 flex gap-3">
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
