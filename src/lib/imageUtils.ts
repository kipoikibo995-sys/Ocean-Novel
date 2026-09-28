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
    label: "Mystic Elven Mage",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564447/fantasy_01_under_100kb_klikgx.jpg",
    category: "Mages & Casters",
    tags: ["elf", "mage", "sorceress", "magic", "glowing", "runes", "hooded", "arcane"],
    description: "An enigmatic elven spellcaster cloaked in deep blue, channeling radiant arcane light and glowing runes.",
  },
  {
    label: "Steampunk Aviator Tinkerer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564446/fantasy_02_under_100kb_iagnes.jpg",
    category: "Rogues & Artificers",
    tags: ["steampunk", "artificer", "inventor", "goggles", "aviator", "leather", "mechanic", "tinkerer"],
    description: "A clever young tinkerer equipped with brass goggles and leather flight jacket, ready for aerial adventures.",
  },
  {
    label: "Royal Court Empress",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564446/fantasy_03_under_100kb_xf2ihh.jpg",
    category: "Nobles & Court",
    tags: ["empress", "queen", "noble", "royal", "crown", "court", "jewelry", "aristocrat"],
    description: "A regal monarch adorned in ornate golden crown and jewel-encrusted crimson robes exuding supreme courtly authority.",
  },
  {
    label: "Celestial Starborn Scholar",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564451/fantasy_04_under_100kb_wicdbn.jpg",
    category: "Mages & Casters",
    tags: ["scholar", "astromancer", "celestial", "stars", "scrolls", "wizard", "academic", "constellation"],
    description: "A scholarly mystic with celestial eyes, surrounded by glowing star charts, ancient tomes, and astral constellations.",
  },
  {
    label: "Arcane Rune Weaver",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564445/fantasy_05_under_100kb_vyx8we.jpg",
    category: "Mages & Casters",
    tags: ["mage", "runes", "arcane", "sorcerer", "mystic", "spellweaver", "glow"],
    description: "A master of glyphic sorcery weaving radiant protective sigils and resonant magical wards.",
  },
  {
    label: "Chanter of the Astral Plane",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564445/fantasy_05_under_100kb_vyx8we.jpg",
    category: "Fae & Mystics",
    tags: ["astral", "chanter", "spellcaster", "cosmic", "enchanter", "mystic"],
    description: "A spiritual chanter connected to higher dimensions, invoking ethereal light and cosmic resonance.",
  },
  {
    label: "Shadowblade Assassin",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564448/fantasy_07_under_100kb_jzsg1g.jpg",
    category: "Rogues & Artificers",
    tags: ["assassin", "rogue", "shadow", "daggers", "stealth", "leather", "hooded", "ninja"],
    description: "A lethal covert operative veiled in shadows and black leather, dual-wielding curved obsidian blades.",
  },
  {
    label: "Solar Templar Paladin",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564449/fantasy_08_under_100kb_mkojix.jpg",
    category: "Warriors & Knights",
    tags: ["paladin", "knight", "templar", "armor", "sun", "gold", "warrior", "divine"],
    description: "A resolute champion of the dawn clad in gleaming gold and silver plate armor etched with solar heraldry.",
  },
  {
    label: "Twilight Forest Druidess",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564450/fantasy_09_under_100kb_olpmb3.jpg",
    category: "Fae & Mystics",
    tags: ["druid", "nature", "fae", "mystic", "forest", "flora", "wild", "glowing"],
    description: "A serene guardian of ancient woodlands woven with living vines, glowing blossom petals, and twilight essence.",
  },
  {
    label: "Abyssal Horned Fiend",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564448/fantasy_10_under_100kb_hh25jh.jpg",
    category: "Creatures & Demons",
    tags: ["demon", "fiend", "horns", "dark fantasy", "abyss", "crimson", "sorcerer", "infernal"],
    description: "A menacing underworld lord crowned with formidable obsidian horns, radiating sinister crimson flame.",
  },
  {
    label: "Crimson Duelist",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564461/11_under_100kb_jd7zle.jpg",
    category: "Warriors & Knights",
    tags: ["duelist", "swordsman", "crimson", "rapier", "fighter", "cape", "noble warrior"],
    description: "An aristocratic swordsman in crimson velvet mantle with lightning reflexes and flawless fencing technique.",
  },
  {
    label: "Frost Whisper Necromancer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564462/12_under_100kb_hlq8js.jpg",
    category: "Mages & Casters",
    tags: ["necromancer", "frost", "dark mage", "skulls", "undead", "ice", "sorcerer"],
    description: "A cold-eyed summoner wielding frostbitten skeletal arts and chilling glacial evocations.",
  },
  {
    label: "Rune-Etched Barbarian",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564465/14_under_100kb_hpb6jp.jpg",
    category: "Warriors & Knights",
    tags: ["barbarian", "berserker", "warrior", "tattoos", "axe", "tribal", "viking"],
    description: "A fierce warrior adorned with glowing clan warpaint and primeval battle scars, wielding unstoppable might.",
  },
  {
    label: "Sylvan Huntress Ranger",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564466/15_under_100kb_atj3uk.jpg",
    category: "Rogues & Artificers",
    tags: ["ranger", "huntress", "archer", "bow", "forest", "green", "tracker", "scout"],
    description: "A keen-eyed scout of the high emerald canopy, silent as a falling leaf with her enchanted recurve bow.",
  },
  {
    label: "High Inquisitor of the Sun",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564461/16_under_100kb_p3ceg2.jpg",
    category: "Nobles & Court",
    tags: ["inquisitor", "cleric", "golden", "sun", "judge", "holy", "robes", "ecclesiastical"],
    description: "A formidable ecclesiastical judge in cloth-of-gold robes, enforcing the unyielding law of the sacred light.",
  },
  {
    label: "Shadow Alchemist",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564463/17_under_100kb_pb7uyt.jpg",
    category: "Rogues & Artificers",
    tags: ["alchemist", "potions", "rogue", "vials", "poison", "hood", "lab", "tinkerer"],
    description: "A secretive experimenter surrounded by phosphorescent vials, volatile elixirs, and alchemical catalysts.",
  },
  {
    label: "Moonlight Siren Priestess",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564464/18_under_100kb_epxdhg.jpg",
    category: "Fae & Mystics",
    tags: ["priestess", "moon", "mystic", "silver", "fae", "water", "ethereal", "divine"],
    description: "An ethereal maiden with cascading silver hair, invoking lunar blessings and celestial tides.",
  },
  {
    label: "Ironclad Vanguard Knight",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564465/19_under_100kb_fhpqyx.jpg",
    category: "Warriors & Knights",
    tags: ["knight", "vanguard", "heavy armor", "shield", "iron", "defender", "champion"],
    description: "A battle-hardened frontline guardian encased in dark tempered steel, bearing an unbreakable kite shield.",
  },
  {
    label: "Draconic Flame Sorcerer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564463/20_under_100kb_zfzfyh.jpg",
    category: "Mages & Casters",
    tags: ["dragon", "sorcerer", "fire", "draconic", "scales", "pyro", "flame", "warlock"],
    description: "A fiery spellcaster carrying dragon blood, igniting ancient primordial flames with an iron-willed gaze.",
  },
  {
    label: "Archduke of the Night",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564453/21_under_100kb_pdojqx.jpg",
    category: "Nobles & Court",
    tags: ["vampire", "lord", "archduke", "gothic", "court", "velvet", "aristocrat", "monarch"],
    description: "A brooding gothic noble with a velvet cravat and aristocratic composure, commanding twilight realms.",
  },
  {
    label: "Bladesinger Elf",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564452/22_under_100kb_ayvmhs.jpg",
    category: "Warriors & Knights",
    tags: ["bladesinger", "elf", "sword", "magic", "graceful", "spellblade", "duelist"],
    description: "An elven swordmaster harmonizing martial finesse with resonant blade songs and kinetic spells.",
  },
  {
    label: "Nether Lich Sovereign",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564453/23_under_100kb_mbtfhi.jpg",
    category: "Creatures & Demons",
    tags: ["lich", "undead", "necromancer", "skull", "crown", "green glow", "undying"],
    description: "An ancient undead sovereign ruling from an eternal bone throne crowned in eerie emerald soulfire.",
  },
  {
    label: "Rogue Bounty Hunter",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564458/24_under_100kb_peyoek.jpg",
    category: "Rogues & Artificers",
    tags: ["bounty hunter", "rogue", "gunslinger", "leather", "scoundrel", "mercenary"],
    description: "A gritty frontier tracker wrapped in reinforced duster coats, hunting high-value targets across wild frontiers.",
  },
  {
    label: "Oracle of the Deep Cosmos",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564458/25_under_100kb_gnarv2.jpg",
    category: "Fae & Mystics",
    tags: ["oracle", "seer", "cosmos", "stars", "prophet", "veil", "galaxy", "divination"],
    description: "A veiled prophet peering through temporal rifts, reading the weaving tapestry of distant constellations.",
  },
  {
    label: "Grand Marshal of the Realm",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564456/26_under_100kb_khkqki.jpg",
    category: "Nobles & Court",
    tags: ["marshal", "commander", "noble", "general", "medals", "uniform", "imperial"],
    description: "A distinguished supreme commander decorated with imperial honors, directing grand tactical campaigns.",
  },
  {
    label: "Thunderclaw Shaman",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564457/27_under_100kb_am0d3p.jpg",
    category: "Fae & Mystics",
    tags: ["shaman", "lightning", "tribal", "storm", "totem", "elemental", "tempest"],
    description: "A primal channeler of the sky's wrath, calling down arc lightning and turbulent gale gusts.",
  },
  {
    label: "Runesmith Artificer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564455/28_under_100kb_cvsnrc.jpg",
    category: "Rogues & Artificers",
    tags: ["runesmith", "blacksmith", "hammer", "forge", "dwarf", "craftsman", "weaponsmith"],
    description: "A master artisan forging legendary arms and armor bound by immutable geometric runes.",
  },
  {
    label: "Shadow Assassin Matron",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564456/29_under_100kb_ohi1n0.jpg",
    category: "Rogues & Artificers",
    tags: ["assassin", "shadow", "matron", "daggers", "mask", "dark elf", "stealth"],
    description: "The masked matriarch of an elite shadow guild, executing contracts with ruthless precision.",
  },
  {
    label: "Ethereal Spirit Maiden",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564454/30_under_100kb_uiq80q.jpg",
    category: "Fae & Mystics",
    tags: ["spirit", "ghost", "maiden", "ethereal", "spectral", "pale", "fae", "phantom"],
    description: "A luminous apparition wandering frosted winter glens, singing forgotten melodies of sorrow.",
  },
  {
    label: "Dragon Knight Warmaster",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564470/31_under_100kb_fqecgv.jpg",
    category: "Warriors & Knights",
    tags: ["dragon knight", "warrior", "dragon armor", "spear", "flame", "draconic", "champion"],
    description: "A legendary warlord in dragonscale barding wielding a blazing dragon lance.",
  },
  {
    label: "Highland Berserker Chieftain",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564470/32_under_100kb_a0slub.jpg",
    category: "Warriors & Knights",
    tags: ["berserker", "chieftain", "viking", "fur", "warrior", "beard", "battle", "north"],
    description: "A towering northern patriarch in heavy wolf pelt cloak, commanding the mountain clans.",
  },
  {
    label: "Archmage of the Violet Spire",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564511/33_under_100kb_uikhja.jpg",
    category: "Mages & Casters",
    tags: ["archmage", "violet", "spire", "arcane", "wizard", "orb", "staff", "high mage"],
    description: "A supreme magister channeling vortexes of pure raw magic from the highest tower of the academy.",
  },
  {
    label: "Corsair Sea Captain",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564468/34_under_100kb_d0ytct.jpg",
    category: "Rogues & Artificers",
    tags: ["pirate", "corsair", "captain", "sea", "rogue", "coat", "mariner", "swashbuckler"],
    description: "A dashing and daring sea captain charting uncharted waters and hunting forgotten leviathan treasures.",
  },
  {
    label: "Moonlight Huntress",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564469/35_under_100kb_h5fl8n.jpg",
    category: "Fae & Mystics",
    tags: ["huntress", "moon", "bow", "silver", "fae", "ranger", "night", "archer"],
    description: "A silent stalker beneath the silver crescent, armed with arrows carved from fallen starlight.",
  },
  {
    label: "Grand Duchess of the Court",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564509/36_under_100kb_tckrgf.jpg",
    category: "Nobles & Court",
    tags: ["duchess", "noble", "court", "tiara", "elegance", "silk", "aristocrat", "high society"],
    description: "A high-ranking royal noblewoman adorned with diamond tiaras and lavish brocade ballgowns.",
  },
  {
    label: "Crimson Inquisitor Captain",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564510/37_under_100kb_irpwkt.jpg",
    category: "Warriors & Knights",
    tags: ["inquisitor", "captain", "sword", "crimson", "armor", "templar", "purifier"],
    description: "An unbending crusader leader wielding a blessed broadsword dedicated to vanquishing dark sorceries.",
  },
  {
    label: "Venomous Blade Dancer",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564508/38_under_100kb_mfs9gy.jpg",
    category: "Rogues & Artificers",
    tags: ["blade dancer", "assassin", "poison", "exotic", "daggers", "veil", "acrobat"],
    description: "A mesmerizing dancer whose hypnotic choreography conceals razor-sharp serpent venom blades.",
  },
  {
    label: "Demon-Blooded Warlock",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564509/39_under_100kb_dfckes.jpg",
    category: "Creatures & Demons",
    tags: ["warlock", "demon", "blood magic", "horns", "occult", "dark", "tiefling"],
    description: "An occultist who bargained for demonic vitality, wielding hellfire and forbidden blood incantations.",
  },
  {
    label: "Forest Nymph Enchantress",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564471/40_under_100kb_jyur2b.jpg",
    category: "Fae & Mystics",
    tags: ["nymph", "fae", "forest", "flowers", "enchantress", "nature", "green", "dryad"],
    description: "A blooming nature spirit in harmony with woodland creatures, blooming flora, and enchanted streams.",
  },
  {
    label: "Ironclad Sentinel Guardian",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564514/41_under_100kb_ukxlrr.jpg",
    category: "Warriors & Knights",
    tags: ["sentinel", "guardian", "heavy plate", "shield", "iron", "fortress", "paladin"],
    description: "An immovable bulwark standing eternal watch before the gates of the mountain sanctuary.",
  },
  {
    label: "Shadow Weaver Occultist",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564513/42_under_100kb_totjsf.jpg",
    category: "Mages & Casters",
    tags: ["occult", "shadow", "sorcerer", "dark magic", "purple", "mystic", "warlock"],
    description: "A secretive mystic channeling shadows and purple void energy to manipulate temporal reality.",
  },
  {
    label: "Storm Dragon Shaman",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564513/43_under_100kb_ubddwi.jpg",
    category: "Creatures & Demons",
    tags: ["dragon", "shaman", "totem", "storm", "beast", "primal", "elemental"],
    description: "A primal shaman communing with ancient dragon spirits to summon raging squalls and thunder.",
  },
  {
    label: "Golden Crest Paladin Knight",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564556/44_under_100kb_pmw13g.jpg",
    category: "Warriors & Knights",
    tags: ["paladin", "knight", "gold", "crest", "armor", "sword", "crusader", "holy warrior"],
    description: "A sworn champion bearing an ornate gilded winged crest, pledged to uphold honor and justice.",
  },
  {
    label: "Arch-Sorceress of the Astral Veil",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564557/45_under_100kb_qbj4hr.jpg",
    category: "Mages & Casters",
    tags: ["sorceress", "astral", "veil", "cosmic", "gems", "spellcaster", "arcane"],
    description: "A visionary mistress of the arcane veiled in iridescent fabrics and humming with cosmic power.",
  },
  {
    label: "Silent Nightblade Assassin",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564517/46_under_100kb_wk4nky.jpg",
    category: "Rogues & Artificers",
    tags: ["assassin", "nightblade", "stealth", "shadow", "cloak", "poison", "operative"],
    description: "A phantom operative moving noiselessly through midnight courtyards, eliminating high-profile targets.",
  },
  {
    label: "High Chancellor of the Throne",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564518/47_under_100kb_ipxyda.jpg",
    category: "Nobles & Court",
    tags: ["chancellor", "court", "noble", "minister", "royalty", "silk", "statesman"],
    description: "A shrewd royal advisor dressed in magnificent gold-trimmed ceremonial robes, wielding immense state power.",
  },
  {
    label: "Ancient Forest Willow Dryad",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564519/48_under_100kb_tgoaxn.jpg",
    category: "Fae & Mystics",
    tags: ["dryad", "fae", "forest", "nature", "tree spirit", "green", "woodland"],
    description: "A sacred tree spirit whose heartbeat synchronizes with the ancient roots and whispers of the elder woods.",
  },
  {
    label: "Iron Berserker of the North",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564516/49_under_100kb_lk6i5x.jpg",
    category: "Warriors & Knights",
    tags: ["berserker", "iron", "barbarian", "warrior", "axes", "fury", "viking"],
    description: "An unstoppable northern warrior in heavy iron plate wielding twin bearded battle axes.",
  },
  {
    label: "Nether Wyrm Warlock",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564516/50_under_100kb_ntxoor.jpg",
    category: "Creatures & Demons",
    tags: ["warlock", "wyrm", "nether", "demon", "horns", "darkness", "infernal"],
    description: "A horned dark sorcerer bound to an ancient nether dragon, commanding destructive shadow flames.",
  },
  {
    label: "Imperial Princess Diplomat",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1790564515/51_under_100kb_r69i3d.jpg",
    category: "Nobles & Court",
    tags: ["princess", "diplomat", "noble", "royal", "court", "tiara", "elegance", "aristocrat"],
    description: "A graceful imperial heir celebrated for both her sharp political intellect and peerless courtly charisma.",
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
