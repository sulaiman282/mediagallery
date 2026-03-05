import express from 'express';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

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

// Get media grouped by detected faces (MUST BE BEFORE /:resourceType route)
app.get('/api/media/faces', async (req, res) => {
  try {
    // Fetch all images - the faces parameter should be a boolean, not part of the path
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 500,
    });

    // Group images that have face detection data
    const faceGroups = {};
    let groupIndex = 0;
    
    result.resources.forEach(resource => {
      // Check if image has faces detected in the info object
      if (resource.info && resource.info.detection && resource.info.detection.adv_face) {
        const faces = resource.info.detection.adv_face.data;
        
        if (faces && Array.isArray(faces) && faces.length > 0) {
          faces.forEach((face) => {
            // Create a simple grouping key based on approximate face position
            const x = Math.round(face.x / 100) * 100;
            const y = Math.round(face.y / 100) * 100;
            const w = Math.round(face.w / 50) * 50;
            const h = Math.round(face.h / 50) * 50;
            const faceKey = `${x}_${y}_${w}_${h}`;
            
            if (!faceGroups[faceKey]) {
              faceGroups[faceKey] = {
                id: `group_${groupIndex++}`,
                count: 0,
                images: [],
                thumbnail: null,
                faceCoords: face,
              };
            }
            
            // Add image to group if not already there
            if (!faceGroups[faceKey].images.find(img => img.public_id === resource.public_id)) {
              faceGroups[faceKey].images.push(resource);
              faceGroups[faceKey].count++;
              
              if (!faceGroups[faceKey].thumbnail) {
                faceGroups[faceKey].thumbnail = resource;
              }
            }
          });
        }
      }
    });

    const groups = Object.values(faceGroups).filter(g => g.count > 0);

    res.json({
      success: true,
      groups: groups,
      total: groups.length,
      message: groups.length === 0 ? 'No faces detected. Upload images with faces and enable face detection in your upload preset.' : undefined,
    });
  } catch (error) {
    console.error('Error fetching face groups:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Face detection requires images to be uploaded with detection enabled. Check your Cloudinary upload preset settings.',
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

app.listen(PORT, () => {
  console.log(`🚀 Cloudinary proxy server running on http://localhost:${PORT}`);
});
