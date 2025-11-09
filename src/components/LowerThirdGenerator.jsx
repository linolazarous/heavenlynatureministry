import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChromePicker } from 'react-color';
import { 
  FaPalette, 
  FaEye, 
  FaEyeSlash,
  FaUndo,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { debounce } from 'lodash';
import './LowerThirdGenerator.css';

// Constants
const DEFAULT_COLOR = '#1a4b8c';
const PRESET_COLORS = [
  '#1a4b8c', // Ministry blue
  '#2c5aa0', // Lighter blue
  '#e74c3c', // Red
  '#27ae60', // Green
  '#f39c12', // Orange
  '#8e44ad', // Purple
  '#2c3e50', // Dark gray
  '#16a085', // Teal
  '#c0392b', // Dark red
  '#2980b9'  // Bright blue
];

// Custom hook for lower third management
const useLowerThirdManager = (initialLowerThird, updateBroadcast) => {
  const [state, setState] = useState({
    lowerThird: {
      visible: false,
      title: '',
      subtitle: '',
      color: DEFAULT_COLOR,
      ...initialLowerThird
    },
    isColorPickerOpen: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    showSuccess: false
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Debounced broadcast update
  const debouncedUpdate = useMemo(
    () => debounce((lowerThirdData) => {
      updateBroadcast({ lowerThird: lowerThirdData });
      updateState({ 
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString(),
        showSuccess: true
      });
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        updateState({ showSuccess: false });
      }, 2000);
    }, 500),
    [updateBroadcast, updateState]
  );

  const updateLowerThird = useCallback((updates) => {
    const newLowerThird = { ...state.lowerThird, ...updates };
    updateState({ 
      lowerThird: newLowerThird,
      hasUnsavedChanges: true 
    });
    debouncedUpdate(newLowerThird);
  }, [state.lowerThird, debouncedUpdate, updateState]);

  const showLowerThird = useCallback(() => {
    if (!state.lowerThird.title.trim()) {
      throw new Error('Title is required to show lower third');
    }
    
    const updated = { ...state.lowerThird, visible: true };
    updateState({ lowerThird: updated });
    updateBroadcast({ lowerThird: updated });
    debouncedUpdate.cancel(); // Cancel any pending updates
  }, [state.lowerThird, updateBroadcast, debouncedUpdate, updateState]);

  const hideLowerThird = useCallback(() => {
    const updated = { ...state.lowerThird, visible: false };
    updateState({ lowerThird: updated });
    updateBroadcast({ lowerThird: updated });
    debouncedUpdate.cancel();
  }, [state.lowerThird, updateBroadcast, debouncedUpdate, updateState]);

  const resetLowerThird = useCallback(() => {
    const resetData = {
      title: '',
      subtitle: '',
      color: DEFAULT_COLOR,
      visible: false
    };
    updateState({ lowerThird: resetData });
    updateBroadcast({ lowerThird: resetData });
    debouncedUpdate.cancel();
  }, [updateBroadcast, debouncedUpdate, updateState]);

  const toggleColorPicker = useCallback(() => {
    updateState(prev => ({ 
      ...prev, 
      isColorPickerOpen: !prev.isColorPickerOpen 
    }));
  }, [updateState]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return {
    ...state,
    updateLowerThird,
    showLowerThird,
    hideLowerThird,
    resetLowerThird,
    toggleColorPicker,
    updateState
  };
};

const LowerThirdGenerator = ({
  lowerThird: externalLowerThird,
  updateBroadcast,
  className = '',
  showLowerThird: externalShowLowerThird,
  hideLowerThird: externalHideLowerThird
}) => {
  const {
    lowerThird,
    isColorPickerOpen,
    hasUnsavedChanges,
    lastSaved,
    showSuccess,
    updateLowerThird,
    showLowerThird,
    hideLowerThird,
    resetLowerThird,
    toggleColorPicker,
    updateState
  } = useLowerThirdManager(externalLowerThird, updateBroadcast);

  const colorPickerRef = useRef(null);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        updateState({ isColorPickerOpen: false });
      }
    };

    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerOpen, updateState]);

  // Use external show/hide functions if provided
  const handleShowLowerThird = useCallback(() => {
    try {
      if (externalShowLowerThird) {
        externalShowLowerThird();
      } else {
        showLowerThird();
      }
    } catch (error) {
      console.error('Failed to show lower third:', error);
    }
  }, [externalShowLowerThird, showLowerThird]);

  const handleHideLowerThird = useCallback(() => {
    if (externalHideLowerThird) {
      externalHideLowerThird();
    } else {
      hideLowerThird();
    }
  }, [externalHideLowerThird, hideLowerThird]);

  // Input handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    updateLowerThird({ [name]: value });
  }, [updateLowerThird]);

  const handleColorChange = useCallback((color) => {
    updateLowerThird({ color: color.hex });
  }, [updateLowerThird]);

  const handlePresetColor = useCallback((color) => {
    updateLowerThird({ color });
    updateState({ isColorPickerOpen: false });
  }, [updateLowerThird, updateState]);

  const handleReset = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm('Are you sure you want to reset? Unsaved changes will be lost.')) {
      return;
    }
    resetLowerThird();
  }, [hasUnsavedChanges, resetLowerThird]);

  // Validation
  const isFormValid = Boolean(lowerThird.title.trim());
  const characterCount = {
    title: lowerThird.title.length,
    subtitle: lowerThird.subtitle.length
  };

  const titleWarning = characterCount.title > 40;
  const subtitleWarning = characterCount.subtitle > 70;

  // Memoized preset colors
  const presetColorButtons = useMemo(() => 
    PRESET_COLORS.map(color => (
      <button
        key={color}
        type="button"
        className={`color-preset ${lowerThird.color === color ? 'active' : ''}`}
        style={{ backgroundColor: color }}
        onClick={() => handlePresetColor(color)}
        aria-label={`Select color ${color}`}
        title={color}
      />
    )), [lowerThird.color, handlePresetColor]
  );

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
    <div className={`lower-third-generator ${className}`}>
      <div className="generator-header">
        <div className="header-title">
          <FaPalette className="header-icon" />
          <h3>Lower Third Generator</h3>
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
      </div>

      <div className="generator-content">
        {/* Success Message */}
        {showSuccess && (
          <div className="success-message" role="alert">
            <FaCheckCircle />
            Changes saved successfully!
          </div>
        )}

        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="lower-third-title" className="required">
            Title *
          </label>
          <input
            type="text"
            id="lower-third-title"
            name="title"
            value={lowerThird.title}
            onChange={handleInputChange}
            placeholder="Speaker name or title"
            maxLength={50}
            className={titleWarning ? 'input-warning' : ''}
            aria-required="true"
            aria-describedby="title-count"
          />
          <div id="title-count" className="character-count">
            {characterCount.title}/50
            {titleWarning && (
              <FaExclamationTriangle className="warning-icon" title="Approaching character limit" />
            )}
          </div>
        </div>

        {/* Subtitle Input */}
        <div className="form-group">
          <label htmlFor="lower-third-subtitle">
            Subtitle (Optional)
          </label>
          <input
            type="text"
            id="lower-third-subtitle"
            name="subtitle"
            value={lowerThird.subtitle}
            onChange={handleInputChange}
            placeholder="Position or scripture reference"
            maxLength={80}
            className={subtitleWarning ? 'input-warning' : ''}
            aria-describedby="subtitle-count"
          />
          <div id="subtitle-count" className="character-count">
            {characterCount.subtitle}/80
            {subtitleWarning && (
              <FaExclamationTriangle className="warning-icon" title="Approaching character limit" />
            )}
          </div>
        </div>

        {/* Color Picker Section */}
        <div className="form-group">
          <label>Background Color</label>
          
          {/* Preset Colors */}
          <div className="preset-colors">
            {presetColorButtons}
          </div>

          {/* Custom Color Picker */}
          <div className="color-picker-container" ref={colorPickerRef}>
            <div className="color-picker-header">
              <span className="color-picker-label">Custom Color</span>
              <button
                type="button"
                className={`color-picker-toggle ${isColorPickerOpen ? 'active' : ''}`}
                onClick={toggleColorPicker}
                aria-expanded={isColorPickerOpen}
                aria-label={isColorPickerOpen ? 'Close color picker' : 'Open color picker'}
              >
                <FaPalette />
              </button>
            </div>
            
            <div 
              className="color-preview"
              style={{ backgroundColor: lowerThird.color }}
              onClick={toggleColorPicker}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleColorPicker();
                }
              }}
              aria-label={`Current color: ${lowerThird.color}. Click to change.`}
            >
              <span className="color-value">{lowerThird.color.toUpperCase()}</span>
            </div>

            {isColorPickerOpen && (
              <div className="color-picker-popup">
                <ChromePicker
                  color={lowerThird.color}
                  onChangeComplete={handleColorChange}
                  disableAlpha
                  presetColors={[]}
                />
                <div className="color-picker-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={toggleColorPicker}
                  >
                    Close Picker
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <div className="primary-actions">
            <button
              className="btn btn-primary show-btn"
              onClick={handleShowLowerThird}
              disabled={!isFormValid || lowerThird.visible}
              aria-label="Show lower third on stream"
            >
              <FaEye /> Show Lower Third
            </button>
            
            <button
              className="btn btn-secondary hide-btn"
              onClick={handleHideLowerThird}
              disabled={!lowerThird.visible}
              aria-label="Hide lower third from stream"
            >
              <FaEyeSlash /> Hide
            </button>
          </div>

          <div className="secondary-actions">
            <button
              className="btn btn-outline reset-btn"
              onClick={handleReset}
              disabled={!lowerThird.title && !lowerThird.subtitle && lowerThird.color === DEFAULT_COLOR}
              aria-label="Reset form"
            >
              <FaUndo /> Reset
            </button>
          </div>
        </div>

        {/* Status Information */}
        <div className="status-info">
          {lastSaved && (
            <div className="save-time">
              <FaSave /> Last saved: {formatTimeSinceSave(lastSaved)}
            </div>
          )}
          {lowerThird.visible && (
            <div className="visibility-status active">
              <FaEye /> Currently visible on stream
            </div>
          )}
        </div>

        {/* Preview */}
        {(lowerThird.title || lowerThird.subtitle) && (
          <div className="preview-section">
            <h4 className="preview-title">Preview</h4>
            <div 
              className="lower-third-preview"
              style={{ backgroundColor: lowerThird.color }}
              aria-label="Lower third preview"
            >
              <div className="preview-content">
                <div className="preview-title-text">{lowerThird.title || 'Title'}</div>
                {lowerThird.subtitle && (
                  <div className="preview-subtitle-text">{lowerThird.subtitle}</div>
                )}
              </div>
            </div>
            <div className="preview-note">
              This is how your lower third will appear on the stream
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

LowerThirdGenerator.propTypes = {
  lowerThird: PropTypes.shape({
    visible: PropTypes.bool,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    color: PropTypes.string
  }),
  updateBroadcast: PropTypes.func.isRequired,
  className: PropTypes.string,
  showLowerThird: PropTypes.func,
  hideLowerThird: PropTypes.func
};

LowerThirdGenerator.defaultProps = {
  lowerThird: {
    visible: false,
    title: '',
    subtitle: '',
    color: '#1a4b8c'
  },
  className: '',
  showLowerThird: null,
  hideLowerThird: null
};

export default LowerThirdGenerator;
