import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

// Helper to handle CORS
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url.replace('/api', '');

  try {
    // Fetch all media
    if (path.startsWith('/media') && method === 'GET' && !path.includes('/media/')) {
      const { type = 'all' } = req.query;
      
      let expression = 'resource_type:image OR resource_type:video';
      
      if (type === 'image') {
        expression = 'resource_type:image';
      } else if (type === 'video') {
        expression = 'resource_type:video';
      }

      const result = await cloudinary.search
        .expression(expression)
        .sort_by('created_at', 'desc')
        .max_results(500)
        .execute();

      return res.status(200).json({
        success: true,
        resources: result.resources,
        total_count: result.total_count,
      });
    }

    // Delete all media
    if (path === '/media/all' && method === 'DELETE') {
      const imageResult = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        max_results: 500,
      });

      const videoResult = await cloudinary.api.resources({
        resource_type: 'video',
        type: 'upload',
        max_results: 500,
      });

      const allPublicIds = [
        ...imageResult.resources.map(r => r.public_id),
        ...videoResult.resources.map(r => r.public_id),
      ];

      if (allPublicIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No media to delete',
          deleted: 0,
        });
      }

      if (imageResult.resources.length > 0) {
        await cloudinary.api.delete_resources(
          imageResult.resources.map(r => r.public_id),
          { resource_type: 'image' }
        );
      }

      if (videoResult.resources.length > 0) {
        await cloudinary.api.delete_resources(
          videoResult.resources.map(r => r.public_id),
          { resource_type: 'video' }
        );
      }

      return res.status(200).json({
        success: true,
        message: `Successfully deleted ${allPublicIds.length} items`,
        deleted: allPublicIds.length,
      });
    }

    // Delete single media
    if (path.match(/\/media\/\w+\/.+/) && method === 'DELETE') {
      const parts = path.split('/');
      const resourceType = parts[2];
      const publicId = decodeURIComponent(parts[3]);

      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });

      return res.status(200).json({
        success: true,
        message: 'Media deleted successfully',
      });
    }

    // Get media by resource type
    if (path.match(/\/media\/\w+$/) && method === 'GET') {
      const resourceType = path.split('/')[2];
      
      const result = await cloudinary.api.resources({
        resource_type: resourceType,
        type: 'upload',
        max_results: 500,
      });

      return res.status(200).json({
        success: true,
        resources: result.resources,
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Not found',
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

