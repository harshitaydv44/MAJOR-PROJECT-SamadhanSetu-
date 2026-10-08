import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Shield,
  ShieldAlert,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'CLIENT', label: 'Citizens / Clients' },
  { value: 'UNIVERSITY', label: 'Universities' },
  { value: 'FACULTY', label: 'Faculty Mentors' },
  { value: 'STUDENT', label: 'Students' },
  { value: 'INDUSTRY', label: 'Industry Partners' },
  { value: 'ADMIN', label: 'Government Admins' }
];

const ROLE_BADGES = {
  ADMIN: { label: 'Admin', variant: 'maroon' },
  CLIENT: { label: 'Citizen', variant: 'sand' },
  UNIVERSITY: { label: 'University', variant: 'navy' },
  FACULTY: { label: 'Faculty', variant: 'navy' },
  STUDENT: { label: 'Student', variant: 'sand' },
  INDUSTRY: { label: 'Industry', variant: 'gold' }
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setActionError('');
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminService.getUsers(params);
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load platform users:', err);
      setError(err.message || 'Failed to retrieve registered users from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    if (user._id === currentUser?._id || user._id === currentUser?.id) {
      setActionError('Self-deactivation is strictly restricted to prevent state lockouts.');
      return;
    }

    const nextState = !user.isActive;
    const confirmMessage = nextState
      ? `Are you sure you want to activate the account for "${user.name}" (${user.email})?`
      : `Are you sure you want to deactivate the account for "${user.name}" (${user.email})? This user will be blocked from logging in.`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoadingId(user._id);
    setActionError('');

    try {
      await adminService.toggleUserStatus(user._id, nextState);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextState } : u));
    } catch (err) {
      setActionError(err.message || 'Failed to update user active status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.isActive !== false).length;
  const citizenCount = users.filter(u => u.role === 'CLIENT').length;
  const uniCount = users.filter(u => ['UNIVERSITY', 'FACULTY', 'STUDENT'].includes(u.role)).length;
  const industryCount = users.filter(u => u.role === 'INDUSTRY').length;

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-serif text-gov-navy font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-gov-maroon" />
            <span>State Platform Access & Role Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-tight">
            User Accounts & Stakeholder Directory
          </h1>
          <p className="text-xs font-serif text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
            Manage authenticated accounts across citizens, university faculties, student innovators, corporate partners, and state administrators.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button variant="subtle" size="sm" onClick={fetchUsers} icon={RefreshCw}>
            Refresh Users
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-500 hover:text-red-700 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gov-text-muted">Total Accounts</div>
          <div className="text-xl font-bold text-gov-navy mt-0.5">{totalUsers}</div>
        </div>
        <div className="p-3.5 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gov-text-muted">Active Access</div>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">{activeCount}</div>
        </div>
        <div className="p-3.5 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gov-text-muted">Citizens</div>
          <div className="text-xl font-bold text-blue-700 mt-0.5">{citizenCount}</div>
        </div>
        <div className="p-3.5 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gov-text-muted">Academic Labs</div>
          <div className="text-xl font-bold text-purple-700 mt-0.5">{uniCount}</div>
        </div>
        <div className="p-3.5 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gov-text-muted">Industry Partners</div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{industryCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card accent="none" className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gov-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, organization, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gov-border rounded-xs text-xs font-serif bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gov-border rounded-xs text-xs font-serif bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button variant="primary" size="sm" type="submit">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Users Table */}
      {loading ? (
        <LoadingState message="Loading stakeholder directory from MongoDB..." />
      ) : error ? (
        <ErrorState
          title="Stakeholder Directory Unavailable"
          message={error}
          onRetry={fetchUsers}
          retryLabel="Retry Registry Connection"
        />
      ) : users.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Users Found"
            description="No stakeholder accounts found matching your selected role and search query."
          />
        </Card>
      ) : (
        <Card accent="navy" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gov-border">
              <thead>
                <tr className="bg-gov-sand-100 text-gov-navy font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3 whitespace-nowrap">User Details</th>
                  <th className="px-4 py-3 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 whitespace-nowrap">Institution / Organization</th>
                  <th className="px-4 py-3 whitespace-nowrap">District</th>
                  <th className="px-4 py-3 whitespace-nowrap">Account Status</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gov-border bg-white">
                {users.map((u) => {
                  const isActive = u.isActive !== false;
                  const isCurrent = u._id === currentUser?._id || u._id === currentUser?.id;
                  const badgeInfo = ROLE_BADGES[u.role] || { label: u.role, variant: 'sand' };

                  return (
                    <tr key={u._id} className="hover:bg-gov-sand-50 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-gov-navy flex items-center space-x-1.5">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-xs">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gov-text-muted mt-0.5">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-gov-text-secondary">{u.phone}</div>}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={badgeInfo.variant}>
                          {badgeInfo.label}
                        </Badge>
                      </td>

                      {/* Organization */}
                      <td className="px-4 py-3 text-gov-text-secondary">
                        {u.organization || u.department || '--'}
                      </td>

                      {/* District */}
                      <td className="px-4 py-3 whitespace-nowrap text-gov-text-secondary">
                        {u.district || 'National Capital Territory'}
                      </td>

                      {/* Account Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-xs bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 mr-1" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Toggle Status Action */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {isCurrent ? (
                          <span className="text-[10px] text-gray-400 italic">Self (Protected)</span>
                        ) : (
                          <Button
                            variant="subtle"
                            size="sm"
                            disabled={actionLoadingId === u._id}
                            onClick={() => handleToggleStatus(u)}
                            className={isActive ? 'text-rose-700 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}
                            icon={isActive ? UserX : UserCheck}
                          >
                            {actionLoadingId === u._id ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
