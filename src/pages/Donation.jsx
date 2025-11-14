// src/pages/Livestream.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { ToastContainer, toast } from 'react-toastify';
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

const Livestream = ({ className = '' }) => {
  // Static/local state only
  const [showNotes, setShowNotes] = useState(false);
  const [showBible, setShowBible] = useState(false);
  const [bibleVerse, setBibleVerse] = useState(null);
  const [translation, setTranslation] = useState('NIV');
  const [verseSearch, setVerseSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('controls');
  const [streamStatus, setStreamStatus] = useState('offline');
  const [viewerCount, setViewerCount] = useState(0);
  const [lowerThird, setLowerThird] = useState({ visible: false, title: '', subtitle: '', color: '#4a6fa5' });
  const [presets, setPresets] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activePlatform, setActivePlatform] = useState('youtube');
  const [fbLiveUrl, setFbLiveUrl] = useState('');
  const [isMultistream, setIsMultistream] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState('');
  
  const presetNameRef = useRef(null);
  const streamContainerRef = useRef(null);

  // Placeholder initialization
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleStreamControl = useCallback(() => {
    setStreamStatus(prev => prev === 'live' ? 'offline' : 'live');
    toast.info('Stream toggled (simulated)');
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleSavePreset = useCallback(() => {
    const name = presetNameRef.current?.value?.trim();
    if (!name) return toast.warning('Enter a preset name');
    setPresets(prev => [...prev, { _id: Date.now(), name }]);
    presetNameRef.current.value = '';
    toast.success('Preset saved (simulated)');
  }, []);

  const platforms = useMemo(() => [
    { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
    { id: 'multistream', name: 'Multistream', icon: FaShareAlt, color: '#8B5CF6' }
  ], []);

  const isBroadcasting = streamStatus === 'live';

  const streamStatusColor = useMemo(() => {
    switch (streamStatus) {
      case 'live': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#666';
    }
  }, [streamStatus]);

  return (
    <ErrorBoundary>
      <div className={`livestream-page ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
        <ToastContainer position="bottom-right" autoClose={5000} pauseOnFocusLoss={false} />

        {/* Header */}
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

              {/* Platform Selector */}
              <div className="platform-selector">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    className={`platform-btn ${activePlatform === platform.id ? 'active' : ''}`}
                    onClick={() => setActivePlatform(platform.id)}
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
            <YouTubeEmbed
              videoId={process.env.REACT_APP_STREAM_VIDEO_ID}
              autoplay={true}
              showChat={activePlatform === 'youtube'}
              width="100%"
              height="400"
            />
            <LivestreamOverlay
              showNotes={showNotes}
              notes={notes}
              showBible={showBible}
              bibleVerse={bibleVerse}
              translation={translation}
              verseSearch={verseSearch}
              lowerThird={lowerThird}
            />
          </section>

          <section className="livestream-controls-section">
            <nav className="control-tabs">
              {['controls', 'lower-third', 'countdown', 'presets'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="tab-content">
              {activeTab === 'controls' && (
                <div className="controls-grid">
                  <LivestreamNotes
                    showNotes={showNotes}
                    setShowNotes={setShowNotes}
                    notes={notes}
                    setNotes={setNotes}
                  />
                  <BibleVerseSearch
                    showBible={showBible}
                    setShowBible={setShowBible}
                    verseSearch={verseSearch}
                    setVerseSearch={setVerseSearch}
                    translation={translation}
                    setTranslation={setTranslation}
                  />
                </div>
              )}

              {activeTab === 'lower-third' && (
                <LowerThirdGenerator
                  lowerThird={lowerThird}
                  setLowerThird={setLowerThird}
                  showLowerThird={() => setLowerThird({ ...lowerThird, visible: true })}
                  hideLowerThird={() => setLowerThird({ ...lowerThird, visible: false })}
                />
              )}

              {activeTab === 'countdown' && (
                <CountdownTimer isBroadcasting={isBroadcasting} />
              )}

              {activeTab === 'presets' && (
                <div className="presets-panel">
                  <div className="preset-form">
                    <input type="text" ref={presetNameRef} placeholder="Preset name" />
                    <button onClick={handleSavePreset}>Save Preset</button>
                  </div>
                  <div className="preset-list">
                    {presets.map(p => <div key={p._id}>{p.name}</div>)}
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
