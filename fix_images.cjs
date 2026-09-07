const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

const oldState = `  const [unmappedLocations, setUnmappedLocations] = useState([
    { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine" },
    { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain" }
  ]);

  const handleMapLocation = (unmapped: any) => {
    const newId = Date.now().toString();
    const newLoc = {
      id: newId,
      name: unmapped.name,
      type: unmapped.type,
      description: "Needs description...",
      atmosphere: "Unknown",
      region: "Unmapped Lands",
      imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769185/08_serene_monastery_in_the_autumn_mountains_pazt8b.jpg" // placeholder
    };`;

const newState = `  const [unmappedLocations, setUnmappedLocations] = useState([
    { id: "u1", name: "Whispering Woods", type: "Forest", icon: "TreePine", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg" },
    { id: "u2", name: "Dragon's Peak", type: "Mountain", icon: "Mountain", imageUrl: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg" }
  ]);

  const handleMapLocation = (unmapped: any) => {
    const newId = Date.now().toString();
    const newLoc = {
      id: newId,
      name: unmapped.name,
      type: unmapped.type,
      description: "Needs description...",
      atmosphere: "Unknown",
      region: "Unmapped Lands",
      imageUrl: unmapped.imageUrl
    };`;

code = code.replace(oldState, newState);
fs.writeFileSync('src/pages/Locations.tsx', code);
