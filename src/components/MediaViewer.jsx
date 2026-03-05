import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight,
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Trash2
} from 'lucide-react';
import { useMediaStore } from '../store/mediaStore';
import { getFullUrl, deleteMedia } from '../services/cloudinary';

const MediaViewer = ({ media, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [deleting, setDeleting] = useState(false);
  
  // Video controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const getFilteredMedia = useMediaStore((state) => state.getFilteredMedia);
  const setMedia = useMediaStore((state) => state.setMedia);
  const allMediaState = useMediaStore((state) => state.media);
  const allMedia = getFilteredMedia();
  const currentIndex = allMedia.findIndex(m => m.public_id === media.public_id);

  const isVideo = media.resource_type === 'video';
  const mediaUrl = getFullUrl(media.public_id, media.resource_type);

  const handleDelete = async () => {
    if (!confirm(`Delete ${media.public_id.split('/').pop()}?`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteMedia(media.public_id, media.resource_type);
      // Remove from local state
      const updatedMedia = allMediaState.filter(m => m.public_id !== media.public_id);
      setMedia(updatedMedia);
      onClose();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete media');
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigateMedia(-1);
      if (e.key === 'ArrowRight') navigateMedia(1);
      if (e.key === ' ' && isVideo) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [media]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const navigateMedia = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < allMedia.length) {
      resetView();
      onClose();
      setTimeout(() => {
        const event = new CustomEvent('openMedia', { detail: allMedia[newIndex] });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (videoRef.current) {
      videoRef.current.loop = !isLooping;
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <span className="text-white font-medium">{Math.round(scale * 100)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate();
              }}
              className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetView();
              }}
              className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors text-white text-sm font-medium"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{
            scale,
            x: position.x,
            y: position.y,
            rotate: rotation,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="max-w-full max-h-full"
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              loop={isLooping}
              muted={isMuted}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Media"
              className="max-w-full max-h-[80vh] object-contain select-none"
              draggable={false}
            />
          )}
        </motion.div>
      </div>

      {/* Video Controls */}
      {isVideo && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Progress Bar */}
            <div
              onClick={handleSeek}
              className="h-2 bg-gray-700 rounded-full cursor-pointer group"
            >
              <div
                className="h-full bg-blue-500 rounded-full relative group-hover:bg-blue-400 transition-colors"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    skip(-10);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" fill="white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    skip(10);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                <span className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changePlaybackRate();
                  }}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white text-sm font-medium"
                >
                  {playbackRate}x
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLoop();
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium ${
                    isLooping
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  Loop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateMedia(-1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {currentIndex < allMedia.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateMedia(1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}
    </motion.div>
  );
};

export default MediaViewer;
