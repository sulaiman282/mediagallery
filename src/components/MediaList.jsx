import { motion } from 'framer-motion';
import { Play, Trash2, Image as ImageIcon, Video as VideoIcon, Calendar, HardDrive } from 'lucide-react';
import { useState } from 'react';
import { useMediaStore } from '../store/mediaStore';
import { deleteMedia } from '../services/cloudinary';

const MediaList = ({ onMediaClick }) => {
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
      const updatedMedia = media.filter(m => m.public_id !== item.public_id);
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete media');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (paginatedMedia.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No media found. Upload some files to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-400 text-sm font-medium">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* List Items */}
      {paginatedMedia.map((item, index) => (
        <motion.div
          key={item.public_id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onMediaClick(item)}
          className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800/30 hover:bg-gray-800/60 rounded-lg cursor-pointer group transition-all items-center"
        >
          {/* Name with Icon */}
          <div className="col-span-5 flex items-center space-x-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              item.resource_type === 'video' 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {item.resource_type === 'video' ? (
                <VideoIcon size={20} />
              ) : (
                <ImageIcon size={20} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate">
                {item.public_id.split('/').pop()}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {item.public_id}
              </p>
            </div>
          </div>

          {/* Type */}
          <div className="col-span-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              item.resource_type === 'video'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {item.resource_type === 'video' ? 'Video' : 'Image'}
            </span>
          </div>

          {/* Size */}
          <div className="col-span-2 text-gray-400 text-sm flex items-center space-x-1">
            <HardDrive size={14} />
            <span>{formatSize(item.bytes)}</span>
          </div>

          {/* Date */}
          <div className="col-span-2 text-gray-400 text-sm flex items-center space-x-1">
            <Calendar size={14} />
            <span className="truncate">{formatDate(item.created_at)}</span>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleDelete(e, item)}
              disabled={deletingId === item.public_id}
              className="p-2 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30 disabled:opacity-50"
            >
              {deletingId === item.public_id ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MediaList;
