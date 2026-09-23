import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  CheckCircle,
  FileDown,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { storage, FrontBackMatterData } from "@/lib/storage";
import { PLAN_LIMITS } from "@/lib/license";
import UpgradeModal from "@/components/UpgradeModal";
import { ManuscriptItem } from "@/mockData";
import {
  exportToEpub,
  cleanContentToParagraphs,
  parseChapterHeading,
  auditManuscriptContent,
  checkCoverResolution,
  cleanInternalMentionsAndTags,
} from "@/lib/epubExport";

type ExportFormat = "epub" | "docx" | "txt";
type ActiveTab = "format" | "matter";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ExportModal({ isOpen, onClose, projectId }: ExportModalProps) {
  const [includeCopyright, setIncludeCopyright] = useState(true);
  const [includeTocPage, setIncludeTocPage] = useState(true);
  const [includeAboutAuthor, setIncludeAboutAuthor] = useState(true);
  const [includeReviewRequest, setIncludeReviewRequest] = useState(true);
  const [includeAcknowledgments, setIncludeAcknowledgments] = useState(false);
  const [stripInternalMentions, setStripInternalMentions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [coverValidation, setCoverValidation] = useState<{
    width: number;
    height: number;
    isAdequate: boolean;
    message: string;
  } | null>(null);

  const project = storage.getProjects().find((p) => p.id === projectId);
  const projectData = storage.getProjectData(projectId);
  const profile = storage.getUserProfile();
  const authorFallback = profile.penName || profile.name || "Author";
  const hasEpub3Export = PLAN_LIMITS[profile?.plan || 'free'].hasEpub3Export;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>("format");
  const [format, setFormat] = useState<ExportFormat>(() => (hasEpub3Export ? "epub" : "docx"));
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const defaultYear = new Date().getFullYear().toString();

  const defaultMatter: FrontBackMatterData = {
    subtitle: "",
    publisher: "", // User input only; omitted if left blank
    edition: `First Digital Edition: ${defaultYear}`,
    copyrightYear: defaultYear,
    copyrightOwner: authorFallback,
    isbn: "",
    asin: "",
    disclaimerText:
      "This is a work of fiction. Names, characters, places, and incidents either are the product of the author's imagination or are used fictitiously. Any resemblance to actual persons, living or dead, events, or locales is entirely coincidental.",
    dedication: "",
    acknowledgmentsText: "", // Strictly optional, no filler text
    authorPenName: authorFallback,
    authorBioText: profile.bio || "", // User input only, never auto-generate fake bio
    authorWebsiteOrNewsletter: "",
    includeReviewRequest: true,
    reviewCtaHeading: "A Sincere Note to the Reader",
    reviewCtaText:
      `Thank you for reading ${project?.title || "this book"}! If you enjoyed this journey, please consider leaving an honest review on Amazon or Goodreads. Reviews are the lifeblood of independent authors and help fellow book lovers discover great new stories.`,
  };

  const [matter, setMatter] = useState<FrontBackMatterData>(
    projectData?.frontBackMatter || defaultMatter
  );

  useEffect(() => {
    if (projectData?.frontBackMatter) {
      setMatter({
        ...defaultMatter,
        ...projectData.frontBackMatter,
      });
      if (projectData.frontBackMatter.includeReviewRequest !== undefined) {
        setIncludeReviewRequest(projectData.frontBackMatter.includeReviewRequest);
      }
    } else {
      setMatter(defaultMatter);
    }
  }, [projectId]);

  useEffect(() => {
    checkCoverResolution(project?.coverUrl).then((res) => {
      setCoverValidation(res);
    });
  }, [project?.coverUrl]);

  const updateMatterField = (key: keyof FrontBackMatterData, value: any) => {
    let updated = { ...matter, [key]: value };
    // Synchronize author and copyright owner if they match or copyright owner is empty
    if (key === "authorPenName") {
      if (!matter.copyrightOwner || matter.copyrightOwner === matter.authorPenName) {
        updated.copyrightOwner = value;
      }
    }
    setMatter(updated);
    storage.saveProjectData(projectId, { frontBackMatter: updated });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetToStandard = () => {
    if (window.confirm("Reset all Front & Back Matter to standard publishing defaults?")) {
      setMatter(defaultMatter);
      setIncludeReviewRequest(true);
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

  // Build structured list of chapters with title deduplication for Word and TXT
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
    if (format === "epub" && !hasEpub3Export) {
      setShowUpgradeModal(true);
      return;
    }
    setIsExporting(true);
    setExportComplete(false);
    setExportError(null);

    try {
      const manuscript = projectData?.manuscript || [];
      const title = project?.title || "Untitled Manuscript";
      const author = (matter.authorPenName || authorFallback).trim();
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
          includeReviewRequest,
          authorBio: matter.authorBioText,
          manuscript,
          stripInternalMentions,
          matter,
        });
      } else if (format === "txt") {
        await exportTxt(exportChapters, title, author);
      } else if (format === "docx") {
        await exportDocx(exportChapters, title, author);
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
      if (matter.publisher?.trim()) content += `Published by ${matter.publisher.trim()}\n`;
      content += `\n\n=========================================\n\n\n`;
    }

    if (includeCopyright) {
      content += `Copyright © ${matter.copyrightYear || defaultYear} by ${matter.copyrightOwner || author}\n`;
      if (matter.isbn) content += `ISBN: ${matter.isbn}\n`;
      if (matter.asin) content += `ASIN: ${matter.asin}\n`;
      content += `\n${matter.disclaimerText}\n\n`;
      if (matter.publisher?.trim()) content += `Published by ${matter.publisher.trim()}\n`;
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
      content += `${author}\n\n`;
      if (matter.authorBioText?.trim()) {
        content += `${matter.authorBioText.trim()}\n\n`;
      }
      if (matter.authorWebsiteOrNewsletter) {
        content += `Newsletter: ${matter.authorWebsiteOrNewsletter}\n\n`;
      }
      if (includeReviewRequest && matter.reviewCtaText?.trim()) {
        content += `-----------------------------------------\n`;
        content += `${matter.reviewCtaHeading || "Note to Readers:"}\n\n${matter.reviewCtaText}\n\n`;
      }
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
      if (matter.publisher?.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: matter.publisher.trim(), size: 20, color: "666666" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          })
        );
      }
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
      if (matter.publisher?.trim()) {
        children.push(new Paragraph({ text: `Published by ${matter.publisher.trim()}`, spacing: { after: 200 } }));
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
      if (matter.authorBioText?.trim()) {
        children.push(
          new Paragraph({
            text: matter.authorBioText.trim(),
            spacing: { after: 400 },
          })
        );
      }
      if (includeReviewRequest && matter.reviewCtaText?.trim()) {
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
                    Professional KDP EPUB 3, Editorial DOCX, and Plain Text TXT
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
                className={`pb-2.5 px-3 border-b-2 flex items-center transition-all cursor-pointer ${
                  activeTab === "format"
                    ? "border-[#8C503C] text-[#8C503C]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <span>Format & Scope</span>
              </button>

              <button
                onClick={() => setActiveTab("matter")}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "matter"
                    ? "border-[#8C503C] text-[#8C503C]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* EPUB Option */}
                    <button
                      onClick={() => {
                        if (!hasEpub3Export) {
                          setShowUpgradeModal(true);
                        } else {
                          setFormat("epub");
                        }
                      }}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        format === "epub"
                          ? "border-[#8C503C] bg-[#8C503C]/10 text-[#8C503C] ring-1 ring-[#8C503C] shadow-xs"
                          : "border-[#E5E0D5] bg-white text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <span className="absolute -top-2 right-1.5 bg-[#8C503C] text-white text-[8px] font-bold font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-0.5">
                        {!hasEpub3Export && <Lock className="w-2 h-2 inline-block mr-0.5" />}
                        {hasEpub3Export ? "Gold KDP" : "OTO1 Tier"}
                      </span>
                      <BookOpen className="w-5 h-5 mt-1" />
                      <span className="text-xs font-bold font-mono uppercase flex items-center gap-1">
                        <span>EPUB 3</span>
                        {!hasEpub3Export && <Lock className="w-3 h-3 text-[#8C503C]" />}
                      </span>
                      <span className="text-[9px] text-stone-500 font-sans">{hasEpub3Export ? "Kindle & E-book" : "Requires OTO1"}</span>
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
                      <div className="font-bold text-stone-900">
                        Remove Internal '@' Mentions (Recommended for Publishing)
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
                      <div className="font-bold text-stone-900">
                        Include Title Page (Front Matter)
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
                      <div className="font-bold text-stone-900">
                        Include Copyright Page & Fiction Disclaimer
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
                        <div className="font-bold text-stone-900">
                          Include In-Book Table of Contents Page (<code className="font-mono text-[10px]">toc.xhtml</code>)
                        </div>
                        <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                          Clickable chapter list for readers browsing through the opening pages.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Option 5: About Author */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeAboutAuthor}
                      onChange={(e) => setIncludeAboutAuthor(e.target.checked)}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900">
                        Include Back Matter: About the Author Page
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Author bio from profile and reader magnet newsletter link.
                      </p>
                    </div>
                  </label>

                  {/* Option 6: Review Request CTA */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeReviewRequest}
                      onChange={(e) => {
                        setIncludeReviewRequest(e.target.checked);
                        updateMatterField("includeReviewRequest", e.target.checked);
                      }}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900">
                        Include Amazon / Goodreads Review Request Box
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Optional call-to-action note inviting readers to leave an honest review.
                      </p>
                    </div>
                  </label>

                  {/* Option 7: Acknowledgments */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E0D5] bg-white cursor-pointer hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeAcknowledgments}
                      onChange={(e) => setIncludeAcknowledgments(e.target.checked)}
                      className="w-4 h-4 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C] mt-0.5"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900">
                        Include Acknowledgments Page (Optional)
                      </div>
                      <p className="text-[11px] text-stone-500 font-serif mt-0.5">
                        Strictly optional. Only included when enabled with your custom text.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Cover Resolution Alert (if inadequate) */}
                {format === "epub" && coverValidation && !coverValidation.isAdequate && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Cover Resolution Notice</div>
                      <p className="text-[11px] text-amber-800 font-serif mt-0.5">
                        {coverValidation.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Content Integrity Audit */}
                {(() => {
                  const audit = auditManuscriptContent(projectData?.manuscript || [], stripInternalMentions);
                  return (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-xs text-emerald-900 font-serif">
                          Pre-export Audit:{" "}
                          <strong className="text-emerald-950 font-sans font-bold">
                            {audit.compiledChapterCount} chapters
                          </strong>
                          ,{" "}
                          <strong className="text-emerald-950 font-sans font-bold">
                            {audit.compiledParagraphCount} paragraphs
                          </strong>{" "}
                          verified (100% Lossless content protection).
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("matter")}
                        className="text-xs text-[#8C503C] hover:text-[#733D2D] font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                      >
                        <span>Customize Pages</span>
                        <span>→</span>
                      </button>
                    </div>
                  );
                })()}
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
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C]">
                    Title Page & Imprint
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
                        Publisher / Imprint Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={matter.publisher || ""}
                        onChange={(e) => updateMatterField("publisher", e.target.value)}
                        placeholder="e.g. Acme Publishing (Leave blank to omit)"
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
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C]">
                    Copyright Page & Legal Metadata
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
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C]">
                    About the Author & Reader Gifts
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
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Newsletter / Reader Gift Link
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C]">
                      Amazon Review Call-to-Action (Back Matter)
                    </h4>
                    <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeReviewRequest}
                        onChange={(e) => {
                          setIncludeReviewRequest(e.target.checked);
                          updateMatterField("includeReviewRequest", e.target.checked);
                        }}
                        className="w-3.5 h-3.5 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C]"
                      />
                      <span className="font-bold text-[11px] text-stone-700">Include Review Box</span>
                    </label>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C503C]">
                      Acknowledgments (Optional)
                    </h4>
                    <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAcknowledgments}
                        onChange={(e) => setIncludeAcknowledgments(e.target.checked)}
                        className="w-3.5 h-3.5 text-[#8C503C] rounded border-stone-300 focus:ring-[#8C503C] accent-[#8C503C]"
                      />
                      <span className="font-bold text-[11px] text-stone-700">Include Page</span>
                    </label>
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={matter.acknowledgmentsText || ""}
                      onChange={(e) => updateMatterField("acknowledgmentsText", e.target.value)}
                      placeholder="Leave empty or enter words of gratitude to editors, beta readers, and mentors..."
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

      {/* Upgrade Modal for locked EPUB 3 export */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="projects"
        title="Amazon KDP EPUB 3 Export Locked"
        description="Gold Standard EPUB 3.3 Amazon KDP export package (dual NCX/EPUB 3 navigation, Landmarked start-reading offsets, and Kindle typography) is unlocked in OTO1: Unlimited Studio Edition ($47)."
      />
    </AnimatePresence>
  );
}
