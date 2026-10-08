const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadLogo,
  getDashboardStats,
  getChallenges,
  getChallengeDetails,
  getOpportunities,
  submitProposal,
  getCollaborations,
  getIndustryProjects,
  getProjectProgress,
  addProjectUpdate,
  uploadProjectDocument
} = require('../controllers/industryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('INDUSTRY'));

// 1. Dashboard Metrics & Recent Items
router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);

// 2. Corporate Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/logo', upload.single('logo'), uploadLogo);

// 3. Browse Validated Societal Challenges
router.get('/challenges', getChallenges);
router.get('/challenges/:id', getChallengeDetails);

// 4. University Innovation Opportunities
router.get('/opportunities', getOpportunities);

// 5. Collaboration Proposals
router.post('/proposals', submitProposal);
router.post('/partnerships', submitProposal);

// 6. My Collaborations
router.get('/collaborations', getCollaborations);
router.get('/partnerships', getCollaborations);

// 7. Supported Projects & Progress Tracking
router.get('/projects', getIndustryProjects);
router.get('/projects/:id/progress', getProjectProgress);
router.post('/projects/:id/updates', addProjectUpdate);
router.post('/projects/:id/documents', upload.single('file'), uploadProjectDocument);

module.exports = router;
