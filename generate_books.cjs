const fs = require('fs');

const generateBook = (id, title, genre, chars, chapterTitles, synopsis) => {
  const characters = chars.map(c => `{
    id: "char_${id}_" + Math.random().toString(36).substr(2, 9),
    name: "${c.name}",
    role: "${c.role}",
    archetype: "${c.archetype}",
    description: "${c.description}",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  }`);

  const paragraphPool = [
    "The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.",
    "A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.",
    "Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.",
    "The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.",
    "A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.",
    "The ancient tome felt heavy, its leather cover worn smooth by countless hands over the millennia. As the scholar carefully turned the fragile pages, strange symbols seemed to writhe and dance in the candlelight. This was the forbidden knowledge they had spent a lifetime seeking, the key to unlocking the realm's greatest mystery.",
    "Shadows stretched long across the cobblestone streets as the sun dipped below the horizon. The thief moved with silent grace, blending into the darkness like a ghost. Their target was the heavily guarded vault of the merchant guild, rumored to hold a gem of unimaginable power.",
    "The sea roared in anger, crashing against the jagged cliffs with terrifying force. Aboard the small vessel, the crew fought frantically to keep the ship afloat. The captain, eyes fixed on the horizon, knew that surviving this storm was only the first trial on their journey to the mythical island.",
    "A hush fell over the crowd as the challenger stepped into the arena. They were an unknown, a wildcard in the grand tournament that decided the fate of the kingdoms. The reigning champion sneered, confident in their invincibility, but the spark in the challenger's eyes promised a battle unlike any other.",
    "The forest was alive with bioluminescent flora, casting an ethereal glow over the mossy ground. Every step felt like walking through a dream, but the beauty hid deadly perils. The adventurers moved cautiously, aware that the guardians of the grove did not take kindly to trespassers."
  ];

  const manuscript = chapterTitles.map((ch, idx) => {
    let content = "";
    // Generate ~200 words per chapter using paragraphs
    for(let i=0; i<3; i++) {
      content += `<p>${paragraphPool[(idx * 3 + i) % paragraphPool.length]}</p>`;
    }
    return `{
      id: "scene_${id}_${idx}",
      type: "scene",
      title: "${ch}",
      content: \`${content}\`
    }`;
  });

  return `
export const book_${id} = {
  project: {
    id: "${id}",
    title: "${title}",
    genre: "${genre}",
    lastModified: Date.now(),
    currentWords: 1000,
    wordGoal: 75000,
    synopsis: "${synopsis}"
  },
  data: {
    manuscript: [
      ${manuscript.join(',\\n      ')}
    ],
    characters: [
      ${characters.join(',\\n      ')}
    ],
    locations: []
  }
};
`;
};

const books = [
  generateBook(
    "proj_fantasy_1",
    "The Crimson Crown",
    "High Fantasy",
    [
      { name: "Kaelen", role: "Protagonist", archetype: "The Reluctant Heir", description: "A young prince hiding from his destiny." },
      { name: "Lyra", role: "Ally", archetype: "The Rogue Mage", description: "A fiery spellcaster with a dark past." },
      { name: "Malakor", role: "Antagonist", archetype: "The Usurper", description: "The ruthless warlord who seized the throne." },
      { name: "Thorne", role: "Mentor", archetype: "The Grizzled Veteran", description: "An old knight bound by an ancient oath." },
      { name: "Elara", role: "Neutral", archetype: "The Information Broker", description: "A cunning spy who sells secrets to the highest bidder." }
    ],
    ["Chapter 1: The Fall of Oakhaven", "Chapter 2: Whispers in the Dark", "Chapter 3: The Broken Blade", "Chapter 4: A Gathering of Storms", "Chapter 5: The Crown's Weight"],
    "A young prince must reclaim his stolen throne before a dark warlord plunges the realm into eternal night."
  ),
  generateBook(
    "proj_fantasy_2",
    "Echoes of the Aether",
    "Steampunk Fantasy",
    [
      { name: "Cora Vance", role: "Protagonist", archetype: "The Inventor", description: "A brilliant tinkerer who discovers a dangerous secret." },
      { name: "Julian", role: "Ally", archetype: "The Sky Pirate", description: "A dashing rogue with a heart of gold and an airship." },
      { name: "Lord Blackwood", role: "Antagonist", archetype: "The Corrupt Industrialist", description: "A ruthless magnate exploiting the aether." },
      { name: "Gideon", role: "Mentor", archetype: "The Exiled Scientist", description: "Cora's former teacher, now in hiding." },
      { name: "Seraphina", role: "Neutral", archetype: "The Clockwork Automaton", description: "A highly advanced machine with emerging consciousness." }
    ],
    ["Chapter 1: The Aether Engine", "Chapter 2: Flight of the Chimera", "Chapter 3: Shadows in the Smog", "Chapter 4: The Clockwork City", "Chapter 5: Ignition"],
    "In a city powered by steam and magic, a young inventor must stop a corrupt magnate from unleashing a devastating weapon."
  ),
  generateBook(
    "proj_fantasy_3",
    "The Obsidian Throne",
    "Dark Fantasy",
    [
      { name: "Vaelin", role: "Protagonist", archetype: "The Dark Knight", description: "A cursed warrior seeking redemption." },
      { name: "Aria", role: "Ally", archetype: "The Lightbringer", description: "A cleric whose faith is constantly tested." },
      { name: "The Nameless King", role: "Antagonist", archetype: "The Ancient Evil", description: "An ancient entity awakening from a long slumber." },
      { name: "Nyx", role: "Neutral", archetype: "The Shadow Weaver", description: "A mysterious figure who controls the darkness." },
      { name: "Garrick", role: "Ally", archetype: "The Doomed Companion", description: "Vaelin's loyal friend, marked for death." }
    ],
    ["Chapter 1: The Awakening", "Chapter 2: Trail of Ash", "Chapter 3: The Cursed Keep", "Chapter 4: Whispers of the Dead", "Chapter 5: Confronting the Void"],
    "A cursed warrior must journey to the heart of darkness to defeat an ancient evil and break the spell that binds him."
  ),
  generateBook(
    "proj_fantasy_4",
    "Whispers of the Sylph",
    "Epic Fantasy",
    [
      { name: "Elowen", role: "Protagonist", archetype: "The Chosen One", description: "A young girl with the rare ability to hear the spirits." },
      { name: "Finnian", role: "Ally", archetype: "The Loyal Guardian", description: "A sworn protector from a rival clan." },
      { name: "Morgath", role: "Antagonist", archetype: "The Spirit Consumer", description: "A dark sorcerer seeking to devour the sylphs' power." },
      { name: "Elder Oakhart", role: "Mentor", archetype: "The Wise Sage", description: "The oldest and wisest of the forest spirits." },
      { name: "Ria", role: "Neutral", archetype: "The Fickle Trickster", description: "A mischievous spirit who helps or hinders on a whim." }
    ],
    ["Chapter 1: The First Whisper", "Chapter 2: The Blighted Grove", "Chapter 3: The Guardian's Oath", "Chapter 4: Gathering the Spirits", "Chapter 5: The Sorcerer's Shadow"],
    "A young girl with a rare gift must unite the warring clans and the spirits of the forest to defeat a dark sorcerer."
  ),
  generateBook(
    "proj_fantasy_5",
    "The Last Dragonrider",
    "Heroic Fantasy",
    [
      { name: "Talon", role: "Protagonist", archetype: "The Underdog", description: "A farm boy who discovers a hidden dragon egg." },
      { name: "Ignis", role: "Ally", archetype: "The Dragon", description: "A fierce and loyal dragon, the last of its kind." },
      { name: "Emperor Valerius", role: "Antagonist", archetype: "The Tyrant", description: "A cruel ruler who wiped out the dragonriders." },
      { name: "Kael", role: "Mentor", archetype: "The Hidden Master", description: "An old hermit who was once a legendary dragonrider." },
      { name: "Lady Serene", role: "Ally", archetype: "The Rebel Leader", description: "A noblewoman secretly funding the resistance." }
    ],
    ["Chapter 1: The Discovery", "Chapter 2: First Flight", "Chapter 3: The Resistance", "Chapter 4: Fire in the Sky", "Chapter 5: The Empire Strikes"],
    "A young farm boy finds the last dragon egg and must learn to ride and fight to overthrow a cruel empire."
  )
];

const code = `
import { ProjectMeta } from "@/lib/storage";
import { ProjectData } from "@/lib/storage";

${books.join('\n')}

export const SEED_FANTASY_BOOKS = [book_proj_fantasy_1, book_proj_fantasy_2, book_proj_fantasy_3, book_proj_fantasy_4, book_proj_fantasy_5];
`;

fs.writeFileSync('src/data/seedFantasy.ts', code);
console.log('Seed files generated successfully.');
