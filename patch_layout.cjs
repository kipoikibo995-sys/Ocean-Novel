const fs = require('fs');
let code = fs.readFileSync('src/components/layout/layouts.tsx', 'utf8');

const importReact = 'import { useState, useEffect } from "react";';
code = code.replace('import { useState } from "react";', importReact);

const targetState = 'const [isExpanded, setIsExpanded] = useState(true);';
const newCode = `const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (location.pathname.includes("/workspace/studio")) {
      setIsExpanded(false);
    }
  }, [location.pathname]);`;

code = code.replace(targetState, newCode);
fs.writeFileSync('src/components/layout/layouts.tsx', code);
