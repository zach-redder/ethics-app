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
};
