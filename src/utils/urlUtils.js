// Utility functions for URL handling
export const getBackendBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || 'https://dailyjournal-backend-4.onrender.com';
};

export const getFullFileUrl = (url) => {
  if (!url) return '';
  
  // If the URL already starts with http, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  const baseUrl = getBackendBaseUrl();
  
  // If it starts with /api/journals/media/, add the backend base URL
  if (url.startsWith('/api/journals/media/')) {
    return `${baseUrl}${url}`;
  }
  
  // If it's just a filename, construct the full URL
  if (!url.startsWith('/')) {
    return `${baseUrl}/api/journals/media/${url}`;
  }
  
  // For other cases, add the backend base URL
  return `${baseUrl}${url}`;
};

export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return undefined;
  
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}${profilePicture}`;
};
