/**
 * Validation Utilities
 * Common validation functions for form inputs
 */

export const validation = {
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * @param {string} password
   * @returns {object} { isValid, message }
   */
  isValidPassword: (password) => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters',
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter',
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter',
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number',
      };
    }

    return { isValid: true, message: 'Password is strong' };
  },

  /**
   * Validate username
   * @param {string} username
   * @returns {object} { isValid, message }
   */
  isValidUsername: (username) => {
    if (!username || username.length < 3) {
      return {
        isValid: false,
        message: 'Username must be at least 3 characters',
      };
    }

    if (username.length > 20) {
      return {
        isValid: false,
        message: 'Username must be less than 20 characters',
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        isValid: false,
        message: 'Username can only contain letters, numbers, and underscores',
      };
    }

    return { isValid: true, message: 'Username is valid' };
  },

  /**
   * Validate required field
   * @param {string} value
   * @param {string} fieldName
   * @returns {object} { isValid, message }
   */
  isRequired: (value, fieldName = 'This field') => {
    if (!value || value.trim() === '') {
      return {
        isValid: false,
        message: `${fieldName} is required`,
      };
    }
    return { isValid: true, message: '' };
  },
};
