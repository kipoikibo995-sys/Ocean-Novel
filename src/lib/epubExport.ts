import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ManuscriptItem } from "@/mockData";
import { FrontBackMatterData } from "@/lib/storage";

export interface EpubOptions {
  title: string;
  subtitle?: string;
  author: string;
  language?: string;
  coverImageUrl?: string;
  genre?: string;
  includeTitlePage?: boolean;
  includeCopyright?: boolean;
  includeTocPage?: boolean;
  includeAboutAuthor?: boolean;
  includeAcknowledgments?: boolean;
  authorBio?: string;
  manuscript: ManuscriptItem[];
  stripInternalMentions?: boolean;
  matter?: FrontBackMatterData;
}

export interface ChapterHeadingInfo {
  numberText: string; // e.g. "CHAPTER 1"
  titleText: string;  // e.g. "The Arrival"
  fullTitle: string;  // e.g. "Chapter 1: The Arrival" for TOC & navigation
}

interface ParsedScene {
  title?: string;
  paragraphs: string[];
}

interface ParsedChapter {
  id: string;
  index: number;
  title: string;
  numberText: string;
  titleText: string;
  fullTitle: string;
  filename: string;
  scenes: ParsedScene[];
}

interface ParsedPart {
  id: string;
  index: number;
  title: string;
  filename: string;
  chapters: ParsedChapter[];
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function padZero(num: number, size: number = 3): string {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

/**
 * Normalizes strings for robust duplicate detection across languages
 */
export function normalizeForComparison(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, "")
    .trim();
}

/**
 * Parses chapter title into a clean two-level heading:
 * Level 1: "CHAPTER 1" (Number label)
 * Level 2: "The Arrival" (Subtitle/Name)
 */
export function parseChapterHeading(
  rawTitle: string,
  index: number,
  language: string = "en"
): ChapterHeadingInfo {
  const clean = (rawTitle || "").replace(/^@/, "").trim();
  const isVi = language?.toLowerCase().startsWith("vi") || /^(chương|hồi)\s*/i.test(clean);
  const defaultPrefix = isVi ? "CHƯƠNG" : "CHAPTER";
  const defaultFullPrefix = isVi ? "Chương" : "Chapter";

  // Check standalone special sections: Prologue, Epilogue, Interlude, Afterword, Mở đầu, Kết thúc
  if (/^(prologue|epilogue|interlude|afterword|preface|introduction|mở đầu|lời mở đầu|kết thúc|vĩ thanh)/i.test(clean)) {
    return {
      numberText: "",
      titleText: clean.toUpperCase(),
      fullTitle: clean,
    };
  }

  // 1. "Chapter 1: The Arrival" or "Chapter 1 - The Arrival" or "Chương 1: The Arrival"
  const matchWithSub = clean.match(/^(chapter|chương|hồi|chap|ch\.?)\s*([0-9ivxlcdm]+)\s*[:\-\u2013\u2014]\s*(.+)$/i);
  if (matchWithSub) {
    const prefix = matchWithSub[1].toUpperCase();
    const num = matchWithSub[2].trim();
    const sub = matchWithSub[3].trim();
    return {
      numberText: `${prefix} ${num}`,
      titleText: sub,
      fullTitle: `${matchWithSub[1]} ${num}: ${sub}`,
    };
  }

  // 2. "Chapter 1" or "Chương 1" without subtitle
  const matchOnlyNum = clean.match(/^(chapter|chương|hồi|chap|ch\.?)\s*([0-9ivxlcdm]+)$/i);
  if (matchOnlyNum) {
    const prefix = matchOnlyNum[1].toUpperCase();
    const num = matchOnlyNum[2].trim();
    return {
      numberText: `${prefix} ${num}`,
      titleText: "",
      fullTitle: `${matchOnlyNum[1]} ${num}`,
    };
  }

  // 3. "1. The Arrival" or "1: The Arrival" or "1 - The Arrival"
  const matchNumberedSub = clean.match(/^([0-9]+)\s*[:\.\-\u2013\u2014]\s*(.+)$/);
  if (matchNumberedSub) {
    const num = matchNumberedSub[1].trim();
    const sub = matchNumberedSub[2].trim();
    return {
      numberText: `${defaultPrefix} ${num}`,
      titleText: sub,
      fullTitle: `${defaultFullPrefix} ${num}: ${sub}`,
    };
  }

  // 4. Default: Just a name like "The Arrival"
  return {
    numberText: `${defaultPrefix} ${index}`,
    titleText: clean,
    fullTitle: `${defaultFullPrefix} ${index}: ${clean}`,
  };
}

/**
 * Extracts clean paragraphs from HTML while stripping internal @ mentions
 * AND stripping duplicate chapter/scene titles from the top of the scene
 */
export function cleanContentToParagraphs(
  html: string,
  stripMentions: boolean = true,
  headingsToStrip: string[] = []
): string[] {
  if (!html) return [];

  const container = document.createElement("div");
  container.innerHTML = html;

  if (stripMentions) {
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

  // Prepare normalized targets for duplicate title detection
  const normalizedTargets = headingsToStrip
    .map(normalizeForComparison)
    .filter((s) => s.length > 0);

  // In book formatting, any top-level H1 or H2 inside a scene editor was inserted as a title placeholder.
  // We completely strip them out so they never duplicate with the compiled chapter header.
  const headingElements = container.querySelectorAll("h1, h2, h3, h4");
  headingElements.forEach((heading) => {
    const headingNorm = normalizeForComparison(heading.textContent || "");
    const matchesTarget =
      normalizedTargets.length === 0 ||
      normalizedTargets.some(
        (target) =>
          headingNorm === target ||
          (headingNorm.length > 3 && (target.includes(headingNorm) || headingNorm.includes(target)))
      );

    if (heading.tagName === "H1" || matchesTarget) {
      heading.remove();
    }
  });

  // Replace remaining block elements with line breaks
  const blockElements = container.querySelectorAll(
    "p, div, h2, h3, h4, h5, h6, li"
  );
  blockElements.forEach((el) => {
    el.appendChild(document.createTextNode("\n"));
  });

  const brElements = container.querySelectorAll("br");
  brElements.forEach((el) => {
    el.replaceWith(document.createTextNode("\n"));
  });

  let rawText = container.textContent || container.innerText || "";

  if (stripMentions) {
    rawText = rawText.replace(
      /(^|[\s\(\[\{"'“‘—–\.,;:!?-])@([A-Za-z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/g,
      "$1$2"
    );
  }

  const rawParagraphs = rawText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Strip leading paragraphs if they are duplicate titles (e.g. plain <p>The Arrival</p>)
  let startIndex = 0;
  while (startIndex < rawParagraphs.length && startIndex < 2) {
    const pNorm = normalizeForComparison(rawParagraphs[startIndex]);
    const isDuplicate =
      normalizedTargets.some(
        (target) =>
          pNorm === target ||
          (pNorm.length > 3 && (target.includes(pNorm) || pNorm.includes(target)))
      ) ||
      /^(chapter|chương|hồi)\s*[0-9ivxlcdm]+/i.test(rawParagraphs[startIndex]);

    if (isDuplicate) {
      startIndex++;
    } else {
      break;
    }
  }

  return rawParagraphs.slice(startIndex);
}

/**
 * Safely loads cover binary data from DataURL or HTTP URL
 */
async function loadCoverBinary(urlOrData?: string): Promise<Uint8Array | null> {
  if (!urlOrData || typeof urlOrData !== "string") return null;
  try {
    if (urlOrData.startsWith("data:")) {
      const base64Index = urlOrData.indexOf(",");
      if (base64Index === -1) return null;
      const base64 = urlOrData.substring(base64Index + 1);
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      const resp = await fetch(urlOrData);
      if (!resp.ok) return null;
      const buffer = await resp.arrayBuffer();
      return new Uint8Array(buffer);
    }
  } catch (err) {
    console.warn("Cover image could not be loaded into EPUB:", err);
    return null;
  }
}

/**
 * Parses manuscript items into structured parts & chapters with exact heading parsing
 */
function parseManuscriptStructure(
  items: ManuscriptItem[],
  stripMentions: boolean,
  language: string = "en"
): { parts: ParsedPart[]; flatChapters: ParsedChapter[] } {
  const parts: ParsedPart[] = [];
  const flatChapters: ParsedChapter[] = [];
  let globalChapterCount = 0;
  let partCount = 0;

  const extractScenesFromChapter = (
    chapItem: ManuscriptItem,
    headingInfo: ChapterHeadingInfo
  ): ParsedScene[] => {
    const scenes: ParsedScene[] = [];
    const targetsToFilter = [
      chapItem.title,
      headingInfo.numberText,
      headingInfo.titleText,
      headingInfo.fullTitle,
    ].filter(Boolean);

    if (chapItem.content && chapItem.content.trim()) {
      scenes.push({
        title: chapItem.title,
        paragraphs: cleanContentToParagraphs(chapItem.content, stripMentions, targetsToFilter),
      });
    }
    if (chapItem.children && chapItem.children.length > 0) {
      for (const child of chapItem.children) {
        if (child.type === "scene" && child.content) {
          scenes.push({
            title: child.title,
            paragraphs: cleanContentToParagraphs(child.content, stripMentions, [
              ...targetsToFilter,
              child.title,
            ]),
          });
        }
      }
    }
    return scenes;
  };

  for (const item of items) {
    if (item.type === "part") {
      partCount++;
      const currentPartChapters: ParsedChapter[] = [];
      const partChapters = (item.children || []).filter(
        (c) => c.type === "chapter" || c.type === "scene"
      );

      for (const chap of partChapters) {
        globalChapterCount++;
        const rawTitle = stripMentions ? chap.title.replace(/^@/, "").trim() : chap.title;
        const headingInfo = parseChapterHeading(rawTitle, globalChapterCount, language);

        const chapObj: ParsedChapter = {
          id: `chap_${padZero(globalChapterCount)}`,
          index: globalChapterCount,
          title: rawTitle,
          numberText: headingInfo.numberText,
          titleText: headingInfo.titleText,
          fullTitle: headingInfo.fullTitle,
          filename: `chapter_${padZero(globalChapterCount)}.xhtml`,
          scenes: extractScenesFromChapter(chap, headingInfo),
        };
        currentPartChapters.push(chapObj);
        flatChapters.push(chapObj);
      }

      parts.push({
        id: `part_${padZero(partCount)}`,
        index: partCount,
        title: stripMentions ? item.title.replace(/^@/, "").trim() : item.title,
        filename: `part_${padZero(partCount)}.xhtml`,
        chapters: currentPartChapters,
      });
    } else if (item.type === "chapter") {
      globalChapterCount++;
      const rawTitle = stripMentions ? item.title.replace(/^@/, "").trim() : item.title;
      const headingInfo = parseChapterHeading(rawTitle, globalChapterCount, language);

      const chapObj: ParsedChapter = {
        id: `chap_${padZero(globalChapterCount)}`,
        index: globalChapterCount,
        title: rawTitle,
        numberText: headingInfo.numberText,
        titleText: headingInfo.titleText,
        fullTitle: headingInfo.fullTitle,
        filename: `chapter_${padZero(globalChapterCount)}.xhtml`,
        scenes: extractScenesFromChapter(item, headingInfo),
      };
      flatChapters.push(chapObj);
    } else if (item.type === "scene" && item.content) {
      globalChapterCount++;
      const rawTitle = stripMentions ? item.title.replace(/^@/, "").trim() : item.title;
      const headingInfo = parseChapterHeading(rawTitle, globalChapterCount, language);

      const chapObj: ParsedChapter = {
        id: `chap_${padZero(globalChapterCount)}`,
        index: globalChapterCount,
        title: rawTitle,
        numberText: headingInfo.numberText,
        titleText: headingInfo.titleText,
        fullTitle: headingInfo.fullTitle,
        filename: `chapter_${padZero(globalChapterCount)}.xhtml`,
        scenes: [
          {
            title: item.title,
            paragraphs: cleanContentToParagraphs(item.content, stripMentions, [
              rawTitle,
              headingInfo.numberText,
              headingInfo.titleText,
              headingInfo.fullTitle,
            ]),
          },
        ],
      };
      flatChapters.push(chapObj);
    }
  }

  return { parts, flatChapters };
}

/**
 * Main Standard EPUB 3 Export Function with Custom Front & Back Matter Support
 */
export async function exportToEpub({
  title,
  subtitle,
  author,
  language = "en",
  coverImageUrl,
  genre,
  includeTitlePage = true,
  includeCopyright = true,
  includeTocPage = true,
  includeAboutAuthor = true,
  includeAcknowledgments = false,
  authorBio,
  manuscript,
  stripInternalMentions = true,
  matter,
}: EpubOptions): Promise<void> {
  const zip = new JSZip();

  // Resolved values taking custom matter into account
  const resolvedAuthor = matter?.authorPenName || author;
  const resolvedSubtitle = matter?.subtitle || subtitle;
  const resolvedPublisher = matter?.publisher || "Ocean Novel Studio";
  const resolvedYear = matter?.copyrightYear || new Date().getFullYear().toString();
  const resolvedCopyrightOwner = matter?.copyrightOwner || resolvedAuthor;
  const resolvedEdition = matter?.edition || `First Digital Edition: ${resolvedYear}`;
  const resolvedDisclaimer =
    matter?.disclaimerText ||
    "This is a work of fiction. Names, characters, places, and incidents either are the product of the author's imagination or are used fictitiously. Any resemblance to actual persons, living or dead, events, or locales is entirely coincidental.";

  // 1. mimetype (Must be first, stored completely uncompressed)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. META-INF/container.xml pointing to EPUB/package.opf
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // 3. EPUB/css/book.css - Professional Novel Typography for Kindle / E-readers
  const bookCss = `/* Ocean Novel Studio - Publishing Grade EPUB 3 Stylesheet */
@namespace "http://www.w3.org/1999/xhtml";

@page {
  margin: 5%;
}

body {
  margin: 0;
  padding: 0;
  font-family: Georgia, "Palatino Linotype", "Book Antiqua", Palatino, serif;
  line-height: 1.6;
  color: #1a1a1a;
}

/* Front & Back Matter */
.frontmatter, .backmatter {
  page-break-before: always;
  break-before: page;
  text-align: center;
  padding-top: 15vh;
  padding-bottom: 5vh;
}

.book-title {
  font-size: 2.2em;
  font-weight: bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.2em;
  line-height: 1.2;
}

.book-subtitle {
  font-size: 1.2em;
  font-style: italic;
  color: #555555;
  margin-top: 0;
  margin-bottom: 2em;
}

.author-by {
  font-size: 0.95em;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #666666;
  margin-bottom: 0.5em;
}

.author-name {
  font-size: 1.5em;
  font-weight: normal;
  letter-spacing: 0.05em;
  margin-top: 0;
  margin-bottom: 3em;
}

.ornament {
  font-size: 1.4em;
  color: #8C503C;
  margin: 1.5em auto;
  text-align: center;
}

.publisher-mark {
  margin-top: 15vh;
  font-size: 0.85em;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #777777;
}

/* Copyright Page */
.copyright-section {
  page-break-before: always;
  break-before: page;
  font-size: 0.85em;
  line-height: 1.6;
  color: #444444;
  padding-top: 25vh;
  padding-left: 5%;
  padding-right: 5%;
}

.copyright-section p {
  text-indent: 0 !important;
  margin-bottom: 1em;
}

.copyright-section .disclaimer {
  font-style: italic;
  font-size: 0.9em;
}

.copyright-meta {
  font-family: monospace;
  font-size: 0.95em;
  color: #666666;
}

/* Dedication */
.dedication-section {
  page-break-before: always;
  break-before: page;
  text-align: center;
  padding-top: 35vh;
  max-width: 80%;
  margin: auto;
}

.dedication-text {
  font-style: italic;
  font-size: 1.2em;
  line-height: 1.8;
  text-indent: 0 !important;
}

/* Table of Contents */
.toc-page {
  page-break-before: always;
  break-before: page;
  padding-top: 5vh;
}

.toc-heading {
  text-align: center;
  font-size: 1.8em;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5em;
}

ul.inbook-toc {
  list-style-type: none;
  padding-left: 0;
  margin: 2em auto;
  max-width: 90%;
}

ul.inbook-toc li {
  margin-bottom: 0.9em;
  border-bottom: 1px dotted #DCD5C9;
  padding-bottom: 0.3em;
}

ul.inbook-toc li a {
  text-decoration: none;
  color: #2A1B14;
  font-size: 1em;
  display: block;
}

ul.inbook-toc li.toc-part {
  font-weight: bold;
  font-size: 1.1em;
  margin-top: 1.5em;
  border-bottom: 2px solid #8C503C;
  color: #8C503C;
}

/* Part Divider */
.part-divider {
  page-break-before: always;
  break-before: page;
  text-align: center;
  padding-top: 35vh;
  padding-bottom: 35vh;
}

.part-title {
  font-size: 2em;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: bold;
  color: #2A1B14;
}

/* Chapter & Body Styles - Exact Single Title Layout */
.chapter-section {
  page-break-before: always;
  break-before: page;
  padding-top: 8vh;
}

.chapter-header {
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 3.5em;
}

.chapter-number {
  font-size: 0.95em;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8C503C;
  margin-top: 0;
  margin-bottom: 0.4em;
  font-weight: bold;
  text-indent: 0 !important;
}

.chapter-title {
  text-align: center;
  font-size: 1.85em;
  font-weight: normal;
  letter-spacing: 0.04em;
  margin-top: 0.2em;
  margin-bottom: 0.6em;
  line-height: 1.25;
}

.chapter-ornament {
  font-size: 1.1em;
  color: #8C503C;
  letter-spacing: 0.3em;
  margin-top: 0.8em;
  text-align: center;
}

p {
  margin: 0;
  text-indent: 1.5em;
  text-align: justify;
  text-justify: inter-word;
}

p.first-p {
  text-indent: 0 !important;
}

.scene-break {
  text-align: center;
  margin: 2em auto;
  color: #8C503C;
  letter-spacing: 0.5em;
  font-size: 1.1em;
}

/* Cover */
.cover-wrapper {
  text-align: center;
  padding: 0;
  margin: 0;
}

img.cover-img {
  max-width: 100%;
  max-height: 100vh;
  height: auto;
  width: auto;
  margin: auto;
  display: block;
}

/* Back matter note box */
.review-box {
  margin-top: 3em;
  padding: 1.5em;
  border: 1px solid #DCD5C9;
  background-color: #FAF8F5;
  border-radius: 6px;
  text-align: left;
}

.review-box h3 {
  margin-top: 0;
  font-size: 1.1em;
  color: #8C503C;
  text-align: center;
}

.review-box p {
  text-indent: 0 !important;
  margin-bottom: 0.8em;
  font-size: 0.95em;
}

.author-newsletter {
  margin-top: 1.5em;
  padding: 1em;
  background-color: #F4EFEB;
  border-left: 3px solid #8C503C;
  text-align: left;
}
.author-newsletter p {
  text-indent: 0 !important;
  margin: 0;
  font-size: 0.95em;
}
.author-newsletter a {
  color: #8C503C;
  font-weight: bold;
  text-decoration: underline;
}
`;
  zip.file("EPUB/css/book.css", bookCss);

  // 4. Load & Embed Cover Image if available
  const coverBytes = await loadCoverBinary(coverImageUrl);
  const hasCoverImage = coverBytes !== null;
  if (hasCoverImage) {
    zip.file("EPUB/images/cover.jpg", coverBytes);
  }

  // 5. Parse Manuscript Hierarchy
  const { parts, flatChapters } = parseManuscriptStructure(
    manuscript,
    stripInternalMentions,
    language
  );
  const hasParts = parts.length > 0;

  // Track items for Manifest and Spine
  interface ManifestItem {
    id: string;
    href: string;
    mediaType: string;
    properties?: string;
  }
  const manifestItems: ManifestItem[] = [
    { id: "style", href: "css/book.css", mediaType: "text/css" },
    { id: "nav", href: "nav.xhtml", mediaType: "application/xhtml+xml", properties: "nav" },
    { id: "ncx", href: "toc.ncx", mediaType: "application/x-dtbncx+xml" },
  ];

  if (hasCoverImage) {
    manifestItems.push({
      id: "cover-image",
      href: "images/cover.jpg",
      mediaType: "image/jpeg",
      properties: "cover-image",
    });
  }

  const spineItemRefs: { idref: string; linear?: string }[] = [];

  // 6. Cover Page (text/cover.xhtml)
  const coverXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Cover</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
  <style type="text/css">
    @page { margin: 0; }
    body { margin: 0; padding: 0; text-align: center; background-color: #1a1a1a; }
  </style>
</head>
<body epub:type="cover">
  <div class="cover-wrapper">
    ${
      hasCoverImage
        ? `<img class="cover-img" src="../images/cover.jpg" alt="Cover" />`
        : `<div style="padding-top: 30vh; color: #FAF8F5;">
             <h1 style="font-size: 2.5em; text-transform: uppercase;">${escapeXml(title)}</h1>
             <p style="font-size: 1.4em; font-style: italic;">By ${escapeXml(resolvedAuthor)}</p>
           </div>`
    }
  </div>
</body>
</html>`;
  zip.file("EPUB/text/cover.xhtml", coverXhtml);
  manifestItems.push({
    id: "cover-xhtml",
    href: "text/cover.xhtml",
    mediaType: "application/xhtml+xml",
  });
  spineItemRefs.push({ idref: "cover-xhtml" });

  // 7. Title Page (text/titlepage.xhtml)
  if (includeTitlePage) {
    const titlePageXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body class="frontmatter" epub:type="frontmatter titlepage">
  <section>
    <h1 class="book-title">${escapeXml(title)}</h1>
    ${resolvedSubtitle ? `<p class="book-subtitle">${escapeXml(resolvedSubtitle)}</p>` : ""}
    <div class="ornament">❖</div>
    <p class="author-by">A Novel by</p>
    <p class="author-name">${escapeXml(resolvedAuthor)}</p>
    <div class="publisher-mark">
      <p>${escapeXml(resolvedPublisher)}</p>
    </div>
  </section>
</body>
</html>`;
    zip.file("EPUB/text/titlepage.xhtml", titlePageXhtml);
    manifestItems.push({
      id: "titlepage",
      href: "text/titlepage.xhtml",
      mediaType: "application/xhtml+xml",
    });
    spineItemRefs.push({ idref: "titlepage" });
  }

  // 8. Copyright Page (text/copyright.xhtml)
  if (includeCopyright) {
    const isbnRow = matter?.isbn ? `<p class="copyright-meta">ISBN: ${escapeXml(matter.isbn)}</p>` : "";
    const asinRow = matter?.asin ? `<p class="copyright-meta">ASIN: ${escapeXml(matter.asin)}</p>` : "";

    const copyrightXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Copyright</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body epub:type="frontmatter copyright-page">
  <section class="copyright-section">
    <p style="font-weight: bold; font-size: 1.1em;">${escapeXml(title)}</p>
    <p>Copyright © ${escapeXml(resolvedYear)} by ${escapeXml(resolvedCopyrightOwner)}</p>
    <p>All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the author, except in the case of brief quotations embodied in critical reviews.</p>
    <p class="disclaimer">${escapeXml(resolvedDisclaimer)}</p>
    ${isbnRow}
    ${asinRow}
    <p>${escapeXml(resolvedEdition)}</p>
    <p>Published by ${escapeXml(resolvedPublisher)}</p>
  </section>
</body>
</html>`;
    zip.file("EPUB/text/copyright.xhtml", copyrightXhtml);
    manifestItems.push({
      id: "copyright",
      href: "text/copyright.xhtml",
      mediaType: "application/xhtml+xml",
    });
    spineItemRefs.push({ idref: "copyright" });
  }

  // 9. Optional Dedication Page (text/dedication.xhtml)
  if (matter?.dedication && matter.dedication.trim()) {
    const dedicationXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Dedication</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body class="frontmatter" epub:type="frontmatter dedication">
  <section class="dedication-section">
    <p class="dedication-text">${escapeXml(matter.dedication)}</p>
    <div class="ornament">❖</div>
  </section>
</body>
</html>`;
    zip.file("EPUB/text/dedication.xhtml", dedicationXhtml);
    manifestItems.push({
      id: "dedication",
      href: "text/dedication.xhtml",
      mediaType: "application/xhtml+xml",
    });
    spineItemRefs.push({ idref: "dedication" });
  }

  // 10. In-book HTML Table of Contents (text/toc.xhtml)
  if (includeTocPage) {
    let tocListItemsHtml = "";
    if (hasParts) {
      for (const part of parts) {
        tocListItemsHtml += `<li class="toc-part"><a href="${part.filename}">${escapeXml(part.title)}</a></li>\n`;
        for (const chap of part.chapters) {
          tocListItemsHtml += `<li><a href="${chap.filename}">${escapeXml(chap.fullTitle)}</a></li>\n`;
        }
      }
    } else {
      for (const chap of flatChapters) {
        tocListItemsHtml += `<li><a href="${chap.filename}">${escapeXml(chap.fullTitle)}</a></li>\n`;
      }
    }

    if (includeAboutAuthor) {
      tocListItemsHtml += `<li><a href="about_author.xhtml">About the Author</a></li>\n`;
    }

    const tocPageXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body epub:type="frontmatter toc">
  <section class="toc-page">
    <h1 class="toc-heading">Table of Contents</h1>
    <div class="ornament">❖</div>
    <ul class="inbook-toc">
      ${tocListItemsHtml}
    </ul>
  </section>
</body>
</html>`;
    zip.file("EPUB/text/toc.xhtml", tocPageXhtml);
    manifestItems.push({
      id: "toc-page",
      href: "text/toc.xhtml",
      mediaType: "application/xhtml+xml",
    });
    spineItemRefs.push({ idref: "toc-page" });
  }

  // 11. Body Matter: Parts & Chapters
  if (hasParts) {
    for (const part of parts) {
      // Part Divider Page (text/part_001.xhtml)
      const partXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>${escapeXml(part.title)}</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body epub:type="part">
  <section class="part-divider">
    <h1 class="part-title">${escapeXml(part.title)}</h1>
    <div class="ornament">❖</div>
  </section>
</body>
</html>`;
      zip.file(`EPUB/text/${part.filename}`, partXhtml);
      manifestItems.push({
        id: part.id,
        href: `text/${part.filename}`,
        mediaType: "application/xhtml+xml",
      });
      spineItemRefs.push({ idref: part.id });

      // Chapters inside this part
      for (const chap of part.chapters) {
        writeChapterFile(zip, chap, language);
        manifestItems.push({
          id: chap.id,
          href: `text/${chap.filename}`,
          mediaType: "application/xhtml+xml",
        });
        spineItemRefs.push({ idref: chap.id });
      }
    }
  } else {
    // Flat chapters
    for (const chap of flatChapters) {
      writeChapterFile(zip, chap, language);
      manifestItems.push({
        id: chap.id,
        href: `text/${chap.filename}`,
        mediaType: "application/xhtml+xml",
      });
      spineItemRefs.push({ idref: chap.id });
    }
  }

  // 12. Acknowledgments (text/acknowledgments.xhtml - Optional)
  if (includeAcknowledgments || (matter?.acknowledgmentsText && matter.acknowledgmentsText.trim())) {
    const ackBody =
      matter?.acknowledgmentsText ||
      "To all the readers, early reviewers, and fellow storytellers who supported this journey from the very first draft. Thank you for bringing these characters to life in your imagination.";

    const ackXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Acknowledgments</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body class="backmatter" epub:type="backmatter acknowledgments">
  <section>
    <h1 class="toc-heading">Acknowledgments</h1>
    <div class="ornament">❖</div>
    <p style="text-indent: 0; max-width: 80%; margin: auto; line-height: 1.8;">
      ${escapeXml(ackBody)}
    </p>
  </section>
</body>
</html>`;
    zip.file("EPUB/text/acknowledgments.xhtml", ackXhtml);
    manifestItems.push({
      id: "acknowledgments",
      href: "text/acknowledgments.xhtml",
      mediaType: "application/xhtml+xml",
    });
    spineItemRefs.push({ idref: "acknowledgments" });
  }

  // 13. About the Author & Review Request (text/about_author.xhtml - Back Matter)
  if (includeAboutAuthor) {
    const bioText =
      matter?.authorBioText ||
      authorBio ||
      `${resolvedAuthor} is a dedicated novelist and storyteller crafting immersive worlds. When not typing away at the next chapter, ${resolvedAuthor} can be found exploring great stories and plotting new adventures.`;

    const reviewHeading = matter?.reviewCtaHeading || "A Sincere Note to the Reader";
    const reviewBody =
      matter?.reviewCtaText ||
      `Thank you for reading ${title}! If you enjoyed this story, please consider taking a moment to leave an honest review on Amazon or Goodreads. Reviews are the lifeblood of independent authors. Your feedback not only supports the author but also helps other passionate book lovers discover their next favorite novel.`;

    const newsletterHtml = matter?.authorWebsiteOrNewsletter
      ? `<div class="author-newsletter">
           <p><strong>Connect with the Author &amp; Exclusive Reader Gifts:</strong></p>
           <p><a href="${escapeXml(matter.authorWebsiteOrNewsletter)}">${escapeXml(matter.authorWebsiteOrNewsletter)}</a></p>
         </div>`
      : "";

    const aboutXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>About the Author</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body class="backmatter" epub:type="backmatter biographical-note">
  <section style="max-width: 85%; margin: auto;">
    <h1 class="toc-heading">About the Author</h1>
    <div class="ornament">❖</div>
    <p style="font-size: 1.3em; font-weight: bold; margin-bottom: 1em; text-indent: 0;">
      ${escapeXml(resolvedAuthor)}
    </p>
    <p style="text-indent: 0; line-height: 1.8; margin-bottom: 1.5em;">
      ${escapeXml(bioText)}
    </p>

    ${newsletterHtml}

    <!-- Amazon KDP Review Call to Action Box -->
    <div class="review-box">
      <h3>${escapeXml(reviewHeading)}</h3>
      <p>${escapeXml(reviewBody)}</p>
    </div>
  </section>
</body>
</html>`;
    zip.file("EPUB/text/about_author.xhtml", aboutXhtml);
    manifestItems.push({
      id: "about-author",
      href: "text/about_author.xhtml",
      mediaType: "application/xhtml+xml",
    });
    spineItemRefs.push({ idref: "about-author" });
  }

  // 14. EPUB 3 Navigation Document (EPUB/nav.xhtml)
  const firstChapterFilename =
    flatChapters.length > 0 ? `text/${flatChapters[0].filename}` : "text/titlepage.xhtml";

  let navOlHtml = "";
  if (hasParts) {
    for (const part of parts) {
      navOlHtml += `    <li><a href="text/${part.filename}">${escapeXml(part.title)}</a>\n      <ol>\n`;
      for (const chap of part.chapters) {
        navOlHtml += `        <li><a href="text/${chap.filename}">${escapeXml(chap.fullTitle)}</a></li>\n`;
      }
      navOlHtml += `      </ol>\n    </li>\n`;
    }
  } else {
    for (const chap of flatChapters) {
      navOlHtml += `    <li><a href="text/${chap.filename}">${escapeXml(chap.fullTitle)}</a></li>\n`;
    }
  }

  if (includeAboutAuthor) {
    navOlHtml += `    <li><a href="text/about_author.xhtml">About the Author</a></li>\n`;
  }

  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Navigation</title>
  <link rel="stylesheet" type="text/css" href="css/book.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${navOlHtml}
    </ol>
  </nav>

  <!-- Kindle Start Reading Location (Landmarks) -->
  <nav epub:type="landmarks" id="landmarks" hidden="">
    <h2>Guide</h2>
    <ol>
      <li><a epub:type="cover" href="text/cover.xhtml">Cover</a></li>
      <li><a epub:type="titlepage" href="text/titlepage.xhtml">Title Page</a></li>
      <li><a epub:type="toc" href="text/toc.xhtml">Table of Contents</a></li>
      <li><a epub:type="bodymatter" href="${firstChapterFilename}">Begin Reading</a></li>
    </ol>
  </nav>
</body>
</html>`;
  zip.file("EPUB/nav.xhtml", navXhtml);

  // 15. Legacy NCX Table of Contents (EPUB/toc.ncx) for older Kindle devices
  let ncxPlayOrder = 1;
  let navPointsHtml = "";

  if (hasParts) {
    for (const part of parts) {
      navPointsHtml += `
    <navPoint id="np_${part.id}" playOrder="${ncxPlayOrder++}">
      <navLabel><text>${escapeXml(part.title)}</text></navLabel>
      <content src="text/${part.filename}"/>`;
      for (const chap of part.chapters) {
        navPointsHtml += `
      <navPoint id="np_${chap.id}" playOrder="${ncxPlayOrder++}">
        <navLabel><text>${escapeXml(chap.fullTitle)}</text></navLabel>
        <content src="text/${chap.filename}"/>
      </navPoint>`;
      }
      navPointsHtml += `
    </navPoint>`;
    }
  } else {
    for (const chap of flatChapters) {
      navPointsHtml += `
    <navPoint id="np_${chap.id}" playOrder="${ncxPlayOrder++}">
      <navLabel><text>${escapeXml(chap.fullTitle)}</text></navLabel>
      <content src="text/${chap.filename}"/>
    </navPoint>`;
    }
  }

  const bookUuid = matter?.isbn
    ? `urn:isbn:${matter.isbn.trim()}`
    : "urn:uuid:" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookUuid}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <docAuthor>
    <text>${escapeXml(resolvedAuthor)}</text>
  </docAuthor>
  <navMap>
${navPointsHtml}
  </navMap>
</ncx>`;
  zip.file("EPUB/toc.ncx", tocNcx);

  // 16. Master Package Document (EPUB/package.opf)
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const manifestXml = manifestItems
    .map(
      (item) =>
        `    <item id="${item.id}" href="${item.href}" media-type="${item.mediaType}"${
          item.properties ? ` properties="${item.properties}"` : ""
        }/>`
    )
    .join("\n");

  const spineXml = spineItemRefs
    .map((item) => `    <itemref idref="${item.idref}"${item.linear ? ` linear="${item.linear}"` : ""}/>`)
    .join("\n");

  const packageOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="BookId">${bookUuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator id="creator">${escapeXml(resolvedAuthor)}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
    <dc:language>${escapeXml(language)}</dc:language>
    <dc:publisher>${escapeXml(resolvedPublisher)}</dc:publisher>
    ${genre ? `<dc:subject>${escapeXml(genre)}</dc:subject>` : ""}
    <meta property="dcterms:modified">${nowIso}</meta>
    ${hasCoverImage ? '<meta name="cover" content="cover-image"/>' : ""}
  </metadata>
  <manifest>
${manifestXml}
  </manifest>
  <spine toc="ncx">
${spineXml}
  </spine>
</package>`;
  zip.file("EPUB/package.opf", packageOpf);

  // 17. Generate Final Binary EPUB Blob & Trigger Browser Download
  const epubBlob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const cleanFilename = `${title.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, "_")}.epub`;
  saveAs(epubBlob, cleanFilename);
}

/**
 * Helper to generate and write clean chapter XHTML file
 * Formats exactly ONE chapter header:
 * CHAPTER 1
 * The Arrival
 * ❖
 * [Story text starts immediately]
 */
function writeChapterFile(zip: JSZip, chap: ParsedChapter, language: string) {
  let contentHtml = "";

  if (chap.scenes && chap.scenes.length > 0) {
    chap.scenes.forEach((scene, sIdx) => {
      if (sIdx > 0) {
        contentHtml += `\n    <div class="scene-break">❖ ❖ ❖</div>\n`;
      }
      scene.paragraphs.forEach((p, pIdx) => {
        const pClass = pIdx === 0 && sIdx === 0 ? ' class="first-p"' : "";
        contentHtml += `    <p${pClass}>${escapeXml(p)}</p>\n`;
      });
    });
  } else {
    contentHtml = `    <p class="first-p">...</p>\n`;
  }

  const numberHtml = chap.numberText
    ? `<p class="chapter-number">${escapeXml(chap.numberText)}</p>`
    : "";
  const titleHtml = chap.titleText
    ? `<h2 class="chapter-title">${escapeXml(chap.titleText)}</h2>`
    : !chap.numberText
    ? `<h2 class="chapter-title">${escapeXml(chap.title)}</h2>`
    : "";

  const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>${escapeXml(chap.fullTitle)}</title>
  <link rel="stylesheet" type="text/css" href="../css/book.css"/>
</head>
<body>
  <section class="chapter-section" epub:type="chapter">
    <header class="chapter-header">
      ${numberHtml}
      ${titleHtml}
      <div class="chapter-ornament">❖</div>
    </header>
${contentHtml}
  </section>
</body>
</html>`;

  zip.file(`EPUB/text/${chap.filename}`, chapterXhtml);
}
