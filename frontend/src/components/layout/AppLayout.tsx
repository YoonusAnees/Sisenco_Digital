import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toaster } from 'sonner';

export const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col lg:flex-row">
      <Toaster position="top-right" richColors closeButton />

      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onMobileMenuToggle={() => setIsMobileOpen((prev) => !prev)}
        />

        {/* Content with pb-24 on mobile so bottom nav never overlaps cards or buttons */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile App Bottom Navigation */}
      <BottomNav onOpenMobileMenu={() => setIsMobileOpen(true)} />
    </div>
  );
};
