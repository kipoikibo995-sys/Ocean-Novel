const fs = require('fs');

// 1. Move ProjectOverview inside ProjectLayout in App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const oldAppStr = `          <Route path="/project/:id" element={<ProjectOverview />} />
          <Route element={<ProjectLayout />}>`;
const newAppStr = `          <Route element={<ProjectLayout />}>
            <Route path="/project/:id" element={<ProjectOverview />} />`;
appCode = appCode.replace(oldAppStr, newAppStr);
fs.writeFileSync('src/App.tsx', appCode);

// 2. Remove the Back button from ProjectOverview.tsx and adjust padding
let poCode = fs.readFileSync('src/pages/ProjectOverview.tsx', 'utf8');
const oldBackButton = `      {/* Absolute Back Button */}
      <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors group uppercase tracking-widest text-[10px] font-bold"
        >
          <div className="w-8 h-8 rounded-full bg-white/50 border border-stone-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span>Return</span>
        </button>
      </div>`;
poCode = poCode.replace(oldBackButton, '');

const oldContainer = `className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto p-6 pt-16 lg:px-12 lg:pt-20 lg:pb-8 gap-8 lg:gap-12 min-h-0 h-full relative z-10"`;
const newContainer = `className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto p-6 lg:px-12 lg:py-12 gap-8 lg:gap-12 min-h-0 h-full relative z-10"`;
poCode = poCode.replace(oldContainer, newContainer);

const chevronImport = 'import { ChevronLeft, Edit3, Type, Target, LayoutDashboard, Clock, Activity, BookOpen, Users, Map } from "lucide-react";';
const newChevronImport = 'import { Edit3, Type, Target, LayoutDashboard, Clock, Activity, BookOpen, Users, Map } from "lucide-react";';
poCode = poCode.replace(chevronImport, newChevronImport);

fs.writeFileSync('src/pages/ProjectOverview.tsx', poCode);
