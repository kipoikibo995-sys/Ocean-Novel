// Ocean Novel License Tiers & Funnel Packages
// FE: FrontEnd (Author Edition - $27)
// OTO1: Unlimited Studio Edition ($47)
// OTO2: Ocean Novel Premium - AI Ghostwriter & Lore Architecture ($67)

export type LicensePlan = 'free' | 'pro' | 'master' | 'commercial';

export interface PlanLimits {
  tierCode: 'FE' | 'OTO1' | 'OTO2' | 'COMMERCIAL';
  tierName: string;
  maxProjects: number;             // FE: 3, OTO1/OTO2: unlimited
  maxCharactersPerProject: number;    // FE: 25, OTO1/OTO2: unlimited
  maxLocationsPerProject: number;     // FE: 15, OTO1/OTO2: unlimited
  hasImageLibrary: boolean;         // FE: false, OTO1+: true (50+ preset portraits & locations)
  hasEpub3Export: boolean;          // FE: false, OTO1+: true (Amazon KDP EPUB 3 export)
  hasAiGhostwriterHub: boolean;     // FE/OTO1: false, OTO2+: true (AI Prompt Hub & Ghostwriter generator)
  hasContinuityEngine: boolean;     // FE/OTO1: false, OTO2+: true (Deep Logic & Continuity Conflict Engine)
  hasCommercialKit: boolean;        // Commercial: true
}

export const PLAN_LIMITS: Record<LicensePlan, PlanLimits> = {
  free: {
    tierCode: 'FE',
    tierName: 'FrontEnd: Author Edition',
    maxProjects: 3,
    maxCharactersPerProject: 25,
    maxLocationsPerProject: 15,
    hasImageLibrary: false,
    hasEpub3Export: false,
    hasAiGhostwriterHub: false,
    hasContinuityEngine: false,
    hasCommercialKit: false,
  },
  pro: {
    tierCode: 'OTO1',
    tierName: 'OTO1: Unlimited Studio Edition',
    maxProjects: Infinity,
    maxCharactersPerProject: Infinity,
    maxLocationsPerProject: Infinity,
    hasImageLibrary: true,
    hasEpub3Export: true,
    hasAiGhostwriterHub: false,
    hasContinuityEngine: false,
    hasCommercialKit: false,
  },
  master: {
    tierCode: 'OTO2',
    tierName: 'OTO2: Ocean Novel Premium (AI & Lore)',
    maxProjects: Infinity,
    maxCharactersPerProject: Infinity,
    maxLocationsPerProject: Infinity,
    hasImageLibrary: true,
    hasEpub3Export: true,
    hasAiGhostwriterHub: true,
    hasContinuityEngine: true,
    hasCommercialKit: false,
  },
  commercial: {
    tierCode: 'COMMERCIAL',
    tierName: 'Agency & Commercial Enterprise',
    maxProjects: Infinity,
    maxCharactersPerProject: Infinity,
    maxLocationsPerProject: Infinity,
    hasImageLibrary: true,
    hasEpub3Export: true,
    hasAiGhostwriterHub: true,
    hasContinuityEngine: true,
    hasCommercialKit: true,
  },
};

export const FE_QUOTAS = {
  MAX_PROJECTS: 3,
  MAX_CHARACTERS_PER_PROJECT: 25,
  MAX_LOCATIONS_PER_PROJECT: 15,
};

