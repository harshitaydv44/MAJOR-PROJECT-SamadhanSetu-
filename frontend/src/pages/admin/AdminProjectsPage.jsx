import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import {
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  Building,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sliders,
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';

const STAGE_OPTIONS = [
  { value: 'ALL', label: 'All Project Stages' },
  { value: 'PROJECT_CREATED', label: 'Project Created' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RESEARCH', label: 'Research & Feasibility' },
  { value: 'PROTOTYPE', label: 'Prototype Engineering' },
  { value: 'TESTING', label: 'Testing & Lab Verification' },
  { value: 'PILOT', label: 'Pilot Field Deployment' },
  { value: 'VALIDATION', label: 'Municipal Validation' },
  { value: 'DEPLOYMENT', label: 'Full State Deployment' },
  { value: 'COMPLETED', label: 'Completed & Certified' }
];

const STAGE_COLORS = {
  PROJECT_CREATED: 'bg-stone-100 text-stone-800 border-stone-300',
  PROPOSAL_SUBMITTED: 'bg-amber-100 text-amber-800 border-amber-300',
  APPROVED: 'bg-blue-100 text-blue-800 border-blue-300',
  RESEARCH: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  PROTOTYPE: 'bg-purple-100 text-purple-800 border-purple-300',
  TESTING: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  PILOT: 'bg-teal-100 text-teal-800 border-teal-300',
  VALIDATION: 'bg-sky-100 text-sky-800 border-sky-300',
  DEPLOYMENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  COMPLETED: 'bg-green-100 text-green-900 border-green-300'
};

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stage Update Modal
  const [updatingProject, setUpdatingProject] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newProgress, setNewProgress] = useState(0);
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminService.getProjects(params);
      setProjects(res.data?.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.message || 'Failed to retrieve active state projects from registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const openUpdateModal = (project) => {
    setUpdatingProject(project);
    setNewStatus(project.status || 'PROJECT_CREATED');
    setNewProgress(project.overallProgress || 0);
    setStatusNote('');
    setModalError('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingProject) return;

    setSubmittingStatus(true);
    setModalError('');

    try {
      await adminService.updateProjectStatus(updatingProject._id, {
        status: newStatus,
        progress: Number(newProgress),
        notes: statusNote.trim()
      });

      setUpdatingProject(null);
      fetchProjects();
    } catch (err) {
      setModalError(err.message || 'Failed to update project status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const totalCount = projects.length;
  const activeCount = projects.filter(p => !['COMPLETED', 'CANCELLED'].includes(p.status)).length;
  const pilotCount = projects.filter(p => ['PILOT', 'TESTING', 'VALIDATION'].includes(p.status)).length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-serif text-gov-navy font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Inter-Agency Academic Project Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-tight">
            Societal Innovation Projects Registry
          </h1>
          <p className="text-xs font-serif text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
            Monitor academic research cohorts, milestones, field prototyping, and municipal test deployments across Delhi universities and industry partners.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button variant="subtle" size="sm" onClick={fetchProjects} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gov-text-muted">Total Monitored</div>
          <div className="text-2xl font-bold text-gov-navy mt-1">{totalCount}</div>
        </div>
        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gov-text-muted">Active Pipeline</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gov-text-muted">Testing / Pilot</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pilotCount}</div>
        </div>
        <div className="p-4 bg-white border border-gov-border rounded-xs shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gov-text-muted">Completed & Deployed</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card accent="none" className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gov-text-muted" />
            <input
              type="text"
              placeholder="Search by project name, challenge code, university, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gov-border rounded-xs text-xs font-serif bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gov-border rounded-xs text-xs font-serif bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button variant="primary" size="sm" type="submit">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Projects List */}
      {loading ? (
        <LoadingState message="Loading projects and engineering milestone data..." />
      ) : error ? (
        <ErrorState
          title="Project Registry Unavailable"
          message={error}
          onRetry={fetchProjects}
          retryLabel="Retry Connection"
        />
      ) : projects.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Projects Found"
            description="No active or matching societal innovation projects found matching your criteria. Projects are instantiated automatically when administrative allocations are confirmed."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const progress = project.overallProgress || 0;
            const completedMilestones = (project.milestones || []).filter(m => m.status === 'COMPLETED').length;
            const totalMilestones = (project.milestones || []).length;

            return (
              <Card key={project._id} accent="navy" className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border">
                        {project.challengeId?.code || `PRJ-${project._id.slice(-4).toUpperCase()}`}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-xs border ${STAGE_COLORS[project.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                        {(project.status || 'PROJECT_CREATED').replace(/_/g, ' ')}
                      </span>
                      {project.challengeId?.category && (
                        <Badge variant="navy">{project.challengeId.category}</Badge>
                      )}
                      {project.challengeId?.district && (
                        <span className="text-xs text-gov-text-muted">&bull; District: {project.challengeId.district}</span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-gov-navy leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-gov-text-secondary leading-relaxed line-clamp-2 mt-1">
                        {project.proposedSolution || project.description}
                      </p>
                    </div>

                    {/* Institutional Partners Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gov-border text-xs text-gov-text-muted">
                      <div className="flex items-center space-x-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-gov-maroon flex-shrink-0" />
                        <span className="truncate">
                          <strong>{project.universityId?.name || project.universityId?.organization || 'Partner University'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                        <span className="truncate">
                          Team: <strong>{project.team?.name || 'Assigned Cohort'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 truncate">
                        <Building className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span className="truncate">
                          Industry: <strong>{project.industryPartner?.name || 'Self-Directed'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Milestone count */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gov-navy">Overall Engineering Progress</span>
                        <span className="text-gov-maroon font-bold">
                          {progress}% {totalMilestones > 0 && `(${completedMilestones}/${totalMilestones} Milestones)`}
                        </span>
                      </div>
                      <div className="w-full bg-gov-sand-100 rounded-full h-2 overflow-hidden border border-gov-border">
                        <div
                          className="bg-gov-maroon h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gov-border">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openUpdateModal(project)}
                      icon={Sliders}
                      className="whitespace-nowrap"
                    >
                      Update Stage
                    </Button>

                    <Link to={`/admin/projects/${project._id}`} className="w-full">
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={ExternalLink}
                        fullWidth
                        className="whitespace-nowrap"
                      >
                        Workspace
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stage Transition Modal */}
      {updatingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-base">
                  Update Project Lifecycle Stage & Progress
                </h3>
              </div>
              <button
                onClick={() => setUpdatingProject(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gov-sand-50 p-3 rounded-xs border border-gov-border text-xs">
              <div className="font-bold text-gov-navy truncate">{updatingProject.title}</div>
              <div className="text-[11px] text-gov-text-muted mt-0.5">
                Current Stage: <strong>{updatingProject.status}</strong> &bull; Current Progress: <strong>{updatingProject.overallProgress || 0}%</strong>
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  New Lifecycle Stage *
                </label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                >
                  {STAGE_OPTIONS.filter(o => o.value !== 'ALL').map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Overall Completion Progress ({newProgress}%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-16 text-center text-xs font-serif border border-gov-border rounded-xs py-1"
                  />
                  <span>%</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Administrative Directive / Stage Note
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Record verification clearance, field evaluation notes, or compliance directives..."
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="pt-2 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setUpdatingProject(null)} disabled={submittingStatus}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submittingStatus}>
                  {submittingStatus ? 'Updating Stage...' : 'Apply Stage Transition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsPage;
