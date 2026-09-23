import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface EpubChapter {
  title: string;
  content: string; // Plain text or clean HTML
}

export interface EpubOptions {
  title: string;
  author: string;
  language?: string;
  includeTitlePage?: boolean;
  chapters: EpubChapter[];
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function exportToEpub({
  title,
  author,
  language = "en",
  includeTitlePage = true,
  chapters,
}: EpubOptions): Promise<void> {
  const zip = new JSZip();

  // 1. mimetype (Must be first, stored uncompressed)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. META-INF/container.xml
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const uuid = "urn:uuid:" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  // 3. OEBPS/style.css (Kindle and E-reader friendly stylesheet)
  const css = `
body {
  margin: 5%;
  font-family: Georgia, "Palatino Linotype", serif;
  line-height: 1.6;
  color: #1a1a1a;
}
h1.book-title {
  text-align: center;
  font-size: 2.2em;
  margin-top: 25vh;
  margin-bottom: 0.3em;
  font-weight: bold;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
p.author-name {
  text-align: center;
  font-size: 1.3em;
  margin-bottom: 25vh;
  font-style: italic;
}
h2.chapter-title {
  text-align: center;
  font-size: 1.6em;
  margin-top: 2em;
  margin-bottom: 1.5em;
  page-break-before: always;
  font-weight: normal;
}
p {
  margin: 0;
  text-indent: 1.5em;
  text-align: justify;
}
p.first-paragraph {
  text-indent: 0;
}
nav#toc ol {
  list-style-type: none;
  padding-left: 0;
}
nav#toc li {
  margin-bottom: 0.8em;
}
nav#toc a {
  text-decoration: none;
  color: #333333;
}
`;
  zip.file("OEBPS/style.css", css);

  // 4. Title page (if enabled)
  if (includeTitlePage) {
    const titlePageXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body class="title-page">
  <h1 class="book-title">${escapeXml(title)}</h1>
  <p class="author-name">By ${escapeXml(author)}</p>
</body>
</html>`;
    zip.file("OEBPS/titlepage.xhtml", titlePageXhtml);
  }

  // 5. Chapter XHTML files
  chapters.forEach((chapter, index) => {
    const chIndex = index + 1;
    const rawParagraphs = chapter.content
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const paragraphsHtml = rawParagraphs
      .map((p, i) => `<p class="${i === 0 ? "first-paragraph" : ""}">${escapeXml(p)}</p>`)
      .join("\n    ");

    const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>${escapeXml(chapter.title || `Chapter ${chIndex}`)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <section epub:type="chapter">
    <h2 class="chapter-title">Chapter ${chIndex}: ${escapeXml(chapter.title)}</h2>
    ${paragraphsHtml}
  </section>
</body>
</html>`;

    zip.file(`OEBPS/chapter_${chIndex}.xhtml`, chapterXhtml);
  });

  // 6. Navigation Document (EPUB 3: nav.xhtml)
  const navListHtml = chapters
    .map(
      (ch, idx) =>
        `    <li><a href="chapter_${idx + 1}.xhtml">Chapter ${idx + 1}: ${escapeXml(ch.title)}</a></li>`
    )
    .join("\n");

  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1 style="text-align: center; margin-bottom: 1.5em;">Table of Contents</h1>
    <ol>
${navListHtml}
    </ol>
  </nav>
</body>
</html>`;
  zip.file("OEBPS/nav.xhtml", navXhtml);

  // 7. NCX (Table of Contents for Kindle legacy / e-readers)
  const ncxNavPoints = chapters
    .map(
      (ch, idx) => `    <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
      <navLabel><text>Chapter ${idx + 1}: ${escapeXml(ch.title)}</text></navLabel>
      <content src="chapter_${idx + 1}.xhtml"/>
    </navPoint>`
    )
    .join("\n");

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <docAuthor><text>${escapeXml(author)}</text></docAuthor>
  <navMap>
${ncxNavPoints}
  </navMap>
</ncx>`;
  zip.file("OEBPS/toc.ncx", tocNcx);

  // 8. OEBPS/content.opf (The Package Document)
  const manifestItems: string[] = [
    `    <item id="style" href="style.css" media-type="text/css"/>`,
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
  ];

  if (includeTitlePage) {
    manifestItems.push(`    <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`);
  }

  chapters.forEach((_, idx) => {
    manifestItems.push(
      `    <item id="ch_${idx + 1}" href="chapter_${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`
    );
  });

  const spineItems: string[] = [];
  if (includeTitlePage) {
    spineItems.push(`    <itemref idref="titlepage"/>`);
  }
  spineItems.push(`    <itemref idref="nav"/>`);
  chapters.forEach((_, idx) => {
    spineItems.push(`    <itemref idref="ch_${idx + 1}"/>`);
  });

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <meta property="dcterms:modified">${nowIso}</meta>
    <dc:publisher>Ocean Novel Studio</dc:publisher>
  </metadata>
  <manifest>
${manifestItems.join("\n")}
  </manifest>
  <spine toc="ncx">
${spineItems.join("\n")}
  </spine>
</package>`;
  zip.file("OEBPS/content.opf", contentOpf);

  // Generate .epub Blob
  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const safeFilename = title.replace(/[^\w\s-]/gi, "").trim().replace(/\s+/g, "_") || "manuscript";
  saveAs(blob, `${safeFilename}.epub`);
}
