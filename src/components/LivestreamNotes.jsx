import React, { forwardRef, useCallback, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FaStickyNote,
  FaTrash,
  FaSave,
  FaExpand,
  FaCompress,
  FaCopy,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { debounce } from 'lodash';
import './LivestreamNotes.css';

// Custom hook for notes management
const useNotesManager = (initialNotes, updateBroadcast) => {
  const [state, setState] = useState({
    notes: initialNotes,
    isEditing: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    copySuccess: false
  });
  
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Debounced broadcast update
  const debouncedUpdate = useMemo(
    () => debounce((notes) => {
      updateBroadcast({ notes });
      updateState({
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      });
    }, 1000),
    [updateBroadcast, updateState]
  );
  
  const handleNotesChange = useCallback((newNotes) => {
    updateState({
      notes: newNotes,
      isEditing: true,
      hasUnsavedChanges: true
    });
    debouncedUpdate(newNotes);
  }, [debouncedUpdate, updateState]);
  
  const clearNotes = useCallback(() => {
    updateState({
      notes: '',
      hasUnsavedChanges: false
    });
    updateBroadcast({ notes: '' });
    debouncedUpdate.cancel();
  }, [debouncedUpdate, updateBroadcast, updateState]);
  
  const saveNotes = useCallback(() => {
    debouncedUpdate.flush();
  }, [debouncedUpdate]);
  
  const copyNotes = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.notes);
      updateState({ copySuccess: true });
      setTimeout(() => updateState({ copySuccess: false }), 2000);
    } catch (err) {
      console.error('Failed to copy notes:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = state.notes;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      updateState({ copySuccess: true });
      setTimeout(() => updateState({ copySuccess: false }), 2000);
    }
  }, [state.notes, updateState]);
  
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return {
    ...state,
    handleNotesChange,
    clearNotes,
    saveNotes,
    copyNotes,
    updateState
  };
};

const LivestreamNotes = forwardRef(({
  showNotes,
  setShowNotes,
  notes: externalNotes,
  updateBroadcast,
  maxLength = 5000,
  autoSave = true,
  className = ''
}, ref) => {
  const {
    notes,
    isEditing,
    hasUnsavedChanges,
    lastSaved,
    copySuccess,
    handleNotesChange,
    clearNotes,
    saveNotes,
    copyNotes,
    updateState
  } = useNotesManager(externalNotes, updateBroadcast);
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sync with external notes changes
  useEffect(() => {
    if (!isEditing && externalNotes !== notes) {
      updateState({ notes: externalNotes });
    }
  }, [externalNotes, isEditing, notes, updateState]);
  
  const handleTextChange = useCallback((e) => {
    const newNotes = e.target.value.slice(0, maxLength);
    handleNotesChange(newNotes);
  }, [handleNotesChange, maxLength]);
  
  const handleClearNotes = useCallback(() => {
    if (notes.trim() && !window.confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      return;
    }
    clearNotes();
  }, [notes, clearNotes]);
  
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  const characterCount = notes.length;
  const characterLimitWarning = characterCount > maxLength * 0.9;
  const characterLimitReached = characterCount >= maxLength;

  const formatTimeSinceSave = useCallback((timestamp) => {
    if (!timestamp) return null;
    
    const now = new Date();
    const saved = new Date(timestamp);
    const diffInSeconds = Math.floor((now - saved) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }, []);

  return (
    <div 
      className={`livestream-notes ${isExpanded ? 'expanded' : ''} ${showNotes ? 'visible' : ''} ${className}`}
      ref={ref}
      role="region"
      aria-labelledby="notes-panel-title"
    >
      <div className="notes-header">
        <div className="notes-title">
          <FaStickyNote className="notes-icon" />
          <h3 id="notes-panel-title">Livestream Notes</h3>
          {hasUnsavedChanges && (
            <span 
              className="unsaved-indicator" 
              title="Unsaved changes"
              aria-label="Unsaved changes"
            >
              •
            </span>
          )}
        </div>
        
        <div className="notes-controls">
          {/* Character count */}
          {showNotes && (
            <div 
              className={`character-count ${characterLimitWarning ? 'warning' : ''} ${characterLimitReached ? 'error' : ''}`}
              aria-label={`${characterCount} characters of ${maxLength} maximum`}
            >
              {characterCount}/{maxLength}
              {characterLimitReached && <FaExclamationTriangle className="limit-icon" />}
            </div>
          )}

          {/* Expand toggle */}
          <button
            onClick={handleToggleExpand}
            className="notes-control-btn"
            aria-label={isExpanded ? 'Collapse notes panel' : 'Expand notes panel'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>

          {/* Main toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`notes-toggle-btn ${showNotes ? 'active' : ''}`}
            aria-expanded={showNotes}
            aria-controls="notes-content"
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
        </div>
      </div>

      {showNotes && (
        <div id="notes-content" className="notes-content">
          {/* Notes textarea */}
          <div className="notes-input-container">
            <textarea
              value={notes}
              onChange={handleTextChange}
              placeholder="Type your livestream notes here... You can use markdown-style formatting for emphasis.

**Bold text** for important points
*Italic text* for quotes or scripture
- Bullet points for lists
# Headings for sections"
              className="notes-textarea"
              rows={isExpanded ? 15 : 8}
              maxLength={maxLength}
              aria-label="Livestream notes"
              aria-describedby="character-count-display"
            />
            
            {/* Character limit warnings */}
            <div id="character-count-display" className="character-display">
              {characterLimitReached && (
                <div className="character-warning error" role="alert">
                  <FaExclamationTriangle />
                  Character limit reached
                </div>
              )}
              {characterLimitWarning && !characterLimitReached && (
                <div className="character-warning warning" role="alert">
                  <FaExclamationTriangle />
                  Approaching character limit ({Math.round((characterCount / maxLength) * 100)}%)
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="notes-actions">
            <div className="notes-buttons">
              <button
                onClick={copyNotes}
                className={`notes-btn copy-btn ${copySuccess ? 'success' : ''}`}
                disabled={!notes.trim()}
                aria-label="Copy notes to clipboard"
              >
                {copySuccess ? <FaCheck /> : <FaCopy />}
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
              
              {!autoSave && (
                <button
                  onClick={saveNotes}
                  className="notes-btn save-btn"
                  disabled={!hasUnsavedChanges}
                  aria-label="Save notes manually"
                >
                  <FaSave />
                  Save
                </button>
              )}
              
              <button
                onClick={handleClearNotes}
                className="notes-btn clear-btn"
                disabled={!notes.trim()}
                aria-label="Clear all notes"
              >
                <FaTrash />
                Clear
              </button>
            </div>

            {/* Save status */}
            <div className="notes-status">
              {lastSaved && (
                <span 
                  className="save-time"
                  title={`Last saved: ${new Date(lastSaved).toLocaleString()}`}
                >
                  Saved {formatTimeSinceSave(lastSaved)}
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="unsaved-text" aria-live="polite">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          {/* Formatting tips */}
          <div className="formatting-tips">
            <details className="tips-details">
              <summary className="tips-summary">
                Formatting Tips
              </summary>
              <div className="tips-content">
                <div className="tip-group">
                  <h4>Text Formatting</h4>
                  <ul>
                    <li><code>**Bold text**</code> - Use for emphasis</li>
                    <li><code>*Italic text*</code> - Use for quotes or scripture</li>
                    <li><code>~~Strikethrough~~</code> - For removed content</li>
                  </ul>
                </div>
                <div className="tip-group">
                  <h4>Structure</h4>
                  <ul>
                    <li><code># Heading</code> - For section titles</li>
                    <li><code>- Item</code> - For bullet points</li>
                    <li><code>1. Item</code> - For numbered lists</li>
                    <li><code>---</code> - Horizontal line for separation</li>
                  </ul>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
});

LivestreamNotes.propTypes = {
  showNotes: PropTypes.bool.isRequired,
  setShowNotes: PropTypes.func.isRequired,
  notes: PropTypes.string.isRequired,
  updateBroadcast: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  autoSave: PropTypes.bool,
  className: PropTypes.string
};

LivestreamNotes.defaultProps = {
  maxLength: 5000,
  autoSave: true,
  className: ''
};

LivestreamNotes.displayName = 'LivestreamNotes';

export default LivestreamNotes;
