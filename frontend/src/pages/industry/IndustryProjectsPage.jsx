import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { industryService } from '../../services/industryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import {
  Briefcase,
  Layers,
  GraduationCap,
  Users2,
  Calendar,
  CheckCircle2,
  Clock,
  Upload,
  MessageSquare,
  FileText,
  ExternalLink,
  RefreshCw,
  Plus,
  Send,
  ArrowRight,
  ArrowLeft,
  Building,
  Check,
  Compass
} from 'lucide-react';

const MILESTONE_STATUS_STYLES = {
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  NOT_STARTED: { label: 'Not Started', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  DELAYED: { label: 'Delayed', color: 'bg-rose-100 text-rose-900 border-rose-300' }
};

const IndustryProjectsPage = () => {
  const { id: paramProjectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(paramProjectId || null);
  const [projectProgress, setProjectProgress] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New update form state
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Upload document form state
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch list of collaborated projects
  const fetchProjects = async () => {
    setLoadingList(true);
    try {
      const res = await industryService.getProjects();
      const projs = res.data?.projects || [];
      setProjects(projs);

      // If no project selected yet but projects exist, default or check param
      if (!selectedProjectId && projs.length > 0) {
        if (paramProjectId) {
          setSelectedProjectId(paramProjectId);
        } else {
          setSelectedProjectId(projs[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load participated projects');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch detail for selected project
  const fetchProjectDetail = async (projId) => {
    if (!projId) return;
    setLoadingDetail(true);
    setErrorMsg('');
    try {
      const res = await industryService.getProjectProgress(projId);
      setProjectProgress(res.data || null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load project progress tracking workspace');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetail(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Post update
  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !updateContent.trim()) return;

    setSubmittingUpdate(true);
    setUpdateSuccess('');
    setErrorMsg('');
    try {
      await industryService.addProjectUpdate(selectedProjectId, {
        title: updateTitle.trim() || 'Corporate Partner Progress Review',
        content: updateContent.trim()
      });
      setUpdateSuccess('Progress note posted to project timeline and dispatched to university team!');
      setUpdateTitle('');
      setUpdateContent('');
      fetchProjectDetail(selectedProjectId);
      setTimeout(() => setUpdateSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post update');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  // Upload document
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !docFile) return;

    setUploadingDoc(true);
    setUploadSuccess('');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      formData.append('title', docTitle.trim() || docFile.name);
      formData.append('description', docDescription.trim());

      await industryService.uploadProjectDocument(selectedProjectId, formData);
      setUploadSuccess(`Document "${docTitle || docFile.name}" uploaded successfully to Cloudinary!`);
      setDocTitle('');
      setDocDescription('');
      setDocFile(null);
      // Reset file input element
      const fileInput = document.getElementById('industry-doc-file-input');
      if (fileInput) fileInput.value = '';
      fetchProjectDetail(selectedProjectId);
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const currentProject = projectProgress?.project;
  const progressStats = projectProgress?.progress || {};
  const milestones = projectProgress?.milestones || [];
  const updates = projectProgress?.updates || [];
  const documents = projectProgress?.documents || [];
  const team = projectProgress?.team || {};

  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-gov-maroon uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Briefcase className="w-4 h-4 text-gov-maroon" />
            <span>Corporate Testbed & Prototype Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Project Progress Tracking
          </h1>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Monitor prototype milestones, verify engineering deliverables, post supervisory updates, and upload corporate testbed permits.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={() => fetchProjectDetail(selectedProjectId)} icon={RefreshCw}>
            Refresh Tracking
          </Button>
          <Link to="/industry/opportunities">
            <Button variant="primary" size="sm" className="bg-gov-maroon text-white">
              Discover More Projects
            </Button>
          </Link>
        </div>
      </div>

      {updateSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{updateSuccess}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs">
          {errorMsg}
        </div>
      )}

      {loadingList ? (
        <LoadingState message="Loading partnered innovation projects..." />
      ) : projects.length === 0 ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
          <p className="font-bold text-gov-navy text-sm">No Active Partnered Projects Found</p>
          <p className="max-w-md mx-auto text-[11px]">
            Once your collaboration proposals are accepted by the supervising university or innovation council, project milestones and testing workspaces appear here.
          </p>
          <Link to="/industry/opportunities">
            <Button variant="outline" size="sm" className="mt-2">
              Browse Open Opportunities
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Projects Selector Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gov-navy px-1">
              Supported Innovation Projects ({projects.length})
            </h2>

            <div className="space-y-2">
              {projects.map((proj) => {
                const isSelected = selectedProjectId === proj._id;
                const completedM = (proj.milestones || []).filter((m) => m.status === 'COMPLETED' || m.completed).length;
                const totalM = (proj.milestones || []).length;
                const pct = totalM > 0 ? Math.round((completedM / totalM) * 100) : (proj.overallProgress || 0);

                return (
                  <div
                    key={proj._id}
                    onClick={() => setSelectedProjectId(proj._id)}
                    className={`p-3.5 rounded-xs border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gov-sand-50 border-gov-maroon shadow-xs ring-1 ring-gov-maroon'
                        : 'bg-white border-gov-border hover:bg-gov-sand-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-gov-maroon font-bold text-[10px]">
                        {proj.challengeId?.code || 'DEL-CIVIC'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gov-navy bg-stone-100 px-1.5 py-0.2 rounded-xs">
                        {proj.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-gov-navy text-xs leading-snug line-clamp-2">
                      {proj.title}
                    </h4>

                    <div className="text-[11px] text-gov-text-muted mt-1 truncate">
                      {proj.universityId?.name || 'Partner University'}
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[10px] text-gov-text-muted">
                        <span>Milestones: {completedM}/{totalM}</span>
                        <span className="font-bold text-gov-navy">{pct}%</span>
                      </div>
                      <div className="w-full bg-gov-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gov-maroon h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Project Progress Tracking Workspace (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {loadingDetail ? (
              <LoadingState message="Loading project milestones and progress tracking details..." />
            ) : !currentProject ? (
              <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted">
                Select a project from the left panel to inspect milestones and upload testbed specs.
              </Card>
            ) : (
              <div className="space-y-6">
                {/* 1. Project Header Card & Overall Progress */}
                <Card accent="maroon" className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border text-xs">
                        {currentProject.challengeId?.code || 'DEL-CIVIC'}
                      </span>
                      <Badge variant="navy">{currentProject.challengeId?.category || 'Civic Infrastructure'}</Badge>
                      <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-800 px-2 py-0.5 rounded-xs">
                        Stage: {currentProject.status}
                      </span>
                    </div>

                    <span className="text-gov-text-muted text-xs">
                      District: <strong>{currentProject.challengeId?.district || 'Delhi'}</strong>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gov-navy leading-snug">
                      {currentProject.title}
                    </h2>
                    <p className="text-xs text-gov-text-secondary mt-1 leading-relaxed">
                      {currentProject.description}
                    </p>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="p-3.5 bg-gov-sand-50 rounded-xs border border-gov-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gov-navy">
                      <span>Overall Milestone Completion</span>
                      <span className="text-gov-maroon text-sm">{progressStats.percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gov-border rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gov-maroon h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressStats.percentage || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gov-text-muted pt-1">
                      <span>Completed Milestones: {progressStats.completedMilestones || 0} of {progressStats.totalMilestones || 0}</span>
                      <span>Timeline: <strong>{currentProject.timeline || 'Phase 1'}</strong></span>
                    </div>
                  </div>
                </Card>

                {/* 2. University & Student Team Details Card */}
                <Card accent="navy" title="Supervising University & Student Innovation Team">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* University */}
                    <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border space-y-1">
                      <span className="font-bold text-gov-navy text-[10px] uppercase block tracking-wider">
                        Nodal University
                      </span>
                      <div className="font-bold text-gov-navy text-xs">
                        {team.university?.name || 'Accredited Delhi University'}
                      </div>
                      <div className="text-[11px] text-gov-text-muted">
                        {team.university?.district || 'Delhi'} &bull; {team.university?.email}
                      </div>
                    </div>

                    {/* Faculty Mentor */}
                    <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border space-y-1">
                      <span className="font-bold text-gov-navy text-[10px] uppercase block tracking-wider">
                        Faculty Mentor
                      </span>
                      <div className="font-bold text-gov-navy text-xs">
                        {team.mentor?.name || 'Academic Lead'}
                      </div>
                      <div className="text-[11px] text-gov-text-muted">
                        {team.mentor?.department || 'Engineering Faculty'} &bull; {team.mentor?.email}
                      </div>
                    </div>

                    {/* Student Leader & Team */}
                    <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border space-y-1">
                      <span className="font-bold text-gov-navy text-[10px] uppercase block tracking-wider">
                        Student Team Lead
                      </span>
                      <div className="font-bold text-gov-navy text-xs">
                        {team.studentLeader?.name || 'Student Researcher'}
                      </div>
                      <div className="text-[11px] text-gov-text-muted">
                        Cohort: {(team.students || []).length} assigned students
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 3. Project Milestones Checklist */}
                <Card accent="none" title={`Engineering Milestones (${milestones.length})`}>
                  {milestones.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gov-text-muted">
                      No milestones registered yet by the university team.
                    </div>
                  ) : (
                    <div className="divide-y divide-gov-border">
                      {milestones.map((m, idx) => {
                        const statusConfig = MILESTONE_STATUS_STYLES[m.status] || {
                          label: m.status || 'Not Started',
                          color: 'bg-stone-100 text-stone-700 border-stone-300'
                        };
                        const isDone = m.status === 'COMPLETED' || m.completed;

                        return (
                          <div key={m._id || idx} className="py-3.5 space-y-2 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isDone ? 'bg-emerald-700 text-white' : 'bg-gov-sand-100 text-gov-navy border border-gov-border'
                                }`}>
                                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                                </span>
                                <h4 className="font-bold text-gov-navy text-sm">
                                  {m.title}
                                </h4>
                              </div>

                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            {m.description && (
                              <p className="text-gov-text-secondary text-xs pl-7">
                                {m.description}
                              </p>
                            )}

                            <div className="pl-7 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gov-text-muted pt-1">
                              <div>
                                Due Date: <strong>{m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-IN') : 'Scheduled in Sprint'}</strong>
                              </div>
                              {m.deliverables && m.deliverables.length > 0 && (
                                <div className="truncate max-w-sm">
                                  Deliverable: <em>{m.deliverables.join(', ')}</em>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* 4. Two-Column Row: Post Progress Update + Upload Supporting Document */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Post Progress Update / Comment */}
                  <Card accent="navy" title="Post Progress Update / Comment">
                    <form onSubmit={handlePostUpdate} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                          Update Title
                        </label>
                        <input
                          type="text"
                          value={updateTitle}
                          onChange={(e) => setUpdateTitle(e.target.value)}
                          placeholder="e.g. Telemetry sensor testbed review complete"
                          className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-gov-navy"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                          Note / Advisory Content *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={updateContent}
                          onChange={(e) => setUpdateContent(e.target.value)}
                          placeholder="Provide architectural feedback, benchmark testing results, or field trial instructions..."
                          className="w-full font-serif border border-gov-border rounded-xs p-2.5 outline-none focus:ring-1 focus:ring-gov-navy"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          disabled={submittingUpdate}
                          icon={Send}
                          className="bg-gov-maroon text-white"
                        >
                          {submittingUpdate ? 'Posting...' : 'Post Progress Note'}
                        </Button>
                      </div>
                    </form>
                  </Card>

                  {/* Upload Supporting Document to Cloudinary */}
                  <Card accent="gold" title="Upload Supporting Document (Cloudinary)">
                    <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                          Document Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          placeholder="e.g. Ghazipur Substation Testbed Authorization"
                          className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-gov-navy"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                          File Description / Specs
                        </label>
                        <input
                          type="text"
                          value={docDescription}
                          onChange={(e) => setDocDescription(e.target.value)}
                          placeholder="e.g. Field sensor wiring schematic & NDA agreement"
                          className="w-full font-serif border border-gov-border rounded-xs px-2.5 py-1.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                          Select Document / Specification File *
                        </label>
                        <input
                          id="industry-doc-file-input"
                          type="file"
                          required
                          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                          onChange={(e) => setDocFile(e.target.files[0] || null)}
                          className="w-full text-xs text-gov-navy file:mr-2 file:py-1 file:px-2.5 file:rounded-xs file:border file:border-gov-border file:text-xs file:bg-gov-sand-100 hover:file:bg-gov-sand-200 cursor-pointer"
                        />
                        <div className="text-[10px] text-gov-text-muted mt-0.5">
                          PDF, DOC, DOCX, or PNG/JPEG up to 10MB
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          disabled={uploadingDoc || !docFile}
                          icon={Upload}
                          className="bg-gov-navy text-white"
                        >
                          {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>

                {/* 5. Documents & Artifacts Repository */}
                <Card accent="none" title={`Supporting Documents & Specifications (${documents.length})`}>
                  {documents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gov-text-muted">
                      No supporting documents uploaded for this project yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gov-border text-xs">
                      {documents.map((doc, idx) => (
                        <div key={doc._id || idx} className="py-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <FileText className="w-4 h-4 text-gov-maroon flex-shrink-0" />
                            <div>
                              <div className="font-bold text-gov-navy text-xs">{doc.title}</div>
                              {doc.description && (
                                <p className="text-[11px] text-gov-text-secondary">{doc.description}</p>
                              )}
                              <div className="text-[10px] text-gov-text-muted mt-0.5">
                                Uploaded by <strong>{doc.uploaderName || 'Stakeholder'}</strong> ({doc.uploaderRole}) on{' '}
                                {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-gov-maroon border border-gov-maroon/30 rounded-xs hover:bg-gov-maroon hover:text-white transition-colors"
                          >
                            <span>Open File</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* 6. Chronological Project Updates & Comments History */}
                <Card accent="none" title={`Project Updates History (${updates.length})`}>
                  {updates.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gov-text-muted">
                      No updates recorded on this project yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gov-border text-xs">
                      {updates.slice().reverse().map((u, idx) => (
                        <div key={u._id || idx} className="py-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-1.5 font-bold text-gov-navy">
                              <span className="text-[10px] uppercase font-bold bg-gov-sand-100 text-gov-maroon px-1.5 py-0.2 rounded-xs border border-gov-border">
                                {u.userRole || 'STAKEHOLDER'}
                              </span>
                              <span>{u.userName}</span>
                              <span className="text-gray-400 font-normal">&bull;</span>
                              <span className="text-gray-700 font-medium">{u.title}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-gov-text-secondary leading-snug pl-1">
                            {u.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryProjectsPage;
