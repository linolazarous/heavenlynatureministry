// src/pages/Livestream.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  FaPlay, FaStop, FaSyncAlt, FaUsers, FaFacebook, FaYoutube, FaShareAlt, FaExpand, FaCompress 
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

const Livestream = ({ className = '' }) => {
  // ---------------------
  // Local State
  // ---------------------
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const [showBible, setShowBible] = useState(false);
  const [bibleVerse, setBibleVerse] = useState(null);
  const [verseSearch, setVerseSearch] = useState('');
  const [translation, setTranslation] = useState('NIV');

  const [activeTab, setActiveTab] = useState('controls');
  const [streamStatus, setStreamStatus] = useState(STREAM_STATUS.OFFLINE);
  const [viewerCount, setViewerCount] = useState(0);
  const [lowerThird, setLowerThird] = useState({
    visible: false,
    title: '',
    subtitle: '',
    color: '#4a6fa5'
  });

  const [presets, setPresets] = useState([]);
  const [activePlatform, setActivePlatform] = useState(PLATFORMS.YOUTUBE);
  const [isMultistream, setIsMultistream] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fbLiveUrl, setFbLiveUrl] = useState('');

  // Refs
  const presetNameRef = useRef(null);
  const streamContainerRef = useRef(null);
  const notesRef = useRef(null);
  const bibleRef = useRef(null);

  // ---------------------
  // Initialization
  // ---------------------
  useEffect(() => {
    // Simulate initialization
    setIsLoading(true);
    setTimeout(() => {
      setIsInitialized(true);
      setIsLoading(false);
      toast.success('Livestream initialized successfully');
    }, 1000);
  }, []);

  // ---------------------
  // Handlers
  // ---------------------
  const handleVerseSearch = useCallback((e) => {
    e.preventDefault();
    if (!verseSearch.trim()) return;
    setBibleVerse(`Sample verse for "${verseSearch}" (${translation})`);
    toast.success('Verse updated successfully');
  }, [verseSearch, translation]);

  const handleTranslationChange = useCallback((newTranslation) => {
    setTranslation(newTranslation);
    toast.info(`Translation changed to ${newTranslation}`);
  }, []);

  const handleShowLowerThird = useCallback(() => {
    setLowerThird(prev => ({ ...prev, visible: true }));
    toast.info('Lower third displayed');
  }, []);

  const handleHideLowerThird = useCallback(() => {
    setLowerThird(prev => ({ ...prev, visible: false }));
    toast.info('Lower third hidden');
  }, []);

  const handleSavePreset = useCallback(() => {
    const name = presetNameRef.current?.value?.trim();
    if (!name) return toast.warning('Enter a preset name');
    setPresets(prev => [...prev, { id: Date.now(), name }]);
    if (presetNameRef.current) presetNameRef.current.value = '';
    toast.success('Preset saved');
  }, []);

  const handleLoadPreset = useCallback((presetId) => {
    toast.info(`Preset ${presetId} loaded (simulated)`);
  }, []);

  const handleStreamControl = useCallback(() => {
    if (streamStatus === STREAM_STATUS.LIVE) {
      setStreamStatus(STREAM_STATUS.OFFLINE);
      toast.info('Broadcast ended');
    } else {
      setStreamStatus(STREAM_STATUS.LIVE);
      toast.success('Broadcast started');
    }
  }, [streamStatus]);

  const toggleFullscreen = useCallback(() => setIsFullscreen(prev => !prev), []);
  const toggleMultistream = useCallback(() => {
    setIsMultistream(prev => !prev);
    setActivePlatform(prev => prev ? PLATFORMS.MULTISTREAM : PLATFORMS.YOUTUBE);
  }, []);

  // ---------------------
  // Memoized values
  // ---------------------
  const isBroadcasting = streamStatus === STREAM_STATUS.LIVE;
  const streamStatusColor = useMemo(() => {
    switch (streamStatus) {
      case STREAM_STATUS.LIVE: return '#4CAF50';
      case STREAM_STATUS.CONNECTING: return '#FF9800';
      case STREAM_STATUS.ERROR: return '#F44336';
      default: return '#666';
    }
  }, [streamStatus]);

  const platforms = useMemo(() => [
    { id: PLATFORMS.YOUTUBE, name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
    { id: PLATFORMS.FACEBOOK, name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
    { id: PLATFORMS.MULTISTREAM, name: 'Multistream', icon: FaShareAlt, color: '#8B5CF6' }
  ], []);

  // ---------------------
  // Render
  // ---------------------
  if (isLoading && !isInitialized) {
    return (
      <div className="livestream-loading">
        <LoadingSpinner message="Initializing Livestream Controls..." size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`livestream-page ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
        <ToastContainer position="bottom-right" autoClose={5000} pauseOnFocusLoss={false} />

        <header className="livestream-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Ministry Livestream</h1>
              <p>Broadcast God's word to the world</p>
            </div>

            <div className="stream-controls-panel">
              <div className="status-indicators">
                <div className="status-indicator" style={{ backgroundColor: streamStatusColor }}>
                  <span>{streamStatus.toUpperCase()}</span>
                </div>
                <div className="viewer-count">
                  <FaUsers />
                  <span>{viewerCount} viewers</span>
                </div>
              </div>

              <div className="platform-selector">
                {platforms.map(p => (
                  <button
                    key={p.id}
                    className={`platform-btn ${activePlatform === p.id ? 'active' : ''}`}
                    onClick={() => setActivePlatform(p.id)}
                    disabled={isBroadcasting}
                    style={{ '--platform-color': p.color }}
                  >
                    <p.icon />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              <button onClick={handleStreamControl} className={`stream-control-btn ${isBroadcasting ? 'stop' : 'start'}`}>
                {isBroadcasting ? <FaStop /> : <FaPlay />}
                {isBroadcasting ? 'End Broadcast' : 'Start Broadcast'}
              </button>

              <button onClick={toggleFullscreen} className="fullscreen-btn">
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </header>

        {error && <ErrorMessage message={error} severity="error" />}

        <main className="livestream-main" ref={streamContainerRef}>
          <section className="livestream-preview-section">
            <div className="preview-header">
              <h2>Stream Preview - {platforms.find(p => p.id === activePlatform)?.name}</h2>
            </div>

            <div className="preview-container">
              <YouTubeEmbed
                videoId={process.env.REACT_APP_STREAM_VIDEO_ID}
                autoplay={true}
                showChat={activePlatform === PLATFORMS.YOUTUBE}
                width="100%"
                height="400"
              />

              <LivestreamOverlay
                showNotes={showNotes}
                notes={notes}
                showBible={showBible}
                bibleVerse={bibleVerse}
                translation={translation}
                lowerThird={lowerThird}
              />
            </div>
          </section>

          <section className="livestream-controls-section">
            <nav className="control-tabs">
              {[
                { id: 'controls', label: 'Controls' },
                { id: 'lower-third', label: 'Lower Third' },
                { id: 'countdown', label: 'Countdown' },
                { id: 'presets', label: 'Presets' }
              ].map(tab => (
                <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="tab-content">
              {activeTab === 'controls' && (
                <div className="controls-grid">
                  <LivestreamNotes showNotes={showNotes} setShowNotes={setShowNotes} notes={notes} setNotes={setNotes} />
                  <BibleVerseSearch
                    showBible={showBible} setShowBible={setShowBible}
                    verseSearch={verseSearch} setVerseSearch={setVerseSearch}
                    translation={translation} setTranslation={handleTranslationChange}
                    handleVerseSearch={handleVerseSearch} currentVerse={bibleVerse}
                  />
                </div>
              )}

              {activeTab === 'lower-third' && (
                <LowerThirdGenerator
                  lowerThird={lowerThird} setLowerThird={setLowerThird}
                  showLowerThird={handleShowLowerThird} hideLowerThird={handleHideLowerThird}
                />
              )}

              {activeTab === 'countdown' && (
                <CountdownTimer isBroadcasting={isBroadcasting} />
              )}

              {activeTab === 'presets' && (
                <div className="presets-panel">
                  <div className="preset-form">
                    <input type="text" placeholder="Preset name" ref={presetNameRef} />
                    <button onClick={handleSavePreset}>Save Preset</button>
                  </div>
                  <div className="preset-list">
                    {presets.map(p => (
                      <div key={p.id}>
                        <span>{p.name}</span>
                        <button onClick={() => handleLoadPreset(p.id)}>Load</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
};

Livestream.propTypes = {
  className: PropTypes.string
};

export default Livestream;
