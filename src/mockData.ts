export const MOCK_PROJECT = {
  id: '1',
  title: 'The Silent Harbor',
  genre: 'Psychological Thriller',
  targetWords: 70000,
  currentWords: 42530,
  progress: 61,
  chaptersCount: 18,
  charactersCount: 7,
  locationsCount: 5,
  lastEdited: 'today',
  premise: 'A journalist returns to her isolated coastal hometown after receiving an anonymous letter suggesting that her sister\'s disappearance fifteen years earlier was not an accident.',
};

export const MOCK_PROJECTS = [
  MOCK_PROJECT,
  {
    id: '2',
    title: 'Ashes of Winter',
    genre: 'Dark Romance',
    targetWords: 80000,
    currentWords: 18240,
    progress: 22,
    chaptersCount: 9,
    charactersCount: 4,
    locationsCount: 3,
    lastEdited: '3 days ago',
    premise: 'In a world frozen over, two rival faction leaders must pretend to be in love to prevent an all-out war.',
  }
];

export const MOCK_CHARACTERS = [
  {
    id: '1',
    name: 'Sarah Cole',
    role: 'Protagonist',
    description: 'Investigative journalist returning to her hometown after fifteen years.',
    age: '32',
    motivation: 'To find the truth about what happened to her sister.',
    locationId: '1',
  },
  {
    id: '2',
    name: 'Daniel Reeves',
    role: 'Supporting Character',
    description: 'Detective responsible for reopening the disappearance case.',
    age: '38',
    motivation: 'To solve the one case that always bothered him.',
    locationId: '1',
  },
  {
    id: '3',
    name: 'Eleanor Cole',
    role: 'Supporting Character',
    description: 'Sarah\'s emotionally distant mother.',
    age: '59',
    motivation: 'To keep family secrets buried.',
    locationId: '3',
  }
];

export const MOCK_LOCATIONS = [
  {
    id: '1',
    name: 'Greyhaven',
    type: 'Coastal Town',
    description: 'A quiet isolated fishing town surrounded by cliffs and dense fog.',
    imageUrl: 'https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/09_stormlit_harbor_of_the_cliffside_citadel_jpisuj.jpg'
  },
  {
    id: '2',
    name: 'Old Lighthouse',
    type: 'Landmark',
    description: 'An abandoned lighthouse overlooking the northern cliffs.',
    imageUrl: 'https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg'
  },
  {
    id: '3',
    name: 'Cole Family House',
    type: 'House',
    description: 'Sarah\'s childhood home.',
    imageUrl: 'https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/06_golden_oasis_city_at_sunset_so7xdx.jpg'
  },
  {
    id: '4',
    name: 'Volcanic Citadel',
    type: 'Castle',
    description: 'A fortress built into the side of an active volcano.',
    imageUrl: 'https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/04_volcanic_citadel_at_sunset_yafvd7.jpg'
  },
  {
    id: '5',
    name: 'Ruined Citadel',
    type: 'Ruins',
    description: 'Ancient ruins beneath a green storm.',
    imageUrl: 'https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/07_ruined_citadel_beneath_the_green_storm_po3es7.jpg'
  }
];

export type ManuscriptItem = {
  id: string;
  type: 'part' | 'chapter' | 'scene';
  title: string;
  content?: string;
  children?: ManuscriptItem[];
};

export const MOCK_MANUSCRIPT: ManuscriptItem[] = [
  {
    id: 'part-1',
    type: 'part',
    title: 'Part I: The Return',
    children: [
      {
        id: 'chap-1',
        type: 'chapter',
        title: 'Chapter 1: The Letter',
        children: [
          {
            id: 'scene-1',
            type: 'scene',
            title: 'Scene 1: Morning Coffee',
            content: `<h1 class="text-4xl font-bold font-sans text-stone-800 mb-8 tracking-tight">The Letter</h1>
              <p class="mb-6">The coffee was cold by the time <span contenteditable="false" class="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm" data-id="1" data-type="character">@Sarah Cole</span> finally looked up from the envelope. It had no return address, just a postmark from <span contenteditable="false" class="inline-flex items-center bg-emerald-100 text-emerald-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-emerald-200 transition-colors select-none text-sm" data-id="1" data-type="location">@Greyhaven</span>.</p>
              <p class="mb-6">She ran her thumb over the wax seal. Fifteen years. Fifteen years since she had stepped foot in that accursed town.</p>`
          },
          {
            id: 'scene-2',
            type: 'scene',
            title: 'Scene 2: Packing',
            content: `<p class="mb-6">The suitcase lay open on the bed. <span contenteditable="false" class="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm" data-id="1" data-type="character">@Sarah Cole</span> threw a few sweaters into it, barely thinking about what she was packing.</p>`
          }
        ]
      },
      {
        id: 'chap-2',
        type: 'chapter',
        title: 'Chapter 2: The Fog',
        children: [
          {
            id: 'scene-3',
            type: 'scene',
            title: 'Scene 1: Arrival',
            content: `<h1 class="text-4xl font-bold font-sans text-stone-800 mb-8 tracking-tight">The Fog</h1>
              <p class="mb-6">The wind whipped against the jagged edges of the northern cliffs, carrying with it the bitter sting of sea salt and the smell of ancient decay. <span contenteditable="false" class="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm" data-id="1" data-type="character">@Sarah Cole</span> pulled her coat tighter, her boots slipping occasionally on the slick, moss-covered path that wound upward.</p>
              <p class="mb-6">Ahead, the <span contenteditable="false" class="inline-flex items-center bg-emerald-100 text-emerald-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-emerald-200 transition-colors select-none text-sm" data-id="2" data-type="location">@Old Lighthouse</span> loomed like a rotting tooth against the bruised, twilight sky.</p>`
          },
          {
            id: 'scene-4',
            type: 'scene',
            title: 'Scene 2: Meeting Daniel',
            content: `<p class="mb-6">A shadow detached itself from the rocks. <span contenteditable="false" class="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm" data-id="2" data-type="character">@Daniel Reeves</span> struck a match, lighting a cigarette. The brief flare illuminated his tired eyes.</p>
              <p class="mb-6">"You came back," he said simply.</p>
              <p class="mb-6"><span contenteditable="false" class="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm" data-id="1" data-type="character">@Sarah Cole</span> nodded. "I had to."</p>`
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
        id: 'chap-3',
        type: 'chapter',
        title: 'Chapter 3: Family Ties',
        children: [
          {
            id: 'scene-5',
            type: 'scene',
            title: 'Scene 1: Mother',
            content: `<h1 class="text-4xl font-bold font-sans text-stone-800 mb-8 tracking-tight">Family Ties</h1><p class="mb-6"><span contenteditable="false" class="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-indigo-200 transition-colors select-none text-sm" data-id="3" data-type="character">@Eleanor Cole</span> stood by the window, not turning when the door opened. The silence in the <span contenteditable="false" class="inline-flex items-center bg-emerald-100 text-emerald-700 rounded-md px-1.5 py-0.5 mx-0.5 font-medium cursor-pointer hover:bg-emerald-200 transition-colors select-none text-sm" data-id="3" data-type="location">@Cole Family House</span> was suffocating.</p>`
          }
        ]
      }
    ]
  }
];
