import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PORTAL_TITLE, GOVT_NAME } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from '../common/NotificationDropdown';
import Button from '../common/Button';
import Badge from '../common/Badge';
import SamadhanSetuLogo from '../common/SamadhanSetuLogo';
import {
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

const AdminHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNotifications = [
    {
      id: 1,
      title: 'New Challenge Awaiting Review',
      text: 'DEL-203 (Micro-Climatic PM2.5 Filtration at Anand Vihar) was lodged by RWA President.',
      time: '15 mins ago',
      unread: true
    },
    {
      id: 2,
      title: 'University Milestone Delivered',
      text: 'DTU Environmental Lab submitted Milestone 3 documentation for Ghazipur Waste project.',
      time: '3 hours ago',
      unread: true
    },
    {
      id: 3,
      title: 'Industry Sponsorship Pledged',
      text: 'Tata Power DDL pledged ₹ 6,00,000 for AIIMS solar lighting deployment.',
      time: '1 day ago',
      unread: false
    }
  ];

  return (
    <header className="bg-white border-b border-gov-border sticky top-0 z-40 shadow-xs">
      {/* Top Administration Strip */}
      <div className="bg-gov-navy text-white text-[11px] font-serif py-1.5 px-4 sm:px-6 flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 min-w-0 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
          <span className="font-bold tracking-wide whitespace-nowrap flex-shrink-0">{GOVT_NAME}</span>
          <span className="text-gray-400 hidden sm:inline flex-shrink-0">|</span>
          <span className="text-gray-300 truncate whitespace-nowrap hidden sm:inline">
            Official State Administration &amp; Governance Console
          </span>
        </div>
        <div className="flex items-center space-x-3 text-gray-300 flex-shrink-0">
          <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
            Restricted Clearance Level
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand / Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gov-navy hover:bg-gov-sand-100 rounded-sm border border-gov-border flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* On mobile, show SamadhanSetuLogo */}
          <div className="lg:hidden flex-shrink-0">
            <SamadhanSetuLogo
              size="sm"
              variant="admin"
              subtitle="Admin Console"
              to="/admin"
            />
          </div>

          {/* On desktop, show clean Government Console Header */}
          <div className="hidden lg:flex items-center space-x-3 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm text-gov-navy leading-none">
                  Delhi Societal Innovation Council
                </span>
                <span className="text-[9px] font-serif font-bold uppercase bg-gov-sand-100 text-gov-navy px-1.5 py-0.5 rounded-xs border border-gov-border">
                  State Administration
                </span>
              </div>
              <span className="text-[11px] font-serif text-gov-text-muted mt-0.5 truncate">
                Centralized Nodal Oversight &amp; Academic Allocation
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notifications, Admin Profile, Logout */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Admin Profile Pill */}
          <Link
            to="/admin/settings"
            className="flex items-center space-x-2.5 p-1.5 rounded-sm hover:bg-gov-sand-50 transition-colors border border-transparent hover:border-gov-border"
          >
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Administrator')}&background=142a45&color=fff&font-size=0.4`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-sm border border-gov-navy object-cover flex-shrink-0"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-serif font-bold text-gov-navy leading-tight truncate max-w-[140px]">
                {user?.name || 'Dr. Vivek Saxena'}
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="navy" className="text-[9px] py-0 px-1 font-bold">
                  STATE ADMIN
                </Badge>
              </div>
            </div>
          </Link>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="text-gov-navy hover:text-gov-maroon"
          >
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
