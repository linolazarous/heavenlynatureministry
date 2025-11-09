import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FaPlay, 
  FaPause, 
  FaExpand, 
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaSpinner,
  FaExclamationTriangle,
  FaComment,
  FaTimes
} from 'react-icons/fa';
import '../css/YouTubeEmbed.css';

// Custom hook for YouTube embed management
const useYouTubeEmbed = (videoId, autoplay = false) => {
  const [state, setState] = useState({
    isLoaded: false,
    isPlaying: autoplay,
    isMuted: false,
    isFullscreen: false,
    error: null,
    showChat: false,
    isLoading: true,
    aspectRatio: '16/9'
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const iframeRef = useRef(null);
  const playerRef = useRef(null);

  const embedUrl = useMemo(() => {
    if (!videoId) return null;
    
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: autoplay ? '1' : '0', // Mute autoplay for better UX
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      controls: '0', // We'll use our own controls
      enablejsapi: '1',
      playsinline: '1',
      origin: window.location.origin
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, autoplay]);

  const chatUrl = useMemo(() => {
    if (!videoId) return null;
    return `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;
  }, [videoId]);

  const handleLoad = useCallback(() => {
    updateState({ 
      isLoaded: true, 
      isLoading: false,
      error: null 
    });
  }, [updateState]);

  const handleError = useCallback((error) => {
    console.error('YouTube embed error:', error);
    updateState({ 
      error: 'Failed to load YouTube video. Please check your connection.', 
      isLoading: false 
    });
  }, [updateState]);

  const togglePlay = useCallback(() => {
    // This would typically use YouTube IFrame API
    // For now, we'll just update the UI state
    updateState(prev => ({ 
      ...prev, 
      isPlaying: !prev.isPlaying 
    }));
  }, [updateState]);

  const toggleMute = useCallback(() => {
    updateState(prev => ({ 
      ...prev, 
      isMuted: !prev.isMuted 
    }));
  }, [updateState]);

  const toggleFullscreen = useCallback(async () => {
    const container = iframeRef.current?.parentElement?.parentElement;
    if (!container) return;

    try {
      if (!state.isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [state.isFullscreen]);

  const toggleChat = useCallback(() => {
    updateState(prev => ({ 
      ...prev, 
      showChat: !prev.showChat 
    }));
  }, [updateState]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      updateState({ isFullscreen: isCurrentlyFullscreen });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [updateState]);

  // Handle YouTube IFrame API (simplified)
  useEffect(() => {
    // In a real implementation, you'd load the YouTube IFrame API
    // and create a YT.Player instance for better control
    if (window.YT && iframeRef.current) {
      // YouTube API initialization would go here
    }
  }, []);

  return {
    ...state,
    embedUrl,
    chatUrl,
    iframeRef,
    playerRef,
    handleLoad,
    handleError,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    toggleChat
  };
};

const YouTubeEmbed = ({ 
  videoId, 
  autoplay = false,
  showChat = false,
  width = "100%",
  height = "400px",
  className = "",
  title = "YouTube video",
  onLoad,
  onError,
  allowFullscreen = true,
  ...props 
}) => {
  const {
    isLoaded,
    isPlaying,
    isMuted,
    isFullscreen,
    error,
    showChat: internalShowChat,
    isLoading,
    embedUrl,
    chatUrl,
    iframeRef,
    handleLoad,
    handleError,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    toggleChat
  } = useYouTubeEmbed(videoId, autoplay);

  // Combined showChat state
  const shouldShowChat = showChat && internalShowChat;

  const containerStyle = useMemo(() => ({
    width,
    maxWidth: '100%'
  }), [width]);

  const wrapperStyle = useMemo(() => ({
    height: shouldShowChat ? `calc(${height} + 400px)` : height
  }), [height, shouldShowChat]);

  const iframeStyle = useMemo(() => ({
    display: isLoaded ? 'block' : 'none'
  }), [isLoaded]);

  // Call external callbacks
  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (!videoId) {
    return (
      <div className={`youtube-embed error ${className}`} style={containerStyle}>
        <div className="embed-error">
          <FaExclamationTriangle className="error-icon" />
          <p>YouTube video ID is required</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`youtube-embed ${className} ${isFullscreen ? 'fullscreen' : ''} ${shouldShowChat ? 'with-chat' : ''}`}
      style={containerStyle}
      {...props}
    >
      <div className="embed-wrapper" style={wrapperStyle}>
        {/* Loading State */}
        {isLoading && (
          <div className="embed-loading">
            <FaSpinner className="spinner" aria-hidden="true" />
            <p>Loading video...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="embed-error" role="alert">
            <FaExclamationTriangle className="error-icon" aria-hidden="true" />
            <div className="error-content">
              <p className="error-message">{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
                aria-label="Retry loading video"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className="video-container">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            style={iframeStyle}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={allowFullscreen}
            onLoad={handleLoad}
            onError={(e) => handleError(e)}
            frameBorder="0"
            className="youtube-iframe"
            aria-label={`YouTube video: ${title}`}
            loading="lazy"
          />
          
          {/* Custom Controls Overlay */}
          {isLoaded && (
            <div className="custom-controls-overlay">
              <button
                className="play-pause-overlay"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
            </div>
          )}
        </div>

        {/* Chat Widget */}
        {showChat && chatUrl && shouldShowChat && (
          <div className="chat-widget">
            <div className="chat-header">
              <div className="chat-title">
                <FaComment className="chat-icon" aria-hidden="true" />
                <h4>Live Chat</h4>
              </div>
              <button 
                className="chat-toggle"
                onClick={toggleChat}
                aria-label="Hide chat"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            <div className="chat-container">
              <iframe
                src={chatUrl}
                title="YouTube Live Chat"
                className="chat-iframe"
                frameBorder="0"
                aria-label="YouTube live chat"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="embed-controls">
        <div className="control-group">
          <button
            className={`control-btn ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            disabled={!isLoaded || error}
          >
            {isPlaying ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
          </button>

          <button
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            disabled={!isLoaded || error}
          >
            {isMuted ? <FaVolumeMute aria-hidden="true" /> : <FaVolumeUp aria-hidden="true" />}
          </button>

          {showChat && (
            <button
              className={`control-btn chat-btn ${shouldShowChat ? 'active' : ''}`}
              onClick={toggleChat}
              aria-label={shouldShowChat ? 'Hide chat' : 'Show chat'}
            >
              <FaComment aria-hidden="true" />
            </button>
          )}

          {allowFullscreen && (
            <button
              className={`control-btn fullscreen-btn ${isFullscreen ? 'active' : ''}`}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <FaCompress aria-hidden="true" /> : <FaExpand aria-hidden="true" />}
            </button>
          )}
        </div>

        {/* Video Status */}
        <div className="video-status">
          {isLoaded && !error && (
            <span className="status-text">
              {isPlaying ? '▶ Playing' : '⏸ Paused'}
              {isMuted ? ' • 🔇 Muted' : ' • 🔊 Sound'}
            </span>
          )}
        </div>
      </div>

      {/* Chat Toggle for Mobile */}
      {showChat && !shouldShowChat && (
        <button
          className="chat-toggle-mobile"
          onClick={toggleChat}
          aria-label="Show chat"
        >
          <FaComment aria-hidden="true" />
          <span>Chat</span>
        </button>
      )}
    </div>
  );
};

YouTubeEmbed.propTypes = {
  videoId: PropTypes.string.isRequired,
  autoplay: PropTypes.bool,
  showChat: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  title: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  allowFullscreen: PropTypes.bool
};

YouTubeEmbed.defaultProps = {
  autoplay: false,
  showChat: false,
  width: "100%",
  height: "400px",
  className: "",
  title: "YouTube video",
  allowFullscreen: true
};

export default YouTubeEmbed;
