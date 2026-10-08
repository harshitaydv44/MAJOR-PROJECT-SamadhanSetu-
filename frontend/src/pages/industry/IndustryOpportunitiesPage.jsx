import React, { useState, useEffect } from 'react';
import { industryService } from '../../services/industryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  DELHI_DISTRICTS,
  CHALLENGE_CATEGORIES
} from '../../utils/constants';
import {
  Compass,
  Filter,
  Handshake,
  Award,
  IndianRupee,
  Cpu,
  Send,
  Heart,
  X,
  Building,
  GraduationCap,
  MapPin,
  CheckCircle,
  RefreshCw,
  Search,
  Layers
} from 'lucide-react';

const SUPPORT_TYPE_OPTIONS = [
  { id: 'MENTORSHIP', label: 'Mentorship', icon: Award, desc: 'Corporate engineering mentorship, sprint reviews, and technical advisement' },
  { id: 'FUNDING', label: 'Funding', icon: IndianRupee, desc: 'CSR grants, student milestone stipends, or prototype co-sponsorship' },
  { id: 'TECHNOLOGY', label: 'Technology', icon: Cpu, desc: 'Proprietary hardware, telemetry sensor toolkits, or software API access' },
  { id: 'PROTOTYPING', label: 'Prototyping', icon: Layers, desc: 'Industrial PCB assembly, CNC fabrication, or cleanroom laboratory access' },
  { id: 'DEPLOYMENT', label: 'Deployment', icon: Send, desc: 'Live ward testbed access, distribution circle pilots, and municipal trial permits' },
  { id: 'EXPRESS_INTEREST', label: 'Express Interest', icon: Heart, desc: 'General exploration of joint R&D and preliminary lab meetings' }
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

const SUPPORT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Support Types' },
  { value: 'Mentorship', label: 'Mentorship' },
  { value: 'Funding', label: 'Funding' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Prototyping', label: 'Prototyping' },
  { value: 'Deployment', label: 'Deployment' }
];

const IndustryOpportunitiesPage = () => {
  const [activeTab, setActiveTab] = useState('CHALLENGES'); // 'CHALLENGES' | 'PROJECTS'
  const [challenges, setChallenges] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedSupport, setSelectedSupport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Challenge Details Modal
  const [detailChallenge, setDetailChallenge] = useState(null);

  // Collaboration Proposal Modal State
  const [partnerTarget, setPartnerTarget] = useState(null); // { challenge, project }
  const [supportType, setSupportType] = useState('FUNDING');
  const [proposedContribution, setProposedContribution] = useState('');
  const [resourcesOffered, setResourcesOffered] = useState('');
  const [timeline, setTimeline] = useState('6 Months');
  const [message, setMessage] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (selectedDomain !== 'all') params.category = selectedDomain;
      if (selectedDistrict !== 'all') params.district = selectedDistrict;
      if (selectedPriority !== 'all') params.priority = selectedPriority;
      if (selectedSupport !== 'all') params.requiredSupport = selectedSupport;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      if (activeTab === 'CHALLENGES') {
        const res = await industryService.getChallenges(params);
        setChallenges(res.data?.challenges || []);
      } else {
        params.domain = params.category;
        const res = await industryService.getOpportunities(params);
        setOpportunities(res.data?.opportunities || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load innovation catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDomain, selectedDistrict, selectedPriority, selectedSupport]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenProposalModal = (target, defaultType = 'FUNDING') => {
    setPartnerTarget(target);
    setSupportType(defaultType);
    const title = target.title || target.projectTitle || 'Civic Challenge';
    setProposedContribution(`Pledging ${defaultType.toLowerCase()} support for "${title}".`);
    setResourcesOffered('Technical advisement, testing benches, and field pilot testbed permits');
    setTimeline('6 Months');
    setMessage(`Our organization would like to collaborate on "${title}" by providing industry expertise, resources, and live testbed access.`);
    setFundingAmount(defaultType === 'FUNDING' ? '500000' : '');
    setDetailChallenge(null);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!partnerTarget) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        challengeId: partnerTarget._id || partnerTarget.challengeId,
        projectId: partnerTarget.assignedProject?._id || partnerTarget.projectId || (partnerTarget.projectTitle ? partnerTarget._id : undefined),
        supportType,
        proposedContribution: proposedContribution.trim(),
        description: proposedContribution.trim(),
        resourcesOffered: resourcesOffered.split(',').map((r) => r.trim()).filter(Boolean),
        timeline: timeline.trim(),
        message: message.trim(),
        fundingAmount: Number(fundingAmount) || 0
      };

      await industryService.submitProposal(payload);
      setActionSuccess(`Collaboration proposal [${supportType}] submitted successfully to the Delhi Innovation Council!`);
      setPartnerTarget(null);
      fetchData();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit collaboration proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-gov-maroon" />
            <span>Academic-Industry Collaboration Exchange</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            {activeTab === 'CHALLENGES' ? `Validated Societal Challenges (${challenges.length})` : `University Research Cohorts (${opportunities.length})`}
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Explore verified Delhi civic challenges and university research projects open for corporate mentorship, CSR funding, tech transfer, and live testbed pilots.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Switcher */}
          <div className="inline-flex rounded-xs border border-gov-border bg-white p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('CHALLENGES')}
              className={`px-3 py-1.5 rounded-xs font-semibold transition-colors ${
                activeTab === 'CHALLENGES'
                  ? 'bg-gov-maroon text-white font-bold'
                  : 'text-gov-navy hover:bg-gov-sand-50'
              }`}
            >
              Validated Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-3 py-1.5 rounded-xs font-semibold transition-colors ${
                activeTab === 'PROJECTS'
                  ? 'bg-gov-maroon text-white font-bold'
                  : 'text-gov-navy hover:bg-gov-sand-50'
              }`}
            >
              University Cohorts ({opportunities.length})
            </button>
          </div>

          <Button variant="subtle" size="sm" onClick={fetchData} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs">
          {errorMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <Card accent="none" className="p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-1 sm:col-span-2">
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Keyword Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Title, code, keyword..."
                  className="w-full font-serif border border-gov-border rounded-xs pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-gov-navy"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Domain / Category */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Civic Category
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                <option value="all">All Delhi Domains</option>
                {CHALLENGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Revenue District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                <option value="all">All Delhi Districts</option>
                {DELHI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Priority Urgency
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                {PRIORITY_OPTIONS.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Required Support */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                Required Support
              </label>
              <select
                value={selectedSupport}
                onChange={(e) => setSelectedSupport(e.target.value)}
                className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs outline-none"
              >
                {SUPPORT_FILTER_OPTIONS.map((sf) => (
                  <option key={sf.value} value={sf.value}>
                    {sf.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gov-border text-[11px] text-gov-text-muted">
            <span>
              Showing {activeTab === 'CHALLENGES' ? challenges.length : opportunities.length} statement(s) matching criteria
            </span>
            <div className="space-x-2">
              <Button
                variant="subtle"
                size="sm"
                type="button"
                onClick={() => {
                  setSelectedDomain('all');
                  setSelectedDistrict('all');
                  setSelectedPriority('all');
                  setSelectedSupport('all');
                  setSearchQuery('');
                  fetchData();
                }}
              >
                Reset Filters
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-gov-navy text-white">
                Apply Search
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Grid Content */}
      {loading ? (
        <LoadingState message="Loading societal challenges & innovation opportunities from Delhi Portal..." />
      ) : activeTab === 'CHALLENGES' ? (
        /* VALIDATED CHALLENGES VIEW */
        challenges.length === 0 ? (
          <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
            <p className="font-bold text-gov-navy text-sm">No Validated Challenges Found</p>
            <p className="text-[11px] max-w-md mx-auto">
              Adjust your search query, civic category, or district filter to discover validated civic challenges.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((c) => {
              const hasProposal = Boolean(c.myProposal);

              return (
                <Card key={c._id} accent="maroon" className="p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Header Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border text-xs">
                          {c.code}
                        </span>
                        <Badge variant="navy">{c.category}</Badge>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-xs ${
                          c.priority === 'critical' ? 'bg-rose-100 text-rose-800 font-bold' :
                          c.priority === 'high' ? 'bg-amber-100 text-amber-900 font-bold' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          Priority: {c.priority}
                        </span>
                      </div>
                      <span className="text-gov-text-muted text-[11px] flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gov-maroon" />
                        {c.district}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-gov-navy text-base leading-snug">
                        {c.title}
                      </h3>
                      {c.assignedUniversity ? (
                        <div className="text-[11px] text-gov-maroon font-semibold mt-0.5 flex items-center">
                          <GraduationCap className="w-3.5 h-3.5 mr-1" />
                          <span>Assigned University: {c.assignedUniversity.name}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-800 font-medium mt-0.5 flex items-center">
                          <Compass className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          <span>Open for University & Corporate Collaboration</span>
                        </div>
                      )}
                    </div>

                    {/* Problem Excerpt */}
                    <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border text-xs">
                      <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                        Problem Statement
                      </span>
                      <p className="text-gov-text-secondary leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    {/* Expected Outcome & Societal Impact */}
                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xs text-xs">
                      <span className="font-bold text-emerald-900 uppercase text-[10px] block">
                        Societal Impact & Outcome
                      </span>
                      <p className="text-emerald-800 text-[11px] leading-snug mt-0.5 line-clamp-2">
                        {c.expectedOutcome || c.impact}
                      </p>
                    </div>

                    {/* Proposal Status Tag if already submitted */}
                    {hasProposal && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-xs text-xs flex items-center justify-between">
                        <span className="text-blue-900 font-bold text-[11px]">
                          Your Proposal: [{c.myProposal.supportType}]
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-xs border ${
                          c.myProposal.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          c.myProposal.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {c.myProposal.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => setDetailChallenge(c)}
                    >
                      View Full Details
                    </Button>

                    <div className="flex items-center space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProposalModal(c, 'MENTORSHIP')}
                        icon={Award}
                        className="text-purple-800 border-purple-300 hover:bg-purple-50"
                      >
                        Mentor
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenProposalModal(c, 'FUNDING')}
                        icon={IndianRupee}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        Fund
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenProposalModal(c, 'DEPLOYMENT')}
                        icon={Send}
                        className="bg-gov-maroon hover:bg-gov-maroon-dark text-white"
                      >
                        Submit Proposal
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* UNIVERSITY PROJECTS VIEW */
        opportunities.length === 0 ? (
          <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
            <p className="font-bold text-gov-navy text-sm">No Active University Projects Found</p>
            <p className="text-[11px] max-w-md mx-auto">
              Try adjusting your search criteria or switch to the Validated Challenges tab.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <Card key={opp._id} accent="maroon" className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border text-xs">
                        {opp.challengeCode}
                      </span>
                      <Badge variant="navy">{opp.category}</Badge>
                      <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded-xs">
                        Stage: {opp.currentStage}
                      </span>
                    </div>
                    <span className="text-gov-text-muted text-[11px] flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-gov-maroon" />
                      {opp.district}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gov-navy text-base leading-snug">
                      {opp.projectTitle}
                    </h3>
                    <div className="text-[11px] text-gov-maroon font-semibold mt-0.5 flex items-center">
                      <GraduationCap className="w-3.5 h-3.5 mr-1" />
                      <span>{opp.university}</span>
                      <span className="text-gray-400 mx-1.5">&bull;</span>
                      <span className="text-gray-600 font-normal">{opp.mentor}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border text-xs">
                    <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                      Problem Statement
                    </span>
                    <p className="text-gov-text-secondary leading-relaxed line-clamp-3">
                      {opp.problem}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-gov-navy uppercase text-[10px] block mb-1">
                      Technologies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(opp.technologies || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-semibold px-1.5 py-0.2 rounded-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xs">
                      <span className="font-bold text-emerald-900 uppercase text-[10px] block">
                        Expected Societal Impact
                      </span>
                      <p className="text-emerald-800 text-[11px] leading-snug mt-0.5 line-clamp-2">
                        {opp.expectedImpact}
                      </p>
                    </div>

                    <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-xs">
                      <span className="font-bold text-amber-900 uppercase text-[10px] block">
                        Support Required
                      </span>
                      <p className="text-amber-800 text-[11px] leading-snug mt-0.5 line-clamp-2">
                        {opp.supportRequired}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-gov-text-muted">
                    Timeline: <strong>{opp.timeline}</strong>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenProposalModal(opp, 'MENTORSHIP')}
                      icon={Award}
                      className="text-purple-800 border-purple-300 hover:bg-purple-50"
                    >
                      Mentor
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenProposalModal(opp, 'FUNDING')}
                      icon={IndianRupee}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      Offer Funding
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenProposalModal(opp, 'DEPLOYMENT')}
                      icon={Send}
                      className="bg-gov-maroon hover:bg-gov-maroon-dark text-white"
                    >
                      Co-Sponsor
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Modal 1: Challenge Details Modal */}
      {detailChallenge && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-serif">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div>
                <span className="font-mono text-gov-maroon text-xs font-bold">
                  {detailChallenge.code}
                </span>
                <h3 className="font-bold text-gov-navy text-lg leading-snug">
                  {detailChallenge.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailChallenge(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="navy">{detailChallenge.category}</Badge>
              <Badge variant="outline">{detailChallenge.district}</Badge>
              <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-800 px-2 py-0.5 rounded-xs">
                Status: {detailChallenge.status}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${
                detailChallenge.priority === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Priority: {detailChallenge.priority}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-gov-navy uppercase text-[11px] mb-1">
                  Full Ground Problem Statement
                </h4>
                <p className="text-gov-text-secondary leading-relaxed p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
                  {detailChallenge.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gov-navy uppercase text-[11px] mb-1">
                  Expected Societal Outcome & Municipal Impact
                </h4>
                <p className="text-emerald-900 leading-relaxed p-3 bg-emerald-50 rounded-xs border border-emerald-200">
                  {detailChallenge.expectedOutcome || detailChallenge.impact}
                </p>
              </div>

              {detailChallenge.assignedUniversity && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xs">
                  <h4 className="font-bold text-indigo-950 uppercase text-[11px] mb-1">
                    Supervising University Cohort
                  </h4>
                  <div className="text-indigo-900 text-xs">
                    <strong>{detailChallenge.assignedUniversity.name}</strong> ({detailChallenge.assignedUniversity.district})
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gov-border flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setDetailChallenge(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenProposalModal(detailChallenge, 'FUNDING')}
                className="bg-gov-maroon text-white"
              >
                Submit Collaboration Proposal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Submit Collaboration Proposal Modal */}
      {partnerTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-serif">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div>
                <span className="font-mono text-gov-maroon text-xs font-bold">
                  {partnerTarget.code || partnerTarget.challengeCode || 'DEL-CIVIC'}
                </span>
                <h3 className="font-bold text-gov-navy text-lg leading-snug">
                  Corporate Collaboration Proposal
                </h3>
              </div>
              <button
                onClick={() => setPartnerTarget(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border text-xs">
              <div className="font-bold text-gov-navy text-sm leading-snug">
                {partnerTarget.title || partnerTarget.projectTitle}
              </div>
              <div className="text-gov-text-muted text-[11px] mt-0.5">
                Category: {partnerTarget.category} &bull; District: {partnerTarget.district}
              </div>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs">
              {/* Select Support Type */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-2">
                  Select Corporate Support Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUPPORT_TYPE_OPTIONS.map((opt) => {
                    const selected = supportType === opt.id;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSupportType(opt.id)}
                        className={`p-2.5 rounded-xs border cursor-pointer transition-colors ${
                          selected
                            ? 'bg-gov-maroon text-white border-gov-maroon shadow-xs'
                            : 'bg-white text-gov-navy border-gov-border hover:bg-gov-sand-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 font-bold text-xs">
                          <Icon className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </div>
                        <div className={`text-[10px] mt-1 leading-snug ${selected ? 'text-amber-100' : 'text-gov-text-muted'}`}>
                          {opt.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Funding Amount if FUNDING selected */}
              {supportType === 'FUNDING' && (
                <div>
                  <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                    CSR / Prototyping Grant Commitment (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-700 font-bold"
                  />
                </div>
              )}

              {/* Proposed Contribution */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Proposed Contribution & Value-Add *
                </label>
                <input
                  type="text"
                  required
                  value={proposedContribution}
                  onChange={(e) => setProposedContribution(e.target.value)}
                  placeholder="e.g. IoT telemetry sensors, quarterly sprint code review, Ghazipur field trial site"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              {/* Resources Offered */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Pledged Corporate Resources & Testbeds (Comma-separated)
                </label>
                <input
                  type="text"
                  value={resourcesOffered}
                  onChange={(e) => setResourcesOffered(e.target.value)}
                  placeholder="e.g. High-voltage test bench, LoRaWAN gateways, Pilot truck, Cleanroom access"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              {/* Timeline */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Collaboration Timeline
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g. 3 Months, 6 Months, Q4 2026"
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              {/* Proposal Message */}
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Detailed Proposal Message & Partnership Objectives
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why your company wants to partner on this civic challenge and the specific engineering or financial outcomes you target..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2.5 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs text-[11px] text-emerald-900">
                <strong>MongoDB Storage:</strong> Submitting this proposal saves the collaboration request to the database, sends a real-time notification to the supervising university and innovation council, and logs it under your portal.
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setPartnerTarget(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Submitting Proposal...' : 'Submit Collaboration Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryOpportunitiesPage;

