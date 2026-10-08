import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Button from '../common/Button';
import LoadingState from '../common/LoadingState';
import { Building, GraduationCap, X, CheckCircle2, AlertCircle, Sparkles, Briefcase, Users, UserCheck } from 'lucide-react';

const AssignUniversityModal = ({ challenge, onClose, onSuccess }) => {
  const [universities, setUniversities] = useState([]);
  const [industryPartners, setIndustryPartners] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [department, setDepartment] = useState('');
  const [studentTeam, setStudentTeam] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState('');
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [uniRes, indRes] = await Promise.all([
          adminService.getUniversities(),
          adminService.getIndustryPartners().catch(() => ({ data: { industryPartners: [] } }))
        ]);

        const uniList = uniRes.data?.universities || [];
        setUniversities(uniList);
        if (uniList.length > 0) {
          const existingUniId = challenge?.assignedUniversity?._id || challenge?.assignedUniversity;
          if (existingUniId) {
            setSelectedUniId(existingUniId);
          } else if (challenge?.aiRecommendedUniversities && challenge.aiRecommendedUniversities.length > 0) {
            setSelectedUniId(challenge.aiRecommendedUniversities[0].university?._id || uniList[0]._id);
          } else {
            setSelectedUniId(uniList[0]._id);
          }
        }

        const indList = indRes.data?.industryPartners || [];
        setIndustryPartners(indList);

        if (challenge?.assignedDepartment) setDepartment(challenge.assignedDepartment);
        if (challenge?.facultyLead?.name) setFacultyName(challenge.facultyLead.name);
        if (challenge?.assignedStudentTeam) setStudentTeam(challenge.assignedStudentTeam);
        if (challenge?.assignedIndustry?._id || challenge?.assignedIndustry) {
          setSelectedIndustryId(challenge.assignedIndustry?._id || challenge.assignedIndustry);
        }
      } catch (err) {
        setError('Failed to load registered institutions and partners');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challenge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUniId) {
      setError('Please select an accredited university partner');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await adminService.assignChallenge(challenge._id, {
        universityId: selectedUniId,
        facultyLeadName: facultyName.trim(),
        facultyLeadDepartment: department.trim(),
        department: department.trim(),
        studentTeamName: studentTeam.trim(),
        industryId: selectedIndustryId || null,
        comment: comment.trim()
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to allocate university and project stakeholders');
    } finally {
      setSubmitting(false);
    }
  };

  const aiRecs = challenge?.aiRecommendedUniversities || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
      <div className="bg-white border border-gov-border rounded-sm max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-gov-maroon" />
            <h3 className="font-bold text-gov-navy text-base">
              Smart Institutional Allocation & Project Routing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Challenge Snippet */}
        <div className="bg-gov-sand-50 p-3 rounded-xs border border-gov-border text-xs space-y-1">
          <div className="font-bold text-gov-navy truncate">
            [{challenge?.code || 'DEL-...'}] {challenge?.title}
          </div>
          <div className="text-[11px] text-gov-text-muted">
            District: <strong>{challenge?.district}</strong> &bull; Category: <strong>{challenge?.category}</strong>
          </div>
        </div>

        {/* AI Recommendations Hint */}
        {aiRecs.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Ranked University Recommendations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {aiRecs.slice(0, 2).map((rec, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedUniId(rec.university?._id || rec.university)}
                  className={`p-2 rounded-xs border cursor-pointer transition-all ${
                    selectedUniId === (rec.university?._id || rec.university)
                      ? 'border-gov-navy bg-white shadow-xs'
                      : 'border-amber-200 bg-amber-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gov-navy truncate">{rec.university?.name || 'Partner Lab'}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs">
                      {rec.matchScore}%
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-600 line-clamp-1 mt-0.5">
                    {rec.explainableSummary || rec.matchingReasons?.[0] || 'Strong domain match'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingState message="Loading registered universities and industry partners..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* University Selection */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Select University Partner *
              </label>
              <select
                required
                value={selectedUniId}
                onChange={(e) => setSelectedUniId(e.target.value)}
                className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
              >
                <option value="">-- Choose University --</option>
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.organization || 'Higher Education Lab'} ({u.district || 'Delhi'})
                  </option>
                ))}
              </select>
            </div>

            {/* Department & Faculty Mentor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Environmental Engineering"
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Designated Faculty Mentor
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g. Prof. S. K. Sharma"
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>
            </div>

            {/* Student Team & Industry Partner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Designated Student Team / Lead
                </label>
                <input
                  type="text"
                  value={studentTeam}
                  onChange={(e) => setStudentTeam(e.target.value)}
                  placeholder="e.g. EcoHydro Innovation Cohort"
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Industry Partner (Optional)
                </label>
                <select
                  value={selectedIndustryId}
                  onChange={(e) => setSelectedIndustryId(e.target.value)}
                  className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
                >
                  <option value="">-- No Industry Partner (or Self-Funded) --</option>
                  {industryPartners.map((ind) => (
                    <option key={ind._id} value={ind._id}>
                      {ind.name} ({ind.sector || ind.organization || 'Corporate'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Directives / Remarks */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Administrative Directives / Scope Remarks
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Specify research directives, deliverables expectations, funding sanctions, or field testing parameters..."
                className="w-full text-xs font-serif border border-gov-border rounded-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gov-navy"
              />
            </div>

            <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xs text-[11px] text-blue-900 leading-snug">
              Allocating an institution automatically creates an active <strong>Project Workspace</strong> linked to this challenge and notifies the designated university, mentors, and partners.
            </div>

            <div className="pt-2 border-t border-gov-border flex items-center justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Allocating Cohort...' : 'Confirm Allocation & Create Project'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignUniversityModal;
