import { motion } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMediaStore } from '../store/mediaStore';
import { getOptimizedUrl, deleteMedia } from '../services/cloudinary';

const MediaGrid = ({ onMediaClick }) => {
  const [deletingId, setDeletingId] = useState(null);
  const getPaginatedMedia = useMediaStore((state) => state.getPaginatedMedia);
  const setMedia = useMediaStore((state) => state.setMedia);
  const media = useMediaStore((state) => state.media);
  const paginatedMedia = getPaginatedMedia();

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    
    if (!confirm(`Delete ${item.public_id.split('/').pop()}?`)) {
      return;
    }

    setDeletingId(item.public_id);
    try {
      await deleteMedia(item.public_id, item.resource_type);
      // Remove from local state
      const updatedMedia = media.filter(m => m.public_id !== item.public_id);
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete media');
    } finally {
      setDeletingId(null);
    }
  };

  if (paginatedMedia.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No media found. Upload some files to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {paginatedMedia.map((item, index) => (
        <motion.div
          key={item.public_id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => onMediaClick(item)}
          className="relative aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow"
        >
          {item.resource_type === 'video' ? (
            <>
              <img
                src={getOptimizedUrl(item.public_id, 'video', { format: 'jpg' })}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                VIDEO
              </div>
            </>
          ) : (
            <>
              <img
                src={getOptimizedUrl(item.public_id, 'image')}
                alt="Media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                IMAGE
              </div>
            </>
          )}
          
          {/* Delete Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => handleDelete(e, item)}
            disabled={deletingId === item.public_id}
            className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 disabled:opacity-50"
          >
            {deletingId === item.public_id ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </motion.button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm truncate">{item.public_id.split('/').pop()}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MediaGrid;
