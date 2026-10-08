import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UniversityHeader from '../components/university/UniversityHeader';
import UniversitySidebar from '../components/university/UniversitySidebar';
import Footer from '../components/common/Footer';

const UniversityLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gov-sand-50 font-serif text-gov-text-primary relative">
      {/* Fixed Persistent Left Sidebar */}
      <UniversitySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area: Offset by sidebar width on desktop (lg:pl-64) */}
      <div className="lg:pl-64 min-h-screen flex flex-col min-w-0 transition-all duration-200">
        <UniversityHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default UniversityLayout;
