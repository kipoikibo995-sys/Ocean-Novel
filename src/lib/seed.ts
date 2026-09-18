import { storage } from "./storage";
import { SEED_FANTASY_BOOKS } from "../data/seedFantasy";

export const runFantasySeed = (): boolean => {
  const isUpgraded = localStorage.getItem("FANTASY_CHAR_PORTRAITS_SEEDED_V5");

  if (!isUpgraded) {
    SEED_FANTASY_BOOKS.forEach(book => {
      const existingData = storage.getProjectData(book.project.id);
      if (!existingData) {
        storage.saveProject(book.project as any);
        storage.saveProjectData(book.project.id, book.data as any);
      } else {
        // Upgrade existing character portraits to user-provided images
        const updatedCharacters = (existingData.characters || []).map((existingChar: any, index: number) => {
          const sampleChar = book.data.characters?.[index];
          if (sampleChar && (!existingChar.imageUrl || existingChar.imageUrl.includes("unsplash.com") || existingChar.imageUrl.includes(".webp"))) {
            return {
              ...existingChar,
              imageUrl: sampleChar.imageUrl,
            };
          }
          return existingChar;
        });

        storage.saveProjectData(book.project.id, {
          ...existingData,
          characters: updatedCharacters,
        });
      }
    });

    localStorage.setItem("FANTASY_CHAR_PORTRAITS_SEEDED_V5", "true");
    return false;
  }

  return false;
};
