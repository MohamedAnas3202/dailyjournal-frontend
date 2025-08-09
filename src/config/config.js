// FORCE production backend URL - completely ignore environment variables
// This will override any REACT_APP_API_BASE_URL set in Vercel
const FORCED_BACKEND_URL = 'https://dailyjournal-backend-4.onrender.com';

// Export the forced URL
export const BACKEND_URL = FORCED_BACKEND_URL;

// Debug: Log what URL we're using
console.log('🔧 FORCED BACKEND URL:', FORCED_BACKEND_URL);
console.log('🔧 Environment variable (ignored):', process.env.REACT_APP_API_BASE_URL);

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
