import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  FaPlay, 
  FaStop, 
  FaSyncAlt, 
  FaExclamationTriangle,
  FaCog,
  FaUsers,
  FaChartLine,
  FaFacebook,
  FaYoutube,
  FaShareAlt,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import BibleVerseSearch from '../components/BibleVerseSearch';
import LivestreamNotes from '../components/LivestreamNotes';
import LivestreamOverlay from '../components/LivestreamOverlay';
import LowerThirdGenerator from '../components/LowerThirdGenerator';
import CountdownTimer from '../components/CountdownTimer';
import YouTubeEmbed from '../components/YouTubeEmbed';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

// Hooks and Services
import { useBroadcast } from '../hooks/useBroadcast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { BibleAPI } from '../services/BibleAPI';
import { BroadcastAPI } from '../services/BroadcastAPI';
import { FacebookService } from '../services/FacebookService';

// Constants
const TRANSLATIONS = [
  { id: 'NIV', name: 'New International Version' },
  { id: 'KJV', name: 'King James Version' },
  { id: 'ESV', name: 'English Standard Version' },
  { id: 'NASB', name: 'New American Standard Bible' },
  { id: 'NLT', name: 'New Living Translation' },
  { id: 'MSG', name: 'The Message' },
  { id: 'AMP', name: 'Amplified Bible' },
];

const STREAM_STATUS = {
  OFFLINE: 'offline',
  CONNECTING: 'connecting',
  LIVE: 'live',
  ERROR: 'error'
};

const PLATFORMS = {
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  MULTISTREAM: 'multistream'
};

// Custom hook for livestream management
const useLivestreamManager = () => {
  const [state, setState] = useState({
    showNotes: false,
    notes: '',
    showBible: false,
    bibleVerse: null,
    translation: 'NIV',
    verseSearch: '',
    suggestions: [],
    isLoading: false,
    error: null,
    activeTab: 'controls',
    streamStatus: STREAM_STATUS.OFFLINE,
    viewerCount: 0,
    streamStats: null,
    lowerThird: {
      visible: false,
      title: '',
      subtitle: '',
      color: '#4a6fa5'
    },
    presets: [],
    isInitialized: false,
    activePlatform: PLATFORMS.YOUTUBE,
    fbLiveUrl: '',
    isMultistream: false,
    isFullscreen: false
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const { user } = useAuth();
  const { broadcastState, updateBroadcast, syncWithServer } = useBroadcast();
  const [notes, setNotes] = useLocalStorage('livestream-notes', '');
  const [savedTranslation, setSavedTranslation] = useLocalStorage('bible-translation', 'NIV');

  // WebSocket connection
  const { 
    isConnected, 
    streamStatus, 
    viewerCount, 
    streamStats,
    sendMessage 
  } = useWebSocket(user?.token);

  // Initialize livestream data
  const initializeLivestream = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [stateResponse, presetsResponse] = await Promise.all([
        BroadcastAPI.getCurrentState(),
        BroadcastAPI.getPresets()
      ]);

      syncWithServer(stateResponse.data);
      updateState({
        presets: presetsResponse.data,
        translation: savedTranslation,
        notes: notes,
        isInitialized: true,
        isLoading: false
      });

      toast.success('Livestream initialized successfully');
    } catch (err) {
      console.error('Failed to initialize livestream:', err);
      updateState({
        error: 'Failed to initialize livestream controls',
        isLoading: false
      });
      toast.error('Failed to load livestream data');
    }
  }, [savedTranslation, notes, syncWithServer, updateState]);

  // Bible verse search with debouncing
  const searchVerse = useCallback(async (searchTerm, version) => {
    if (!searchTerm.trim()) return;

    updateState({ isLoading: true, error: null });
    
    try {
      const verse = await BibleAPI.getVerse(searchTerm, version);
      updateState({ 
        bibleVerse: verse,
        verseSearch: searchTerm 
      });
      updateBroadcast({ 
        bibleVerse: verse.text, 
        bibleReference: searchTerm, 
        translation: version 
      });
      toast.success('Verse updated successfully');
    } catch (err) {
      console.error('Error fetching Bible verse:', err);
      updateState({ 
        error: 'Failed to fetch verse. Please try again.',
        bibleVerse: null 
      });
      toast.error('Failed to fetch verse');
    } finally {
      updateState({ isLoading: false });
    }
  }, [updateBroadcast, updateState]);

  // Stream control functions
  const startBroadcast = useCallback(async (platform = null) => {
    try {
      updateState({ isLoading: true });
      
      let response;
      const targetPlatform = platform || state.activePlatform;

      if (targetPlatform === PLATFORMS.FACEBOOK) {
        response = await FacebookService.startLiveStream();
        updateState({ fbLiveUrl: response.embed_html });
      } else if (targetPlatform === PLATFORMS.MULTISTREAM) {
        await Promise.all([
          BroadcastAPI.startBroadcast(),
          FacebookService.startLiveStream()
        ]);
      } else {
        response = await BroadcastAPI.startBroadcast();
      }

      sendMessage('start-broadcast', { platform: targetPlatform });
      toast.success(`Broadcast started on ${targetPlatform}`);
    } catch (err) {
      console.error('Failed to start broadcast:', err);
      toast.error(`Failed to start broadcast: ${err.message}`);
      throw err;
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.activePlatform, sendMessage, updateState]);

  const endBroadcast = useCallback(async () => {
    try {
      updateState({ isLoading: true });
      
      if (state.activePlatform === PLATFORMS.FACEBOOK || state.activePlatform === PLATFORMS.MULTISTREAM) {
        await FacebookService.endLiveStream();
      }
      
      if (state.activePlatform === PLATFORMS.YOUTUBE || state.activePlatform === PLATFORMS.MULTISTREAM) {
        await BroadcastAPI.endBroadcast();
      }

      sendMessage('end-broadcast');
      toast.success('Broadcast ended successfully');
    } catch (err) {
      console.error('Failed to end broadcast:', err);
      toast.error('Failed to end broadcast');
      throw err;
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.activePlatform, sendMessage, updateState]);

  // Platform management
  const switchPlatform = useCallback((platform) => {
    updateState({ activePlatform: platform });
    toast.info(`Switched to ${platform} streaming`);
  }, [updateState]);

  const toggleMultistream = useCallback(() => {
    const newMultistream = !state.isMultistream;
    updateState({ 
      isMultistream: newMultistream,
      activePlatform: newMultistream ? PLATFORMS.MULTISTREAM : PLATFORMS.YOUTUBE
    });
    toast.info(newMultistream ? 'Multistream enabled' : 'Multistream disabled');
  }, [state.isMultistream, updateState]);

  // Preset management
  const savePreset = useCallback(async (presetName) => {
    if (!presetName.trim()) {
      toast.warning('Please enter a preset name');
      return;
    }

    try {
      updateState({ isLoading: true });
      const response = await BroadcastAPI.savePreset({
        name: presetName,
        state: broadcastState
      });
      updateState(prev => ({
        presets: [...prev.presets, response.data]
      }));
      toast.success('Preset saved successfully');
    } catch (err) {
      console.error('Failed to save preset:', err);
      toast.error('Failed to save preset');
      throw err;
    } finally {
      updateState({ isLoading: false });
    }
  }, [broadcastState, updateState]);

  const loadPreset = useCallback(async (presetId) => {
    try {
      updateState({ isLoading: true });
      const response = await BroadcastAPI.getPreset(presetId);
      syncWithServer(response.data.state);
      toast.success('Preset loaded successfully');
    } catch (err) {
      console.error('Failed to load preset:', err);
      toast.error('Failed to load preset');
      throw err;
    } finally {
      updateState({ isLoading: false });
    }
  }, [syncWithServer, updateState]);

  // Fullscreen control
  const toggleFullscreen = useCallback(() => {
    updateState(prev => ({ isFullscreen: !prev.isFullscreen }));
  }, [updateState]);

  return {
    ...state,
    updateState,
    initializeLivestream,
    searchVerse,
    startBroadcast,
    endBroadcast,
    switchPlatform,
    toggleMultistream,
    savePreset,
    loadPreset,
    toggleFullscreen,
    isConnected,
    streamStatus: streamStatus || STREAM_STATUS.OFFLINE,
    viewerCount,
    streamStats,
    broadcastState,
    updateBroadcast,
    notes,
    setNotes,
    savedTranslation,
    setSavedTranslation
  };
};

const Livestream = ({ className = '' }) => {
  const {
    // State
    showNotes,
    showBible,
    bibleVerse,
    translation,
    verseSearch,
    suggestions,
    isLoading,
    error,
    activeTab,
    streamStatus,
    viewerCount,
    streamStats,
    lowerThird,
    presets,
    isInitialized,
    activePlatform,
    fbLiveUrl,
    isMultistream,
    isFullscreen,
    
    // State updaters
    updateState,
    
    // Functions
    initializeLivestream,
    searchVerse,
    startBroadcast,
    endBroadcast,
    switchPlatform,
    toggleMultistream,
    savePreset,
    loadPreset,
    toggleFullscreen,
    
    // WebSocket
    isConnected,
    
    // Broadcast
    broadcastState,
    updateBroadcast,
    
    // Local storage
    notes,
    setNotes,
    savedTranslation,
    setSavedTranslation
  } = useLivestreamManager();

  const { isAuthenticated, user } = useAuth();
  const presetNameRef = useRef(null);
  const streamContainerRef = useRef(null);

  // Refs for components
  const notesRef = useRef(null);
  const bibleRef = useRef(null);

  // Initialize on component mount
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      initializeLivestream();
    }
  }, [isAuthenticated, isInitialized, initializeLivestream]);

  // Event handlers
  const handleVerseSearch = useCallback((e) => {
    e.preventDefault();
    searchVerse(verseSearch, translation);
  }, [verseSearch, translation, searchVerse]);

  const handleTranslationChange = useCallback((newTranslation) => {
    updateState({ translation: newTranslation });
    setSavedTranslation(newTranslation);
    updateBroadcast({ translation: newTranslation });
  }, [updateState, setSavedTranslation, updateBroadcast]);

  const handleShowLowerThird = useCallback(() => {
    const updatedLowerThird = { ...lowerThird, visible: true };
    updateState({ lowerThird: updatedLowerThird });
    updateBroadcast({ lowerThird: updatedLowerThird });
    toast.info('Lower third displayed');
  }, [lowerThird, updateState, updateBroadcast]);

  const handleHideLowerThird = useCallback(() => {
    const updatedLowerThird = { ...lowerThird, visible: false };
    updateState({ lowerThird: updatedLowerThird });
    updateBroadcast({ lowerThird: updatedLowerThird });
    toast.info('Lower third hidden');
  }, [lowerThird, updateState, updateBroadcast]);

  const handleSavePreset = useCallback(async () => {
    const presetName = presetNameRef.current?.value?.trim();
    await savePreset(presetName);
    if (presetNameRef.current) {
      presetNameRef.current.value = '';
    }
  }, [savePreset]);

  const handleStreamControl = useCallback(async () => {
    try {
      if (streamStatus === STREAM_STATUS.LIVE) {
        await endBroadcast();
      } else {
        await startBroadcast();
      }
    } catch (err) {
      // Error handled in the function
    }
  }, [streamStatus, startBroadcast, endBroadcast]);

  const handleRetry = useCallback(() => {
    initializeLivestream();
  }, [initializeLivestream]);

  // Memoized values
  const isBroadcasting = streamStatus === STREAM_STATUS.LIVE;
  const streamStatusColor = useMemo(() => {
    switch (streamStatus) {
      case STREAM_STATUS.LIVE: return '#4CAF50';
      case STREAM_STATUS.CONNECTING: return '#FF9800';
      case STREAM_STATUS.ERROR: return '#F44336';
      default: return '#666';
    }
  }, [streamStatus]);

  const availableTranslations = useMemo(() => TRANSLATIONS, []);

  // Platform configuration
  const platforms = useMemo(() => [
    {
      id: PLATFORMS.YOUTUBE,
      name: 'YouTube',
      icon: FaYoutube,
      color: '#FF0000'
    },
    {
      id: PLATFORMS.FACEBOOK,
      name: 'Facebook',
      icon: FaFacebook,
      color: '#1877F2'
    },
    {
      id: PLATFORMS.MULTISTREAM,
      name: 'Multistream',
      icon: FaShareAlt,
      color: '#8B5CF6'
    }
  ], []);

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <ErrorMessage 
          message="Authentication Required"
          description="Please log in to access the livestream controls."
          severity="warning"
        />
      </div>
    );
  }

  if (isLoading && !isInitialized) {
    return (
      <div className="livestream-loading">
        <LoadingSpinner 
          message="Initializing Livestream Controls..." 
          size="large"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`livestream-page ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
        <ToastContainer 
          position="bottom-right" 
          autoClose={5000}
          pauseOnFocusLoss={false}
        />

        {/* Header */}
        <header className="livestream-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Ministry Livestream</h1>
              <p>Broadcast God's word to the world</p>
            </div>
            
            <div className="stream-controls-panel">
              <div className="status-indicators">
                <div 
                  className="status-indicator" 
                  style={{ backgroundColor: streamStatusColor }}
                >
                  <span>{streamStatus.toUpperCase()}</span>
                </div>
                <div className="viewer-count">
                  <FaUsers />
                  <span>{viewerCount} viewers</span>
                </div>
                <div className="connection-status">
                  <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>

              {/* Platform Selector */}
              <div className="platform-selector">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    className={`platform-btn ${activePlatform === platform.id ? 'active' : ''}`}
                    onClick={() => switchPlatform(platform.id)}
                    disabled={isBroadcasting}
                    style={{ '--platform-color': platform.color }}
                  >
                    <platform.icon />
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStreamControl}
                className={`stream-control-btn ${isBroadcasting ? 'stop' : 'start'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <FaSyncAlt className="spinning" />
                ) : isBroadcasting ? (
                  <FaStop />
                ) : (
                  <FaPlay />
                )}
                {isLoading ? 'Processing...' : isBroadcasting ? 'End Broadcast' : 'Start Broadcast'}
              </button>

              <button
                onClick={toggleFullscreen}
                className="fullscreen-btn"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="livestream-error">
            <ErrorMessage 
              message={error}
              onRetry={handleRetry}
              severity="error"
            />
          </div>
        )}

        <main className="livestream-main" ref={streamContainerRef}>
          {/* Preview Section */}
          <section className="livestream-preview-section">
            <div className="preview-header">
              <h2>Stream Preview - {platforms.find(p => p.id === activePlatform)?.name}</h2>
              {streamStats && (
                <div className="stream-stats">
                  <span>Bitrate: {streamStats.bitrate}kbps</span>
                  <span>Uptime: {streamStats.uptime}</span>
                  {streamStats.quality && (
                    <span>Quality: {streamStats.quality}</span>
                  )}
                </div>
              )}
            </div>

            <div className="preview-container">
              {activePlatform === PLATFORMS.FACEBOOK && fbLiveUrl ? (
                <div 
                  className="facebook-live-embed"
                  dangerouslySetInnerHTML={{ __html: fbLiveUrl }}
                />
              ) : (
                <YouTubeEmbed
                  videoId={process.env.REACT_APP_STREAM_VIDEO_ID}
                  autoplay={true}
                  showChat={activePlatform === PLATFORMS.YOUTUBE}
                  width="100%"
                  height="400"
                  className="stream-preview"
                />
              )}

              <LivestreamOverlay
                showNotes={showNotes}
                notes={notes}
                showBible={showBible}
                bibleVerse={bibleVerse}
                translation={translation}
                verseSearch={verseSearch}
                lowerThird={broadcastState.lowerThird || lowerThird}
                className="stream-overlay"
              />
            </div>

            {/* Multistream Status */}
            {isMultistream && (
              <div className="multistream-status">
                <FaShareAlt />
                <span>Streaming to multiple platforms simultaneously</span>
              </div>
            )}
          </section>

          {/* Controls Section */}
          <section className="livestream-controls-section">
            <nav className="control-tabs">
              {[
                { id: 'controls', label: 'Controls', icon: FaCog },
                { id: 'lower-third', label: 'Lower Third', icon: FaUsers },
                { id: 'countdown', label: 'Countdown', icon: FaChartLine },
                { id: 'presets', label: 'Presets', icon: FaSyncAlt }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => updateState({ activeTab: tab.id })}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="tab-content">
              {activeTab === 'controls' && (
                <div className="controls-grid">
                  <LivestreamNotes
                    showNotes={showNotes}
                    setShowNotes={(value) => updateState({ showNotes: value })}
                    notes={notes}
                    setNotes={setNotes}
                    ref={notesRef}
                    updateBroadcast={updateBroadcast}
                  />

                  <BibleVerseSearch
                    showBible={showBible}
                    setShowBible={(value) => updateState({ showBible: value })}
                    verseSearch={verseSearch}
                    setVerseSearch={(value) => updateState({ verseSearch: value })}
                    translation={translation}
                    setTranslation={handleTranslationChange}
                    translations={availableTranslations}
                    suggestions={suggestions}
                    isLoading={isLoading}
                    error={error}
                    handleVerseSearch={handleVerseSearch}
                    setSuggestions={(value) => updateState({ suggestions: value })}
                    ref={bibleRef}
                    updateBroadcast={updateBroadcast}
                    currentVerse={bibleVerse}
                  />
                </div>
              )}

              {activeTab === 'lower-third' && (
                <LowerThirdGenerator
                  lowerThird={lowerThird}
                  setLowerThird={(value) => updateState({ lowerThird: value })}
                  showLowerThird={handleShowLowerThird}
                  hideLowerThird={handleHideLowerThird}
                  updateBroadcast={updateBroadcast}
                />
              )}

              {activeTab === 'countdown' && (
                <CountdownTimer
                  updateBroadcast={updateBroadcast}
                  isBroadcasting={isBroadcasting}
                />
              )}

              {activeTab === 'presets' && (
                <div className="presets-panel">
                  <div className="preset-form">
                    <h3>Save Current State</h3>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Preset name"
                        ref={presetNameRef}
                        aria-label="Preset name"
                      />
                      <button
                        onClick={handleSavePreset}
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? 'Saving...' : 'Save Preset'}
                      </button>
                    </div>
                  </div>

                  <div className="preset-list">
                    <h3>Available Presets</h3>
                    {presets.length > 0 ? (
                      <div className="preset-grid">
                        {presets.map(preset => (
                          <div key={preset._id} className="preset-item">
                            <span className="preset-name">{preset.name}</span>
                            <button
                              onClick={() => loadPreset(preset._id)}
                              className="btn btn-outline"
                              disabled={isLoading}
                            >
                              Load
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-presets">No presets saved yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Debug panel for development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="debug-panel">
            <summary>Debug Information</summary>
            <div className="debug-content">
              <h4>Broadcast State</h4>
              <pre>{JSON.stringify(broadcastState, null, 2)}</pre>
              <h4>Connection Status</h4>
              <p>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
              <p>Stream: {streamStatus}</p>
              <p>Platform: {activePlatform}</p>
              <p>Multistream: {isMultistream ? 'Enabled' : 'Disabled'}</p>
            </div>
          </details>
        )}
      </div>
    </ErrorBoundary>
  );
};

Livestream.propTypes = {
  className: PropTypes.string
};

Livestream.defaultProps = {
  className: ''
};

export default Livestream;