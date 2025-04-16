// src/components/ui/CustomVideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

const CustomVideoPlayer = ({ src, posterImage, className = '', onPlay, onPause }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const controlsTimerRef = useRef(null);

  // Initialize video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Update progress as video plays
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateProgress = () => {
      const currentProgress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(currentProgress || 0);
      setCurrentTime(videoElement.currentTime || 0);
    };

    videoElement.addEventListener('timeupdate', updateProgress);
    
    return () => {
      videoElement.removeEventListener('timeupdate', updateProgress);
    };
  }, []);

  // Auto-hide controls after a period of inactivity
  useEffect(() => {
    if (!isPlaying || !showControls || isHovering) return;

    const hideControls = () => {
      setShowControls(false);
    };

    controlsTimerRef.current = setTimeout(hideControls, 3000);

    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPlaying, showControls, isHovering]);

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      video.play();
      setIsPlaying(true);
      setShowControls(true);
      if (onPlay) onPlay();
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = videoRef.current.parentElement;
    
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  // Handle seeking through the video
  const handleSeek = (e) => {
    const seekPosition = e.target.value;
    const seekTime = (duration * seekPosition) / 100;
    videoRef.current.currentTime = seekTime;
    setProgress(seekPosition);
  };

  // Format time for display (MM:SS)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Skip forward/backward
  const skipTime = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    video.currentTime = newTime;
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => {
        if (!isPlaying) togglePlay();
        setShowControls(true);
      }}
      onMouseMove={() => {
        if (isPlaying) setShowControls(true);
      }}
    >
      {/* Video Element */}
      <video 
        ref={videoRef}
        src={src}
        poster={posterImage}
        className="w-full h-full object-contain bg-black"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play Button Overlay (shown when not playing) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button 
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-green-700 bg-opacity-80 flex items-center justify-center hover:bg-opacity-100 transition-opacity"
          >
            <Play className="h-10 w-10 text-gray-900" />
          </button>
        </div>
      )}

      {/* Video Controls (shown after play is clicked) */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-4 pt-10 pb-2 transition-opacity duration-300">
          {/* Progress Bar */}
          <div className="flex items-center mb-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-gray-400 appearance-none rounded-full cursor-pointer focus:outline-none"
              style={{
                background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
              }}
            />
          </div>
          
          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button onClick={togglePlay} className="text-green-700 hover:text-gray-200">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              {/* Skip Buttons */}
              <button onClick={() => skipTime(-10)} className="text-green-700 hover:text-gray-200">
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button onClick={() => skipTime(10)} className="text-green-700 hover:text-gray-200">
                <SkipForward className="h-5 w-5" />
              </button>
              
              {/* Time Display */}
              <div className="text-green-700 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Volume Control */}
              <div 
                className="relative flex items-center"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button onClick={toggleMute} className="text-green-700 hover:text-gray-200">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                {showVolumeSlider && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-8 bg-black bg-opacity-70 rounded-md flex items-center justify-center px-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-500 appearance-none rounded-full cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`,
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Fullscreen Button */}
              <button onClick={toggleFullscreen} className="text-green-700 hover:text-gray-200">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;