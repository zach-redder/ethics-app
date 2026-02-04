/**
 * Formatter Utilities
 * Common formatting functions for displaying data
 */

export const formatters = {
  /**
   * Format date to readable string
   * @param {string|Date} date
   * @returns {string}
   */
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format date and time
   * @param {string|Date} date
   * @returns {string}
   */
  formatDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {string|Date} date
   * @returns {string}
   */
  formatRelativeTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now - d) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Format number with commas
   * @param {number} num
   * @returns {string}
   */
  formatNumber: (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
  },

  /**
   * Format currency
   * @param {number} amount
   * @param {string} currency
   * @returns {string}
   */
  formatCurrency: (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Parse frequency range string (e.g., "3-5" or "3")
   * @param {string} frequencyRange - Range string like "3-5" or single number "3"
   * @returns {object} { min, max } or null if invalid
   */
  parseFrequencyRange: (frequencyRange) => {
    if (!frequencyRange || typeof frequencyRange !== 'string') return null;
    
    const trimmed = frequencyRange.trim();
    if (!trimmed) return null;

    // Check if it's a range format (e.g., "3-5")
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1], 10);
      const max = parseInt(rangeMatch[2], 10);
      if (min > 0 && max >= min) {
        return { min, max };
      }
      return null;
    }

    // Check if it's a single number
    const singleMatch = trimmed.match(/^(\d+)$/);
    if (singleMatch) {
      const value = parseInt(singleMatch[1], 10);
      if (value > 0) {
        return { min: value, max: value };
      }
      return null;
    }

    return null;
  },

  /**
   * Format frequency range for display (e.g., "3-5" or "3")
   * @param {string} frequencyRange - Range string like "3-5" or single number "3"
   * @returns {string} Formatted string for display
   */
  formatFrequencyRange: (frequencyRange) => {
    if (!frequencyRange) return '';
    const parsed = formatters.parseFrequencyRange(frequencyRange);
    if (!parsed) return frequencyRange; // Return original if can't parse
    
    if (parsed.min === parsed.max) {
      return parsed.min.toString();
    }
    return `${parsed.min}-${parsed.max}`;
  },

  /**
   * Check if a completion count is within the frequency range
   * @param {string} frequencyRange - Range string like "3-5"
   * @param {number} completions - Number of completions
   * @returns {boolean} True if completions is within range
   */
  isWithinFrequencyRange: (frequencyRange, completions) => {
    if (!frequencyRange) return false;
    const parsed = formatters.parseFrequencyRange(frequencyRange);
    if (!parsed) return false;
    
    return completions >= parsed.min && completions <= parsed.max;
  },

  /**
   * Get the maximum value from a frequency range
   * @param {string} frequencyRange - Range string like "3-5"
   * @returns {number} Maximum value or 0 if invalid
   */
  getMaxFrequency: (frequencyRange) => {
    if (!frequencyRange) return 0;
    const parsed = formatters.parseFrequencyRange(frequencyRange);
    if (!parsed) return 0;
    return parsed.max;
  },

  /**
   * Get the minimum value from a frequency range
   * @param {string} frequencyRange - Range string like "3-5"
   * @returns {number} Minimum value or 0 if invalid
   */
  getMinFrequency: (frequencyRange) => {
    if (!frequencyRange) return 0;
    const parsed = formatters.parseFrequencyRange(frequencyRange);
    if (!parsed) return 0;
    return parsed.min;
  },
};
