import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FaEye, 
  FaEyeSlash, 
  FaCheck, 
  FaTimes,
  FaLock,
  FaExclamationTriangle
} from 'react-icons/fa';
import { changePassword } from '../../services/userService';
import { toast } from 'react-toastify';
import './PasswordForm.css';

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// Custom hook for password management
const usePasswordManager = (userId) => {
  const [state, setState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    success: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Password validation
  const validatePassword = useCallback((password) => {
    const rules = {
      length: password.length >= PASSWORD_RULES.minLength,
      uppercase: PASSWORD_RULES.requireUppercase ? /[A-Z]/.test(password) : true,
      lowercase: PASSWORD_RULES.requireLowercase ? /[a-z]/.test(password) : true,
      numbers: PASSWORD_RULES.requireNumbers ? /\d/.test(password) : true,
      special: PASSWORD_RULES.requireSpecialChars ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
    };

    return {
      isValid: Object.values(rules).every(Boolean),
      rules
    };
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = state;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      updateState({ error: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      updateState({ error: "New passwords don't match" });
      return;
    }

    if (currentPassword === newPassword) {
      updateState({ error: 'New password must be different from current password' });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      updateState({ error: 'New password does not meet requirements' });
      return;
    }

    updateState({ isLoading: true, error: null, success: false });

    try {
      await changePassword(userId, currentPassword, newPassword);
      
      updateState({ 
        success: true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isLoading: false
      });
      
      toast.success('Password changed successfully!');
    } catch (err) {
      console.error('Password change failed:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to change password. Please try again.';
      updateState({ 
        error: errorMessage,
        isLoading: false 
      });
      toast.error(errorMessage);
    }
  }, [state, userId, validatePassword, updateState]);

  const togglePasswordVisibility = useCallback((field) => {
    updateState(prev => ({
      ...prev,
      [`show${field.charAt(0).toUpperCase() + field.slice(1)}Password`]: 
        !prev[`show${field.charAt(0).toUpperCase() + field.slice(1)}Password`]
    }));
  }, [updateState]);

  return {
    ...state,
    validatePassword,
    handleSubmit,
    togglePasswordVisibility,
    updateState
  };
};

const PasswordForm = ({ userId, className = '' }) => {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    success,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    validatePassword,
    handleSubmit,
    togglePasswordVisibility,
    updateState
  } = usePasswordManager(userId);

  // Memoized password validation
  const passwordValidation = useMemo(() => 
    validatePassword(newPassword),
    [newPassword, validatePassword]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    updateState({ 
      [name]: value,
      error: null // Clear error when user starts typing
    });
  }, [updateState]);

  const handleErrorDismiss = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const handleSuccessDismiss = useCallback(() => {
    updateState({ success: false });
  }, [updateState]);

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    
    const passedRules = Object.values(passwordValidation.rules).filter(Boolean).length;
    const totalRules = Object.keys(passwordValidation.rules).length;
    const strength = (passedRules / totalRules) * 100;

    let level = 'weak';
    if (strength >= 80) level = 'strong';
    else if (strength >= 60) level = 'medium';

    return { strength, level };
  }, [newPassword, passwordValidation.rules]);

  return (
    <div className={`password-form-container ${className}`}>
      <div className="form-header">
        <h3>
          <FaLock className="header-icon" />
          Change Password
        </h3>
        <p>Update your account password</p>
      </div>

      <form className="password-form" onSubmit={handleSubmit} noValidate>
        {/* Current Password */}
        <div className="form-group">
          <label htmlFor="currentPassword" className="required">
            Current Password
          </label>
          <div className="password-input-container">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              aria-describedby="currentPasswordHelp"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('current')}
              disabled={isLoading}
              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="form-group">
          <label htmlFor="newPassword" className="required">
            New Password
          </label>
          <div className="password-input-container">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleInputChange}
              required
              minLength={PASSWORD_RULES.minLength}
              disabled={isLoading}
              aria-describedby="passwordRules"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('new')}
              disabled={isLoading}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className={`strength-fill ${passwordStrength.level}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
              <span className={`strength-text ${passwordStrength.level}`}>
                {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
              </span>
            </div>
          )}

          {/* Password Rules */}
          <div id="passwordRules" className="password-rules">
            <p>Password must contain:</p>
            <ul>
              <li className={passwordValidation.rules.length ? 'valid' : 'invalid'}>
                {passwordValidation.rules.length ? <FaCheck /> : <FaTimes />}
                At least {PASSWORD_RULES.minLength} characters
              </li>
              {PASSWORD_RULES.requireUppercase && (
                <li className={passwordValidation.rules.uppercase ? 'valid' : 'invalid'}>
                  {passwordValidation.rules.uppercase ? <FaCheck /> : <FaTimes />}
                  One uppercase letter
                </li>
              )}
              {PASSWORD_RULES.requireLowercase && (
                <li className={passwordValidation.rules.lowercase ? 'valid' : 'invalid'}>
                  {passwordValidation.rules.lowercase ? <FaCheck /> : <FaTimes />}
                  One lowercase letter
                </li>
              )}
              {PASSWORD_RULES.requireNumbers && (
                <li className={passwordValidation.rules.numbers ? 'valid' : 'invalid'}>
                  {passwordValidation.rules.numbers ? <FaCheck /> : <FaTimes />}
                  One number
                </li>
              )}
              {PASSWORD_RULES.requireSpecialChars && (
                <li className={passwordValidation.rules.special ? 'valid' : 'invalid'}>
                  {passwordValidation.rules.special ? <FaCheck /> : <FaTimes />}
                  One special character
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="required">
            Confirm New Password
          </label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              aria-describedby="passwordMatch"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirm')}
              disabled={isLoading}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {/* Password Match Indicator */}
          {confirmPassword && (
            <div 
              id="passwordMatch"
              className={`password-match ${
                newPassword === confirmPassword ? 'match' : 'mismatch'
              }`}
            >
              {newPassword === confirmPassword ? (
                <>
                  <FaCheck /> Passwords match
                </>
              ) : (
                <>
                  <FaTimes /> Passwords don't match
                </>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="form-error" role="alert">
            <FaExclamationTriangle />
            {error}
            <button 
              type="button" 
              className="error-dismiss"
              onClick={handleErrorDismiss}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="form-success" role="status">
            <FaCheck />
            Password changed successfully!
            <button 
              type="button" 
              className="success-dismiss"
              onClick={handleSuccessDismiss}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            aria-busy={isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

PasswordForm.propTypes = {
  userId: PropTypes.string.isRequired,
  className: PropTypes.string
};

PasswordForm.defaultProps = {
  className: ''
};

export default PasswordForm;