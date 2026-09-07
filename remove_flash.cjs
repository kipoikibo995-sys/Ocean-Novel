const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/layout/layouts.tsx', 'utf8');

// AppLayout
const oldAppLayout = `export function AppLayout() {
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

const newAppLayout = `export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800 font-sans flex flex-col">
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}`;
layoutCode = layoutCode.replace(oldAppLayout, newAppLayout);

// ProjectLayout
const oldProjectMain = `<main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F1EA]">
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
const newProjectMain = `<main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F4F1EA]">
        <Outlet />
      </main>`;
layoutCode = layoutCode.replace(oldProjectMain, newProjectMain);

fs.writeFileSync('src/components/layout/layouts.tsx', layoutCode);
