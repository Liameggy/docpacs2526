/**
 * Utility helper functions
 */

/**
 * Parse comma-separated usernames into an array
 */
function parseUsernames(usernamesString) {
  if (Array.isArray(usernamesString)) {
    return usernamesString;
  }
  
  return usernamesString
    .split(/[,\n]/)
    .map(u => u.trim())
    .filter(u => u.length > 0);
}

/**
 * Validate repository URL
 */
function isValidRepoUrl(url) {
  return /github\.com\/[^\/]+\/[^\/]+/.test(url);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Validate team data
 */
function validateTeamData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Team name is required');
  }

  if (!data.repoUrl || !isValidRepoUrl(data.repoUrl)) {
    errors.push('Valid GitHub repository URL is required');
  }

  if (!data.projectBoard) {
    errors.push('Project board number or URL is required');
  }

  if (!data.usernames || data.usernames.length === 0) {
    errors.push('At least one username is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create error response
 */
function errorResponse(message, details = null) {
  return {
    success: false,
    error: message,
    details,
  };
}

/**
 * Create success response
 */
function successResponse(data) {
  return {
    success: true,
    data,
  };
}

module.exports = {
  parseUsernames,
  isValidRepoUrl,
  formatDate,
  validateTeamData,
  errorResponse,
  successResponse,
};

