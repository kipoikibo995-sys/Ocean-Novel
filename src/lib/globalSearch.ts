import { ManuscriptItem } from "@/mockData";
import { ProjectData, storage } from "./storage";

export interface SearchResultItem {
  id: string;
  sourceType: 'manuscript' | 'character' | 'location' | 'note' | 'bible';
  sourceTitle: string;
  sourceSubtitle?: string;
  targetId: string; // sceneId, characterId, locationId, or field name
  field: string;
  snippetBefore: string;
  matchText: string;
  snippetAfter: string;
  fullSnippet: string;
  originalText: string;
  matchIndex: number;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  sourceTypes?: Array<'manuscript' | 'character' | 'location' | 'note' | 'bible'>;
}

export interface ReplaceItemRequest {
  result: SearchResultItem;
  replacement: string;
}

// Helper to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Strip HTML tags safely to get plain text while retaining spacing
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Searches across all data in a project:
 * - Manuscript scenes (both content and title)
 * - Characters (name, role, description, motivation, traits)
 * - Locations (name, type, description)
 * - Scene Notes
 * - Story Bible
 */
export function searchProject(
  projectData: ProjectData,
  query: string,
  options: SearchOptions = {}
): SearchResultItem[] {
  if (!query || !query.trim()) return [];

  const results: SearchResultItem[] = [];
  const flags = options.caseSensitive ? "g" : "gi";
  const escapedQuery = escapeRegExp(query.trim());
  const regexPattern = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
  
  let regex: RegExp;
  try {
    regex = new RegExp(regexPattern, flags);
  } catch (e) {
    return [];
  }

  const enabledSources = new Set(
    options.sourceTypes || ['manuscript', 'character', 'location', 'note', 'bible']
  );

  const findMatchesInText = (
    text: string,
    sourceType: SearchResultItem['sourceType'],
    sourceTitle: string,
    sourceSubtitle: string | undefined,
    targetId: string,
    field: string
  ) => {
    if (!text) return;
    const plainText = stripHtml(text);
    let match: RegExpExecArray | null;
    const localRegex = new RegExp(regexPattern, flags);

    while ((match = localRegex.exec(plainText)) !== null) {
      const matchIndex = match.index;
      const matchLength = match[0].length;
      
      const start = Math.max(0, matchIndex - 45);
      const end = Math.min(plainText.length, matchIndex + matchLength + 45);

      const before = plainText.substring(start, matchIndex);
      const matched = plainText.substring(matchIndex, matchIndex + matchLength);
      const after = plainText.substring(matchIndex + matchLength, end);

      const prefix = start > 0 ? "…" : "";
      const suffix = end < plainText.length ? "…" : "";

      results.push({
        id: `${sourceType}-${targetId}-${field}-${matchIndex}`,
        sourceType,
        sourceTitle,
        sourceSubtitle,
        targetId,
        field,
        snippetBefore: prefix + before,
        matchText: matched,
        snippetAfter: after + suffix,
        fullSnippet: `${prefix}${before}${matched}${after}${suffix}`,
        originalText: plainText,
        matchIndex,
      });

      // Avoid infinite loop if zero-width match
      if (match.index === localRegex.lastIndex) {
        localRegex.lastIndex++;
      }
    }
  };

  // 1. Search Manuscript
  if (enabledSources.has('manuscript') && projectData.manuscript) {
    const traverseManuscript = (items: ManuscriptItem[], path: string[] = []) => {
      for (const item of items) {
        const currentPath = [...path, item.title];
        if (item.type === 'scene') {
          const parentPath = path.join(" › ");
          if (item.title) {
            findMatchesInText(
              item.title,
              'manuscript',
              item.title,
              parentPath || 'Scene Title',
              item.id,
              'title'
            );
          }
          if (item.content) {
            findMatchesInText(
              item.content,
              'manuscript',
              item.title,
              parentPath || 'Scene Content',
              item.id,
              'content'
            );
          }
        }
        if (item.children && item.children.length > 0) {
          traverseManuscript(item.children, currentPath);
        }
      }
    };
    traverseManuscript(projectData.manuscript);
  }

  // 2. Search Characters
  if (enabledSources.has('character') && projectData.characters) {
    for (const char of projectData.characters) {
      if (char.name) {
        findMatchesInText(char.name, 'character', char.name, 'Name & Identity', String(char.id), 'name');
      }
      if (char.role) {
        findMatchesInText(char.role, 'character', char.name, 'Role', String(char.id), 'role');
      }
      if (char.description) {
        findMatchesInText(char.description, 'character', char.name, 'Description', String(char.id), 'description');
      }
      if (char.motivation) {
        findMatchesInText(char.motivation, 'character', char.name, 'Motivation', String(char.id), 'motivation');
      }
      if (char.backstory) {
        findMatchesInText(char.backstory, 'character', char.name, 'Backstory', String(char.id), 'backstory');
      }
      if (Array.isArray(char.traits)) {
        findMatchesInText(char.traits.join(", "), 'character', char.name, 'Traits', String(char.id), 'traits');
      }
    }
  }

  // 3. Search Locations
  if (enabledSources.has('location') && projectData.locations) {
    for (const loc of projectData.locations) {
      if (loc.name) {
        findMatchesInText(loc.name, 'location', loc.name, 'Location Name', String(loc.id), 'name');
      }
      if (loc.type) {
        findMatchesInText(loc.type, 'location', loc.name, 'Location Type', String(loc.id), 'type');
      }
      if (loc.description) {
        findMatchesInText(loc.description, 'location', loc.name, 'Description', String(loc.id), 'description');
      }
      if (loc.history) {
        findMatchesInText(loc.history, 'location', loc.name, 'History & Lore', String(loc.id), 'history');
      }
    }
  }

  // 4. Search Notes
  if (enabledSources.has('note') && projectData.notes) {
    for (const [sceneId, noteContent] of Object.entries(projectData.notes)) {
      if (noteContent) {
        // Look up scene title if possible
        let sceneTitle = `Scene #${sceneId}`;
        const findScene = (items: ManuscriptItem[]): string | null => {
          for (const it of items) {
            if (it.id === sceneId) return it.title;
            if (it.children) {
              const res = findScene(it.children);
              if (res) return res;
            }
          }
          return null;
        };
        if (projectData.manuscript) {
          const foundTitle = findScene(projectData.manuscript);
          if (foundTitle) sceneTitle = foundTitle;
        }

        findMatchesInText(noteContent, 'note', `Notes: ${sceneTitle}`, 'Scene Notes', sceneId, 'note');
      }
    }
  }

  // 5. Search Story Bible
  if (enabledSources.has('bible') && projectData.storyBible) {
    const bible = projectData.storyBible;
    const bibleFields: Array<{ key: keyof typeof bible; label: string }> = [
      { key: 'premise', label: 'Story Premise' },
      { key: 'worldDescription', label: 'World Description' },
      { key: 'importantRules', label: 'World Rules & Magic' },
      { key: 'mainConflict', label: 'Core Conflict' },
      { key: 'themes', label: 'Themes' },
      { key: 'primarySetting', label: 'Primary Setting' },
      { key: 'narrativeStyle', label: 'Narrative Style' },
      { key: 'dialogueStyle', label: 'Dialogue Style' },
      { key: 'tone', label: 'Tone' },
    ];

    for (const item of bibleFields) {
      const val = bible[item.key];
      if (typeof val === 'string' && val.trim()) {
        findMatchesInText(val, 'bible', `Story Bible: ${item.label}`, item.label, item.key, item.key);
      }
    }
  }

  return results;
}

/**
 * Executes a global replacement across the project data.
 * Safely handles HTML mentions (updating data-label and inner text)
 * and plain text in scenes, characters, locations, notes, and story bible.
 */
export function executeBatchReplace(
  projectId: string,
  searchQuery: string,
  replacementText: string,
  selectedResultIds: Set<string>,
  options: SearchOptions = {}
): { updatedCount: number; projectData: ProjectData } {
  const currentData = storage.getProjectData(projectId);
  if (!currentData) {
    throw new Error("Project data not found");
  }

  let updatedCount = 0;
  const flags = options.caseSensitive ? "g" : "gi";
  const escapedQuery = escapeRegExp(searchQuery.trim());
  const regexPattern = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
  const regex = new RegExp(regexPattern, flags);

  // Deep clone to safely mutate
  const data: ProjectData = JSON.parse(JSON.stringify(currentData));

  // Helper to replace plain text occurrences
  const replaceInPlainText = (text: string): string => {
    return text.replace(regex, (match) => {
      updatedCount++;
      return replacementText;
    });
  };

  // Helper to replace in HTML content (specifically handling TipTap mentions)
  const replaceInHtml = (htmlContent: string): string => {
    if (!htmlContent) return "";
    
    // 1. First replace occurrences inside mentions:
    // <span data-type="mention" data-id="1" data-label="OldName" class="mention">@OldName</span>
    let updatedHtml = htmlContent.replace(
      /<span([^>]*?)data-label="([^"]*?)"([^>]*?)>@?([^<]*?)<\/span>/gi,
      (fullTag, p1, label, p3, text) => {
        let modified = false;
        let newLabel = label;
        let newText = text;

        if (regex.test(label)) {
          newLabel = label.replace(regex, () => {
            updatedCount++;
            modified = true;
            return replacementText;
          });
        }
        if (regex.test(text)) {
          newText = text.replace(regex, () => {
            modified = true;
            return replacementText;
          });
        }

        if (modified) {
          return `<span${p1}data-label="${newLabel}"${p3}>@${newLabel}</span>`;
        }
        return fullTag;
      }
    );

    // 2. Then replace general text outside tags
    // Split by tags so we don't destroy HTML markup tags
    const parts = updatedHtml.split(/(<[^>]*>)/g);
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i].startsWith('<')) {
        parts[i] = parts[i].replace(regex, (m) => {
          updatedCount++;
          return replacementText;
        });
      }
    }

    return parts.join("");
  };

  // 1. Replace in Manuscript
  if (data.manuscript) {
    const updateManuscript = (items: ManuscriptItem[]) => {
      for (const item of items) {
        if (item.type === 'scene') {
          // Check if any results were selected for this scene
          const hasSelectedTitle = Array.from(selectedResultIds).some(id => id.includes(`manuscript-${item.id}-title`));
          const hasSelectedContent = Array.from(selectedResultIds).some(id => id.includes(`manuscript-${item.id}-content`));

          if (hasSelectedTitle && item.title) {
            item.title = replaceInPlainText(item.title);
          }
          if (hasSelectedContent && item.content) {
            item.content = replaceInHtml(item.content);
          }
        }
        if (item.children) {
          updateManuscript(item.children);
        }
      }
    };
    updateManuscript(data.manuscript);
  }

  // 2. Replace in Characters
  if (data.characters) {
    for (const char of data.characters) {
      const charId = String(char.id);
      const isSelected = (field: string) => 
        Array.from(selectedResultIds).some(id => id.includes(`character-${charId}-${field}`));

      if (char.name && isSelected('name')) {
        char.name = replaceInPlainText(char.name);
      }
      if (char.role && isSelected('role')) {
        char.role = replaceInPlainText(char.role);
      }
      if (char.description && isSelected('description')) {
        char.description = replaceInPlainText(char.description);
      }
      if (char.motivation && isSelected('motivation')) {
        char.motivation = replaceInPlainText(char.motivation);
      }
      if (char.backstory && isSelected('backstory')) {
        char.backstory = replaceInPlainText(char.backstory);
      }
    }
  }

  // 3. Replace in Locations
  if (data.locations) {
    for (const loc of data.locations) {
      const locId = String(loc.id);
      const isSelected = (field: string) => 
        Array.from(selectedResultIds).some(id => id.includes(`location-${locId}-${field}`));

      if (loc.name && isSelected('name')) {
        loc.name = replaceInPlainText(loc.name);
      }
      if (loc.type && isSelected('type')) {
        loc.type = replaceInPlainText(loc.type);
      }
      if (loc.description && isSelected('description')) {
        loc.description = replaceInPlainText(loc.description);
      }
      if (loc.history && isSelected('history')) {
        loc.history = replaceInPlainText(loc.history);
      }
    }
  }

  // 4. Replace in Notes
  if (data.notes) {
    for (const [sceneId, noteContent] of Object.entries(data.notes)) {
      const isSelected = Array.from(selectedResultIds).some(id => id.includes(`note-${sceneId}-note`));
      if (isSelected && noteContent) {
        data.notes[sceneId] = replaceInPlainText(noteContent);
      }
    }
  }

  // 5. Replace in Story Bible
  if (data.storyBible) {
    const bible = data.storyBible as any;
    for (const key of Object.keys(bible)) {
      const isSelected = Array.from(selectedResultIds).some(id => id.includes(`bible-${key}-${key}`));
      if (isSelected && typeof bible[key] === 'string') {
        bible[key] = replaceInPlainText(bible[key]);
      }
    }
  }

  // Persist the updated data
  storage.saveProjectData(projectId, data);

  return { updatedCount, projectData: data };
}
