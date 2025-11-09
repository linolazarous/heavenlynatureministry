import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCamera,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { updateUserProfile } from '../services/userService';
import { toast } from 'react-toastify';
import '../css/ProfileForm.css';

// Validation constants
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  bio: {
    maxLength: 500
  },
  avatar: {
    urlPattern: /^https?:\/\/.+\..+$/,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  }
};

// Custom hook for profile form management
const useProfileForm = (initialProfile, onUpdate) => {
  const [state, setState] = useState({
    formData: {
      name: '',
      bio: '',
      avatar: ''
    },
    isLoading: false,
    error: null,
    success: false,
    hasChanges: false,
    validationErrors: {},
    isAvatarLoading: false
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize form with profile data
  useEffect(() => {
    if (initialProfile) {
      updateState({
        formData: {
          name: initialProfile.name || '',
          bio: initialProfile.bio || '',
          avatar: initialProfile.avatar || ''
        }
      });
    }
  }, [initialProfile, updateState]);

  // Validation functions
  const validateField = useCallback((name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return null;

    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < rules.minLength) return `Name must be at least ${rules.minLength} characters`;
        if (value.length > rules.maxLength) return `Name must be less than ${rules.maxLength} characters`;
        if (!rules.pattern.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return null;

      case 'bio':
        if (value.length > rules.maxLength) return `Bio must be less than ${rules.maxLength} characters`;
        return null;

      case 'avatar':
        if (value && !rules.urlPattern.test(value)) return 'Please enter a valid URL';
        if (value) {
          const extension = value.toLowerCase().split('.').pop();
          if (!rules.allowedExtensions.includes(`.${extension}`)) {
            return `Avatar must be a valid image URL (${rules.allowedExtensions.join(', ')})`;
          }
        }
        return null;

      default:
        return null;
    }
  }, []);

  const validateForm = useCallback((formData) => {
    const errors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    return errors;
  }, [validateField]);

  const handleInputChange = useCallback((name, value) => {
    updateState(prev => {
      const newFormData = { ...prev.formData, [name]: value };
      const validationErrors = { ...prev.validationErrors };
      const fieldError = validateField(name, value);

      if (fieldError) {
        validationErrors[name] = fieldError;
      } else {
        delete validationErrors[name];
      }

      const hasChanges = JSON.stringify(newFormData) !== JSON.stringify({
        name: initialProfile?.name || '',
        bio: initialProfile?.bio || '',
        avatar: initialProfile?.avatar || ''
      });

      return {
        formData: newFormData,
        validationErrors,
        hasChanges,
        error: null
      };
    });
  }, [initialProfile, validateField, updateState]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(state.formData);
    if (Object.keys(validationErrors).length > 0) {
      updateState({ validationErrors, error: 'Please fix validation errors' });
      return;
    }

    if (!state.hasChanges) {
      toast.info('No changes to save');
      return;
    }

    updateState({ isLoading: true, error: null, success: false });

    try {
      const updatedProfile = await updateUserProfile(initialProfile.id, state.formData);
      onUpdate(updatedProfile);
      
      updateState({ 
        success: true,
        hasChanges: false
      });
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update failed:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to update profile. Please try again.';
      updateState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.formData, state.hasChanges, initialProfile, onUpdate, validateForm, updateState]);

  const handleReset = useCallback(() => {
    updateState({
      formData: {
        name: initialProfile?.name || '',
        bio: initialProfile?.bio || '',
        avatar: initialProfile?.avatar || ''
      },
      validationErrors: {},
      hasChanges: false,
      error: null
    });
  }, [initialProfile, updateState]);

  const testAvatarUrl = useCallback(async (url) => {
    if (!url) return true;
    
    updateState({ isAvatarLoading: true });
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    } finally {
      updateState({ isAvatarLoading: false });
    }
  }, [updateState]);

  return {
    ...state,
    handleInputChange,
    handleSubmit,
    handleReset,
    testAvatarUrl,
    validateField
  };
};

const ProfileForm = ({ profile, onUpdate, className = '' }) => {
  const {
    formData,
    isLoading,
    error,
    success,
    hasChanges,
    validationErrors,
    isAvatarLoading,
    handleInputChange,
    handleSubmit,
    handleReset
  } = useProfileForm(profile, onUpdate);

  // Character counters
  const characterCounts = useMemo(() => ({
    name: formData.name.length,
    bio: formData.bio.length
  }), [formData.name, formData.bio]);

  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  }, [handleInputChange]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  return (
    <div className={`profile-form-container ${className}`}>
      <div className="form-header">
        <h3>
          <FaUser className="header-icon" />
          Profile Information
        </h3>
        <p>Update your personal information</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="required">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFieldChange}
            placeholder="Enter your full name"
            className={validationErrors.name ? 'error' : ''}
            aria-describedby="nameHelp nameError"
            aria-required="true"
            disabled={isLoading}
          />
          <div className="field-meta">
            <span 
              className={`character-count ${
                characterCounts.name > VALIDATION_RULES.name.maxLength * 0.8 ? 'warning' : ''
              }`}
            >
              {characterCounts.name}/{VALIDATION_RULES.name.maxLength}
            </span>
          </div>
          {validationErrors.name && (
            <div id="nameError" className="field-error" role="alert">
              <FaExclamationTriangle />
              {validationErrors.name}
            </div>
          )}
        </div>

        {/* Bio Field */}
        <div className="form-group">
          <label htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleFieldChange}
            rows="4"
            placeholder="Tell us about yourself, your role in ministry, or your testimony..."
            className={validationErrors.bio ? 'error' : ''}
            aria-describedby="bioHelp bioError"
            disabled={isLoading}
          />
          <div className="field-meta">
            <span 
              className={`character-count ${
                characterCounts.bio > VALIDATION_RULES.bio.maxLength * 0.8 ? 'warning' : ''
              }`}
            >
              {characterCounts.bio}/{VALIDATION_RULES.bio.maxLength}
            </span>
          </div>
          {validationErrors.bio && (
            <div id="bioError" className="field-error" role="alert">
              <FaExclamationTriangle />
              {validationErrors.bio}
            </div>
          )}
          <div id="bioHelp" className="field-help">
            Share your story or ministry involvement (optional)
          </div>
        </div>

        {/* Avatar Field */}
        <div className="form-group">
          <label htmlFor="avatar">
            Avatar URL
          </label>
          <div className="avatar-input-container">
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleFieldChange}
              placeholder="https://example.com/your-avatar.jpg"
              className={validationErrors.avatar ? 'error' : ''}
              aria-describedby="avatarHelp avatarError"
              disabled={isLoading}
            />
            <div className="avatar-actions">
              {isAvatarLoading && (
                <div className="avatar-loading" aria-label="Checking avatar URL">
                  <FaCamera className="spinning" />
                </div>
              )}
            </div>
          </div>
          {validationErrors.avatar && (
            <div id="avatarError" className="field-error" role="alert">
              <FaExclamationTriangle />
              {validationErrors.avatar}
            </div>
          )}
          <div id="avatarHelp" className="field-help">
            Enter a direct link to your profile picture
          </div>

          {/* Avatar Preview */}
          {formData.avatar && !validationErrors.avatar && (
            <div className="avatar-preview">
              <div className="preview-label">Preview:</div>
              <div className="preview-image">
                <img 
                  src={formData.avatar} 
                  alt="Avatar preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.warn('Avatar image failed to load');
                  }}
                />
                {isAvatarLoading && (
                  <div className="preview-loading">Checking image...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Status */}
        <div className="form-status">
          {error && (
            <div className="form-error" role="alert">
              <FaExclamationTriangle />
              {error}
            </div>
          )}
          
          {success && (
            <div className="form-success" role="status">
              <FaCheckCircle />
              Profile updated successfully!
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {hasChanges && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
              disabled={isLoading}
            >
              <FaTimes /> Reset
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !hasChanges || !isFormValid}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" aria-hidden="true"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="changes-indicator">
            <FaEdit />
            You have unsaved changes
          </div>
        )}
      </form>
    </div>
  );
};

ProfileForm.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    bio: PropTypes.string,
    avatar: PropTypes.string
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  className: PropTypes.string
};

ProfileForm.defaultProps = {
  className: ''
};

export default ProfileForm;
