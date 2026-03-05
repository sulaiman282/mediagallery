import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';

const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json());

// Fetch all media with pagination
app.get('/api/media', async (req, res) => {
  try {
    const { page = 1, limit = 500, type = 'all' } = req.query;
    
    let expression = 'resource_type:image OR resource_type:video';
    
    if (type === 'image') {
      expression = 'resource_type:image';
    } else if (type === 'video') {
      expression = 'resource_type:video';
    }

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(parseInt(limit))
      .execute();

    res.json({
      success: true,
      resources: result.resources,
      total_count: result.total_count,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get media by resource type
app.get('/api/media/:resourceType', async (req, res) => {
  try {
    const { resourceType } = req.params;
    const { max_results = 500 } = req.query;

    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      max_results: parseInt(max_results),
    });

    res.json({
      success: true,
      resources: result.resources,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete single media item
app.delete('/api/media/:resourceType/:publicId', async (req, res) => {
  try {
    const { resourceType, publicId } = req.params;
    
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    res.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete all media
app.delete('/api/media/all', async (req, res) => {
  try {
    // Fetch all resources
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
      return res.json({
        success: true,
        message: 'No media to delete',
        deleted: 0,
      });
    }

    // Delete images
    if (imageResult.resources.length > 0) {
      await cloudinary.api.delete_resources(
        imageResult.resources.map(r => r.public_id),
        { resource_type: 'image' }
      );
    }

    // Delete videos
    if (videoResult.resources.length > 0) {
      await cloudinary.api.delete_resources(
        videoResult.resources.map(r => r.public_id),
        { resource_type: 'video' }
      );
    }

    res.json({
      success: true,
      message: `Successfully deleted ${allPublicIds.length} items`,
      deleted: allPublicIds.length,
    });
  } catch (error) {
    console.error('Error deleting all media:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export for Vercel serverless
export default app;
