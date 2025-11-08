import React, { forwardRef, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FaStickyNote,
  FaTrash,
  FaSave,
  FaExpand,
  FaCompress,
  FaCopy
} from 'react-icons/fa';
import { debounce } from 'lodash';
import './LivestreamNotes.css';

// Custom hook for notes management
const useNotesManager = (initialNotes, updateBroadcast) => {
  const [state, setState] = useState({
    notes: initialNotes,
    isEditing: false,
    hasUnsavedChanges: false,
    lastSaved: null
  });
  
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Debounced broadcast update
  const debouncedUpdate = useCallback(
    debounce((notes) => {
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
      // Could show toast: toast.success('Notes copied to clipboard');
    } catch (err) {
      console.error('Failed to copy notes:', err);
    }
  }, [state.notes]);
  
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
  autoSave = true
}, ref) => {
  const {
    notes,
    isEditing,
    hasUnsavedChanges,
    lastSaved,
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
    if (notes.trim() && !window.confirm('Are you sure you want to clear all notes?')) {
      return;
    }
    clearNotes();
  }, [notes, clearNotes]);
  
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  const characterCount = notes.length;
  const characterLimitWarning = characterCount > maxLength * 0.9;
  
  return (
    <div 
      className={`control-panel notes-panel ${isExpanded ? 'expanded' : ''} ${showNotes ? 'visible' : ''}`}
      ref={ref}
      role="region"
      aria-labelledby="notes-panel-title"
    >
      <div className="panel-header">
        <h3 id="notes-panel-title">
          <FaStickyNote className="panel-icon" />
          Livestream Notes
          {hasUnsavedChanges && (
            <span 
              className="unsaved-indicator" 
              title="Unsaved changes"
              aria-label="Unsaved changes"
            >
              •
            </span>
          )}
        </h3>
        
        <div className="panel-controls">
          {/* Character count */}
          {showNotes && (
            <span 
              className={`character-count ${characterLimitWarning ? 'warning' : ''}`}
              aria-label={`${characterCount} characters of ${maxLength} maximum`}
            >
              {characterCount}/{maxLength}
            </span>
          )}

          {/* Expand toggle */}
          <button
            onClick={handleToggleExpand}
            className="icon-button"
            aria-label={isExpanded ? 'Collapse notes panel' : 'Expand notes panel'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>

          {/* Main toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`toggle-btn ${showNotes ? 'active' : ''}`}
            aria-expanded={showNotes}
            aria-controls="notes-content"
          >
            {showNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
        </div>
      </div>

      {showNotes && (
        <div id="notes-content" className="panel-content">
          {/* Notes textarea */}
          <div className="notes-input-container">
            <textarea
              value={notes}
              onChange={handleTextChange}
              placeholder="Type notes to display during livestream... You can use markdown-style formatting for emphasis."
              className="notes-textarea"
              rows={isExpanded ? 12 : 6}
              maxLength={maxLength}
              aria-label="Livestream notes"
            />
            
            {/* Character limit warning */}
            {characterLimitWarning && (
              <div className="character-warning" role="alert">
                Approaching character limit ({Math.round((characterCount / maxLength) * 100)}%)
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="notes-actions">
            <div className="notes-action-group">
              <button
                onClick={copyNotes}
                className="btn btn-outline-secondary"
                disabled={!notes.trim()}
                aria-label="Copy notes to clipboard"
              >
                <FaCopy /> Copy
              </button>
              
              {!autoSave && (
                <button
                  onClick={saveNotes}
                  className="btn btn-outline-primary"
                  disabled={!hasUnsavedChanges}
                  aria-label="Save notes"
                >
                  <FaSave /> Save
                </button>
              )}
              
              <button
                onClick={handleClearNotes}
                className="btn btn-outline-danger"
                disabled={!notes.trim()}
                aria-label="Clear all notes"
              >
                <FaTrash /> Clear
              </button>
            </div>

            {/* Save status */}
            <div className="notes-status">
              {lastSaved && (
                <span 
                  className="save-time"
                  title={`Last saved: ${new Date(lastSaved).toLocaleString()}`}
                >
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="unsaved-text">Unsaved changes</span>
              )}
            </div>
          </div>

          {/* Formatting tips */}
          <div className="formatting-tips">
            <details>
              <summary>Formatting Tips</summary>
              <ul>
                <li>**Bold text** - Use for emphasis</li>
                <li>*Italic text* - Use for quotes or scripture</li>
                <li>--- - Horizontal line for separation</li>
                <li># Heading - For section titles</li>
              </ul>
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
  autoSave: PropTypes.bool
};

LivestreamNotes.defaultProps = {
  maxLength: 5000,
  autoSave: true
};

LivestreamNotes.displayName = 'LivestreamNotes';

export default LivestreamNotes;
