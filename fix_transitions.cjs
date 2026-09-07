const fs = require('fs');

// 1. In App.tsx, remove the AnimatePresence and key from Routes
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace('<AnimatePresence mode="wait">', '');
appCode = appCode.replace('</AnimatePresence>', '');
appCode = appCode.replace('key={location.pathname}', '');
appCode = appCode.replace(/import \{ AnimatePresence \} from "motion\/react";\n?/, '');
fs.writeFileSync('src/App.tsx', appCode);

// 2. In layouts.tsx, add AnimatePresence and motion to ProjectLayout and AppLayout
let layoutCode = fs.readFileSync('src/components/layout/layouts.tsx', 'utf8');

const importMotion = `import { AnimatePresence, motion } from "motion/react";\n`;
layoutCode = importMotion + layoutCode;

// Wrap AppLayout
const oldAppLayout = `export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800 font-sans flex flex-col">
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}`;

const newAppLayout = `export function AppLayout() {
  const location = useLocation();
  // AppLayout only animates its direct children (Dashboard, CreateProject, ProjectLayout)
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800 font-sans flex flex-col">
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname.startsWith('/project') ? 'project' : location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col h-screen overflow-hidden"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}`;
layoutCode = layoutCode.replace(oldAppLayout, newAppLayout);

// Wrap ProjectLayout main content
const oldMain = `<main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F1EA]">
        <Outlet />
      </main>`;
const newMain = `<main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F1EA]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>`;
layoutCode = layoutCode.replace(oldMain, newMain);

fs.writeFileSync('src/components/layout/layouts.tsx', layoutCode);
