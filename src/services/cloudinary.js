const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

export const uploadToCloudinary = async (file, resourceType = 'auto') => {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file');
  }
  
  if (!UPLOAD_PRESET) {
    throw new Error('Upload preset is not configured. Please add VITE_CLOUDINARY_UPLOAD_PRESET to your .env file');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    const errorMsg = error.error?.message || 'Upload failed';
    
    if (errorMsg.includes('Upload preset not found')) {
      throw new Error(
        `Upload preset "${UPLOAD_PRESET}" not found. Please create an unsigned upload preset in your Cloudinary dashboard (Settings > Upload > Upload presets) or use an existing preset name.`
      );
    }
    
    throw new Error(errorMsg);
  }

  return response.json();
};

// Fetch media from backend proxy server
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '/api'  // Production: use relative path (same domain)
  : 'http://localhost:3001/api';  // Development: use localhost

export const fetchAllMedia = async (type = 'all') => {
  try {
    const response = await fetch(`${API_URL}/media?type=${type}&limit=500`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch media');
    }
    
    const data = await response.json();
    return data.resources || [];
  } catch (error) {
    console.error('Error fetching media:', error);
    return [];
  }
};

export const getOptimizedUrl = (publicId, resourceType, options = {}) => {
  const { width = 400, quality = 'auto', format = 'auto' } = options;
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/w_${width},q_${quality},f_${format}/${publicId}`;
};

export const getFullUrl = (publicId, resourceType) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${publicId}`;
};

export const deleteAllMedia = async () => {
  try {
    const response = await fetch(`${API_URL}/media/all`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete media');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting all media:', error);
    throw error;
  }
};

export const deleteMedia = async (publicId, resourceType) => {
  try {
    // Encode the public_id to handle special characters and slashes
    const encodedPublicId = encodeURIComponent(publicId);
    
    const response = await fetch(`${API_URL}/media/${resourceType}/${encodedPublicId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete media');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};
