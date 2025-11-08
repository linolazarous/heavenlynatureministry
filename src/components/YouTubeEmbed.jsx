import React, { useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  FaPlay, 
  FaPause, 
  FaExpand, 
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import './YouTubeEmbed.css';

// Custom hook for YouTube embed management
const useYouTubeEmbed = (videoId, autoplay = false) => {
  const [state, setState] = useState({
    isLoaded: false,
    isPlaying: autoplay,
    isMuted: false,
    isFullscreen: false,
    error: null,
    showChat: false,
    isLoading: true
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const iframeRef = useRef(null);

  const embedUrl = useMemo(() => {
    if (!videoId) return null;
    
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: autoplay ? '1' : '0', // Mute autoplay for better UX
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      controls: '1',
      enablejsapi: '1'
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

  const handleError = useCallback(() => {
    updateState({ 
      error: 'Failed to load YouTube video', 
      isLoading: false 
    });
  }, [updateState]);

  const togglePlay = useCallback(() => {
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

  const toggleFullscreen = useCallback(() => {
    if (!iframeRef.current) return;

    if (!state.isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      } else if (iframeRef.current.msRequestFullscreen) {
        iframeRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    updateState(prev => ({ 
      ...prev, 
      isFullscreen: !prev.isFullscreen 
    }));
  }, [state.isFullscreen, updateState]);

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
      
      if (isCurrentlyFullscreen !== state.isFullscreen) {
        updateState({ isFullscreen: isCurrentlyFullscreen });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [state.isFullscreen, updateState]);

  return {
    ...state,
    embedUrl,
    chatUrl,
    iframeRef,
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
    height: shouldShowChat ? `calc(${height} + 300px)` : height
  }), [width, height, shouldShowChat]);

  const iframeStyle = useMemo(() => ({
    display: isLoaded ? 'block' : 'none'
  }), [isLoaded]);

  // Call external callbacks
  React.useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (!videoId) {
    return (
      <div className={`youtube-embed error ${className}`}>
        <div className="embed-error">
          <FaExclamationTriangle />
          <p>YouTube video ID is required</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`youtube-embed ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      style={containerStyle}
      {...props}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="embed-loading">
          <FaSpinner className="spinner" />
          <p>Loading video...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="embed-error" role="alert">
          <FaExclamationTriangle />
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Video Container */}
      <div className="video-container">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          style={iframeStyle}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          frameBorder="0"
          aria-label={`YouTube video: ${title}`}
        />
      </div>

      {/* Chat Widget */}
      {showChat && chatUrl && shouldShowChat && (
        <div className="chat-widget">
          <div className="chat-header">
            <h4>Live Chat</h4>
            <button 
              className="chat-toggle"
              onClick={toggleChat}
              aria-label="Hide chat"
            >
              ×
            </button>
          </div>
          <iframe
            src={chatUrl}
            title="YouTube Live Chat"
            className="chat-iframe"
            frameBorder="0"
            aria-label="YouTube live chat"
          />
        </div>
      )}

      {/* Controls */}
      <div className="embed-controls">
        <div className="control-group">
          <button
            className="control-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            disabled={!isLoaded}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            className="control-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            disabled={!isLoaded}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>

          {showChat && (
            <button
              className="control-btn"
              onClick={toggleChat}
              aria-label={shouldShowChat ? 'Hide chat' : 'Show chat'}
            >
              💬
            </button>
          )}

          <button
            className="control-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>

        {/* Video Status */}
        <div className="video-status">
          {isLoaded && (
            <span className="status-text">
              {isPlaying ? 'Playing' : 'Paused'} • 
              {isMuted ? ' Muted' : ' Unmuted'}
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
          💬
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
  onError: PropTypes.func
};

YouTubeEmbed.defaultProps = {
  autoplay: false,
  showChat: false,
  width: "100%",
  height: "400px",
  className: "",
  title: "YouTube video"
};

export default YouTubeEmbed;
