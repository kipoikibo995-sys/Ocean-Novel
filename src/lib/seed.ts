import { storage } from "./storage";
import { SEED_FANTASY_BOOKS } from "../data/seedFantasy";

export const runFantasySeed = (): boolean => {
  if (localStorage.getItem("FANTASY_SEEDED_2")) {
    return false;
  }
  
  SEED_FANTASY_BOOKS.forEach(book => {
    storage.saveProject(book.project as any);
    storage.saveProjectData(book.project.id, book.data as any);
  });
  
  localStorage.setItem("FANTASY_SEEDED_2", "true");
  
  // Force a reload to reflect changes
  window.location.reload();
};
