import api from './api';

export const industryService = {
  // 1. Dashboard Metrics & Activity
  getDashboard: async () => {
    const response = await api.get('/industry/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/industry/stats');
    return response.data;
  },

  // 2. Profile Management
  getProfile: async () => {
    const response = await api.get('/industry/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/industry/profile', profileData);
    return response.data;
  },

  uploadLogo: async (formData) => {
    const response = await api.post('/industry/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // 3. Browse Validated Challenges
  getChallenges: async (params = {}) => {
    const response = await api.get('/industry/challenges', { params });
    return response.data;
  },

  getChallengeDetails: async (id) => {
    const response = await api.get(`/industry/challenges/${id}`);
    return response.data;
  },

  // 4. University Opportunities
  getOpportunities: async (params = {}) => {
    const response = await api.get('/industry/opportunities', { params });
    return response.data;
  },

  // 5. Collaboration Proposals
  submitProposal: async (proposalData) => {
    const response = await api.post('/industry/proposals', proposalData);
    return response.data;
  },

  createPartnership: async (partnershipData) => {
    const response = await api.post('/industry/partnerships', partnershipData);
    return response.data;
  },

  // 6. My Collaborations
  getCollaborations: async () => {
    const response = await api.get('/industry/collaborations');
    return response.data;
  },

  getPartnerships: async () => {
    const response = await api.get('/industry/partnerships');
    return response.data;
  },

  // 7. Supported Projects & Progress Tracking
  getProjects: async () => {
    const response = await api.get('/industry/projects');
    return response.data;
  },

  getProjectProgress: async (projectId) => {
    const response = await api.get(`/industry/projects/${projectId}/progress`);
    return response.data;
  },

  addProjectUpdate: async (projectId, updateData) => {
    const response = await api.post(`/industry/projects/${projectId}/updates`, updateData);
    return response.data;
  },

  uploadProjectDocument: async (projectId, formData) => {
    const response = await api.post(`/industry/projects/${projectId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

