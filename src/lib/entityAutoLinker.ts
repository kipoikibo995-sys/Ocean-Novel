/**
 * Smart Entity Auto-Linker for Ocean Novel Writing Studio
 * Automatically detects characters and locations in plain text or HTML
 * and converts them into bold, interactive mentions without the '@' prefix.
 */

export interface EntityItem {
  id: string;
  name: string;
  role?: string;
  type?: string;
  aliases?: string[] | string;
}

export interface EntityMatcher {
  text: string;
  id: string;
  type: 'character' | 'location';
  role?: string;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Common words / honorifics that shouldn't match as standalone first-names if short or generic
const STOP_WORDS = new Set([
  'the', 'and', 'with', 'from', 'into', 'over', 'that', 'this',
  'lord', 'lady', 'sir', 'mrs', 'miss', 'doctor', 'prof', 'king', 'queen',
  'captain', 'agent', 'detective', 'officer', 'father', 'mother', 'brother', 'sister'
]);

/**
 * Builds prioritized matchers from character and location entities.
 * Multi-word full names come first, followed by significant single names/aliases.
 */
export function buildEntityMatchers(entities: EntityItem[]): EntityMatcher[] {
  const matchers: EntityMatcher[] = [];
  const seenTexts = new Set<string>();

  for (const ent of entities) {
    if (!ent || !ent.name || typeof ent.name !== 'string') continue;
    const name = ent.name.trim();
    if (name.length < 2) continue;

    const entType: 'character' | 'location' = ent.type && !ent.role ? 'location' : 'character';

    // 1. Full primary name
    const lowerName = name.toLowerCase();
    if (!seenTexts.has(lowerName)) {
      seenTexts.add(lowerName);
      matchers.push({ text: name, id: String(ent.id), type: entType, role: ent.role || ent.type });
    }

    // 2. Aliases if available
    let aliasList: string[] = [];
    if (Array.isArray(ent.aliases)) {
      aliasList = ent.aliases;
    } else if (typeof ent.aliases === 'string') {
      aliasList = ent.aliases.split(',').map(s => s.trim());
    }

    for (const alias of aliasList) {
      const trimmed = alias.trim();
      const lowerAlias = trimmed.toLowerCase();
      if (trimmed.length >= 2 && !seenTexts.has(lowerAlias) && !STOP_WORDS.has(lowerAlias)) {
        seenTexts.add(lowerAlias);
        matchers.push({ text: trimmed, id: String(ent.id), type: entType, role: ent.role || ent.type });
      }
    }

    // 3. Significant sub-parts of the name (e.g. First name or Surname)
    const parts = name.split(/\s+/).map(p => p.trim()).filter(p => p.length >= 3);
    for (const part of parts) {
      const lowerPart = part.toLowerCase();
      if (!seenTexts.has(lowerPart) && !STOP_WORDS.has(lowerPart)) {
        seenTexts.add(lowerPart);
        matchers.push({ text: part, id: String(ent.id), type: entType, role: ent.role || ent.type });
      }
    }
  }

  // Sort descending by text length so longer multi-word names (e.g., "Jennifer Vance") match before "Jennifer"
  return matchers.sort((a, b) => b.text.length - a.text.length);
}

/**
 * Links entity names inside a raw text chunk by claiming non-overlapping ranges.
 * Longer entity names take priority, avoiding sub-word or partial-name collisions.
 */
function linkTextChunk(
  text: string,
  matchers: EntityMatcher[],
  claimedNames: Set<string>
): { text: string; count: number } {
  if (!text || matchers.length === 0) return { text, count: 0 };

  interface MatchItem {
    start: number;
    end: number;
    text: string;
    matcher: EntityMatcher;
  }

  const matches: MatchItem[] = [];

  for (const m of matchers) {
    // Unicode-aware word boundary pattern
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(m.text)}(?![\\p{L}\\p{N}])`, 'giu');
    let res: RegExpExecArray | null;
    while ((res = regex.exec(text)) !== null) {
      matches.push({
        start: res.index,
        end: res.index + res[0].length,
        text: res[0],
        matcher: m,
      });
    }
  }

  if (matches.length === 0) return { text, count: 0 };

  // Sort matches by: length descending, then earlier start index
  matches.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);

  // Claim non-overlapping ranges
  const claimed: MatchItem[] = [];
  for (const match of matches) {
    const overlaps = claimed.some(c => !(match.end <= c.start || match.start >= c.end));
    if (!overlaps) {
      claimed.push(match);
      claimedNames.add(match.text);
    }
  }

  if (claimed.length === 0) return { text, count: 0 };

  // Sort claimed matches by start index ascending for sequential assembly
  claimed.sort((a, b) => a.start - b.start);

  let result = '';
  let lastIndex = 0;
  for (const c of claimed) {
    result += text.slice(lastIndex, c.start);
    result += `<span data-type="mention" data-id="${c.matcher.id}" data-label="${c.text}" class="mention font-bold text-[#8C503C] hover:text-[#5C2E1F] hover:bg-[#8C503C]/10 px-0.5 rounded cursor-pointer transition-colors">${c.text}</span>`;
    lastIndex = c.end;
  }
  result += text.slice(lastIndex);

  return { text: result, count: claimed.length };
}

/**
 * Scans an HTML string or fragment and wraps occurrences of character/location names
 * in interactive, bold Tiptap mention spans without the '@' prefix:
 * <span data-type="mention" data-id="${id}" data-label="${matched}">${matched}</span>
 */
export function autoLinkEntitiesInHtml(
  htmlContent: string,
  entities: EntityItem[]
): { html: string; linkedCount: number; linkedNames: string[] } {
  if (!htmlContent || !entities || entities.length === 0) {
    return { html: htmlContent, linkedCount: 0, linkedNames: [] };
  }

  const matchers = buildEntityMatchers(entities);
  if (matchers.length === 0) {
    return { html: htmlContent, linkedCount: 0, linkedNames: [] };
  }

  const claimedNames = new Set<string>();
  let totalLinked = 0;

  // Split HTML into HTML tags vs text tokens
  // E.g. tokens alternates between tags "<...>" and text content
  const tokens = htmlContent.split(/(<[^>]+>)/g);

  let insideSkipTag = 0;
  const processedTokens = tokens.map(token => {
    if (!token) return '';

    // Check if token is an HTML tag
    if (token.startsWith('<') && token.endsWith('>')) {
      const lower = token.toLowerCase();
      // Track tags that should not have their contents parsed
      if (
        lower.startsWith('<a ') || lower === '<a>' ||
        lower.includes('data-type="mention"') ||
        lower.includes("data-type='mention'") ||
        lower.includes('class="mention') ||
        lower.startsWith('<code') ||
        lower.startsWith('<pre')
      ) {
        insideSkipTag++;
      } else if (
        lower === '</a>' ||
        lower === '</span>' ||
        lower === '</code>' ||
        lower === '</pre>'
      ) {
        if (insideSkipTag > 0) insideSkipTag--;
      }
      return token;
    }

    // If inside a tag that already links or contains code, leave text untouched
    if (insideSkipTag > 0) {
      return token;
    }

    // Process pure text chunk
    const { text: linkedText, count } = linkTextChunk(token, matchers, claimedNames);
    totalLinked += count;
    return linkedText;
  });

  return {
    html: processedTokens.join(''),
    linkedCount: totalLinked,
    linkedNames: Array.from(claimedNames),
  };
}

/**
 * Handles plain text conversion to HTML with auto-linked entities
 */
export function autoLinkEntitiesInPlainText(
  plainText: string,
  entities: EntityItem[]
): { html: string; linkedCount: number; linkedNames: string[] } {
  if (!plainText) {
    return { html: '', linkedCount: 0, linkedNames: [] };
  }

  const paragraphs = plainText
    .split(/\r?\n\r?\n/)
    .map(p => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');

  return autoLinkEntitiesInHtml(paragraphs, entities);
}
