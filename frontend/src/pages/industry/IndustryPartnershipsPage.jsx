import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { industryService } from '../../services/industryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Handshake,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Heart,
  Layers,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Filter,
  XCircle,
  FileText
} from 'lucide-react';

const SUPPORT_TYPE_INFO = {
  MENTORSHIP: { label: 'Mentorship', icon: Award, color: 'bg-purple-100 text-purple-800' },
  FUNDING: { label: 'Funding', icon: IndianRupee, color: 'bg-emerald-100 text-emerald-800' },
  TECHNOLOGY: { label: 'Technology', icon: Cpu, color: 'bg-blue-100 text-blue-800' },
  PROTOTYPING: { label: 'Prototyping', icon: Layers, color: 'bg-indigo-100 text-indigo-800' },
  DEPLOYMENT: { label: 'Deployment', icon: Send, color: 'bg-amber-100 text-amber-900 font-bold' },
  PILOT_SUPPORT: { label: 'Pilot Support', icon: Send, color: 'bg-amber-100 text-amber-900 font-bold' },
  EXPRESS_INTEREST: { label: 'Express Interest', icon: Heart, color: 'bg-stone-100 text-stone-800' }
};

const STATUS_TABS = [
  { id: 'ALL', label: 'All Collaborations' },
  { id: 'PROPOSED', label: 'Proposed' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'REJECTED', label: 'Rejected' }
];

const LIFECYCLE_STAGES = ['PROPOSED', 'UNDER_REVIEW', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

const normalizeStatus = (status) => {
  if (['PENDING', 'SUBMITTED'].includes(status)) return 'PROPOSED';
  if (['ACTIVE'].includes(status)) return 'ACCEPTED';
  return status;
};

const getStatusBadge = (status) => {
  const norm = normalizeStatus(status);
  switch (norm) {
    case 'PROPOSED':
      return { label: 'Proposed', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'UNDER_REVIEW':
      return { label: 'Under Review', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    case 'ACCEPTED':
      return { label: 'Accepted', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
    case 'COMPLETED':
      return { label: 'Completed', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    case 'REJECTED':
      return { label: 'Rejected', color: 'bg-rose-100 text-rose-900 border-rose-300' };
    default:
      return { label: norm, color: 'bg-stone-100 text-stone-800 border-stone-300' };
  }
};

const IndustryPartnershipsPage = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState('ALL');

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const res = await industryService.getCollaborations();
      setCollaborations(res.data?.collaborations || res.data?.partnerships || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const filtered = collaborations.filter((p) => {
    if (activeStatusTab === 'ALL') return true;
    const norm = normalizeStatus(p.status);
    return norm === activeStatusTab;
  });

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Handshake className="w-4 h-4 text-gov-maroon" />
            <span>My Corporate Collaborations</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Industry Collaborations ({collaborations.length})
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Track status across the collaboration lifecycle: Proposed &rarr; Under Review &rarr; Accepted &rarr; In Progress &rarr; Completed.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchCollaborations} icon={RefreshCw}>
            Refresh
          </Button>
          <Link to="/industry/opportunities">
            <Button variant="primary" size="sm" className="bg-gov-maroon text-white">
              Browse More Challenges
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gov-border pb-2 text-xs">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'ALL'
              ? collaborations.length
              : collaborations.filter((c) => normalizeStatus(c.status) === tab.id).length;

          const isActive = activeStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-gov-maroon text-white font-bold shadow-xs'
                  : 'bg-white text-gov-navy border border-gov-border hover:bg-gov-sand-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gov-sand-100 text-gov-text-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Collaborations List */}
      {loading ? (
        <LoadingState message="Loading industry collaborations and lifecycle statuses..." />
      ) : filtered.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
          <p className="font-bold text-gov-navy text-sm">No Collaborations Found in this Category</p>
          <p className="max-w-md mx-auto text-[11px]">
            {activeStatusTab === 'ALL'
              ? 'You have not submitted any collaboration proposals yet. Browse validated challenges to submit support.'
              : `No collaboration proposals currently marked as "${activeStatusTab.replace('_', ' ')}".`}
          </p>
          <Link to="/industry/opportunities">
            <Button variant="outline" size="sm" className="mt-2">
              Browse Open Challenges
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const typeInfo = SUPPORT_TYPE_INFO[p.supportType] || {
              label: p.supportType,
              icon: Handshake,
              color: 'bg-gray-100 text-gray-700'
            };
            const Icon = typeInfo.icon;
            const badge = getStatusBadge(p.status);
            const normStatus = normalizeStatus(p.status);

            const challengeTitle = p.challenge?.title || p.project?.title || 'Delhi Civic Innovation Challenge';
            const challengeCode = p.challenge?.code || 'DEL-CIVIC';
            const universityName = p.university?.name || p.project?.universityId?.name || 'Assigned University Team';
            const studentLead = p.project?.studentLeader?.name || 'Student Research Lead';
            const facultyMentor = p.project?.mentor?.name || p.assignedMentor?.name || null;
            const latestUpdate = (p.updates && p.updates.length > 0)
              ? p.updates[p.updates.length - 1]
              : (p.project?.updates && p.project?.updates.length > 0)
              ? p.project.updates[p.project.updates.length - 1]
              : null;

            return (
              <Card key={p._id} accent="navy" className="p-5 space-y-4">
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border text-xs">
                      {challengeCode}
                    </span>

                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs flex items-center space-x-1 ${typeInfo.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      <span>{typeInfo.label}</span>
                    </span>

                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${badge.color}`}>
                      Status: {badge.label}
                    </span>
                  </div>

                  <span className="text-gov-text-muted text-[11px]">
                    Submitted {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Challenge Name & University / Student Team */}
                <div className="space-y-1">
                  <h3 className="font-bold text-gov-navy text-base leading-snug">
                    {challengeTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gov-text-secondary">
                    <div className="flex items-center text-gov-maroon font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 mr-1" />
                      <span>University: {universityName}</span>
                    </div>

                    {studentLead && (
                      <div className="text-gov-navy">
                        Student Lead: <strong>{studentLead}</strong>
                      </div>
                    )}

                    {facultyMentor && (
                      <div className="text-gray-600">
                        Mentor: <strong>{facultyMentor}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proposed Contribution & Resources */}
                <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-gov-navy uppercase text-[10px] block mb-0.5">
                      Proposed Corporate Contribution
                    </span>
                    <p className="text-gov-text-secondary leading-relaxed">
                      {p.proposedContribution || p.description}
                    </p>
                  </div>

                  {p.resourcesOffered && p.resourcesOffered.length > 0 && (
                    <div className="pt-2 border-t border-gov-border">
                      <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                        Pledged Testbeds & Hardware
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {p.resourcesOffered.map((res, idx) => (
                          <span
                            key={idx}
                            className="bg-white text-gov-navy border border-gov-border px-2 py-0.5 rounded-xs text-[10px] font-semibold"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lifecycle Progress Pipeline (Visible Stepper) */}
                <div className="p-3 bg-white rounded-xs border border-gov-border">
                  <div className="text-[10px] uppercase font-bold text-gov-navy tracking-wider mb-2">
                    Collaboration Lifecycle Pipeline
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                    {LIFECYCLE_STAGES.map((st, idx) => {
                      const isReached =
                        (normStatus === 'PROPOSED' && idx === 0) ||
                        (normStatus === 'UNDER_REVIEW' && idx <= 1) ||
                        (normStatus === 'ACCEPTED' && idx <= 2) ||
                        (normStatus === 'IN_PROGRESS' && idx <= 3) ||
                        (normStatus === 'COMPLETED' && idx <= 4);

                      const isCurrent = normStatus === st;

                      return (
                        <div
                          key={st}
                          className={`p-1.5 rounded-xs border font-semibold truncate ${
                            isCurrent
                              ? 'bg-gov-maroon text-white border-gov-maroon font-bold'
                              : isReached
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-stone-50 text-stone-400 border-stone-200'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest Update Note */}
                {latestUpdate && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
                      <span>Latest Update: {latestUpdate.title || 'Progress Note'}</span>
                      <span className="text-[10px] text-blue-700 font-normal">
                        {new Date(latestUpdate.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-blue-900 text-[11px] leading-snug">
                      {latestUpdate.content}
                    </p>
                  </div>
                )}

                {/* Footer Bar: Timeline, Budget & Progress Link */}
                <div className="pt-2 border-t border-gov-border flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center space-x-4 text-gov-text-muted">
                    <div>
                      Timeline: <strong>{p.timeline || '6 Months'}</strong>
                    </div>
                    {p.fundingAmount > 0 && (
                      <div className="font-bold text-emerald-800 text-xs">
                        Grant: ₹{p.fundingAmount.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* If accepted or in progress, link to project workspace */}
                    {(p.project || ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(normStatus)) && (
                      <Link
                        to={p.project ? `/industry/projects/${p.project._id || p.project}` : `/industry/projects`}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          className="bg-gov-maroon hover:bg-gov-maroon-dark text-white font-bold"
                        >
                          View Project Progress & Milestones
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IndustryPartnershipsPage;
