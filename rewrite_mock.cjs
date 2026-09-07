const fs = require('fs');

let content = fs.readFileSync('src/mockData.ts', 'utf8');
content = content.replace(
  `export const MOCK_LOCATIONS = [
  {
    id: '1',
    name: 'Greyhaven',
    type: 'Coastal Town',
    description: 'A quiet isolated fishing town surrounded by cliffs and dense fog.',
  },
  {
    id: '2',
    name: 'Old Lighthouse',
    type: 'Landmark',
    description: 'An abandoned lighthouse overlooking the northern cliffs.',
  },
  {
    id: '3',
    name: 'Cole Family House',
    type: 'House',
    description: 'Sarah\\'s childhood home.',
  }
];`,
  `export const MOCK_LOCATIONS = [
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
    description: 'Sarah\\'s childhood home.',
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
];`
);
fs.writeFileSync('src/mockData.ts', content);
