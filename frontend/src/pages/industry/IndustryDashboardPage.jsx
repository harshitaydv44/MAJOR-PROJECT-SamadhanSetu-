import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { industryService } from '../../services/industryService';
import MetricCard from '../../components/common/MetricCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Compass,
  Handshake,
  Briefcase,
  Award,
  IndianRupee,
  Send,
  Building2,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Factory,
  Cpu
} from 'lucide-react';

const SUPPORT_TYPE_LABELS = {
  EXPRESS_INTEREST: { label: 'Expression of Interest', color: 'bg-stone-100 text-stone-800' },
  MENTORSHIP: { label: 'Mentorship', color: 'bg-purple-100 text-purple-800' },
  FUNDING: { label: 'Grant Funding', color: 'bg-emerald-100 text-emerald-800' },
  TECHNOLOGY: { label: 'Technology / Hardware', color: 'bg-blue-100 text-blue-800' },
  PROTOTYPING: { label: 'Prototyping Facility', color: 'bg-indigo-100 text-indigo-800' },
  PILOT_SUPPORT: { label: 'Pilot Field Testing', color: 'bg-amber-100 text-amber-900 font-bold' }
};

const IndustryDashboardPage = () => {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, profRes, partRes] = await Promise.all([
        industryService.getDashboard(),
        industryService.getProfile(),
        industryService.getCollaborations()
      ]);
      const dashData = dashRes.data || {};
      setData(dashData.stats || {});
      setRecentNotifications(dashData.recentNotifications || []);
      setProfile(profRes.data?.industry || {});
      setPartnerships(partRes.data?.collaborations || partRes.data?.partnerships || []);
    } catch (err) {
      console.error('Failed to load industry dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading corporate innovation metrics & partnership commitments from Delhi Portal..." />;
  }

  const stats = data || {};

  return (
    <div className="space-y-6 font-serif">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-gov-maroon" />
            <span>Corporate Innovation & CSR Partnership Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            {profile?.name || 'Tata Power Innovation Hub'}
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            {profile?.organizationType || 'Industry'} &bull; Sector: <strong>{profile?.industrySector || 'Clean Energy & Utilities'}</strong> &bull; Location: {profile?.location || 'Delhi'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchData} icon={RefreshCw}>
            Refresh
          </Button>
          <Link to="/industry/opportunities">
            <Button variant="primary" size="sm" icon={Compass} className="bg-gov-maroon text-white">
              Browse Challenges
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 MongoDB Metrics Cards Requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <MetricCard
          title="Available Challenges"
          value={stats.availableChallenges ?? 0}
          subtitle="Validated civic challenges"
          icon={Compass}
          accent="gold"
        />

        <MetricCard
          title="Active Collaborations"
          value={stats.activeCollaborations ?? 0}
          subtitle="Accepted & active pacts"
          icon={Handshake}
          accent="navy"
        />

        <MetricCard
          title="Ongoing Projects"
          value={stats.ongoingProjects ?? 0}
          subtitle="Prototypes in development"
          icon={Briefcase}
          accent="indigo"
        />

        <MetricCard
          title="Completed Projects"
          value={stats.completedProjects ?? 0}
          subtitle="Field verified solutions"
          icon={CheckCircle2}
          accent="emerald"
        />

        <MetricCard
          title="Recent Notifications"
          value={recentNotifications.length}
          subtitle="Live council bulletins"
          icon={Award}
          accent="maroon"
        />
      </div>

      {/* Opportunities Action Alert */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-amber-900 flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-amber-700" />
            <span>Discover High-Impact Samadhan Setu Engineering Challenges</span>
          </div>
          <p className="text-amber-800 text-[11px]">
            Academically vetted challenges and prototypes seek corporate mentorship, grant funding, prototyping facilities, and live ward pilot testbeds.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/industry/opportunities">
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-700 hover:bg-amber-800 text-white whitespace-nowrap"
            >
              Browse Validated Challenges &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* 2-Column Grid: Active Collaborations + Recent Notifications & Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Collaborations */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            accent="maroon"
            title={`Active Corporate Collaborations (${partnerships.length})`}
            subtitle="Pledged support and partnerships tracked in MongoDB"
          >
            {partnerships.length === 0 ? (
              <div className="py-8 text-center text-xs text-gov-text-muted space-y-2">
                <p>No active partnerships registered yet.</p>
                <Link to="/industry/opportunities">
                  <Button variant="outline" size="sm" icon={Compass}>
                    Explore Open Opportunities
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gov-border">
                {partnerships.slice(0, 5).map((p) => {
                  const typeInfo = SUPPORT_TYPE_LABELS[p.supportType] || { label: p.supportType, color: 'bg-gray-100 text-gray-700' };
                  const targetTitle = p.challenge?.title || p.project?.title || 'Academic Innovation Project';
                  const targetCode = p.challenge?.code || 'DEL-CIVIC';

                  return (
                    <div key={p._id} className="py-3.5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-gov-maroon bg-gov-sand-100 px-1.5 py-0.5 rounded-xs border border-gov-border">
                            {targetCode}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${
                            p.status === 'ACTIVE' || p.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            p.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            p.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            p.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        {p.fundingAmount > 0 && (
                          <span className="font-bold text-emerald-800 text-xs">
                            ₹{p.fundingAmount.toLocaleString('en-IN')} Pledged
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-gov-navy text-sm leading-snug">
                        {targetTitle}
                      </h4>

                      <p className="text-xs text-gov-text-secondary leading-relaxed line-clamp-2">
                        {p.proposedContribution || p.description}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gov-text-muted">
                        <div>
                          Partner: <strong>{p.university?.name || 'Assigned University Team'}</strong>
                        </div>
                        <div className="flex items-center space-x-3">
                          {p.project && (
                            <Link
                              to={`/industry/projects/${p.project._id || p.project}`}
                              className="text-gov-navy font-bold hover:underline inline-flex items-center"
                            >
                              <span>Track Progress</span>
                              <ArrowRight className="w-3 h-3 ml-0.5" />
                            </Link>
                          )}
                          <Link
                            to="/industry/partnerships"
                            className="text-gov-maroon font-bold hover:underline inline-flex items-center"
                          >
                            <span>Manage Collaboration</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Recent Notifications + Capability Snapshot */}
        <div className="space-y-4">
          {/* Recent Notifications Card */}
          <Card accent="navy" title="Recent Notifications">
            {recentNotifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-gov-text-muted">
                No recent notifications.
              </div>
            ) : (
              <div className="divide-y divide-gov-border text-xs">
                {recentNotifications.slice(0, 4).map((n) => (
                  <div key={n._id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gov-navy">
                      <span className="truncate pr-2">{n.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gov-text-secondary line-clamp-2 leading-snug">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-gov-border">
              <Link to="/industry/notifications">
                <Button variant="ghost" size="sm" fullWidth className="text-gov-maroon font-bold text-xs">
                  View All Notifications &rarr;
                </Button>
              </Link>
            </div>
          </Card>

          {/* Corporate Capability Snapshot */}
          <Card accent="gold" title="Corporate Capabilities Snapshot">
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-gov-navy block text-[10px] uppercase tracking-wider mb-1">
                  Organization Profile
                </span>
                <div className="text-gov-text-secondary leading-snug text-[11px]">
                  <strong>{profile?.organizationType || 'Industry'}</strong> &bull; {profile?.industrySector || 'Energy & Utilities'}
                </div>
              </div>

              <div className="pt-2 border-t border-gov-border">
                <span className="font-bold text-gov-navy block text-[10px] uppercase tracking-wider mb-1">
                  CSR & Funding Bandwidth
                </span>
                <p className="text-emerald-800 font-bold text-xs">
                  Max Grant per Cohort: ₹{(profile?.fundingCapability?.maxGrantAmount || 2500000).toLocaleString('en-IN')}
                </p>
                <div className="text-gov-text-muted text-[10px] mt-0.5">
                  Annual CSR Allocated: ₹{(profile?.fundingCapability?.csrBudgetAllocated || 10000000).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-2 border-t border-gov-border">
                <span className="font-bold text-gov-navy block text-[10px] uppercase tracking-wider mb-1">
                  Pledged Testbeds & Labs
                </span>
                <div className="flex flex-wrap gap-1">
                  {(profile?.resources || []).slice(0, 3).map((res, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-xs bg-gov-sand-100 text-gov-navy border border-gov-border text-[10px] font-semibold truncate max-w-full"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gov-border">
                <Link to="/industry/profile">
                  <Button variant="outline" size="sm" fullWidth>
                    Manage Profile & Capabilities
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IndustryDashboardPage;
