const Industry = require('../models/Industry');
const User = require('../models/User');
const Project = require('../models/Project');
const Challenge = require('../models/Challenge');
const Partnership = require('../models/Partnership');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { dispatchNotification } = require('../services/notificationDispatcher');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get or Provision Industry Profile
 * GET /api/industry/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let industry = await Industry.findOne({ user: userId });
    const user = await User.findById(userId);

    if (!industry) {
      industry = await Industry.create({
        user: userId,
        name: user?.name || user?.organization || 'Delhi Corporate Innovation Partner',
        organizationType: 'Industry',
        industrySector: 'Clean Energy, Smart Grids & Utilities',
        location: 'Netaji Subhash Place, Pitampura, Delhi',
        district: user?.district || 'North West Delhi',
        website: 'https://www.tatapower-ddl.com',
        contactPerson: user?.name || 'Innovation Director',
        contactEmail: user?.email || '',
        contactPhone: user?.phone || '+91 98765 43210',
        logo: user?.profileImage || '',
        expertise: [
          'Clean Energy & Microgrids',
          'IoT Sensor Telemetry',
          'Environmental Engineering',
          'Smart Metering Infrastructure'
        ],
        technologies: ['LoRaWAN', 'SCADA', 'Python Data Analytics', 'Solar Inverters'],
        resources: [
          'High-voltage testing bench',
          'Smart grid telemetry testing facility',
          'Rapid electronics prototype assembly'
        ],
        fundingCapability: {
          maxGrantAmount: 2500000,
          csrBudgetAllocated: 10000000,
          fundingTypes: ['CSR Grant', 'Prototyping Co-Sponsorship', 'Equipment Loan']
        },
        mentorshipCapability: {
          availableMentorsCount: 6,
          domains: ['Embedded Engineering', 'Utility Scaling', 'Product Certification'],
          guidelines: 'Quarterly field trials and sprint architectural guidance.'
        },
        implementationCapability: {
          fieldTrialSites: ['North Delhi Distribution Circles', 'Ghazipur Substation'],
          pilotSupportLocations: ['Bawana Industrial Area', 'Narela Substation'],
          manufacturingCapacity: 'Electronics rapid assembly and pilot telemetry testing.'
        }
      });
    }

    return successResponse(res, 'Industry profile retrieved successfully', { industry, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Industry Profile
 * PUT /api/industry/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      organizationType,
      industrySector,
      location,
      district,
      website,
      contactPerson,
      contactEmail,
      contactPhone,
      logo,
      expertise,
      technologies,
      resources,
      fundingCapability,
      mentorshipCapability,
      implementationCapability
    } = req.body;

    let industry = await Industry.findOne({ user: userId });
    if (!industry) {
      industry = new Industry({ user: userId, name: req.user.name || 'Industry Partner' });
    }

    if (name) industry.name = name.trim();
    if (organizationType) industry.organizationType = organizationType;
    if (industrySector) industry.industrySector = industrySector.trim();
    if (location !== undefined) industry.location = location.trim();
    if (district) industry.district = district;
    if (website !== undefined) industry.website = website.trim();
    if (contactPerson !== undefined) industry.contactPerson = contactPerson.trim();
    if (contactEmail !== undefined) industry.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) industry.contactPhone = contactPhone.trim();
    if (logo !== undefined) industry.logo = logo;
    if (Array.isArray(expertise)) industry.expertise = expertise;
    if (Array.isArray(technologies)) industry.technologies = technologies;
    if (Array.isArray(resources)) industry.resources = resources;
    if (fundingCapability) industry.fundingCapability = fundingCapability;
    if (mentorshipCapability) industry.mentorshipCapability = mentorshipCapability;
    if (implementationCapability) industry.implementationCapability = implementationCapability;

    await industry.save();

    // Sync User organization name, phone, district, and avatar
    const userUpdates = {};
    if (name) {
      userUpdates.organization = name.trim();
      userUpdates.name = contactPerson ? contactPerson.trim() : name.trim();
    }
    if (contactPhone) userUpdates.phone = contactPhone.trim();
    if (district) userUpdates.district = district;
    if (logo) userUpdates.profileImage = logo;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdates);
    }

    return successResponse(res, 'Industry profile updated successfully', { industry });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Organization Logo
 * POST /api/industry/profile/logo
 */
const uploadLogo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return errorResponse(res, 'Please provide an image file for logo upload', null, 400);
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      `industry_logo_${userId}_${Date.now()}.${req.file.originalname.split('.').pop()}`,
      'delhi_portal_industry_logos'
    );

    const logoUrl = uploadResult.url;

    let industry = await Industry.findOneAndUpdate(
      { user: userId },
      { logo: logoUrl },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(userId, { profileImage: logoUrl });

    return successResponse(res, 'Organization logo uploaded successfully', {
      logoUrl,
      industry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Innovation Opportunities (University Projects for Industry Participation)
 * GET /api/industry/opportunities
 */
const getOpportunities = async (req, res, next) => {
  try {
    const { domain, technology, district, stage, search } = req.query;

    const filter = {};
    // Projects active in development or created
    filter.status = { $in: ['PROJECT_CREATED', 'TEAM_FORMED', 'PROPOSAL_SUBMITTED', 'DEVELOPMENT', 'APPROVED'] };

    if (stage) filter.status = stage;

    let query = Project.find(filter)
      .populate('challengeId', 'code title category district priority impact description')
      .populate('universityId', 'name email organization district')
      .populate('mentor', 'name department specialization')
      .sort({ updatedAt: -1 });

    let projects = await query;

    // Apply domain (category), district, technology, search filters on populated challenge
    if (domain && domain !== 'all') {
      projects = projects.filter((p) => p.challengeId?.category === domain);
    }
    if (district && district !== 'all') {
      projects = projects.filter((p) => p.challengeId?.district === district || p.universityId?.district === district);
    }
    if (technology && technology !== 'all') {
      projects = projects.filter((p) =>
        (p.technologies || []).some((t) => t.toLowerCase().includes(technology.toLowerCase()))
      );
    }
    if (search) {
      const s = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.challengeId?.title?.toLowerCase().includes(s) ||
          p.universityId?.name?.toLowerCase().includes(s)
      );
    }

    // Format opportunities
    const opportunities = projects.map((p) => ({
      _id: p._id,
      projectTitle: p.title,
      university: p.universityId?.name || 'Delhi Technical University Partner',
      universityId: p.universityId?._id,
      challengeCode: p.challengeId?.code || 'DEL-CIVIC',
      challengeTitle: p.challengeId?.title || p.title,
      category: p.challengeId?.category || 'Urban Infrastructure',
      district: p.challengeId?.district || 'Delhi',
      problem: p.description,
      proposedSolution: p.proposedSolution,
      technologies: p.technologies || [],
      expectedImpact: p.outcomes?.join('. ') || p.challengeId?.impact || 'Direct municipal benefit',
      currentStage: p.status,
      supportRequired: p.teamRequirements || 'Mentorship, field prototyping, and pilot testing sponsorship',
      timeline: p.timeline,
      estimatedBudget: p.budget?.estimatedAmount || 0,
      mentor: p.mentor ? `${p.mentor.name} (${p.mentor.department})` : 'Designated Academic Faculty'
    }));

    return successResponse(res, 'Innovation opportunities retrieved successfully', {
      opportunities,
      total: opportunities.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Industry Dashboard Metrics & Recent Items
 * GET /api/industry/dashboard & GET /api/industry/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Available Challenges (validated challenges open for collaboration)
    const availableChallenges = await Challenge.countDocuments({
      status: {
        $in: [
          'VALIDATED',
          'ASSIGNED',
          'IN_PROGRESS',
          'SOLUTION_PROPOSED',
          'PILOT_TESTING'
        ]
      }
    });

    // 2. Active Collaborations (partnerships for this industry user that are accepted or active or in progress)
    const allPartnerships = await Partnership.find({ industry: userId })
      .populate('challenge', 'code title category district priority status')
      .populate('project', 'title status overallProgress timeline')
      .populate('university', 'name organization district')
      .sort({ updatedAt: -1 });

    const activePartnershipsList = allPartnerships.filter((p) =>
      ['ACCEPTED', 'IN_PROGRESS', 'ACTIVE'].includes(p.status)
    );
    const activeCollaborations = activePartnershipsList.length;

    // 3. Ongoing Projects
    const acceptedProjectIds = allPartnerships
      .filter((p) => ['ACCEPTED', 'IN_PROGRESS', 'ACTIVE'].includes(p.status) && p.project)
      .map((p) => p.project._id || p.project);

    const ongoingProjects = await Project.countDocuments({
      $or: [
        { industryPartners: userId },
        { _id: { $in: acceptedProjectIds } }
      ],
      status: {
        $in: [
          'PROJECT_CREATED',
          'TEAM_FORMED',
          'PROPOSAL_SUBMITTED',
          'DEVELOPMENT',
          'APPROVED',
          'PILOT_READY',
          'TESTING',
          'IN_PROGRESS'
        ]
      }
    });

    // 4. Completed Projects
    const completedProjects = await Project.countDocuments({
      $or: [
        { industryPartners: userId },
        { _id: { $in: allPartnerships.map((p) => p.project).filter(Boolean) } }
      ],
      status: 'COMPLETED'
    });

    // 5. Recent Notifications for this industry user (latest 5)
    const recentNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Other helpful aggregates
    const mentorshipRequests = allPartnerships.filter((p) => p.supportType === 'MENTORSHIP').length;
    const fundingCommitments = allPartnerships
      .filter((p) => p.supportType === 'FUNDING' || (p.fundingAmount && p.fundingAmount > 0))
      .reduce((sum, p) => sum + (p.fundingAmount || 0), 0);
    const pilotProjects = allPartnerships.filter((p) =>
      ['PILOT_SUPPORT', 'PILOT', 'DEPLOYMENT'].includes(p.supportType)
    ).length;

    // Available opportunities (university projects)
    const availableOpportunities = await Project.countDocuments({
      status: {
        $in: [
          'PROJECT_CREATED',
          'TEAM_FORMED',
          'PROPOSAL_SUBMITTED',
          'DEVELOPMENT',
          'APPROVED'
        ]
      }
    });

    const distinctProjectIds = new Set(
      allPartnerships.map((p) => p.project?._id?.toString() || p.project?.toString()).filter(Boolean)
    );

    return successResponse(res, 'Industry dashboard statistics retrieved successfully', {
      stats: {
        availableChallenges,
        activeCollaborations,
        ongoingProjects,
        completedProjects,
        availableOpportunities,
        activePartnerships: activeCollaborations,
        projectsSupported: distinctProjectIds.size,
        mentorshipRequests,
        fundingCommitments,
        pilotProjects
      },
      recentNotifications,
      activeCollaborationsList: activePartnershipsList.slice(0, 5),
      recentProposals: allPartnerships.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Browse Validated Societal Challenges
 * GET /api/industry/challenges
 */
const getChallenges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, district, priority, requiredSupport, search, page = 1, limit = 50 } = req.query;

    const filter = {
      status: {
        $in: [
          'VALIDATED',
          'ASSIGNED',
          'IN_PROGRESS',
          'SOLUTION_PROPOSED',
          'PILOT_TESTING'
        ]
      }
    };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (district && district !== 'all') {
      filter.district = district;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority.toLowerCase();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { code: regex },
        { subcategory: regex },
        { expectedOutcome: regex }
      ];
    }

    const challenges = await Challenge.find(filter)
      .populate('assignedUniversity', 'name email organization district phone')
      .populate('assignedProject', 'title status overallProgress timeline budget milestones')
      .populate('submittedBy', 'name district')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Get this industry user's proposals on these challenges to annotate proposal status
    const challengeIds = challenges.map((c) => c._id);
    const existingProposals = await Partnership.find({
      industry: userId,
      challenge: { $in: challengeIds }
    });

    const proposalMap = {};
    existingProposals.forEach((p) => {
      proposalMap[p.challenge.toString()] = p;
    });

    // Format challenges with required support inferences and user's proposal status
    let formattedChallenges = challenges.map((c) => {
      const existing = proposalMap[c._id.toString()];
      return {
        _id: c._id,
        code: c.code,
        title: c.title,
        description: c.description,
        category: c.category,
        subcategory: c.subcategory || '',
        district: c.district,
        priority: c.priority,
        status: c.status,
        expectedOutcome: c.expectedOutcome || '',
        impact: typeof c.impact === 'string' ? c.impact : c.impact?.estimatedCitizens || 'Civic infrastructure improvement',
        location: c.location,
        assignedUniversity: c.assignedUniversity
          ? {
              _id: c.assignedUniversity._id,
              name: c.assignedUniversity.name,
              organization: c.assignedUniversity.organization,
              district: c.assignedUniversity.district
            }
          : null,
        assignedProject: c.assignedProject
          ? {
              _id: c.assignedProject._id,
              title: c.assignedProject.title,
              status: c.assignedProject.status,
              overallProgress: c.assignedProject.overallProgress || 0
            }
          : null,
        createdAt: c.createdAt,
        myProposal: existing
          ? {
              _id: existing._id,
              status: existing.status,
              supportType: existing.supportType,
              proposedContribution: existing.proposedContribution || existing.description,
              timeline: existing.timeline,
              createdAt: existing.createdAt
            }
          : null
      };
    });

    // Filter by required support if specified
    if (requiredSupport && requiredSupport !== 'all') {
      const sup = requiredSupport.toLowerCase();
      formattedChallenges = formattedChallenges.filter((c) =>
        c.description.toLowerCase().includes(sup) ||
        c.title.toLowerCase().includes(sup) ||
        c.category.toLowerCase().includes(sup) ||
        c.expectedOutcome.toLowerCase().includes(sup)
      );
    }

    const total = await Challenge.countDocuments(filter);

    return successResponse(res, 'Validated challenges retrieved successfully', {
      challenges: formattedChallenges,
      total: formattedChallenges.length,
      totalCountInDb: total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Challenge Details
 * GET /api/industry/challenges/:id
 */
const getChallengeDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const challenge = await Challenge.findById(id)
      .populate('assignedUniversity', 'name email organization district phone')
      .populate('assignedProject', 'title status overallProgress timeline budget milestones mentor team')
      .populate('submittedBy', 'name district');

    if (!challenge) {
      return errorResponse(res, 'Challenge not found', null, 404);
    }

    const existingProposal = await Partnership.findOne({
      challenge: id,
      industry: userId
    }).populate('project', 'title status');

    return successResponse(res, 'Challenge details retrieved successfully', {
      challenge,
      myProposal: existingProposal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Collaboration Proposal
 * POST /api/industry/proposals & POST /api/industry/partnerships
 */
const submitProposal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      challengeId,
      projectId,
      supportType,
      proposedContribution,
      resourcesOffered,
      resourcesEstimated,
      timeline,
      message,
      description,
      fundingAmount
    } = req.body;

    if (!supportType) {
      return errorResponse(res, 'Support type is required', null, 400);
    }

    if (!challengeId && !projectId) {
      return errorResponse(res, 'Either a Challenge ID or Project ID is required', null, 400);
    }

    let challenge = null;
    let project = null;
    let universityId = null;

    if (challengeId) {
      challenge = await Challenge.findById(challengeId).populate('assignedUniversity');
      if (!challenge) {
        return errorResponse(res, 'Challenge not found', null, 404);
      }
      if (challenge.assignedProject) {
        project = await Project.findById(challenge.assignedProject);
      }
      if (challenge.assignedUniversity) {
        universityId = challenge.assignedUniversity._id || challenge.assignedUniversity;
      }
    }

    if (projectId && !project) {
      project = await Project.findById(projectId).populate('universityId');
      if (!project) {
        return errorResponse(res, 'Project not found', null, 404);
      }
      if (!challenge && project.challengeId) {
        challenge = await Challenge.findById(project.challengeId);
      }
      if (!universityId && project.universityId) {
        universityId = project.universityId._id || project.universityId;
      }
    }

    const industryProfile = await Industry.findOne({ user: userId });
    const industryName = industryProfile?.name || req.user.organization || req.user.name || 'Industry Partner';

    const contentNote =
      proposedContribution || description || message || `${supportType} corporate collaboration proposed`;

    const resourcesArray = Array.isArray(resourcesOffered)
      ? resourcesOffered
      : typeof resourcesOffered === 'string'
      ? resourcesOffered.split(',').map((r) => r.trim()).filter(Boolean)
      : [];

    const partnership = await Partnership.create({
      challenge: challenge?._id,
      project: project?._id,
      industry: userId,
      industryProfile: industryProfile?._id,
      university: universityId,
      supportType,
      proposedContribution: contentNote,
      description: contentNote,
      message: message || contentNote,
      resourcesOffered: resourcesArray,
      resourcesEstimated: resourcesEstimated || '',
      timeline: timeline || '6 Months',
      fundingAmount: Number(fundingAmount) || 0,
      expectedInvolvement:
        req.body.expectedInvolvement ||
        'Co-development, technical supervision, testbed provision, and milestone verification.',
      status: 'PROPOSED',
      updates: [
        {
          user: userId,
          userName: industryName,
          userRole: 'INDUSTRY',
          title: 'Collaboration Proposal Submitted',
          content: `${industryName} submitted a ${supportType} collaboration proposal for "${
            challenge?.title || project?.title
          }".`,
          createdAt: new Date()
        }
      ]
    });

    // If project exists, add industry to project's industryPartners
    if (project) {
      await Project.findByIdAndUpdate(project._id, {
        $addToSet: { industryPartners: userId }
      });
    }

    // Determine notification event type
    let notifType = 'PARTNERSHIP_REQUEST';
    if (supportType === 'MENTORSHIP') notifType = 'MENTORSHIP_OFFER';
    else if (supportType === 'FUNDING') notifType = 'FUNDING_OFFER';
    else if (['PILOT', 'PILOT_SUPPORT', 'DEPLOYMENT'].includes(supportType)) notifType = 'PILOT_OFFER';

    // 1. Notify University Nodal Officer (if assigned)
    if (universityId) {
      await dispatchNotification({
        recipient: universityId,
        sender: userId,
        senderName: industryName,
        title: 'New Industry Collaboration Proposal',
        message: `${industryName} submitted a [${supportType}] proposal for "${
          challenge?.title || project?.title
        }".`,
        type: notifType,
        relatedEntity: 'Partnership',
        relatedEntityId: partnership._id,
        project: project?._id
      });
    }

    // 2. Notify State Innovation Council Admin
    const adminUser = await User.findOne({ role: 'ADMIN' });
    if (adminUser) {
      await dispatchNotification({
        recipient: adminUser._id,
        sender: userId,
        senderName: industryName,
        title: 'Industry Collaboration Proposal Registered',
        message: `${industryName} offered [${supportType}] support for challenge "${
          challenge?.title || project?.title
        }".`,
        type: notifType,
        relatedEntity: 'Partnership',
        relatedEntityId: partnership._id,
        project: project?._id
      });
    }

    const populated = await Partnership.findById(partnership._id)
      .populate('challenge', 'code title category district priority status')
      .populate('project', 'title status overallProgress timeline')
      .populate('university', 'name email organization district');

    return successResponse(
      res,
      'Collaboration proposal submitted successfully to the Delhi Innovation Council!',
      { partnership: populated },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Industry Collaborations (My Collaborations)
 * GET /api/industry/collaborations & GET /api/industry/partnerships
 */
const getCollaborations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const partnerships = await Partnership.find({ industry: userId })
      .populate('challenge', 'code title category district priority status description impact assignedUniversity')
      .populate({
        path: 'project',
        select: 'title status overallProgress timeline budget milestones team mentor universityId updates documents',
        populate: [
          {
            path: 'team',
            select: 'name members',
            populate: {
              path: 'members.student',
              select: 'name email department'
            }
          },
          { path: 'mentor', select: 'name department email' }
        ]
      })
      .populate('university', 'name email organization district phone')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Industry collaborations retrieved successfully', {
      collaborations: partnerships,
      partnerships
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Projects Partnered with Industry
 * GET /api/industry/projects
 */
const getIndustryProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all partnerships for this industry user
    const partnerships = await Partnership.find({
      industry: userId,
      status: { $in: ['ACCEPTED', 'IN_PROGRESS', 'ACTIVE', 'COMPLETED', 'UNDER_REVIEW', 'PROPOSED'] }
    });

    const projectIds = partnerships.map((p) => p.project).filter(Boolean);

    const projects = await Project.find({
      $or: [{ industryPartners: userId }, { _id: { $in: projectIds } }]
    })
      .populate('challengeId', 'code title category district priority status description impact')
      .populate('universityId', 'name email organization district')
      .populate('mentor', 'name department email specialization')
      .populate({
        path: 'team',
        select: 'name members',
        populate: {
          path: 'members.student',
          select: 'name email department'
        }
      })
      .sort({ updatedAt: -1 });

    return successResponse(res, 'Industry partner projects retrieved successfully', {
      projects,
      total: projects.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Project Progress Details
 * GET /api/industry/projects/:id/progress
 */
const getProjectProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('challengeId', 'code title category district priority status description impact')
      .populate('universityId', 'name email organization district phone')
      .populate('mentor', 'name department email specialization phone')
      .populate({
        path: 'team',
        select: 'name members',
        populate: {
          path: 'members.student',
          select: 'name email department phone'
        }
      })
      .populate('industryPartners', 'name organization email');

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Verify partnership or participation
    const partnership = await Partnership.findOne({
      project: id,
      industry: userId
    });

    const isPartner =
      (project.industryPartners || []).some((p) => (p._id || p).toString() === userId.toString()) ||
      partnership !== null;

    if (!isPartner && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Unauthorized access to project progress workspace', null, 403);
    }

    // Calculate progress %
    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = (project.milestones || []).filter(
      (m) => m.status === 'COMPLETED' || m.completed === true
    ).length;

    const calculatedProgress =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : project.overallProgress || 0;

    return successResponse(res, 'Project progress details retrieved successfully', {
      project,
      partnership,
      progress: {
        percentage: calculatedProgress,
        totalMilestones,
        completedMilestones,
        currentStage: project.status
      },
      milestones: project.milestones || [],
      updates: project.updates || [],
      documents: project.documents || [],
      team: {
        university: project.universityId,
        mentor: project.mentor,
        teamName: project.team?.name || 'Assigned Innovation Team',
        members: project.team?.members || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Post Progress Update / Comment on Project
 * POST /api/industry/projects/:id/updates
 */
const addProjectUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, message, comment, text } = req.body;

    const updateText = content || message || comment || text;
    if (!updateText || !updateText.trim()) {
      return errorResponse(res, 'Update content is required', null, 400);
    }

    const project = await Project.findById(id).populate('universityId');
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const industryProfile = await Industry.findOne({ user: userId });
    const senderName = industryProfile?.name || req.user.organization || req.user.name || 'Industry Partner';

    const updateObj = {
      user: userId,
      userName: senderName,
      userRole: 'INDUSTRY',
      title: title?.trim() || 'Industry Collaboration Note',
      content: updateText.trim(),
      type: 'UPDATE',
      createdAt: new Date()
    };

    project.updates.push(updateObj);
    await project.save();

    // Also update any matching partnership record
    await Partnership.updateMany(
      { project: id, industry: userId },
      {
        $push: {
          updates: {
            user: userId,
            userName: senderName,
            userRole: 'INDUSTRY',
            title: title?.trim() || 'Industry Progress Note',
            content: updateText.trim(),
            createdAt: new Date()
          }
        }
      }
    );

    // Notify University and Students
    if (project.universityId) {
      await dispatchNotification({
        recipient: project.universityId._id || project.universityId,
        sender: userId,
        senderName,
        title: 'New Industry Partner Update',
        message: `${senderName} posted a progress note on project "${project.title}".`,
        type: 'PROJECT_UPDATE',
        relatedEntity: 'Project',
        relatedEntityId: project._id,
        project: project._id
      });
    }

    if (project.mentor) {
      await dispatchNotification({
        recipient: project.mentor,
        sender: userId,
        senderName,
        title: 'Industry Partner Feedback',
        message: `${senderName} left a comment on "${project.title}".`,
        type: 'PROJECT_UPDATE',
        relatedEntity: 'Project',
        relatedEntityId: project._id,
        project: project._id
      });
    }

    return successResponse(res, 'Project update posted successfully', {
      update: updateObj,
      updates: project.updates
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Supporting Document to Project
 * POST /api/industry/projects/:id/documents
 */
const uploadProjectDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description } = req.body;

    if (!req.file) {
      return errorResponse(res, 'Please provide a file to upload', null, 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const industryProfile = await Industry.findOne({ user: userId });
    const uploaderName = industryProfile?.name || req.user.organization || req.user.name || 'Industry Partner';

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      `doc_${id}_${Date.now()}_${req.file.originalname}`,
      'delhi_portal_project_documents'
    );

    const docObj = {
      title: title?.trim() || req.file.originalname,
      description: description?.trim() || 'Corporate testbed and technical specification document',
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileType: req.file.mimetype,
      projectId: project._id,
      uploadedBy: userId,
      uploaderName,
      uploaderRole: 'INDUSTRY',
      uploadedAt: new Date()
    };

    project.documents.push(docObj);

    // Also record in project updates
    project.updates.push({
      user: userId,
      userName: uploaderName,
      userRole: 'INDUSTRY',
      title: `Document Uploaded: ${docObj.title}`,
      content: `${uploaderName} uploaded supporting file: ${docObj.title}`,
      type: 'DOCUMENT_UPLOAD',
      createdAt: new Date()
    });

    await project.save();

    // Also update partnership document record
    await Partnership.updateMany(
      { project: id, industry: userId },
      {
        $push: {
          documents: {
            title: docObj.title,
            description: docObj.description,
            url: docObj.url,
            publicId: docObj.publicId,
            fileType: docObj.fileType,
            uploadedBy: userId,
            uploaderName,
            uploadedAt: new Date()
          }
        }
      }
    );

    // Notify University
    if (project.universityId) {
      await dispatchNotification({
        recipient: project.universityId,
        sender: userId,
        senderName: uploaderName,
        title: 'New Supporting Document Uploaded',
        message: `${uploaderName} uploaded "${docObj.title}" for project "${project.title}".`,
        type: 'DOCUMENT_UPLOAD',
        relatedEntity: 'Project',
        relatedEntityId: project._id,
        project: project._id
      });
    }

    return successResponse(res, 'Supporting document uploaded successfully', {
      document: docObj,
      documents: project.documents
    }, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  getDashboardStats,
  getChallenges,
  getChallengeDetails,
  getOpportunities,
  submitProposal,
  createPartnership: submitProposal,
  getCollaborations,
  getPartnerships: getCollaborations,
  getIndustryProjects,
  getProjectProgress,
  addProjectUpdate,
  uploadProjectDocument
};
