import { motion } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ onClose, onConfirm, itemCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl border border-red-900/50 w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Delete All Media</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-gray-300 text-sm">
              You are about to permanently delete <span className="font-bold text-white">{itemCount}</span> media {itemCount === 1 ? 'item' : 'items'} from Cloudinary.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 text-sm">This will:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm ml-2">
              <li>Delete all images and videos from your Cloudinary account</li>
              <li>Remove all media from this gallery</li>
              <li>Free up storage space in your Cloudinary account</li>
            </ul>
          </div>

          <p className="text-gray-300 font-medium">
            Are you absolutely sure you want to continue?
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 flex items-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete All</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmModal;
