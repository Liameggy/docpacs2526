/**
 * Date helper functions for date range filtering
 */

/**
 * Get the most recent Monday (or today if today is Monday)
 */
function getMostRecentMonday() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 6 : day - 1; // If Sunday (0), go back 6 days; otherwise go back to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get Monday from N weeks ago
 */
function getMondayWeeksAgo(weeks) {
  const recentMonday = getMostRecentMonday();
  const targetMonday = new Date(recentMonday);
  targetMonday.setDate(recentMonday.getDate() - (weeks * 7));
  return targetMonday;
}

/**
 * Get default date range (two Mondays ago to most recent Monday)
 */
function getDefaultDateRange() {
  const endDate = getMostRecentMonday();
  const startDate = getMondayWeeksAgo(2);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Format date for HTML date input (YYYY-MM-DD)
 */
function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is within a range
 */
function isDateInRange(date, startDate, endDate) {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
}

/**
 * Parse date string to Date object, handling various formats
 */
function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

module.exports = {
  getMostRecentMonday,
  getMondayWeeksAgo,
  getDefaultDateRange,
  formatDateForInput,
  isDateInRange,
  parseDate,
};

