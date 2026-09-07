import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F2]">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center max-w-md">
        <h1 className="text-2xl font-bold text-[#62242F] mb-2">Sisenco Weekly Report System</h1>
        <p className="text-slate-600 text-sm mb-4">Phase 1 Foundation Initialized Successfully.</p>
        <span className="inline-block px-3 py-1 bg-[#B7872A] text-white text-xs font-semibold rounded-full">
          Tailwind CSS v4 + TypeScript
        </span>
      </div>
    </div>
  );
};

export default App;
