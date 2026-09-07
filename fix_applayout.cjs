const fs = require('fs');
let code = fs.readFileSync('src/components/layout/layouts.tsx', 'utf8');

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
  return (
    <div className="h-screen w-screen bg-[#F4F1EA] text-stone-800 font-sans flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}`;

code = code.replace(oldAppLayout, newAppLayout);
fs.writeFileSync('src/components/layout/layouts.tsx', code);
