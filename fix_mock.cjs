const fs = require('fs');

const content = fs.readFileSync('src/mockData.ts', 'utf8');
const startIndex = content.indexOf('export const MOCK_MANUSCRIPT');
const before = content.substring(0, startIndex);

const newManuscript = `export const MOCK_MANUSCRIPT: ManuscriptItem[] = [
  {
    id: 'part-1',
    type: 'part',
    title: 'Part I: The Return',
    children: [
      {
        id: 'chap-1',
        type: 'chapter',
        title: 'Chapter 1: The Arrival',
        children: [
          {
            id: 'scene-1',
            type: 'scene',
            title: 'Scene 1: The Bus Ride',
            content: \`<h1>The Arrival</h1>
<p>The rhythmic thrum of the engine vibrated through the worn leather seat as the bus navigated the treacherous coastal highway leading into <span data-type="mention" data-id="1" data-label="Greyhaven" class="mention">@Greyhaven</span>. <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> pressed her forehead against the cold, condensation-streaked glass, watching the familiar, oppressive fog roll over the jagged cliffs. It had been exactly fifteen years since she last set foot in this town, fifteen years of trying to erase the memory of the salt-heavy air and the perpetual gray skies. Yet, the anonymous letter she had received three days ago sat like a lead weight in her coat pocket. The handwriting was unmistakable, and the message was chillingly brief: "She didn't fall."</p>
<p>As the bus descended into the valley, the town emerged like a ghost ship from the mist. The harbor was dotted with rusted fishing vessels bobbing restlessly in the churning dark waters. Every cobblestone street and weather-beaten storefront seemed to hold a memory she had desperately tried to bury. She remembered running down these streets with her sister, their laughter swallowed by the ever-present roar of the ocean. Now, there was only silence, save for the shrieking of the gulls. <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> tightened her grip on her duffel bag, a surge of anxiety mixing with a cold, hardened resolve. She wasn't just a grieving sister anymore; she was an investigative journalist who had spent her career unearthing ugly truths. And she was going to tear this town apart to find out what really happened.</p>
<p>Stepping off the bus, the bitter wind immediately bit through her coat. The few locals on the street hurried past, heads down, casting suspicious glances at the newcomer. In a town like <span data-type="mention" data-id="1" data-label="Greyhaven" class="mention">@Greyhaven</span>, secrets were the currency, and outsiders were always a liability. She checked her phone—no signal, as expected. She took a deep breath, the taste of brine and ancient decay filling her lungs, and began the long walk toward the center of town. The nightmare she had run away from was finally catching up to her, or perhaps, she was finally running toward it.</p>\`
          }
        ]
      },
      {
        id: 'chap-2',
        type: 'chapter',
        title: 'Chapter 2: The Old Lighthouse',
        children: [
          {
            id: 'scene-2',
            type: 'scene',
            title: 'Scene 1: A Chance Encounter',
            content: \`<h1>The Old Lighthouse</h1>
<p>The path leading to the <span data-type="mention" data-id="2" data-label="Old Lighthouse" class="mention">@Old Lighthouse</span> was steeper and far more treacherous than <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> remembered. Slippery, moss-covered stones threatened to send her tumbling down into the violent, frothing sea below. The lighthouse itself loomed against the bruised twilight sky like a rotting tooth, its white paint peeling away to reveal the dark, decaying stone underneath. It had been abandoned for decades, a monument to the town's slow decay and the exact location where her sister was last seen.</p>
<p>As she approached the rusted iron door, the wind howled through the shattered lantern room at the top, creating a haunting, melodic whistle. She pushed the door open, the hinges screaming in protest. Inside, the air was thick with the smell of guano and damp earth. She pulled out her flashlight, its beam cutting through the gloom, illuminating graffiti-covered walls and debris-strewn floors. Suddenly, the unmistakable scrape of a boot against stone echoed from the spiral staircase above. <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> froze, her hand instinctively reaching for the heavy flashlight in her pocket.</p>
<p>"I wouldn't go up there if I were you," a deep, gravelly voice echoed from the shadows. A figure detached itself from the darkness of the stairwell, the brief flare of a match illuminating a tired, lined face. It was <span data-type="mention" data-id="2" data-label="Daniel Reeves" class="mention">@Daniel Reeves</span>. He looked older, the weight of a hundred unsolved cases etched into the corners of his eyes, but he still wore the same battered trench coat. "The structural integrity of those stairs is about as reliable as a politician's promise."</p>
<p>"Daniel," Sarah breathed, lowering her guard slightly but not completely. "I didn't think you were still working this district."</p>
<p>"And I didn't think you'd actually come back," <span data-type="mention" data-id="2" data-label="Daniel Reeves" class="mention">@Daniel Reeves</span> replied, taking a slow drag from his cigarette. "I heard you were poking around. The locals are spooked. The letter you got... it changes things. If what it implies is true, the original investigation was a sham, and we're looking at a covered-up homicide."</p>\`
          }
        ]
      },
      {
        id: 'chap-3',
        type: 'chapter',
        title: 'Chapter 3: Family Secrets',
        children: [
          {
            id: 'scene-3',
            type: 'scene',
            title: 'Scene 1: Mother',
            content: \`<h1>Family Secrets</h1>
<p>Standing before the <span data-type="mention" data-id="3" data-label="Cole Family House" class="mention">@Cole Family House</span>, <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> felt a familiar suffocation tighten her chest. The grand, Victorian-style home, once a symbol of the family's prominence in the region, now looked desolate and unwelcoming. The paint was chipping, the ivy had overgrown the lower windows, and the once-manicured lawn was a tangle of weeds. It was a physical manifestation of her family's collapse after the tragedy.</p>
<p>She turned the brass doorknob, finding it unlocked—a strange habit her mother had maintained for fifteen years, as if expecting her lost daughter to simply walk back in. The air inside was stagnant, heavy with the scent of old paper, dried lavender, and stale gin. In the dimly lit parlor, sitting rigidly in an ornate armchair, was <span data-type="mention" data-id="3" data-label="Eleanor Cole" class="mention">@Eleanor Cole</span>. She didn't turn her head as the door clicked shut. Her gaze remained fixed on the dying embers in the fireplace.</p>
<p>"I told them not to let you in," <span data-type="mention" data-id="3" data-label="Eleanor Cole" class="mention">@Eleanor Cole</span> said, her voice brittle and devoid of warmth. "You bring nothing but disruption, Sarah. You always have."</p>
<p>"Hello to you too, Mother," <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> replied, refusing to let the venom sting her. She walked further into the room, her footsteps muffled by the thick Persian rug. "I didn't come here for a family reunion. I received a letter. It says she didn't just fall off the cliffs. Someone was there with her."</p>
<p><span data-type="mention" data-id="3" data-label="Eleanor Cole" class="mention">@Eleanor Cole</span> finally turned, her eyes flashing with a sudden, fierce anger. "Lies! Vicious gossip from a town that has nothing better to do than tear this family down. The police concluded their investigation. It was an accident. Why must you insist on dragging us back through the mud? Why can't you just let her rest?"</p>
<p>"Because she isn't resting, and neither are you," Sarah shot back, stepping closer. "You've been sitting in this mausoleum for a decade and a half. What are you hiding? Who are you protecting?" The silence that followed was deafening, the unspoken secrets hanging between them like a dense fog.</p>\`
          }
        ]
      }
    ]
  },
  {
    id: 'part-2',
    type: 'part',
    title: 'Part II: The Investigation',
    children: [
      {
        id: 'chap-4',
        type: 'chapter',
        title: 'Chapter 4: The Ruins',
        children: [
          {
            id: 'scene-4',
            type: 'scene',
            title: 'Scene 1: The Clue',
            content: \`<h1>The Ruins</h1>
<p>The call came at 3:00 AM. <span data-type="mention" data-id="2" data-label="Daniel Reeves" class="mention">@Daniel Reeves</span> was breathless, the sound of howling wind roaring through the phone's receiver. "Get to the <span data-type="mention" data-id="5" data-label="Ruined Citadel" class="mention">@Ruined Citadel</span>. Now. And don't let anyone see you leave." The line went dead before <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> could ask a single question.</p>
<p>The <span data-type="mention" data-id="5" data-label="Ruined Citadel" class="mention">@Ruined Citadel</span> was an ancient, crumbling fortress located on the northernmost tip of the peninsula, accessible only by a treacherous goat path. By the time Sarah arrived, a freak meteorological phenomenon—a localized, swirling green storm—had enveloped the ruins, casting an eerie, emerald glow over the fractured stones. The air crackled with static electricity, making the hair on her arms stand on end.</p>
<p>She found <span data-type="mention" data-id="2" data-label="Daniel Reeves" class="mention">@Daniel Reeves</span> kneeling in the mud in what used to be the citadel's central courtyard. He was furiously digging into the earth with a folding shovel, his trench coat soaked and plastered to his back. "Over here," he yelled over the roar of the wind. "The tectonic shift yesterday... it caused a partial collapse of the lower crypts. I was doing a perimeter check and found a secondary access tunnel."</p>
<p><span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> slid down into the trench beside him. "What did you find?"</p>
<p>Daniel stopped digging and used his hands to brush away the remaining dirt from a small, metal lockbox. It was heavily corroded but intact. "This isn't ancient history, Sarah. This is recent." He forced the latch open with his knife. Inside, wrapped in oilcloth, was a leather-bound journal and a silver locket. Sarah's breath hitched. It was her sister's locket. The one she never took off. As she opened the journal, the pages were filled with frantic, jagged handwriting, detailing a conspiracy that went deeper than the town's borders, pointing toward a location no one dared to visit.</p>\`
          }
        ]
      },
      {
        id: 'chap-5',
        type: 'chapter',
        title: 'Chapter 5: Fire and Stone',
        children: [
          {
            id: 'scene-5',
            type: 'scene',
            title: 'Scene 1: The Truth',
            content: \`<h1>Fire and Stone</h1>
<p>The coordinates in the journal led them far inland, away from the coastal fog and into a jagged, unforgiving landscape. The <span data-type="mention" data-id="4" data-label="Volcanic Citadel" class="mention">@Volcanic Citadel</span> stood as a brutal monument of black obsidian and basalt, built directly into the side of a semi-active volcano. The ambient heat was suffocating, the air thick with the smell of sulfur and ash. <span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> wiped a mixture of sweat and soot from her forehead, her boots crunching against the porous volcanic rock as they climbed the ancient, uneven steps.</p>
<p>"If she came here," <span data-type="mention" data-id="2" data-label="Daniel Reeves" class="mention">@Daniel Reeves</span> said, pausing to catch his breath and leaning heavily against a stone pillar, "she was tracking something massive. This place is supposed to be restricted by the federal government. A seismic monitoring zone."</p>
<p>"It's a cover," Sarah replied grimly, clutching the leather journal to her chest. "The journal detailed a smuggling ring. Not drugs, not weapons. They were excavating something from the deep crust. And my sister found out."</p>
<p>They reached the massive iron gates of the inner sanctum. The metal was warm to the touch. Pushing them open revealed a cavernous interior illuminated by the dull, red glow of magma flowing through channels cut into the floor. In the center of the room, surrounded by modern drilling equipment and hastily abandoned research stations, stood <span data-type="mention" data-id="3" data-label="Eleanor Cole" class="mention">@Eleanor Cole</span>.</p>
<p><span data-type="mention" data-id="1" data-label="Sarah Cole" class="mention">@Sarah Cole</span> froze, the betrayal hitting her with physical force. Her mother, the grieving recluse, was standing in the heart of the conspiracy, looking perfectly in control. "I told you to leave it alone, Sarah," Eleanor said, her voice echoing off the cavern walls, devoid of any maternal affection. "Some secrets are buried in the earth for a reason. Your sister couldn't understand the larger picture. I hope, for your sake, you're smarter than she was. It's time to end this." The true nightmare hadn't been the town; it had been her own blood.</p>\`
          }
        ]
      }
    ]
  }
];
`;

fs.writeFileSync('src/mockData.ts', before + newManuscript);
