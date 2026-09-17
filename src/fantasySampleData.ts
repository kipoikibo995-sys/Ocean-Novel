import { ManuscriptItem, MOCK_MANUSCRIPT, MOCK_CHARACTERS, MOCK_LOCATIONS } from "./mockData";
import { storage, ProjectMeta, ProjectData } from "./lib/storage";

export interface FantasyBookSample {
  meta: ProjectMeta;
  data: ProjectData;
}

export const FANTASY_SAMPLE_BOOKS: FantasyBookSample[] = [
  // BOOK 1: The Silent Harbor (Gothic Coast Mystery Fantasy)
  {
    meta: {
      id: "book-silent-harbor",
      title: "The Silent Harbor",
      author: "Sarah Cole",
      genre: "Gothic Coast Fantasy",
      audience: "Adult",
      logline: "An investigator returns to an isolated coastal town haunted by drowned gods and the fifteen-year-old mystery of her sister's disappearance.",
      wordGoal: 75000,
      currentWords: 18450,
      lastModified: Date.now() - 3600000 * 2,
      themeColor: "bg-[#2a1a14]",
    },
    data: {
      manuscript: MOCK_MANUSCRIPT,
      characters: [
        {
          id: "1",
          name: "Sarah Cole",
          role: "Protagonist",
          description: "Investigative occultist returning to her hometown after fifteen years of exile.",
          age: "32",
          motivation: "To uncover the supernatural conspiracy that claimed her sister.",
          locationId: "1",
          traits: ["ANALYTICAL", "RELENTLESS", "GUARDED"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/04_noble_sun_knight_portrait_iehl2w.webp",
          backstory: "Raised along the treacherous sea bluffs of Greyhaven, Sarah was the only family member who never believed the drowning was an accident."
        },
        {
          id: "2",
          name: "Daniel Reeves",
          role: "Supporting Character",
          description: "Weary detective and Harbor Warden who suspects dark rituals.",
          age: "38",
          motivation: "To atone for closing the case prematurely fifteen years ago.",
          locationId: "2",
          traits: ["CYNICAL", "PROTECTIVE", "OBSERVANT"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/08_stern_dwarf_warrior_in_braided_armor_bljexb.webp",
          backstory: "A decorated former guard captain, Daniel knows every subterranean tunnel beneath the cliffs."
        },
        {
          id: "3",
          name: "Eleanor Cole",
          role: "Supporting Character",
          description: "Sarah's estranged mother and keeper of the maritime blood oath.",
          age: "59",
          motivation: "To protect the family lineage from the ancient leviathan cult.",
          locationId: "3",
          traits: ["SECRETIVE", "COLD", "AUTHORITATIVE"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/02_enigmatic_woodland_elven_noble_kf6umg.webp",
          backstory: "Matriarch of the old merchant fleet, Eleanor traded blood secrets for safe harbor during the Great Storms."
        }
      ],
      locations: MOCK_LOCATIONS,
      storyBible: {
        title: "The Silent Harbor",
        genre: "Gothic Coast Fantasy",
        subgenre: "Occult Mystery",
        targetAudience: "Adult",
        pov: "Third Person Limited",
        tone: "Melancholic, tense, atmospheric",
        premise: "An occult investigator unearths ancient drowned deities lurking under her hometown.",
        mainConflict: "Uncovering the truth of the sister's sacrifice while the town's secret society hunts her.",
        worldDescription: "Cold, wind-battered coastlines lined with jagged obsidian cliffs and drowned sunken ruins.",
        importantRules: "The Tide mirrors the heartbeat of the Sunken God; blood spilled on wet stone cannot be washed away by rainwater.",
        narrativeStyle: "Lyrical prose with sensory focus on damp brine, creaking timber, and creeping shadows."
      }
    }
  },

  // BOOK 2: The Sunken Crown of Eldoria (Epic High Fantasy)
  {
    meta: {
      id: "book-sunken-crown",
      title: "The Sunken Crown of Eldoria",
      author: "Valen Hawke",
      genre: "Epic High Fantasy",
      audience: "Young Adult / New Adult",
      logline: "When the Dragon Emperor perishes without an heir, an outcast solar knight and an exiled elven sorceress journey into the volcanic abyss to claim the mythical Sunken Crown.",
      wordGoal: 95000,
      currentWords: 31200,
      lastModified: Date.now() - 3600000 * 5,
      themeColor: "bg-[#3e1f17]",
    },
    data: {
      manuscript: [
        {
          id: "sc-part-1",
          type: "part",
          title: "Part I: The Shattered Altar",
          children: [
            {
              id: "sc-chap-1",
              type: "chapter",
              title: "Chapter 1: Oath of the Sun Knight",
              children: [
                {
                  id: "sc-scene-1",
                  type: "scene",
                  title: "Scene 1: Flames on the Bastion",
                  content: `<h1>Oath of the Sun Knight</h1>
<p>The dawn over the <span data-type="mention" data-id="loc-volcano" data-label="Volcanic Citadel" class="mention">@Volcanic Citadel</span> did not break with light, but with crimson ash. <span data-type="mention" data-id="char-valen" data-label="Prince Valen Eldoria" class="mention">@Prince Valen Eldoria</span> tightened the clasps of his gilded breastplate as embers drifted past his visored helm. The bells of the High Spires tolled twelve times—a sign that the Dragon Emperor was dead, and the imperial lineage had fractured into blood and blade.</p>
<p>"You shouldn't be standing on the open parapet, Valen," a melodic, teasing voice whispered from the mist. <span data-type="mention" data-id="char-lyra" data-label="Lyra Nightwhisper" class="mention">@Lyra Nightwhisper</span> stepped through the smoke, her emerald cloak swirling around boots of silent woven bark. Her hand lingered over the silver hilt of her astral bow. "The Pyre Guard is already sweeping the lower wards. If they find you here, your birthright won't save you from <span data-type="mention" data-id="char-morath" data-label="Morath the Pyre Lord" class="mention">@Morath the Pyre Lord</span>."</p>
<p><span data-type="mention" data-id="char-valen" data-label="Prince Valen Eldoria" class="mention">@Prince Valen Eldoria</span> turned, his golden eyes burning with quiet fury. "Let Morath come. The Dragon Crown was forged in the Sunken Depths, not in his bloody execution pits. If the elders crown him tonight, Eldoria will burn to cinders before the season ends."</p>
<p><span data-type="mention" data-id="char-lyra" data-label="Lyra Nightwhisper" class="mention">@Lyra Nightwhisper</span> watched him with a mixture of pity and admiration. "Then we ride south before midday. <span data-type="mention" data-id="char-garrick" data-label="Garrick Stonebreaker" class="mention">@Garrick Stonebreaker</span> has already secured the tunnel below the magma aqueduct. But once we plunge into the Sunken Realm, there is no army behind us. Only myth and ancient dragons."</p>`
                },
                {
                  id: "sc-scene-2",
                  type: "scene",
                  title: "Scene 2: The Forge of Embers",
                  content: `<h1>The Forge of Embers</h1>
<p>Deep within the subterranean belly of the fortress, the clanging of runic steel shook the stone caverns. <span data-type="mention" data-id="char-garrick" data-label="Garrick Stonebreaker" class="mention">@Garrick Stonebreaker</span> stood chest-deep in heat, a massive two-handed forging hammer resting across his braided leather apron. He spat into a trough of bubbling water and scowled at the approaching footsteps.</p>
<p>"You're late, boy," <span data-type="mention" data-id="char-garrick" data-label="Garrick Stonebreaker" class="mention">@Garrick Stonebreaker</span> grunted, gesturing with soot-covered tongs toward an anvil bathed in blue dragonfire. "Another ten minutes and <span data-type="mention" data-id="char-morath" data-label="Morath the Pyre Lord" class="mention">@Morath the Pyre Lord</span>'s scouts would have sealed the iron gates above. Look here, <span data-type="mention" data-id="char-valen" data-label="Prince Valen Eldoria" class="mention">@Prince Valen Eldoria</span>—your father's signet ring still matches the keyway of the Sunken Vault."</p>
<p><span data-type="mention" data-id="char-lyra" data-label="Lyra Nightwhisper" class="mention">@Lyra Nightwhisper</span> touched the glyphs along the cold iron door. "The magic here isn't dwarven or elven. It is primordial dragon speech. To open it without waking the beasts beneath, <span data-type="mention" data-id="char-valen" data-label="Prince Valen Eldoria" class="mention">@Prince Valen Eldoria</span> must channel the solar crest."</p>
<p>"I know what it costs," Valen whispered, laying his palm upon the searing brass lock. Gold light flared across his skin, illuminating the cavern with the blinding brilliance of a newborn star.</p>`
                }
              ]
            }
          ]
        }
      ],
      characters: [
        {
          id: "char-valen",
          name: "Prince Valen Eldoria",
          role: "Protagonist",
          description: "Outcast Solar Paladin and rightful heir to the Dragon Throne.",
          age: "26",
          motivation: "To claim the Sunken Crown and unite the fractured realms against tyrannical ruin.",
          traits: ["HONORABLE", "FEARLESS", "IDEALISTIC"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/04_noble_sun_knight_portrait_iehl2w.webp",
          backstory: "Exiled after refusing to execute civilian clans during the Border Skirmishes, Valen carries the ancient blood of solar kings."
        },
        {
          id: "char-lyra",
          name: "Lyra Nightwhisper",
          role: "Supporting Character",
          description: "Exiled woodland elven sorceress and master of ancient celestial bowcraft.",
          age: "118",
          motivation: "To restore the ancient treaty between elves and humans before war annihilates the sacred forests.",
          traits: ["CUNNING", "PERCEPTIVE", "MYSTERIOUS"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/02_enigmatic_woodland_elven_noble_kf6umg.webp",
          backstory: "Banished from the Silver Canopy for studying forbidden star sorcery, Lyra found an unexpected ally in Valen."
        },
        {
          id: "char-garrick",
          name: "Garrick Stonebreaker",
          role: "Supporting Character",
          description: "Dwarven Forge Master and veteran general of the Volcanic Redoubts.",
          age: "142",
          motivation: "To honor his life-debt to Valen's fallen father and protect the secret dwarven tunnels.",
          traits: ["GRUNTING", "LOYAL", "MASTER SMITH"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/08_stern_dwarf_warrior_in_braided_armor_bljexb.webp",
          backstory: "Renowned across five provinces as the only smith capable of folding dragon-scale metal into flexible plate."
        },
        {
          id: "char-morath",
          name: "Morath the Pyre Lord",
          role: "Antagonist",
          description: "Ruthless warlord commanding the Obsidian Legions with dragonfire pacts.",
          age: "45",
          motivation: "To seize absolute dominion over Eldoria and eradicate all rival bloodlines.",
          traits: ["TYRANNICAL", "CRUEL", "STRATEGIC"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/05_defiant_young_rogue_portrait_vmydle.webp",
          backstory: "Once a trusted general of the late Emperor, Morath made a pact with the dormant fire dragons beneath Mount Ash."
        }
      ],
      locations: [
        {
          id: "loc-volcano",
          name: "Volcanic Citadel",
          type: "Imperial Fortress",
          description: "An immense black fortress carved into the obsidian caldera of Mount Ash.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/04_volcanic_citadel_at_sunset_yafvd7.jpg"
        },
        {
          id: "loc-oasis",
          name: "Golden Oasis City",
          type: "Trading Capital",
          description: "The radiant desert crossroads where human merchants and elven scholars mingle.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/06_golden_oasis_city_at_sunset_so7xdx.jpg"
        },
        {
          id: "loc-peak",
          name: "Dragon's Peak",
          type: "Mountain Sanctuary",
          description: "Snow-crowned heights where the last slumbering drakes nest above the clouds.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg"
        }
      ],
      storyBible: {
        title: "The Sunken Crown of Eldoria",
        genre: "Epic High Fantasy",
        subgenre: "Dragon Mythos",
        targetAudience: "Young Adult / New Adult",
        pov: "Third Person Multi-POV",
        tone: "Heroic, grand, suspenseful",
        premise: "An outcast solar paladin races to find a drowned crown before a fire tyrant enslaves the continent.",
        mainConflict: "Claiming the sunken dragon artifacts while avoiding the Obsidian Legions and awakening slumbering leviathans.",
        worldDescription: "A world of towering obsidian spires, subterranean magma rivers, and ancient elven forests.",
        importantRules: "Solar magic is powered by personal virtue and vows; dragonfire consumes both body and mind if wielded without an ancient crest.",
        narrativeStyle: "Fast-paced epic fantasy with sweeping tactical battles, magical duels, and sharp banter."
      }
    }
  },

  // BOOK 3: Whispers of the Astral Spire (Arcane Dark Fantasy)
  {
    meta: {
      id: "book-astral-spire",
      title: "Whispers of the Astral Spire",
      author: "Archmage Alistair Vance",
      genre: "Arcane Dark Fantasy",
      audience: "Adult",
      logline: "Inside the celestial observatories of the Astral Spire, a disgraced scholar and a daring shadow thief break the Seventh Cosmic Seal, waking forgotten stellar anomalies.",
      wordGoal: 85000,
      currentWords: 24800,
      lastModified: Date.now() - 3600000 * 8,
      themeColor: "bg-[#1a2332]",
    },
    data: {
      manuscript: [
        {
          id: "as-part-1",
          type: "part",
          title: "Part I: The Forbidden Astrolabe",
          children: [
            {
              id: "as-chap-1",
              type: "chapter",
              title: "Chapter 1: The Shattered Prism",
              children: [
                {
                  id: "as-scene-1",
                  type: "scene",
                  title: "Scene 1: The Midnight Alignment",
                  content: `<h1>The Midnight Alignment</h1>
<p>Above the highest dome of the <span data-type="mention" data-id="loc-astral" data-label="Astral Spire" class="mention">@Astral Spire</span>, the constellations were running backward. <span data-type="mention" data-id="char-alistair" data-label="Archmage Alistair Vance" class="mention">@Archmage Alistair Vance</span> pressed his trembling hand against the brass astrolabe, feeling the stellar vibrations hum through his withered knuckles. The blue astral amulet at his neck flared with a piercing, cold luminescence.</p>
<p>"It's happening exactly as the dead scrolls foretold," Alistair muttered into his beard. "The Seventh Star has dropped out of its orbit."</p>
<p>Behind him, hanging upside down from the vaulted stained glass rafters, a lithe silhouette slipped silently to the floor. <span data-type="mention" data-id="char-kaelen" data-label="Kaelen Shadowblade" class="mention">@Kaelen Shadowblade</span> dusted obsidian soot off his leather breeches, tossing a heavy velvet pouch between his hands with a smirk.</p>
<p>"I hope you have the gold ready, Old Man," <span data-type="mention" data-id="char-kaelen" data-label="Kaelen Shadowblade" class="mention">@Kaelen Shadowblade</span> said, his twin shadow-daggers gleaming in the moonlight. "Breaking into the High Inquisitor's private crypt wasn't an evening stroll. His gargoyles nearly took my ears off."</p>
<p><span data-type="mention" data-id="char-alistair" data-label="Archmage Alistair Vance" class="mention">@Archmage Alistair Vance</span> snatched the pouch and emptied its contents onto the star chart. A pulsing, black crystal rolled across the parchment, freezing the ink into spiderwebs of frost. "You fool. This isn't just an artifact. This is the heart of a dead god. If <span data-type="mention" data-id="char-sylvia" data-label="Sylvia Moonthorn" class="mention">@Sylvia Moonthorn</span> discovers we have this inside the sanctuary, she will seal this entire tower in root and thorn."</p>
<p>"Then we'd better work fast," <span data-type="mention" data-id="char-kaelen" data-label="Kaelen Shadowblade" class="mention">@Kaelen Shadowblade</span> replied, leaning against the balcony railing and glancing down at the dark, bottomless chasm below. "Because I hear <span data-type="mention" data-id="char-inquisitor" data-label="Lord Inquisitor Vane" class="mention">@Lord Inquisitor Vane</span>'s hounds baying at the gates."</p>`
                },
                {
                  id: "as-scene-2",
                  type: "scene",
                  title: "Scene 2: Council of the Whispering Grove",
                  content: `<h1>Council of the Whispering Grove</h1>
<p>The smell of damp moss and ancient pine preceded her presence. <span data-type="mention" data-id="char-sylvia" data-label="Sylvia Moonthorn" class="mention">@Sylvia Moonthorn</span> stepped into the observatory library, her druidic staff humming with living green energy. Her ageless eyes scanned the forbidden manuscripts scattered across <span data-type="mention" data-id="char-alistair" data-label="Archmage Alistair Vance" class="mention">@Archmage Alistair Vance</span>'s desk with mounting horror.</p>
<p>"You are meddling with celestial forces that cannot be reasoned with, Alistair," <span data-type="mention" data-id="char-sylvia" data-label="Sylvia Moonthorn" class="mention">@Sylvia Moonthorn</span> warned, her voice trembling like rustling autumn leaves. "The stars are not guideposts for your vanity; they are cages holding back the cosmic void. When <span data-type="mention" data-id="char-kaelen" data-label="Kaelen Shadowblade" class="mention">@Kaelen Shadowblade</span> stole that prism, he severed the barrier between our world and the Void Maw."</p>
<p><span data-type="mention" data-id="char-alistair" data-label="Archmage Alistair Vance" class="mention">@Archmage Alistair Vance</span> looked up, his astral amulet pulsing in counterpoint to her green staff. "If I do nothing, <span data-type="mention" data-id="char-inquisitor" data-label="Lord Inquisitor Vane" class="mention">@Lord Inquisitor Vane</span> will weaponize the prism to purge every mage in the northern continent. We either master this cosmic anomaly, or we all perish under the Inquisitor's pyres."</p>`
                }
              ]
            }
          ]
        }
      ],
      characters: [
        {
          id: "char-alistair",
          name: "Archmage Alistair Vance",
          role: "Protagonist",
          description: "Grand Astromancer exiled for researching cosmic anomalies and forbidden celestial magic.",
          age: "74",
          motivation: "To decode the cosmic prophecy before the Astral Inquisitors eradicate free magical study.",
          traits: ["SCHOLARLY", "OBSESSIVE", "BRILLIANT"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/03_elderly_wizard_with_astral_amulet_dvtdh5.webp",
          backstory: "Former Dean of Celestial Theory, Alistair discovered that the empire's star calendar was hiding an impending cosmic extinction event."
        },
        {
          id: "char-kaelen",
          name: "Kaelen Shadowblade",
          role: "Supporting Character",
          description: "Defiant young rogue and master thief specializing in arcane relics and vault infiltration.",
          age: "23",
          motivation: "To buy his family's freedom from the Inquisitorial debtor mines with the ultimate heist.",
          traits: ["ACROBATIC", "SARCASTIC", "FEARLESS"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/05_defiant_young_rogue_portrait_vmydle.webp",
          backstory: "Orphaned in the lower docks, Kaelen discovered he could blend into magical shadows after surviving an experimental blast."
        },
        {
          id: "char-sylvia",
          name: "Sylvia Moonthorn",
          role: "Supporting Character",
          description: "Elder Druid of the Whispering Woods guarding the boundary between earthly nature and stellar rifts.",
          age: "62",
          motivation: "To preserve the sacred ley lines from celestial corruption.",
          traits: ["WISE", "UNYIELDING", "EARTH-BOUND"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/06_elder_druid_of_the_whispering_woods_ki2zso.webp",
          backstory: "Spokesperson of the Old Faith, Sylvia commands the roots of the forest to seal unnatural portals."
        },
        {
          id: "char-inquisitor",
          name: "Lord Inquisitor Vane",
          role: "Antagonist",
          description: "Supreme Commander of the Astral Inquisition, determined to burn all non-conforming sorcery.",
          age: "48",
          motivation: "To impose absolute imperial order by harnessing the cosmic void.",
          traits: ["ZEALOT", "RUTHLESS", "PURITANICAL"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/04_noble_sun_knight_portrait_iehl2w.webp",
          backstory: "Wields anti-magic cuffs and silver flames that incinerate spellcasters in their tracks."
        }
      ],
      locations: [
        {
          id: "loc-astral",
          name: "Astral Spire Observatory",
          type: "Arcane Tower",
          description: "A colossal spiraling tower of brass and crystal piercing the cloud cover.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/07_ruined_citadel_beneath_the_green_storm_po3es7.jpg"
        },
        {
          id: "loc-woods",
          name: "Whispering Woods",
          type: "Enchanted Forest",
          description: "Ancient bioluminescent forest where primordial spirits whisper secrets of forgotten stars.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg"
        },
        {
          id: "loc-lighthouse-astral",
          name: "The Celestial Beacon",
          type: "Landmark",
          description: "An isolated beacon projecting beams of concentrated star-fire across the chasm.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg"
        }
      ],
      storyBible: {
        title: "Whispers of the Astral Spire",
        genre: "Arcane Dark Fantasy",
        subgenre: "Cosmic Academy Mystery",
        targetAudience: "Adult",
        pov: "Third Person Limited (Alternating Alistair & Kaelen)",
        tone: "Intellectual, claustrophobic, cosmic dread",
        premise: "A wizard and a thief unlock a celestial vault, only to find the stars themselves are predatory entities.",
        mainConflict: "Evading the ruthless Inquisition while attempting to reseal a tear in the dimensional cosmos.",
        worldDescription: "High-Gothic floating towers, astrolabes the size of cities, and misty valleys corrupted by celestial radiation.",
        importantRules: "Spells draw upon stellar constellations; casting during an eclipse risks planetary backlash.",
        narrativeStyle: "Atmospheric, rich in esoteric terminology, sharp contrast between dusty libraries and roof-running chases."
      }
    }
  },

  // BOOK 4: Shadows of the Frostgate (Nordic Myth / Survival Fantasy)
  {
    meta: {
      id: "book-frostgate",
      title: "Shadows of the Frostgate",
      author: "Torvin Icevein",
      genre: "Nordic Grimdark Fantasy",
      audience: "Adult",
      logline: "Beyond the colossal glacial ramparts of Frostgate Citadel, a berserker clan and a frost shaman race against a blood-moon eclipse that awakens primeval frost beasts.",
      wordGoal: 80000,
      currentWords: 19800,
      lastModified: Date.now() - 3600000 * 14,
      themeColor: "bg-[#1c2c35]",
    },
    data: {
      manuscript: [
        {
          id: "fg-part-1",
          type: "part",
          title: "Part I: The Howling Rime",
          children: [
            {
              id: "fg-chap-1",
              type: "chapter",
              title: "Chapter 1: The Blood Moon Rises",
              children: [
                {
                  id: "fg-scene-1",
                  type: "scene",
                  title: "Scene 1: Watch on the Ice Wall",
                  content: `<h1>Watch on the Ice Wall</h1>
<p>The wind howled across the parapets of <span data-type="mention" data-id="loc-frostgate" data-label="Frostgate Citadel" class="mention">@Frostgate Citadel</span>, throwing needles of frozen sleet into the bearded face of <span data-type="mention" data-id="char-torvin" data-label="Torvin Icevein" class="mention">@Torvin Icevein</span>. He adjusted the wolf pelt across his broad iron pauldrons and leaned over the battlements. Far below in the glacial gorge, the shadows were crawling upward.</p>
<p>"The wolves won't hunt tonight, Jarl," a soft, shivering voice called out behind him. <span data-type="mention" data-id="char-astrid" data-label="Astrid Wolfspeaker" class="mention">@Astrid Wolfspeaker</span> emerged from the guardhouse, her pack of twin frost-hounds whining anxiously at her heels. "The scent on the gale is wrong. It smells of thawed carrion and ancient tomb-ice."</p>
<p><span data-type="mention" data-id="char-torvin" data-label="Torvin Icevein" class="mention">@Torvin Icevein</span> tightened his grip on his rune-etched battleaxe. "Then <span data-type="mention" data-id="char-malakor" data-label="Malakor the Ice Wraith" class="mention">@Malakor the Ice Wraith</span> has broken through the northern crevasse. Rouse the warband. Light the sulfur beacons along the west tower."</p>
<p>Before Astrid could turn, a flash of blue frost-fire illuminated the central courtyard. <span data-type="mention" data-id="char-freyja" data-label="Freyja Stormchaser" class="mention">@Freyja Stormchaser</span> was kneeling in the center of a carved spiral rune, her arms raised to the stormy heavens. Blood from her palms dripped onto the snow, sizzling into glowing azure vapor.</p>
<p>"The ice has spoken!" <span data-type="mention" data-id="char-freyja" data-label="Freyja Stormchaser" class="mention">@Freyja Stormchaser</span> cried out, her eyes milky white with shamanic trance. "<span data-type="mention" data-id="char-malakor" data-label="Malakor the Ice Wraith" class="mention">@Malakor the Ice Wraith</span> does not march with beasts alone. He brings the drowned warriors of the Fjords. If <span data-type="mention" data-id="char-torvin" data-label="Torvin Icevein" class="mention">@Torvin Icevein</span> does not sound the Horn of Winter before midnight, Frostgate will become our collective tomb!"</p>`
                }
              ]
            }
          ]
        }
      ],
      characters: [
        {
          id: "char-torvin",
          name: "Torvin Icevein",
          role: "Protagonist",
          description: "Grizzled clan Jarl and berserker chieftain defending the final bastion against perpetual winter.",
          age: "44",
          motivation: "To ensure his people survive the long winter eclipse at any cost.",
          traits: ["STERN", "RESILIENT", "FEARLESS"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/08_stern_dwarf_warrior_in_braided_armor_bljexb.webp",
          backstory: "Survivor of three blood feuds and twenty winters, Torvin holds the fortress gate against impossible odds."
        },
        {
          id: "char-freyja",
          name: "Freyja Stormchaser",
          role: "Supporting Character",
          description: "Frost Shaman and Seer who channels ancient elemental spirits through runic blood magic.",
          age: "36",
          motivation: "To appease the primordial winter spirits before the earth is swallowed by eternal ice.",
          traits: ["MYSTICAL", "DEVOUT", "CALM"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/02_enigmatic_woodland_elven_noble_kf6umg.webp",
          backstory: "Blinded during her initiation under the frozen waterfall, Freyja sees through the eyes of northern owls."
        },
        {
          id: "char-astrid",
          name: "Astrid Wolfspeaker",
          role: "Supporting Character",
          description: "Beastmaster scout and tracker who commands a pack of savage arctic frost-hounds.",
          age: "24",
          motivation: "To avenge her fallen clan members butchered by the Ice Wraith's shadows.",
          traits: ["FIERCE", "AGILE", "PRAGMATIC"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/05_defiant_young_rogue_portrait_vmydle.webp",
          backstory: "Raised by wolves in the high taiga, Astrid can track a scent across three days of blizzard."
        },
        {
          id: "char-malakor",
          name: "Malakor the Ice Wraith",
          role: "Antagonist",
          description: "Ancient king of the frost abyss, reawakened by the lunar eclipse to extinguish mortal warmth.",
          age: "Unknown",
          motivation: "To plunge the mortal world into frozen stillness for eternity.",
          traits: ["MERCILESS", "ETHEREAL", "ANCIENT"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/03_elderly_wizard_with_astral_amulet_dvtdh5.webp",
          backstory: "A betrayed ruler of the First Age whose kingdom was drowned in glaciers."
        }
      ],
      locations: [
        {
          id: "loc-frostgate",
          name: "Frostgate Citadel",
          type: "Glacial Fortress",
          description: "A colossal fortress constructed from blue glacial ice and megalithic granite stones.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg"
        },
        {
          id: "loc-harbor-frost",
          name: "Stormlit Harbor",
          type: "Frozen Port",
          description: "A storm-battered harbor where longships are encased in ice under jagged sea cliffs.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/09_stormlit_harbor_of_the_cliffside_citadel_jpisuj.jpg"
        },
        {
          id: "loc-woods-frost",
          name: "Whispering Woods",
          type: "Snowy Forest",
          description: "Frost-covered pine forests where snow phantoms stalk unwary travelers.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg"
        }
      ],
      storyBible: {
        title: "Shadows of the Frostgate",
        genre: "Nordic Grimdark Fantasy",
        subgenre: "Survival Mythos",
        targetAudience: "Adult",
        pov: "Third Person Limited",
        tone: "Brutal, chilling, heroic",
        premise: "A clan of defenders holds an ice wall against an undead army led by a primordial wraith king.",
        mainConflict: "Surviving the blood-moon siege while maintaining clan unity and managing dwindling food supplies.",
        worldDescription: "Perpetual twilight, towering glaciers, freezing howling blizzards, and isolated hearth fires.",
        importantRules: "Frostbite cannot be cured by ordinary fire once the shadow touch sets in; only blood-warmed dragon-iron can kill an Ice Wraith.",
        narrativeStyle: "Visceral, heavy on tactical shield-wall combat, clan honor, and folklore chanting."
      }
    }
  },

  // BOOK 5: Chronicles of the Sunken Oasis (Desert Arabian Fantasy)
  {
    meta: {
      id: "book-golden-oasis",
      title: "Chronicles of the Sunken Oasis",
      author: "Amira Al-Zahir",
      genre: "Desert Arabian Fantasy",
      audience: "General / Young Adult",
      logline: "Beneath the burning dunes of the Great Mirage, an exile caravan warden and a sand sorcerer discover a sunken bronze necropolis holding the primordial heart of the sand goddess.",
      wordGoal: 70000,
      currentWords: 22600,
      lastModified: Date.now() - 3600000 * 20,
      themeColor: "bg-[#382613]",
    },
    data: {
      manuscript: [
        {
          id: "go-part-1",
          type: "part",
          title: "Part I: The Crimson Mirage",
          children: [
            {
              id: "go-chap-1",
              type: "chapter",
              title: "Chapter 1: Whispers in the Sand",
              children: [
                {
                  id: "go-scene-1",
                  type: "scene",
                  title: "Scene 1: The Caravan of Cinders",
                  content: `<h1>The Caravan of Cinders</h1>
<p>The heat rising from the red dunes of the Great Mirage made the horizon waver like molten glass. <span data-type="mention" data-id="char-amira" data-label="Amira Al-Zahir" class="mention">@Amira Al-Zahir</span> lowered her linen veil, shielding her sun-bronzed face from the stinging desert gale. At her hip, the dual curved scimitars forged from meteorite iron clicked rhythmically against her leather cuirass.</p>
<p>"The sand is shifting under our camels, Amira," warned <span data-type="mention" data-id="char-tariq" data-label="Sorcerer Tariq" class="mention">@Sorcerer Tariq</span>. The elder sand-weaver walked barefoot upon the scalding dunes, his golden staff stirring miniature dust devils that danced around his ankles. "This is no natural storm. The bronze gates beneath <span data-type="mention" data-id="loc-golden-oasis" data-label="Golden Oasis City" class="mention">@Golden Oasis City</span> are uncoupling."</p>
<p><span data-type="mention" data-id="char-amira" data-label="Amira Al-Zahir" class="mention">@Amira Al-Zahir</span> squinted toward the golden spires gleaming in the twilight. "We made an oath to bring the spice convoy safely inside the city walls. I don't care if the phantoms of <span data-type="mention" data-id="char-maheera" data-label="Queen Maheera" class="mention">@Queen Maheera</span> are scratching at the stones. We push forward."</p>
<p>A sudden thud resonated from behind the lead merchant wagon. <span data-type="mention" data-id="char-zahir" data-label="Zahir the Unseen" class="mention">@Zahir the Unseen</span> rolled out from under the canvas, coughing sand and holding up a tarnished golden amulet shaped like a sun-scarab.</p>
<p>"Look what just popped out of the sinkhole," <span data-type="mention" data-id="char-zahir" data-label="Zahir the Unseen" class="mention">@Zahir the Unseen</span> grinned, his dark eyes twinkling with mischief. "The crypt has collapsed, Amira! The sunken treasury of <span data-type="mention" data-id="char-maheera" data-label="Queen Maheera" class="mention">@Queen Maheera</span> is wide open. We can be richer than the Sultan before the moon rises!"</p>
<p><span data-type="mention" data-id="char-tariq" data-label="Sorcerer Tariq" class="mention">@Sorcerer Tariq</span> struck the sand with his staff, generating a tremor that made the rogue stumble. "Drop that scarab, Zahir! That is no jewel. It is the seal that keeps the Sun-Gilded Queen asleep!"</p>`
                }
              ]
            }
          ]
        }
      ],
      characters: [
        {
          id: "char-amira",
          name: "Amira Al-Zahir",
          role: "Protagonist",
          description: "Fierce caravan blade and exiled desert warden dedicated to protecting merchants across the perilous wastes.",
          age: "28",
          motivation: "To find the oasis of living water and clear her family's name with the Sultan.",
          traits: ["PRAGMATIC", "VALIANT", "SWIFT"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/04_noble_sun_knight_portrait_iehl2w.webp",
          backstory: "Trained in the Scimitar Schools of the Sunken Oasis, Amira was framed for the theft of the sacred water jars."
        },
        {
          id: "char-tariq",
          name: "Sorcerer Tariq",
          role: "Supporting Character",
          description: "Sand Weaver and Sun Astrologer who can command dunes, heat illusions, and ancient sigils.",
          age: "68",
          motivation: "To keep the ancient tomb sealed and prevent a sandstorm from consuming the oasis.",
          traits: ["PATIENT", "WISE", "MYSTICAL"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/03_elderly_wizard_with_astral_amulet_dvtdh5.webp",
          backstory: "Spent forty years in the desert hermitage deciphering the sand runes left by the First Dynasty."
        },
        {
          id: "char-zahir",
          name: "Zahir the Unseen",
          role: "Supporting Character",
          description: "Tomb raider, lock-picker, and charismatic scoundrel with an eye for gold artifacts.",
          age: "25",
          motivation: "To amass enough wealth to buy an entire fleet of desert skiffs.",
          traits: ["GREEDY", "CHARISMATIC", "LUCKY"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/05_defiant_young_rogue_portrait_vmydle.webp",
          backstory: "Can slip through any barred window and escape any dungeon using nothing but a bent wire and a flash bomb."
        },
        {
          id: "char-maheera",
          name: "Queen Maheera",
          role: "Antagonist",
          description: "The Sun-Gilded Lich Queen sleeping in the subterranean bronze necropolis.",
          age: "Ancient",
          motivation: "To dry up all water in the world and rule over an eternal kingdom of golden sand.",
          traits: ["REGAL", "COLD", "DEVOURING"],
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/02_enigmatic_woodland_elven_noble_kf6umg.webp",
          backstory: "Ancient monarch who traded her mortality for the heart of the scorched sun."
        }
      ],
      locations: [
        {
          id: "loc-golden-oasis",
          name: "Golden Oasis City",
          type: "Desert Citadel",
          description: "A breathtaking golden city of domed minarets surrounded by emerald palm groves and crystal lagoons.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/06_golden_oasis_city_at_sunset_so7xdx.jpg"
        },
        {
          id: "loc-volcano-desert",
          name: "The Sunken Bronze Necropolis",
          type: "Ancient Ruins",
          description: "A subterranean city of bronze gates buried under three hundred feet of moving red sands.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/04_volcanic_citadel_at_sunset_yafvd7.jpg"
        },
        {
          id: "loc-harbor-desert",
          name: "Harbor of the Dunes",
          type: "Desert Port",
          description: "A cliffside dry port where massive sand-skiffs dock to unload spices and silk.",
          imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/09_stormlit_harbor_of_the_cliffside_citadel_jpisuj.jpg"
        }
      ],
      storyBible: {
        title: "Chronicles of the Sunken Oasis",
        genre: "Desert Arabian Fantasy",
        subgenre: "Mythic Adventure",
        targetAudience: "General / Young Adult",
        pov: "Third Person Multi-POV",
        tone: "Exotic, adventurous, suspenseful",
        premise: "A caravan guard and a sand wizard accidentally breach the tomb of a sun queen buried under the dunes.",
        mainConflict: "Stopping the awakened Sand Queen from draining the oasis of life while racing across scorching dunes.",
        worldDescription: "Endless rolling red sand seas, vibrant bazaars smelling of cardamom and roasted dates, sunken bronze crypts.",
        importantRules: "Sand magic requires standing barefoot on undisturbed earth; heat mirages can be solidified if touched with pure silver.",
        narrativeStyle: "Lush, evocative, rich with Arabian folklore motifs, dynamic swordplay and magical sand-weaving."
      }
    }
  }
];

/**
 * Ensures all 5 fantasy sample books exist in localStorage
 */
export function ensureFantasyBooksSeeded(): ProjectMeta[] {
  const existingProjects = storage.getProjects();
  const existingMap = new Map((existingProjects || []).map(p => [p.id, p]));
  const existingTitleMap = new Map((existingProjects || []).map(p => [(p.title || "").toLowerCase().trim(), p]));

  let updated = false;

  for (const sample of FANTASY_SAMPLE_BOOKS) {
    const foundById = existingMap.get(sample.meta.id);
    const foundByTitle = existingTitleMap.get(sample.meta.title.toLowerCase().trim());

    if (!foundById && !foundByTitle) {
      // Save project meta
      storage.saveProject(sample.meta);
      // Save project data
      storage.saveProjectData(sample.meta.id, sample.data);
      updated = true;
    } else {
      // If found, ensure project data (characters, manuscript, storyBible) exists
      const targetId = foundById ? sample.meta.id : (foundByTitle?.id || sample.meta.id);
      const data = storage.getProjectData(targetId);
      if (!data || !data.manuscript || data.manuscript.length === 0 || !data.characters || data.characters.length === 0) {
        storage.saveProjectData(targetId, sample.data);
      }
    }
  }

  return storage.getProjects();
}
