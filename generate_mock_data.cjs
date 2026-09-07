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
            content: \`<h1>The Arrival</h1><p>The bus ride to <span data-type="mention" data-id="1" class="mention">@Greyhaven</span> was as bumpy and uncomfortable as <span data-type="mention" data-id="1" class="mention">@Sarah Cole</span> remembered. The coastal town hadn't changed much in fifteen years; the fog still clung to the jagged cliffs like a shroud.</p>\`
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
            content: \`<h1>The Old Lighthouse</h1><p><span data-type="mention" data-id="1" class="mention">@Sarah Cole</span> stood at the base of the <span data-type="mention" data-id="2" class="mention">@Old Lighthouse</span>. The wind roared, threatening to push her into the crashing waves below. Suddenly, a figure emerged from the shadows. It was <span data-type="mention" data-id="2" class="mention">@Daniel Reeves</span>, looking older and more tired than she remembered.</p><p>"I didn't think you'd actually come back," he said.</p>\`
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
            content: \`<h1>Family Secrets</h1><p>The air inside the <span data-type="mention" data-id="3" class="mention">@Cole Family House</span> was stagnant, smelling of old paper and dried lavender. <span data-type="mention" data-id="3" class="mention">@Eleanor Cole</span> sat in her armchair, refusing to meet her daughter's eyes.</p><p>"Why did you come back, <span data-type="mention" data-id="1" class="mention">@Sarah Cole</span>?" she asked coldly.</p>\`
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
            content: \`<h1>The Ruins</h1><p><span data-type="mention" data-id="2" class="mention">@Daniel Reeves</span> called her early in the morning. He had found something at the <span data-type="mention" data-id="5" class="mention">@Ruined Citadel</span>. The green storm raged above them as they dug through the ancient stones.</p>\`
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
            content: \`<h1>Fire and Stone</h1><p>The trail led them far from the coast, all the way to the <span data-type="mention" data-id="4" class="mention">@Volcanic Citadel</span>. <span data-type="mention" data-id="1" class="mention">@Sarah Cole</span> wiped soot from her forehead. The truth about her sister was hidden here, amidst the magma and ancient rock.</p><p>It was time to end this.</p>\`
          }
        ]
      }
    ]
  }
];
`;

fs.writeFileSync('src/mockData.ts', before + newManuscript);
