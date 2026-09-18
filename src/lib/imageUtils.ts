/**
 * Utility to process uploaded image files (resize and compress to base64)
 * to ensure fast client-side rendering and protect against localStorage quota limits.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // For SVG or GIF (to preserve animation/vectors), return direct data URL
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => {
        resolve(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface PresetImage {
  label: string;
  url: string;
  category?: string;
  tags?: string[];
  description?: string;
}

export const FANTASY_PRESET_PORTRAITS: PresetImage[] = [
  {
    label: "Skeletal Mage / Necromancer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721908/10_skeletal_mage_e6802e.jpg",
    category: "Mages & Casters",
    tags: ["mage", "necromancer", "skeleton", "dark magic", "undead", "skull", "pháp sư xương"],
    description: "Undead sorcerer in ornate bone vestments channeling eldritch death magic.",
  },
  {
    label: "Red & Gold Court Lady",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721908/09_red_gold_court_lady_kusyp1.jpg",
    category: "Nobles & Court",
    tags: ["court", "lady", "noble", "aristocrat", "red gold", "royal", "quý phu nhân"],
    description: "High-born imperial noblewoman adorned in crimson silk and filigree gold jewelry.",
  },
  {
    label: "Dark Fae Sorceress",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721907/08_dark_fae_woman_mj0wba.jpg",
    category: "Fae & Mystics",
    tags: ["fae", "dark fae", "sorceress", "mystic", "fairy", "tiên hắc ám", "ma thuật"],
    description: "Enigmatic fey mystic with luminous nocturnal features and twilight glamour.",
  },
  {
    label: "Woodland Child with Rabbit",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721895/01_woodland_child_with_rabbit_rzvvgu.jpg",
    category: "Fae & Mystics",
    tags: ["woodland", "child", "rabbit", "nature", "innocent", "đứa trẻ rừng", "thỏ"],
    description: "Innocent forest child holding a wild hare amidst mossy ancient glades.",
  },
  {
    label: "Horned Dark Fantasy Demoness",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721895/05_horned_dark_fantasy_woman_bd5vg4.jpg",
    category: "Creatures & Demons",
    tags: ["horned", "demon", "tiefling", "dark fantasy", "sorceress", "nữ quỷ", "có sừng"],
    description: "Crown of curved obsidian horns framing a fierce tiefling warlord.",
  },
  {
    label: "Fur-Clad Elder Warrior",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721896/06_fur_clad_elder_warrior_cm6wxh.jpg",
    category: "Warriors & Knights",
    tags: ["warrior", "elder", "nordic", "viking", "fur", "chiến binh già", "áo lông"],
    description: "Weather-beaten northern chieftain cloaked in thick wolf pelt and hardened mail.",
  },
  {
    label: "Desert Noble / Vizier",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721895/04_desert_noble_gu06uc.jpg",
    category: "Nobles & Court",
    tags: ["desert", "noble", "vizier", "sultan", "nomad", "quý tộc sa mạc", "lãnh chúa"],
    description: "Commanding aristocrat of the southern dunes draped in embroidered silk robes.",
  },
  {
    label: "Steampunk Youth / Artificer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721896/07_steampunk_youth_enrgaj.jpg",
    category: "Rogues & Artificers",
    tags: ["steampunk", "artificer", "inventor", "youth", "goggles", "thiếu niên cơ khí"],
    description: "Keen-eyed young inventor with brass goggles and mechanical tools.",
  },
  {
    label: "Gothic Aristocrat / Nobleman",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721895/02_gothic_aristocrat_rsdt8q.jpg",
    category: "Nobles & Court",
    tags: ["gothic", "aristocrat", "vampire", "lord", "nobleman", "quý tộc gothic"],
    description: "Brooding high-society lord with velvet coat and antique family signet.",
  },
  {
    label: "Regal Orc Shaman of the Forest Shrine",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/06_regal_orc_shaman_of_the_forest_shrine_da7pn9.jpg",
    category: "Creatures & Demons",
    tags: ["orc", "shaman", "forest shrine", "druid", "tribal", "pháp sư orc"],
    description: "Venerable orc spirit-seer crowned in bone beads and emerald canopy light.",
  },
  {
    label: "Regal Paladin in Cathedral",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/02_regal_paladin_in_the_cathedral_kmo5lz.jpg",
    category: "Warriors & Knights",
    tags: ["paladin", "knight", "cathedral", "holy armor", "kỵ sĩ thánh đường"],
    description: "Devout knight protector stood beneath towering stained-glass vaulted arches.",
  },
  {
    label: "Elderly Wizard in Celestial Study",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/03_elderly_wizard_in_a_celestial_study_gxgza0.jpg",
    category: "Mages & Casters",
    tags: ["wizard", "celestial", "study", "astronomy", "scholar", "đại pháp sư"],
    description: "Silver-bearded stargazer examining astrolabes and cosmic tomes.",
  },
  {
    label: "Rogue in Lantern-Lit Alley",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/04_rogue_in_the_lantern_lit_alley_xdppun.jpg",
    category: "Rogues & Artificers",
    tags: ["rogue", "assassin", "shadow", "lantern", "alley", "thích khách"],
    description: "Cloaked shadow operative stalking cobblestone alleyways under gaslight.",
  },
  {
    label: "Red-Haired Forge Warrior",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/05_red_haired_forge_warrior_portrait_tpde6u.jpg",
    category: "Warriors & Knights",
    tags: ["warrior", "forge", "blacksmith", "red hair", "fighter", "chiến binh lò rèn"],
    description: "Dauntless flame-haired blacksmith warrior tempered by anvil fire and steel.",
  },
  {
    label: "Elven Sorceress in Celestial Library",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/01_elven_sorceress_in_a_celestial_library_pbyk5z.jpg",
    category: "Mages & Casters",
    tags: ["elven", "sorceress", "celestial library", "mage", "books", "nữ pháp sư elf"],
    description: "Graceful elven scholar channeling arcane constellations in an infinite archives.",
  },
  {
    label: "Grandmother Herbalist in Cozy Apothecary",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/09_grandmother_herbalist_in_her_cozy_apothecary_esx6py.jpg",
    category: "Creatures & Demons",
    tags: ["herbalist", "apothecary", "grandmother", "potions", "healer", "bà lão dược sư"],
    description: "Warm, wise matriarch surrounded by dried blossoms, potion vials, and warm hearth light.",
  },
  {
    label: "Dragonborn Astromancer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/07_dragonborn_astromancer_in_a_candlelit_study_vp4n8q.jpg",
    category: "Creatures & Demons",
    tags: ["dragonborn", "astromancer", "dragon", "candlelit", "study", "long tộc"],
    description: "Draconic scholar deciphering ancient planetary charts under candlelight.",
  },
  {
    label: "Desert Citadel Warrior at Dusk",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/10_desert_citadel_warrior_at_dusk_djbqqn.jpg",
    category: "Warriors & Knights",
    tags: ["desert", "warrior", "citadel", "dusk", "spear", "chiến binh sa mạc"],
    description: "Stalwart guardian keeping watch atop ochre fortress ramparts as the sun sets.",
  },
  {
    label: "Enchanted Woodland Fairy",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1789721866/08_enchanted_woodland_fairy_portrait_pgsfxw.jpg",
    category: "Fae & Mystics",
    tags: ["fairy", "woodland", "enchanted", "fae", "wings", "tiên nữ rừng"],
    description: "Delicate sprite with iridescent gossamer wings glowing among dew-kissed mushrooms.",
  },
  {
    label: "Young Rogue / Scout",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/05_defiant_young_rogue_portrait_vmydle.webp",
    category: "Rogues & Artificers",
    tags: ["rogue", "scout", "youth", "dagger", "stealth"],
    description: "Agile scout ready with daggers in hand, prepared for covert wilderness missions.",
  },
  {
    label: "Elder Druid / Shaman",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/06_elder_druid_of_the_whispering_woods_ki2zso.webp",
    category: "Creatures & Demons",
    tags: ["druid", "shaman", "nature", "elder", "horns"],
    description: "Guardian of the primeval woods attuned to nature spirits and primal forces.",
  },
  {
    label: "Dwarf Warrior / Guardian",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/08_stern_dwarf_warrior_in_braided_armor_bljexb.webp",
    category: "Warriors & Knights",
    tags: ["dwarf", "warrior", "guardian", "armor", "beard"],
    description: "Unyielding mountain defender clad in ancestral runic plate.",
  },
  {
    label: "Elven Noble / Diplomat",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/02_enigmatic_woodland_elven_noble_kf6umg.webp",
    category: "Nobles & Court",
    tags: ["elf", "noble", "diplomat", "woodland", "royal"],
    description: "Silvan lord with courtly poise and deep knowledge of realm politics.",
  },
  {
    label: "Astral Wizard / Archmage",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/03_elderly_wizard_with_astral_amulet_dvtdh5.webp",
    category: "Mages & Casters",
    tags: ["wizard", "archmage", "astral", "amulet", "magic"],
    description: "Master of celestial evocation wearing an energized astral medallion.",
  },
  {
    label: "Sun Knight / Paladin",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/04_noble_sun_knight_portrait_iehl2w.webp",
    category: "Warriors & Knights",
    tags: ["knight", "sun", "paladin", "gold armor", "noble"],
    description: "Solar crusader championing the dawn with sun-blessed plate and mantle.",
  },
];

export const FANTASY_PRESET_LOCATIONS = [
  {
    label: "Golden Oasis City",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/06_golden_oasis_city_at_sunset_so7xdx.jpg",
  },
  {
    label: "Volcanic Citadel",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/04_volcanic_citadel_at_sunset_yafvd7.jpg",
  },
  {
    label: "Enchanted Woods",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg",
  },
  {
    label: "Frostgate Citadel",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg",
  },
  {
    label: "Stormlit Harbor",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/09_stormlit_harbor_of_the_cliffside_citadel_jpisuj.jpg",
  },
  {
    label: "Ruined Emerald Citadel",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/07_ruined_citadel_beneath_the_green_storm_po3es7.jpg",
  },
];
