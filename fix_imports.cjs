const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

const oldImport = 'import { Plus, MoreVertical, Search, X, MapPin, Map as MapIcon, Compass, Mountain, TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move, Pen, Link2 } from "lucide-react";';
const newImport = 'import { Plus, MoreVertical, Search, X, MapPin, Map as MapIcon, Compass, Mountain, TreePine, Castle, Edit3, Trash2, Home, Building, LayoutGrid, Route, Move, Pen, Link2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";';

code = code.replace(oldImport, newImport);

fs.writeFileSync('src/pages/Locations.tsx', code);
