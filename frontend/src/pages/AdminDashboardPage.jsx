import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuth } from '../hooks/useAuth';
import MetricCard from '../components/common/MetricCard';
import ChartCard from '../components/common/ChartCard';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import AssignUniversityModal from '../components/admin/AssignUniversityModal';
import ChallengeDetailModal from '../components/admin/ChallengeDetailModal';

// Recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';

import {
  FolderKanban,
  FilePlus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  GraduationCap,
  Building2,
  Eye,
  Check,
  XCircle,
  Share2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const STATUS_COLORS = {
  SUBMITTED: '#78716c',
  UNDER_REVIEW: '#d97706',
  VALIDATED: '#2563eb',
  ASSIGNED: '#4f46e5',
  IN_PROGRESS: '#ca8a04',
  SOLUTION_PROPOSED: '#9333ea',
  PILOT_TESTING: '#0891b2',
  RESOLVED: '#059669',
  REJECTED: '#e11d48'
};

const PIE_COLORS = ['#7a1113', '#142a45', '#b45309', '#059669', '#4f46e5', '#9333ea', '#0891b2', '#e11d48'];

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [assigningChallenge, setAssigningChallenge] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, challengesRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getChallenges({ page: 1, limit: 6, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      const data = dashboardRes.data || {};
      setMetrics(data.metrics || {});
      setCharts(data.charts || {});
      setRecentChallenges(challengesRes.data?.challenges || data.recentChallenges || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to retrieve government state data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Quick Action: Validate Challenge
  const handleValidate = async (challenge) => {
    try {
      await adminService.validateChallenge(
        challenge._id,
        'Validated by Delhi State Innovation Council nodal cell'
      );
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to validate challenge');
    }
  };

  // Quick Action: Reject Challenge
  const handleReject = async (challenge) => {
    const reason = window.prompt(
      'Please specify official rejection reason for citizen audit records:',
      'Duplicate submission or out of state jurisdiction.'
    );
    if (!reason) return;

    try {
      await adminService.rejectChallenge(challenge._id, reason.trim());
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Failed to reject challenge');
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to Delhi State Innovation Registry & calculating live analytics..." />;
  }

  if (error && !metrics?.totalChallenges) {
    return (
      <div className="py-12">
        <ErrorState
          title="State Innovation Registry Unavailable"
          message={error}
          onRetry={loadDashboard}
          retryLabel="Retry Dashboard Connection"
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Operational Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-serif text-gov-navy font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>GNCTD State Administration &bull; {user?.name || 'Dr. Vivek Saxena'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-tight">
            Government Oversight & Challenge Allocation Console
          </h1>
          <p className="text-xs font-serif text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
            Monitor community problem statements across Delhi's 11 districts, screen validation pipelines, coordinate academic university labs, and track municipal field deployments.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button variant="subtle" size="sm" onClick={loadDashboard} icon={RefreshCw}>
            Sync Metrics
          </Button>
          <Link to="/admin/validation-queue">
            <Button variant="primary" size="sm">
              Review Queue ({metrics?.pendingValidation || 0})
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-serif rounded-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="subtle" size="sm" onClick={loadDashboard}>
            Retry
          </Button>
        </div>
      )}

      {/* 7 Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3.5">
        <MetricCard
          title="Total Challenges"
          value={metrics?.totalChallenges || 0}
          subtitle="Recorded statements"
          icon={FolderKanban}
          accent="navy"
          onClick={() => navigate('/admin/challenges')}
        />

        <MetricCard
          title="Pending Validation"
          value={metrics?.pendingValidation || 0}
          subtitle="Awaiting clearance"
          icon={Clock}
          accent="maroon"
          badgeText="Queue"
          onClick={() => navigate('/admin/validation-queue')}
        />

        <MetricCard
          title="Validated Challenges"
          value={metrics?.validatedChallenges ?? metrics?.validated ?? 0}
          subtitle="Ready for cohort"
          icon={CheckCircle2}
          accent="blue"
          onClick={() => navigate('/admin/challenges?status=VALIDATED')}
        />

        <MetricCard
          title="Active Projects"
          value={metrics?.activeProjects ?? metrics?.inProgress ?? 0}
          subtitle="Research & pilots"
          icon={TrendingUp}
          accent="indigo"
          onClick={() => navigate('/admin/projects')}
        />

        <MetricCard
          title="Completed Projects"
          value={metrics?.completedProjects ?? metrics?.resolved ?? 0}
          subtitle="Field deployed"
          icon={Award}
          accent="emerald"
          onClick={() => navigate('/admin/projects?status=COMPLETED')}
        />

        <MetricCard
          title="Universities"
          value={metrics?.universities ?? metrics?.totalUniversities ?? 0}
          subtitle="Academic partners"
          icon={GraduationCap}
          accent="purple"
          onClick={() => navigate('/admin/universities')}
        />

        <MetricCard
          title="Industry Partners"
          value={metrics?.industryPartners ?? metrics?.totalIndustryPartners ?? 0}
          subtitle="Corporate & CSR"
          icon={Building2}
          accent="cyan"
          onClick={() => navigate('/admin/industry-partners')}
        />
      </div>

      {/* 4 Recharts Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Challenges by Category */}
        <ChartCard
          accent="navy"
          title="Challenges by Category"
          subtitle="Distribution across civic problem sectors in Delhi"
          badge="Category Breakdown"
        >
          {((charts?.challengesByCategory || charts?.byCategory) && (charts?.challengesByCategory || charts?.byCategory).length > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={charts.challengesByCategory || charts.byCategory}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Georgia' }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fontFamily: 'Georgia' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'Georgia',
                    fontSize: 12
                  }}
                />
                <Bar dataKey="count" name="Challenges" fill="#7a1113" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs font-serif text-gov-text-muted">No category data recorded</p>
          )}
        </ChartCard>

        {/* Chart 2: Priority Distribution */}
        <ChartCard
          accent="maroon"
          title="Priority Distribution"
          subtitle="Severity and urgency distribution across registered challenges"
          badge="Priority Levels"
        >
          {((charts?.challengePriorityDistribution || charts?.byPriority) && (charts?.challengePriorityDistribution || charts?.byPriority).length > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={charts.challengePriorityDistribution || charts.byPriority}
                margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="priority" tick={{ fontSize: 11, fontFamily: 'Georgia' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Georgia' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'Georgia',
                    fontSize: 12
                  }}
                />
                <Bar dataKey="count" name="Challenges" fill="#142a45" radius={[2, 2, 0, 0]}>
                  {(charts?.challengePriorityDistribution || charts?.byPriority || []).map((entry, index) => {
                    const colorMap = {
                      Low: '#059669',
                      Medium: '#d97706',
                      High: '#e11d48',
                      Critical: '#7a1113'
                    };
                    return <Cell key={`cell-${index}`} fill={colorMap[entry.priority] || '#142a45'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs font-serif text-gov-text-muted">No priority distribution data recorded</p>
          )}
        </ChartCard>

        {/* Chart 3: Project Status / Lifecycle */}
        <ChartCard
          accent="navy"
          title="Project Lifecycle Progression"
          subtitle="Active project stages across engineering cohorts"
          badge="Project Status"
        >
          {((charts?.projectStatus || charts?.byStatus) && (charts?.projectStatus || charts?.byStatus).length > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={charts?.projectStatus || charts?.byStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                  label={({ percent }) => `${((Number(percent) || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(charts?.projectStatus || charts?.byStatus || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'Georgia',
                    fontSize: 12
                  }}
                  formatter={(val, name, item) => {
                    const str = typeof name === 'string' ? name : (item?.payload?.status ? String(item.payload.status) : '');
                    return [`${val} Projects`, str.replace(/_/g, ' ')];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs font-serif text-gov-text-muted">No project status data recorded</p>
          )}
        </ChartCard>

        {/* Chart 4: Monthly Challenge Trends */}
        <ChartCard
          accent="maroon"
          title="Challenge Submission Trends"
          subtitle="Monthly trajectory of civic problem reports across Delhi"
          badge="Trends"
        >
          {((charts?.challengeTrends || charts?.monthlySubmissions) && (charts?.challengeTrends || charts?.monthlySubmissions).length > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={charts.challengeTrends || charts.monthlySubmissions}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a1113" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7a1113" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Georgia' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Georgia' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'Georgia',
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Submissions"
                  stroke="#7a1113"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs font-serif text-gov-text-muted">No monthly trend data recorded</p>
          )}
        </ChartCard>
      </div>

      {/* Recent Submissions Table with Action Controls */}
      <Card
        accent="navy"
        title="Recent Submissions & Administrative Action Workbench"
        subtitle="Review latest community issues, validate feasibility, reject duplicates, or assign research labs"
        headerAction={
          <Link to="/admin/challenges">
            <Button variant="subtle" size="sm">
              View All ({metrics?.totalChallenges || 0})
            </Button>
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-serif divide-y divide-gov-border">
            <thead>
              <tr className="bg-gov-sand-100 text-gov-navy font-bold uppercase tracking-wider text-[11px]">
                <th className="px-3 py-3 whitespace-nowrap">Challenge ID</th>
                <th className="px-3 py-3 min-w-[200px]">Title</th>
                <th className="px-3 py-3 whitespace-nowrap">Category</th>
                <th className="px-3 py-3 whitespace-nowrap">District</th>
                <th className="px-3 py-3 whitespace-nowrap">Submitted By</th>
                <th className="px-3 py-3 whitespace-nowrap">Date</th>
                <th className="px-3 py-3 whitespace-nowrap">Priority</th>
                <th className="px-3 py-3 whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-right whitespace-nowrap min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-border bg-white">
              {(recentChallenges || []).filter(Boolean).map((c, idx) => {
                const cId = c._id ? String(c._id) : (c.id ? String(c.id) : `c-${idx}`);
                const displayCode = c.code || `DEL-${cId.slice(-4).toUpperCase()}`;
                const isPending = ['SUBMITTED', 'UNDER_REVIEW'].includes((c.status || '').toUpperCase());

                return (
                  <tr key={cId} className="hover:bg-gov-sand-50 transition-colors">
                    <td className="px-3 py-3 font-mono font-bold text-gov-maroon whitespace-nowrap">
                      {displayCode}
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-bold text-gov-navy line-clamp-1 hover:text-gov-maroon">
                        {c.title}
                      </div>
                      {c.location?.landmark && (
                        <div className="text-[10px] text-gov-text-muted truncate">
                          Near {c.location.landmark}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-gov-text-secondary">
                      {c.category}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap font-medium text-gov-navy">
                      {c.district}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-gov-text-secondary">
                      <div>{c.submittedBy?.name || 'Citizen'}</div>
                      <div className="text-[10px] text-gov-text-muted truncate max-w-[120px]">
                        {c.submittedBy?.organization || 'Resident'}
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-gov-text-muted">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs ${
                          c.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : c.priority === 'high'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {c.priority || 'Medium'}
                      </span>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Actions: View, Validate, Reject, Assign */}
                    <td className="px-3 py-3 text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => setSelectedChallenge(c)}
                        title="View Full Submission"
                        icon={Eye}
                      >
                        View
                      </Button>

                      {isPending && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleValidate(c)}
                            title="Validate Challenge"
                            className="bg-emerald-700 hover:bg-emerald-800"
                            icon={Check}
                          >
                            Validate
                          </Button>

                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => handleReject(c)}
                            title="Reject Challenge"
                            className="text-rose-700 hover:bg-rose-50"
                            icon={XCircle}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssigningChallenge(c)}
                        title="Assign to University"
                        icon={Share2}
                      >
                        Assign
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Detail Modal */}
      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onValidate={handleValidate}
          onReject={handleReject}
          onAssign={(c) => setAssigningChallenge(c)}
        />
      )}

      {/* Assign University Modal */}
      {assigningChallenge && (
        <AssignUniversityModal
          challenge={assigningChallenge}
          onClose={() => setAssigningChallenge(null)}
          onSuccess={() => loadDashboard()}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
