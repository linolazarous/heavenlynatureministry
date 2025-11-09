.donation-form-wrapper {
  max-width: 500px;
  margin: 0 auto;
}

.donation-form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
}

.donation-form-container:hover {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

/* Header */
.donation-header {
  background: linear-gradient(135deg, #1a4b8c 0%, #2c5aa0 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.donation-header h2 {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.donation-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

/* Form */
.donation-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

/* Donation Type Toggle */
.donation-type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  border-radius: 12px;
  background: #f8fafc;
  padding: 0.25rem;
}

.type-option {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.type-option:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
}

.type-option.active {
  background: white;
  color: #1a4b8c;
  box-shadow: 0 2px 8px rgba(26, 75, 140, 0.2);
}

/* Amount Selection */
.amount-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.amount-option {
  padding: 1rem 0.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.amount-option:hover {
  border-color: #1a4b8c;
  background: #f8fafc;
  transform: translateY(-1px);
}

.amount-option.active {
  border-color: #1a4b8c;
  background: #1a4b8c;
  color: white;
  box-shadow: 0 4px 12px rgba(26, 75, 140, 0.3);
}

/* Custom Amount */
.custom-amount {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  font-weight: 600;
  color: #6b7280;
  font-size: 1.1rem;
  z-index: 2;
}

#custom-amount-input {
  width: 100%;
  padding: 1rem 1rem 1rem 2.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  text-align: center;
}

#custom-amount-input:focus {
  outline: none;
  border-color: #1a4b8c;
  box-shadow: 0 0 0 3px rgba(26, 75, 140, 0.1);
}

.amount-info {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
}

/* Form Inputs */
.form-input,
.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1a4b8c;
  box-shadow: 0 0 0 3px rgba(26, 75, 140, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Card Element */
.card-element-container {
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background: white;
  transition: all 0.2s ease;
}

.card-element-container:focus-within {
  border-color: #1a4b8c;
  box-shadow: 0 0 0 3px rgba(26, 75, 140, 0.1);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 1rem 0;
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0 1rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.submit-button:active:not(.disabled) {
  transform: translateY(0);
}

.submit-button.disabled,
.submit-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Security Notice */
.security-notice {
  border-top: 1px solid #e1e5e9;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.security-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.security-icon {
  color: #10b981;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.security-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.security-text strong {
  font-size: 0.9rem;
  color: #374151;
}

.security-text span {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Loading Overlay */
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 10px;
  color: #6b7280;
  font-weight: 500;
  margin: 1rem 0;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Error State */
.donation-form-container.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.donation-form-container.error .error-message {
  background: transparent;
  border: none;
  padding: 2rem;
  text-align: center;
  flex-direction: column;
  gap: 1rem;
}

.donation-form-container.error .error-message div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.donation-form-container.error .error-icon {
  font-size: 2rem;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .donation-form-wrapper {
    margin: 1rem;
  }

  .donation-header {
    padding: 2rem 1.5rem;
  }

  .donation-header h2 {
    font-size: 1.5rem;
  }

  .donation-form {
    padding: 1.5rem;
  }

  .amount-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .type-option {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }

  .submit-button {
    padding: 1.125rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .donation-header {
    padding: 1.5rem 1rem;
  }

  .donation-form {
    padding: 1rem;
  }

  .amount-buttons {
    grid-template-columns: 1fr;
  }

  .donation-type-toggle {
    grid-template-columns: 1fr;
  }

  .header-icon {
    font-size: 2.5rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .donation-form-container {
    border: 2px solid;
  }

  .form-input,
  .form-textarea,
  .card-element-container {
    border: 2px solid;
  }

  .amount-option,
  .type-option {
    border: 2px solid;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .donation-form-container,
  .submit-button,
  .amount-option,
  .type-option {
    transition: none;
  }

  .submit-button:hover:not(.disabled) {
    transform: none;
  }

  .amount-option:hover {
    transform: none;
  }

  .spinner {
    animation: none;
  }
}
