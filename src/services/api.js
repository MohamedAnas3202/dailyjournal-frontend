import axios from 'axios';
import { BACKEND_URL } from '../config/config';

// Force the correct backend URL regardless of environment variables
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const getCurrentUser = () =>
  api.get('/users/me');

export const updateProfile = (data) =>
  api.put('/users/update', data);

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/users/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAllUsers = () =>
  api.get('/users/all');

export const promoteUser = (userId) =>
  api.post(`/admin/promote/${userId}`);

export const blockUser = (userId) =>
  api.delete(`/users/${userId}`);

export const toggleUserStatus = (userId) =>
  api.put(`/users/toggle-status/${userId}`);

export const deleteUser = (userId) =>
  api.delete(`/admin/users/${userId}`);

export const adminSearchJournals = (query) =>
  api.get('/admin/journals/search-users', { params: { query } });

export const adminGetAllJournals = () =>
  api.get('/admin/journals/all');

export const adminDeleteJournal = (journalId) =>
  api.delete(`/admin/journals/${journalId}`);

export const getJournals = (userId) =>
  api.get(`/journals/user/${userId}`);

export const getJournal = (id) =>
  api.get(`/journals/${id}`);

export const createJournal = (userId, data) =>
  api.post(`/journals/create/${userId}`, data);

export const updateJournal = (id, data) =>
  api.put(`/journals/${id}`, data);

export const deleteJournal = (id) =>
  api.delete(`/journals/${id}`);

export const searchJournals = (userId, params) =>
  api.get(`/journals/search`, { params: { userId, ...params } });

export const filterJournals = (userId, params) =>
  api.get(`/journals/filter`, { params: { ...params, userId } });

export const uploadJournalFiles = (journalId, files) => {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('files', file));
  return api.post(`/journals/${journalId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteJournalFile = (journalId, filename) =>
  api.delete(`/journals/${journalId}/media/${encodeURIComponent(filename)}`);

export const searchUsers = (query) =>
  api.get('/users/search', { params: { query } });

// ===== PUBLIC JOURNAL ENDPOINTS =====
// These endpoints return only public (non-private) journals for user search and viewing

export const getPublicJournals = (userId) =>
  api.get(`/journals/public/user/${userId}`);

export const searchPublicJournals = (userId, params) =>
  api.get(`/journals/public/search`, { params: { userId, ...params } });

export const getPublicJournalsByDateRange = (userId, start, end) =>
  api.get(`/journals/public/calendar?userId=${userId}&start=${start}&end=${end}`);

// ===== PUBLISHED JOURNAL ENDPOINTS =====
// These endpoints handle published journals that any user can view

export const getAllPublishedJournals = () =>
  api.get('/journals/published');

export const searchPublishedJournals = (params) =>
  api.get('/journals/published/search', { params });

export const publishJournal = (journalId) =>
  api.post(`/journals/${journalId}/publish`);

export const unpublishJournal = (journalId) =>
  api.post(`/journals/${journalId}/unpublish`);

// ===== ADMIN PUBLISHED JOURNAL ENDPOINTS =====
// These endpoints show all journals that were ever published (including hidden ones) for admin moderation

export const getAllEverPublishedJournalsForAdmin = () =>
  api.get('/journals/admin/published');

export const searchAllEverPublishedJournalsForAdmin = (params) =>
  api.get('/journals/admin/published/search', { params });

export const restoreJournal = (journalId) =>
  api.post(`/journals/admin/${journalId}/restore`);

export const hideJournalByAdmin = (journalId) =>
  api.post(`/journals/admin/${journalId}/hide`);

// Friend Request API functions
export const sendFriendRequest = (receiverId) =>
  api.post(`/friends/request/${receiverId}`);

export const acceptFriendRequest = (requestId) =>
  api.post(`/friends/accept/${requestId}`);

export const rejectFriendRequest = (requestId) =>
  api.post(`/friends/reject/${requestId}`);

export const getPendingFriendRequests = () =>
  api.get('/friends/requests/pending');

export const getSentFriendRequests = () =>
  api.get('/friends/requests/sent');

export const getPendingRequestCount = () =>
  api.get('/friends/requests/count');

export const getFriendRequestStatus = (userId) =>
  api.get(`/friends/status/${userId}`);

// Friend API functions (legacy and current)
export const addFriend = (friendId) =>
  api.post(`/friends/add/${friendId}`);

export const removeFriend = (friendId) =>
  api.delete(`/friends/remove/${friendId}`);

export const getMyFriends = () =>
  api.get('/friends/my-friends');

export const getUserFriends = (userId) =>
  api.get(`/friends/user/${userId}`);

export const isFriend = (userId) =>
  api.get(`/friends/is-friend/${userId}`);

export const getFriendCount = () =>
  api.get('/friends/count');

export default api;