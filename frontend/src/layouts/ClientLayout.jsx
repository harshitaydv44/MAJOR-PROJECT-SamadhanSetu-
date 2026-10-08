import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Footer from '../components/common/Footer';
import { Home, ChevronRight, ArrowLeft } from 'lucide-react';

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/client' || path === '/client/dashboard') return 'Overview';
    if (path === '/client/challenges/new' || path === '/client/submit') return 'Submit a Challenge';
    if (path.includes('/edit')) return 'Edit Challenge';
    if (path.startsWith('/client/challenges/') && path !== '/client/challenges') return 'Challenge Detail';
    if (path === '/client/challenges') return 'My Challenges';
    if (path === '/client/saved') return 'Saved Challenges';
    if (path === '/client/notifications') return 'Notifications';
    if (path === '/client/profile') return 'Profile';
    if (path === '/client/help') return 'Help & Support';
    return 'Citizen Portal';
  };

  return (
    <div className="min-h-screen bg-gov-sand-50 text-gov-text-primary font-serif relative">
      {/* Fixed Persistent Left Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area: Offset by sidebar width on desktop (lg:pl-64) */}
      <div className="lg:pl-64 min-h-screen flex flex-col min-w-0 transition-all duration-200">
        <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Sub-header Breadcrumb Strip */}
        <div className="bg-white border-b border-gov-border px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
          <nav className="flex items-center space-x-2 text-gov-text-muted min-w-0 overflow-hidden">
            <Link to="/select-role" className="hover:text-gov-maroon flex items-center flex-shrink-0">
              <Home className="w-3.5 h-3.5 mr-1" />
              Portal
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <Link to="/client" className="hover:text-gov-maroon font-medium flex-shrink-0">
              Citizen Dashboard
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-gov-maroon font-semibold truncate">{getBreadcrumbTitle()}</span>
          </nav>

          <Link
            to="/select-role"
            className="text-gov-maroon hover:underline flex items-center text-[11px] font-semibold whitespace-nowrap ml-auto"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Switch Role
          </Link>
        </div>

        {/* Body Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto min-w-0">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ClientLayout;
