import React, { useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChromePicker } from 'react-color';
import { 
  FaPalette, 
  FaEye, 
  FaEyeSlash,
  FaUndo,
  FaSave,
  FaExclamationTriangle
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
  '#2c3e50'  // Dark gray
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
    lastSaved: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Debounced broadcast update
  const debouncedUpdate = useCallback(
    debounce((lowerThirdData) => {
      updateBroadcast({ lowerThird: lowerThirdData });
      updateState({ 
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      });
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
  className = ''
}) => {
  const {
    lowerThird,
    isColorPickerOpen,
    hasUnsavedChanges,
    lastSaved,
    updateLowerThird,
    showLowerThird,
    hideLowerThird,
    resetLowerThird,
    toggleColorPicker,
    updateState
  } = useLowerThirdManager(externalLowerThird, updateBroadcast);

  const colorPickerRef = useRef(null);

  // Close color picker when clicking outside
  React.useEffect(() => {
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

  const handleShowLowerThird = useCallback(() => {
    try {
      showLowerThird();
    } catch (error) {
      console.error('Failed to show lower third:', error);
      // You could show a toast here: toast.error(error.message);
    }
  }, [showLowerThird]);

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

  // Memoized preset colors
  const presetColorButtons = useMemo(() => 
    PRESET_COLORS.map(color => (
      <button
        key={color}
        type="button"
        className="color-preset"
        style={{ backgroundColor: color }}
        onClick={() => handlePresetColor(color)}
        aria-label={`Select color ${color}`}
        title={color}
      />
    )), [handlePresetColor]
  );

  return (
    <div className={`control-panel lower-third-panel ${className}`}>
      <div className="panel-header">
        <h3>
          <FaPalette className="panel-icon" />
          Lower Third Generator
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
      </div>

      <div className="panel-content">
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
            className={characterCount.title > 40 ? 'warning' : ''}
            aria-required="true"
          />
          <div className="character-count">
            {characterCount.title}/50
            {characterCount.title > 40 && (
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
            className={characterCount.subtitle > 70 ? 'warning' : ''}
          />
          <div className="character-count">
            {characterCount.subtitle}/80
            {characterCount.subtitle > 70 && (
              <FaExclamationTriangle className="warning-icon" title="Approaching character limit" />
            )}
          </div>
        </div>

        {/* Color Picker */}
        <div className="form-group">
          <label>Background Color</label>
          
          {/* Preset Colors */}
          <div className="preset-colors">
            {presetColorButtons}
          </div>

          {/* Custom Color Picker */}
          <div className="color-picker-container" ref={colorPickerRef}>
            <div className="color-picker-header">
              <span>Custom Color</span>
              <button
                type="button"
                className="color-picker-toggle"
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
              aria-label={`Current color: ${lowerThird.color}. Click to change.`}
            >
              <span className="color-value">{lowerThird.color}</span>
            </div>

            {isColorPickerOpen && (
              <div className="color-picker-popup">
                <ChromePicker
                  color={lowerThird.color}
                  onChangeComplete={handleColorChange}
                  disableAlpha
                  presetColors={[]}
                />
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={toggleColorPicker}
                >
                  Close Picker
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <div className="primary-actions">
            <button
              className="btn btn-primary"
              onClick={handleShowLowerThird}
              disabled={!isFormValid || lowerThird.visible}
              aria-label="Show lower third on stream"
            >
              <FaEye /> Show Lower Third
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={hideLowerThird}
              disabled={!lowerThird.visible}
              aria-label="Hide lower third from stream"
            >
              <FaEyeSlash /> Hide
            </button>
          </div>

          <div className="secondary-actions">
            <button
              className="btn btn-outline-secondary"
              onClick={handleReset}
              disabled={!lowerThird.title && !lowerThird.subtitle}
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
              <FaSave /> Last saved: {new Date(lastSaved).toLocaleTimeString()}
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
            <h4>Preview</h4>
            <div 
              className="lower-third-preview"
              style={{ backgroundColor: lowerThird.color }}
            >
              <div className="preview-content">
                <div className="preview-title">{lowerThird.title || 'Title'}</div>
                {lowerThird.subtitle && (
                  <div className="preview-subtitle">{lowerThird.subtitle}</div>
                )}
              </div>
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
  className: PropTypes.string
};

LowerThirdGenerator.defaultProps = {
  lowerThird: {
    visible: false,
    title: '',
    subtitle: '',
    color: '#1a4b8c'
  },
  className: ''
};

export default LowerThirdGenerator;
