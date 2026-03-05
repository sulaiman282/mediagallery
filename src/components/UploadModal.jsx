import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, File, Loader2, CheckCircle, AlertCircle, FileArchive, Lock } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import JSZip from 'jszip';

const UploadModal = ({ onClose, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]);
  const [zipPassword, setZipPassword] = useState('');
  const [showZipPassword, setShowZipPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    const processedFiles = [];
    for (const file of selectedFiles) {
      if (file.name.endsWith('.zip')) {
        setShowZipPassword(true);
        processedFiles.push({ file, isZip: true });
      } else {
        processedFiles.push({ file, isZip: false });
      }
    }
    
    setFiles(processedFiles);
  };

  const extractZipFiles = async (zipFile, password) => {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile, {
        password: password || undefined
      });
      
      const extractedFiles = [];
      for (const [filename, fileData] of Object.entries(contents.files)) {
        if (!fileData.dir && (filename.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)$/i))) {
          const blob = await fileData.async('blob');
          const file = new File([blob], filename, { type: blob.type });
          extractedFiles.push(file);
        }
      }
      return extractedFiles;
    } catch (error) {
      throw new Error('Failed to extract ZIP. Check password if protected.');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const statuses = [];

    for (const { file, isZip } of files) {
      try {
        let filesToUpload = [];
        
        if (isZip) {
          statuses.push({ name: file.name, status: 'extracting', progress: 0 });
          setUploadStatus([...statuses]);
          
          const extracted = await extractZipFiles(file, zipPassword);
          filesToUpload = extracted;
          
          statuses[statuses.length - 1] = { name: file.name, status: 'extracted', progress: 100 };
        } else {
          filesToUpload = [file];
        }

        for (const fileToUpload of filesToUpload) {
          const statusIndex = statuses.length;
          statuses.push({ name: fileToUpload.name, status: 'uploading', progress: 0 });
          setUploadStatus([...statuses]);

          const resourceType = fileToUpload.type.startsWith('video/') ? 'video' : 'image';
          await uploadToCloudinary(fileToUpload, resourceType);

          statuses[statusIndex] = { name: fileToUpload.name, status: 'success', progress: 100 };
          setUploadStatus([...statuses]);
        }
      } catch (error) {
        statuses.push({ name: file.name, status: 'error', progress: 0, error: error.message });
        setUploadStatus([...statuses]);
      }
    }

    setUploading(false);
    setTimeout(() => {
      onUploadComplete();
      onClose();
    }, 1500);
  };

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
        className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Upload Media</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* File Input */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/30"
          >
            <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 font-medium mb-2">
              Click to select files or ZIP archives
            </p>
            <p className="text-gray-500 text-sm">
              Supports images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, MKV)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* ZIP Password Input */}
          {showZipPassword && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <Lock size={16} />
                <span>ZIP Password (if protected)</span>
              </label>
              <input
                type="password"
                value={zipPassword}
                onChange={(e) => setZipPassword(e.target.value)}
                placeholder="Leave empty if not password protected"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
              />
            </motion.div>
          )}

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {files.map(({ file, isZip }, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    {isZip ? <FileArchive className="w-5 h-5 text-purple-400" /> : <File className="w-5 h-5 text-blue-400" />}
                    <span className="flex-1 text-sm text-gray-300 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Upload Progress</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {uploadStatus.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    {status.status === 'uploading' || status.status === 'extracting' ? (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    ) : status.status === 'success' || status.status === 'extracted' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="flex-1 text-sm text-gray-300 truncate">{status.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{status.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadModal;
