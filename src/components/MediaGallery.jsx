import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, LogOut, Image as ImageIcon, Video, Grid3x3, Loader2, Trash2, List, LayoutGrid, RefreshCw } from 'lucide-react';
import { useMediaStore } from '../store/mediaStore';
import { useAuthStore } from '../store/authStore';
import { fetchAllMedia, deleteAllMedia } from '../services/cloudinary';
import MediaGrid from './MediaGrid';
import MediaList from './MediaList';
import UploadModal from './UploadModal';
import MediaViewer from './MediaViewer';
import Pagination from './Pagination';
import DeleteConfirmModal from './DeleteConfirmModal';

const MediaGallery = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { logout } = useAuthStore();
  const { media, loading, filter, setMedia, setLoading, setFilter } = useMediaStore();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const fetchedMedia = await fetchAllMedia();
      setMedia(fetchedMedia);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fetchedMedia = await fetchAllMedia();
      setMedia(fetchedMedia);
    } catch (error) {
      console.error('Failed to refresh media:', error);
      alert('Failed to refresh media. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteAllMedia();
      setMedia([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hidden sm:block">
                Media Gallery
              </h1>
            </div>

            {/* Center: Filters */}
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('all')}
                title="All Media"
                className={`p-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Grid3x3 size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('image')}
                title="Images Only"
                className={`p-2 rounded-lg font-medium transition-all ${
                  filter === 'image'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <ImageIcon size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('video')}
                title="Videos Only"
                className={`p-2 rounded-lg font-medium transition-all ${
                  filter === 'video'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Video size={20} />
              </motion.button>

              {/* View Mode Toggle */}
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-2 rounded-lg font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <LayoutGrid size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-2 rounded-lg font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <List size={20} />
              </motion.button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm hidden sm:block mr-2">
                {media.length} items
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing || loading}
                title="Refresh"
                className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpload(true)}
                title="Upload"
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
              >
                <Upload size={20} />
              </motion.button>

              {media.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete All"
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
                >
                  <Trash2 size={20} />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                title="Logout"
                className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <MediaGrid onMediaClick={setSelectedMedia} />
            ) : (
              <MediaList onMediaClick={setSelectedMedia} />
            )}
            <Pagination />
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUploadComplete={loadMedia}
          />
        )}
        {selectedMedia && (
          <MediaViewer
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteAll}
            itemCount={media.length}
          />
        )}
      </AnimatePresence>

      {/* Deleting Overlay */}
      {deleting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            <p className="text-white text-lg font-medium">Deleting all media...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
