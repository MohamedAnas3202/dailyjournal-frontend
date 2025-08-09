// Force production backend URL - overrides any environment variables
export const BACKEND_URL = 'https://dailyjournal-backend-4.onrender.com';

// Helper function to get full media URL
export const getMediaUrl = (url) => {
  if (!url) return '';
  
  // If the URL already starts with http, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it starts with /api/journals/media/, add the backend base URL
  if (url.startsWith('/api/journals/media/')) {
    return `${BACKEND_URL}${url}`;
  }
  
  // If it's just a filename, construct the full URL
  if (!url.startsWith('/')) {
    return `${BACKEND_URL}/api/journals/media/${url}`;
  }
  
  // For other cases, add the backend base URL
  return `${BACKEND_URL}${url}`;
};

// Helper function for profile pictures
export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return undefined;
  
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  
  return `${BACKEND_URL}${profilePicture}`;
};
