import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import Footer from '../components/common/Footer';
import { ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Overview';
    if (path === '/admin/challenges') return 'Challenge Management';
    if (path === '/admin/validation-queue') return 'Validation Queue';
    if (path === '/admin/universities') return 'Universities Registry';
    if (path === '/admin/industry-partners') return 'Industry & Corporate Partners';
    if (path === '/admin/projects') return 'Active Societal Projects';
    if (path === '/admin/analytics') return 'Strategic Analytics';
    if (path === '/admin/notifications') return 'Government Alerts';
    if (path === '/admin/settings') return 'Admin Settings & Identity';
    return 'State Console';
  };

  return (
    <div className="min-h-screen bg-gov-sand-50 text-gov-text-primary font-serif relative">
      {/* Fixed Persistent Left Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area: Offset by sidebar width on desktop (lg:pl-64) */}
      <div className="lg:pl-64 min-h-screen flex flex-col min-w-0 transition-all duration-200">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Sub-header Breadcrumb Strip */}
        <div className="bg-white border-b border-gov-border px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
          <nav className="flex items-center space-x-2 text-gov-text-muted min-w-0 overflow-hidden">
            <Link to="/select-role" className="hover:text-gov-maroon flex items-center flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gov-navy" />
              Portal
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <Link to="/admin" className="hover:text-gov-navy font-medium flex-shrink-0">
              State Administration
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-gov-navy font-bold truncate">{getBreadcrumbTitle()}</span>
          </nav>

          <Link
            to="/select-role"
            className="text-gov-maroon hover:underline flex items-center text-[11px] font-semibold whitespace-nowrap ml-auto"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Exit Admin Console
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

export default AdminLayout;
