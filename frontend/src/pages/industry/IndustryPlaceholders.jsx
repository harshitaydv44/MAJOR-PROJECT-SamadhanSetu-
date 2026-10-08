import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import socketService from '../../services/socket';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Briefcase,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Bell,
  RefreshCw,
  Compass,
  CheckCircle2,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';

// Re-export real IndustryProjectsPage
export { default as IndustryProjectsPage } from './IndustryProjectsPage';

/**
 * Mentorship Page (/industry/mentorship)
 */
export const IndustryMentorshipPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-gov-maroon" />
          <span>Industry Mentorship Cell</span>
        </div>
        <h1 className="text-2xl font-bold text-gov-navy">Corporate Engineering Mentorship</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Senior industry advisors providing architecture reviews, code audits, and production hardening for student teams.
        </p>
      </div>
      <Card accent="navy" className="p-6 text-xs text-gov-text-secondary space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xs text-purple-900">
          <h4 className="font-bold text-sm mb-1">Mentorship Guidelines & Review Cadence</h4>
          <p className="leading-relaxed">
            Corporate engineering mentors are paired with student innovators during the prototype and testing phases. Mentors conduct monthly sprint reviews, advise on telemetry standards (LoRaWAN, SCADA, ISO compliance), and review GitHub deliverables.
          </p>
        </div>
        <div className="flex justify-end">
          <Link to="/industry/opportunities">
            <Button variant="primary" size="sm" className="bg-gov-maroon text-white">
              Offer Mentorship on Open Challenges
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

/**
 * Funding Page (/industry/funding)
 */
export const IndustryFundingPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <IndianRupee className="w-4 h-4 text-gov-maroon" />
          <span>CSR Grants & Seed Commitments</span>
        </div>
        <h1 className="text-2xl font-bold text-gov-navy">CSR Grants & Prototyping Sponsorship</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Disbursed innovation grants, milestone-based payments, and municipal CSR accounting statements under GNCTD Innovation Cell.
        </p>
      </div>
      <Card accent="emerald" className="p-6 text-xs text-gov-text-secondary space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs text-emerald-900">
          <h4 className="font-bold text-sm mb-1">CSR Section 135 Innovation Compliance</h4>
          <p className="leading-relaxed">
            All research sponsorships and hardware grants directed to Delhi accredited universities (DTU, NSUT, IIITD, IGDTUW) qualify under Schedule VII of the Companies Act 2013 for official CSR tax compliance.
          </p>
        </div>
        <div className="flex justify-end">
          <Link to="/industry/opportunities">
            <Button variant="primary" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
              Pledge Funding for Open Challenges
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

/**
 * Prototyping Page (/industry/prototyping)
 */
export const IndustryPrototypingPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <Cpu className="w-4 h-4 text-gov-maroon" />
          <span>Industrial Fabrication Testbeds</span>
        </div>
        <h1 className="text-2xl font-bold text-gov-navy">Industrial Fabrication & Lab Access</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Cleanroom permits, rapid PCB assembly bookings, CNC machining, and high-voltage bench testing scheduling.
        </p>
      </div>
      <Card accent="indigo" className="p-6 text-xs text-gov-text-secondary space-y-4">
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xs text-indigo-900">
          <h4 className="font-bold text-sm mb-1">Corporate Lab Facilities & Testing Benches</h4>
          <p className="leading-relaxed">
            Provide student researchers access to industrial testing facilities, environmental simulation chambers, and sensor telemetry testbeds across Delhi industrial clusters.
          </p>
        </div>
        <div className="flex justify-end">
          <Link to="/industry/profile">
            <Button variant="outline" size="sm">
              Update Facility Availability
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

/**
 * Pilot Projects Page (/industry/pilot-projects)
 */
export const IndustryPilotProjectsPage = () => {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <Send className="w-4 h-4 text-gov-maroon" />
          <span>Live Deployment Corridors</span>
        </div>
        <h1 className="text-2xl font-bold text-gov-navy">Live Delhi Ward Pilot Testbeds</h1>
        <p className="text-xs text-gov-text-secondary mt-0.5">
          Field site permits, municipal utility testbed integrations, and ground trials with MCD, DJB, and DISCOMs.
        </p>
      </div>
      <Card accent="maroon" className="p-6 text-xs text-gov-text-secondary space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs text-amber-900">
          <h4 className="font-bold text-sm mb-1">Municipal Testbed Integration</h4>
          <p className="leading-relaxed">
            Co-sponsor live ward trials in Ghazipur, Najafgarh, Bawana, and Rohini. Pilot testing permits are reviewed and co-signed by municipal zone engineers and the Delhi State Innovation Council.
          </p>
        </div>
        <div className="flex justify-end">
          <Link to="/industry/projects">
            <Button variant="primary" size="sm" className="bg-gov-maroon text-white">
              View Active Pilot Projects
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

/**
 * Notifications Page (/industry/notifications)
 * Real-time Notifications via MongoDB + Socket.IO
 */
export const IndustryNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Listen for real-time WebSocket notifications via Socket.IO
  useEffect(() => {
    if (user?._id) {
      socketService.joinUserRoom(user._id);
    }

    const unsubscribe = socketService.onNotification((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?._id]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      setActionSuccess('All notices marked as read.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  const displayList = notifications.filter((n) => {
    if (filterMode === 'UNREAD') return !n.isRead && !n.read;
    return true;
  });

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Bell className="w-4 h-4 text-gov-maroon" />
            <span>Corporate Alerts & Real-Time Notices</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Notifications & Bulletins ({notifications.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Real-time updates on proposal reviews, university project milestones, student submissions, and council directives.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              icon={Check}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
          <Button variant="subtle" size="sm" onClick={fetchNotifs} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs border-b border-gov-border pb-2">
        <button
          onClick={() => setFilterMode('ALL')}
          className={`px-3 py-1.5 rounded-xs font-semibold transition-colors ${
            filterMode === 'ALL'
              ? 'bg-gov-maroon text-white font-bold'
              : 'bg-white text-gov-navy border border-gov-border hover:bg-gov-sand-50'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilterMode('UNREAD')}
          className={`px-3 py-1.5 rounded-xs font-semibold transition-colors ${
            filterMode === 'UNREAD'
              ? 'bg-gov-maroon text-white font-bold'
              : 'bg-white text-gov-navy border border-gov-border hover:bg-gov-sand-50'
          }`}
        >
          Unread Alerts ({unreadCount})
        </button>
      </div>

      <Card accent="none">
        {loading ? (
          <LoadingState message="Loading corporate notifications from MongoDB & Socket.IO..." />
        ) : displayList.length === 0 ? (
          <div className="py-12 text-center text-xs text-gov-text-muted space-y-1">
            <p className="font-bold text-gov-navy text-sm">No Notifications Found</p>
            <p className="text-[11px]">
              {filterMode === 'UNREAD'
                ? 'All caught up! You have no unread notifications.'
                : 'No corporate alerts or bulletins recorded.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gov-border text-xs">
            {displayList.map((n) => {
              const isUnread = !n.isRead && !n.read;

              return (
                <div
                  key={n._id}
                  className={`p-4 space-y-2 transition-colors ${
                    isUnread ? 'bg-amber-50/50' : 'bg-white hover:bg-gov-sand-50/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center space-x-2">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-gov-maroon animate-pulse" />
                      )}
                      <span className="font-bold text-gov-navy text-sm">
                        {n.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted bg-stone-100 px-1.5 py-0.2 rounded-xs">
                        {n.type || 'NOTICE'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-gov-text-muted">
                      <span>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(n._id)}
                          className="text-gov-maroon font-bold hover:underline text-[11px]"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gov-text-secondary text-xs leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-gov-text-muted">
                    <div>
                      From: <strong>{n.senderName || 'Delhi State Innovation Council'}</strong>
                    </div>

                    {n.project && (
                      <Link
                        to={`/industry/projects/${n.project}`}
                        className="text-gov-maroon font-bold hover:underline inline-flex items-center"
                      >
                        <span>View Project Workspace</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

