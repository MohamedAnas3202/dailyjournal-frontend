// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }
  
  // For production, try to get from environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Fallback: try to determine from current location
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8080';
  }
  
  // Default production API URL - your deployed backend
  return 'https://dailyjournal-backend-4.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to construct full media URLs
export const getFullMediaUrl = (url) => {
  if (!url) return '';
  
  // If the URL already starts with http, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it starts with /api/journals/media/, add the backend base URL
  if (url.startsWith('/api/journals/media/')) {
    return `${API_BASE_URL}${url}`;
  }
  
  // If it starts with /uploads/, add the backend base URL
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  
  // If it starts with /profile-photos/, add the backend base URL
  if (url.startsWith('/profile-photos/')) {
    return `${API_BASE_URL}${url}`;
  }
  
  // If it's just a filename, construct the full URL
  if (!url.startsWith('/')) {
    return `${API_BASE_URL}/api/journals/media/${url}`;
  }
  
  // For other cases, add the backend base URL
  return `${API_BASE_URL}${url}`;
};
