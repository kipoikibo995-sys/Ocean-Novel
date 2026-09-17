
import { ProjectMeta } from "@/lib/storage";
import { ProjectData } from "@/lib/storage";


export const book_proj_fantasy_1 = {
  project: {
    id: "proj_fantasy_1",
    title: "The Crimson Crown",
    genre: "High Fantasy",
    lastModified: Date.now(),
    currentWords: 1000,
    wordGoal: 75000,
    synopsis: "A young prince must reclaim his stolen throne before a dark warlord plunges the realm into eternal night."
  },
  data: {
    manuscript: [
      {
      id: "scene_proj_fantasy_1_0",
      type: "scene",
      title: "Chapter 1: The Fall of Oakhaven",
      content: `<p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p><p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p>`
    },
      {
      id: "scene_proj_fantasy_1_1",
      type: "scene",
      title: "Chapter 2: Whispers in the Dark",
      content: `<p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p><p>The ancient tome felt heavy, its leather cover worn smooth by countless hands over the millennia. As the scholar carefully turned the fragile pages, strange symbols seemed to writhe and dance in the candlelight. This was the forbidden knowledge they had spent a lifetime seeking, the key to unlocking the realm's greatest mystery.</p>`
    },
      {
      id: "scene_proj_fantasy_1_2",
      type: "scene",
      title: "Chapter 3: The Broken Blade",
      content: `<p>Shadows stretched long across the cobblestone streets as the sun dipped below the horizon. The thief moved with silent grace, blending into the darkness like a ghost. Their target was the heavily guarded vault of the merchant guild, rumored to hold a gem of unimaginable power.</p><p>The sea roared in anger, crashing against the jagged cliffs with terrifying force. Aboard the small vessel, the crew fought frantically to keep the ship afloat. The captain, eyes fixed on the horizon, knew that surviving this storm was only the first trial on their journey to the mythical island.</p><p>A hush fell over the crowd as the challenger stepped into the arena. They were an unknown, a wildcard in the grand tournament that decided the fate of the kingdoms. The reigning champion sneered, confident in their invincibility, but the spark in the challenger's eyes promised a battle unlike any other.</p>`
    },
      {
      id: "scene_proj_fantasy_1_3",
      type: "scene",
      title: "Chapter 4: A Gathering of Storms",
      content: `<p>The forest was alive with bioluminescent flora, casting an ethereal glow over the mossy ground. Every step felt like walking through a dream, but the beauty hid deadly perils. The adventurers moved cautiously, aware that the guardians of the grove did not take kindly to trespassers.</p><p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p>`
    },
      {
      id: "scene_proj_fantasy_1_4",
      type: "scene",
      title: "Chapter 5: The Crown's Weight",
      content: `<p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p><p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p>`
    }
    ],
    characters: [
      {
    id: "char_proj_fantasy_1_" + Math.random().toString(36).substr(2, 9),
    name: "Kaelen",
    role: "Protagonist",
    archetype: "The Reluctant Heir",
    description: "A young prince hiding from his destiny.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_1_" + Math.random().toString(36).substr(2, 9),
    name: "Lyra",
    role: "Ally",
    archetype: "The Rogue Mage",
    description: "A fiery spellcaster with a dark past.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_1_" + Math.random().toString(36).substr(2, 9),
    name: "Malakor",
    role: "Antagonist",
    archetype: "The Usurper",
    description: "The ruthless warlord who seized the throne.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_1_" + Math.random().toString(36).substr(2, 9),
    name: "Thorne",
    role: "Mentor",
    archetype: "The Grizzled Veteran",
    description: "An old knight bound by an ancient oath.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_1_" + Math.random().toString(36).substr(2, 9),
    name: "Elara",
    role: "Neutral",
    archetype: "The Information Broker",
    description: "A cunning spy who sells secrets to the highest bidder.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  }
    ],
    locations: []
  }
};


export const book_proj_fantasy_2 = {
  project: {
    id: "proj_fantasy_2",
    title: "Echoes of the Aether",
    genre: "Steampunk Fantasy",
    lastModified: Date.now(),
    currentWords: 1000,
    wordGoal: 75000,
    synopsis: "In a city powered by steam and magic, a young inventor must stop a corrupt magnate from unleashing a devastating weapon."
  },
  data: {
    manuscript: [
      {
      id: "scene_proj_fantasy_2_0",
      type: "scene",
      title: "Chapter 1: The Aether Engine",
      content: `<p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p><p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p>`
    },
      {
      id: "scene_proj_fantasy_2_1",
      type: "scene",
      title: "Chapter 2: Flight of the Chimera",
      content: `<p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p><p>The ancient tome felt heavy, its leather cover worn smooth by countless hands over the millennia. As the scholar carefully turned the fragile pages, strange symbols seemed to writhe and dance in the candlelight. This was the forbidden knowledge they had spent a lifetime seeking, the key to unlocking the realm's greatest mystery.</p>`
    },
      {
      id: "scene_proj_fantasy_2_2",
      type: "scene",
      title: "Chapter 3: Shadows in the Smog",
      content: `<p>Shadows stretched long across the cobblestone streets as the sun dipped below the horizon. The thief moved with silent grace, blending into the darkness like a ghost. Their target was the heavily guarded vault of the merchant guild, rumored to hold a gem of unimaginable power.</p><p>The sea roared in anger, crashing against the jagged cliffs with terrifying force. Aboard the small vessel, the crew fought frantically to keep the ship afloat. The captain, eyes fixed on the horizon, knew that surviving this storm was only the first trial on their journey to the mythical island.</p><p>A hush fell over the crowd as the challenger stepped into the arena. They were an unknown, a wildcard in the grand tournament that decided the fate of the kingdoms. The reigning champion sneered, confident in their invincibility, but the spark in the challenger's eyes promised a battle unlike any other.</p>`
    },
      {
      id: "scene_proj_fantasy_2_3",
      type: "scene",
      title: "Chapter 4: The Clockwork City",
      content: `<p>The forest was alive with bioluminescent flora, casting an ethereal glow over the mossy ground. Every step felt like walking through a dream, but the beauty hid deadly perils. The adventurers moved cautiously, aware that the guardians of the grove did not take kindly to trespassers.</p><p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p>`
    },
      {
      id: "scene_proj_fantasy_2_4",
      type: "scene",
      title: "Chapter 5: Ignition",
      content: `<p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p><p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p>`
    }
    ],
    characters: [
      {
    id: "char_proj_fantasy_2_" + Math.random().toString(36).substr(2, 9),
    name: "Cora Vance",
    role: "Protagonist",
    archetype: "The Inventor",
    description: "A brilliant tinkerer who discovers a dangerous secret.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_2_" + Math.random().toString(36).substr(2, 9),
    name: "Julian",
    role: "Ally",
    archetype: "The Sky Pirate",
    description: "A dashing rogue with a heart of gold and an airship.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_2_" + Math.random().toString(36).substr(2, 9),
    name: "Lord Blackwood",
    role: "Antagonist",
    archetype: "The Corrupt Industrialist",
    description: "A ruthless magnate exploiting the aether.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_2_" + Math.random().toString(36).substr(2, 9),
    name: "Gideon",
    role: "Mentor",
    archetype: "The Exiled Scientist",
    description: "Cora's former teacher, now in hiding.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_2_" + Math.random().toString(36).substr(2, 9),
    name: "Seraphina",
    role: "Neutral",
    archetype: "The Clockwork Automaton",
    description: "A highly advanced machine with emerging consciousness.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  }
    ],
    locations: []
  }
};


export const book_proj_fantasy_3 = {
  project: {
    id: "proj_fantasy_3",
    title: "The Obsidian Throne",
    genre: "Dark Fantasy",
    lastModified: Date.now(),
    currentWords: 1000,
    wordGoal: 75000,
    synopsis: "A cursed warrior must journey to the heart of darkness to defeat an ancient evil and break the spell that binds him."
  },
  data: {
    manuscript: [
      {
      id: "scene_proj_fantasy_3_0",
      type: "scene",
      title: "Chapter 1: The Awakening",
      content: `<p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p><p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p>`
    },
      {
      id: "scene_proj_fantasy_3_1",
      type: "scene",
      title: "Chapter 2: Trail of Ash",
      content: `<p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p><p>The ancient tome felt heavy, its leather cover worn smooth by countless hands over the millennia. As the scholar carefully turned the fragile pages, strange symbols seemed to writhe and dance in the candlelight. This was the forbidden knowledge they had spent a lifetime seeking, the key to unlocking the realm's greatest mystery.</p>`
    },
      {
      id: "scene_proj_fantasy_3_2",
      type: "scene",
      title: "Chapter 3: The Cursed Keep",
      content: `<p>Shadows stretched long across the cobblestone streets as the sun dipped below the horizon. The thief moved with silent grace, blending into the darkness like a ghost. Their target was the heavily guarded vault of the merchant guild, rumored to hold a gem of unimaginable power.</p><p>The sea roared in anger, crashing against the jagged cliffs with terrifying force. Aboard the small vessel, the crew fought frantically to keep the ship afloat. The captain, eyes fixed on the horizon, knew that surviving this storm was only the first trial on their journey to the mythical island.</p><p>A hush fell over the crowd as the challenger stepped into the arena. They were an unknown, a wildcard in the grand tournament that decided the fate of the kingdoms. The reigning champion sneered, confident in their invincibility, but the spark in the challenger's eyes promised a battle unlike any other.</p>`
    },
      {
      id: "scene_proj_fantasy_3_3",
      type: "scene",
      title: "Chapter 4: Whispers of the Dead",
      content: `<p>The forest was alive with bioluminescent flora, casting an ethereal glow over the mossy ground. Every step felt like walking through a dream, but the beauty hid deadly perils. The adventurers moved cautiously, aware that the guardians of the grove did not take kindly to trespassers.</p><p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p>`
    },
      {
      id: "scene_proj_fantasy_3_4",
      type: "scene",
      title: "Chapter 5: Confronting the Void",
      content: `<p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p><p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p>`
    }
    ],
    characters: [
      {
    id: "char_proj_fantasy_3_" + Math.random().toString(36).substr(2, 9),
    name: "Vaelin",
    role: "Protagonist",
    archetype: "The Dark Knight",
    description: "A cursed warrior seeking redemption.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_3_" + Math.random().toString(36).substr(2, 9),
    name: "Aria",
    role: "Ally",
    archetype: "The Lightbringer",
    description: "A cleric whose faith is constantly tested.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_3_" + Math.random().toString(36).substr(2, 9),
    name: "The Nameless King",
    role: "Antagonist",
    archetype: "The Ancient Evil",
    description: "An ancient entity awakening from a long slumber.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_3_" + Math.random().toString(36).substr(2, 9),
    name: "Nyx",
    role: "Neutral",
    archetype: "The Shadow Weaver",
    description: "A mysterious figure who controls the darkness.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_3_" + Math.random().toString(36).substr(2, 9),
    name: "Garrick",
    role: "Ally",
    archetype: "The Doomed Companion",
    description: "Vaelin's loyal friend, marked for death.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  }
    ],
    locations: []
  }
};


export const book_proj_fantasy_4 = {
  project: {
    id: "proj_fantasy_4",
    title: "Whispers of the Sylph",
    genre: "Epic Fantasy",
    lastModified: Date.now(),
    currentWords: 1000,
    wordGoal: 75000,
    synopsis: "A young girl with a rare gift must unite the warring clans and the spirits of the forest to defeat a dark sorcerer."
  },
  data: {
    manuscript: [
      {
      id: "scene_proj_fantasy_4_0",
      type: "scene",
      title: "Chapter 1: The First Whisper",
      content: `<p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p><p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p>`
    },
      {
      id: "scene_proj_fantasy_4_1",
      type: "scene",
      title: "Chapter 2: The Blighted Grove",
      content: `<p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p><p>The ancient tome felt heavy, its leather cover worn smooth by countless hands over the millennia. As the scholar carefully turned the fragile pages, strange symbols seemed to writhe and dance in the candlelight. This was the forbidden knowledge they had spent a lifetime seeking, the key to unlocking the realm's greatest mystery.</p>`
    },
      {
      id: "scene_proj_fantasy_4_2",
      type: "scene",
      title: "Chapter 3: The Guardian's Oath",
      content: `<p>Shadows stretched long across the cobblestone streets as the sun dipped below the horizon. The thief moved with silent grace, blending into the darkness like a ghost. Their target was the heavily guarded vault of the merchant guild, rumored to hold a gem of unimaginable power.</p><p>The sea roared in anger, crashing against the jagged cliffs with terrifying force. Aboard the small vessel, the crew fought frantically to keep the ship afloat. The captain, eyes fixed on the horizon, knew that surviving this storm was only the first trial on their journey to the mythical island.</p><p>A hush fell over the crowd as the challenger stepped into the arena. They were an unknown, a wildcard in the grand tournament that decided the fate of the kingdoms. The reigning champion sneered, confident in their invincibility, but the spark in the challenger's eyes promised a battle unlike any other.</p>`
    },
      {
      id: "scene_proj_fantasy_4_3",
      type: "scene",
      title: "Chapter 4: Gathering the Spirits",
      content: `<p>The forest was alive with bioluminescent flora, casting an ethereal glow over the mossy ground. Every step felt like walking through a dream, but the beauty hid deadly perils. The adventurers moved cautiously, aware that the guardians of the grove did not take kindly to trespassers.</p><p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p>`
    },
      {
      id: "scene_proj_fantasy_4_4",
      type: "scene",
      title: "Chapter 5: The Sorcerer's Shadow",
      content: `<p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p><p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p>`
    }
    ],
    characters: [
      {
    id: "char_proj_fantasy_4_" + Math.random().toString(36).substr(2, 9),
    name: "Elowen",
    role: "Protagonist",
    archetype: "The Chosen One",
    description: "A young girl with the rare ability to hear the spirits.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_4_" + Math.random().toString(36).substr(2, 9),
    name: "Finnian",
    role: "Ally",
    archetype: "The Loyal Guardian",
    description: "A sworn protector from a rival clan.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_4_" + Math.random().toString(36).substr(2, 9),
    name: "Morgath",
    role: "Antagonist",
    archetype: "The Spirit Consumer",
    description: "A dark sorcerer seeking to devour the sylphs' power.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_4_" + Math.random().toString(36).substr(2, 9),
    name: "Elder Oakhart",
    role: "Mentor",
    archetype: "The Wise Sage",
    description: "The oldest and wisest of the forest spirits.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_4_" + Math.random().toString(36).substr(2, 9),
    name: "Ria",
    role: "Neutral",
    archetype: "The Fickle Trickster",
    description: "A mischievous spirit who helps or hinders on a whim.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  }
    ],
    locations: []
  }
};


export const book_proj_fantasy_5 = {
  project: {
    id: "proj_fantasy_5",
    title: "The Last Dragonrider",
    genre: "Heroic Fantasy",
    lastModified: Date.now(),
    currentWords: 1000,
    wordGoal: 75000,
    synopsis: "A young farm boy finds the last dragon egg and must learn to ride and fight to overthrow a cruel empire."
  },
  data: {
    manuscript: [
      {
      id: "scene_proj_fantasy_5_0",
      type: "scene",
      title: "Chapter 1: The Discovery",
      content: `<p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p><p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p>`
    },
      {
      id: "scene_proj_fantasy_5_1",
      type: "scene",
      title: "Chapter 2: First Flight",
      content: `<p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p><p>The ancient tome felt heavy, its leather cover worn smooth by countless hands over the millennia. As the scholar carefully turned the fragile pages, strange symbols seemed to writhe and dance in the candlelight. This was the forbidden knowledge they had spent a lifetime seeking, the key to unlocking the realm's greatest mystery.</p>`
    },
      {
      id: "scene_proj_fantasy_5_2",
      type: "scene",
      title: "Chapter 3: The Resistance",
      content: `<p>Shadows stretched long across the cobblestone streets as the sun dipped below the horizon. The thief moved with silent grace, blending into the darkness like a ghost. Their target was the heavily guarded vault of the merchant guild, rumored to hold a gem of unimaginable power.</p><p>The sea roared in anger, crashing against the jagged cliffs with terrifying force. Aboard the small vessel, the crew fought frantically to keep the ship afloat. The captain, eyes fixed on the horizon, knew that surviving this storm was only the first trial on their journey to the mythical island.</p><p>A hush fell over the crowd as the challenger stepped into the arena. They were an unknown, a wildcard in the grand tournament that decided the fate of the kingdoms. The reigning champion sneered, confident in their invincibility, but the spark in the challenger's eyes promised a battle unlike any other.</p>`
    },
      {
      id: "scene_proj_fantasy_5_3",
      type: "scene",
      title: "Chapter 4: Fire in the Sky",
      content: `<p>The forest was alive with bioluminescent flora, casting an ethereal glow over the mossy ground. Every step felt like walking through a dream, but the beauty hid deadly perils. The adventurers moved cautiously, aware that the guardians of the grove did not take kindly to trespassers.</p><p>The wind howled through the ancient trees, their gnarled branches scratching against the starry sky like desperate fingers. Far below, the village lay in a tense silence, aware of the encroaching darkness that seeped from the mountains. It had been centuries since the last sighting, but the old tales were returning to life.</p><p>A glint of steel caught the pale moonlight. The warrior adjusted their grip on the hilt, feeling the familiar weight of the blade. This was not just a weapon; it was a legacy passed down through generations of blood and sorrow. The enemy was approaching, their heavy footsteps echoing in the narrow canyon.</p>`
    },
      {
      id: "scene_proj_fantasy_5_4",
      type: "scene",
      title: "Chapter 5: The Empire Strikes",
      content: `<p>Inside the grand hall, the air was thick with the scent of roasted meat and political deceit. Nobles in silk and velvet whispered behind jewel-encrusted goblets, their smiles hiding daggers of ambition. The throne at the end of the room sat empty, a silent testament to the king's failing health and the impending war of succession.</p><p>The magic pulsed through the veins of the earth, a chaotic rhythm that only the attuned could feel. With a deep breath, the sorcerer closed their eyes and reached out to the invisible currents. The spell required absolute focus; one wrong syllable, and the resulting explosion would level the entire tower.</p><p>A lone raven circled above the battlefield, its sharp eyes scanning the carnage. The clash of armies had left the ground scarred and soaked in crimson. Amidst the fallen, a single figure rose, their armor battered but unbroken. The war was far from over, but this victory had bought them time.</p>`
    }
    ],
    characters: [
      {
    id: "char_proj_fantasy_5_" + Math.random().toString(36).substr(2, 9),
    name: "Talon",
    role: "Protagonist",
    archetype: "The Underdog",
    description: "A farm boy who discovers a hidden dragon egg.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_5_" + Math.random().toString(36).substr(2, 9),
    name: "Ignis",
    role: "Ally",
    archetype: "The Dragon",
    description: "A fierce and loyal dragon, the last of its kind.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_5_" + Math.random().toString(36).substr(2, 9),
    name: "Emperor Valerius",
    role: "Antagonist",
    archetype: "The Tyrant",
    description: "A cruel ruler who wiped out the dragonriders.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_5_" + Math.random().toString(36).substr(2, 9),
    name: "Kael",
    role: "Mentor",
    archetype: "The Hidden Master",
    description: "An old hermit who was once a legendary dragonrider.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  },
      {
    id: "char_proj_fantasy_5_" + Math.random().toString(36).substr(2, 9),
    name: "Lady Serene",
    role: "Ally",
    archetype: "The Rebel Leader",
    description: "A noblewoman secretly funding the resistance.",
    imageUrl: "https://images.unsplash.com/photo-1544507888-56d73eb6046e?w=800&q=80",
    tags: ["Fantasy"]
  }
    ],
    locations: []
  }
};


export const SEED_FANTASY_BOOKS = [book_proj_fantasy_1, book_proj_fantasy_2, book_proj_fantasy_3, book_proj_fantasy_4, book_proj_fantasy_5];
