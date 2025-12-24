/**
 * Date and Time Utilities
 * Helper functions for temporal organization and filtering
 */

/**
 * Get start of today (midnight)
 */
export const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Get start of tomorrow
 */
export const getStartOfTomorrow = () => {
  const today = getStartOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

/**
 * Get date N days from now
 */
export const getDaysFromNow = days => {
  const today = getStartOfToday();
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  return future;
};

/**
 * Check if a date is today
 */
export const isToday = dateString => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = getStartOfToday();
  const tomorrow = getStartOfTomorrow();
  return date >= today && date < tomorrow;
};

/**
 * Check if a date is this week (next 7 days)
 */
export const isThisWeek = dateString => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = getStartOfToday();
  const weekFromNow = getDaysFromNow(7);
  return date >= today && date < weekFromNow;
};

/**
 * Check if a date is this month (next 30 days)
 */
export const isThisMonth = dateString => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = getStartOfToday();
  const monthFromNow = getDaysFromNow(30);
  return date >= today && date < monthFromNow;
};

/**
 * Check if a date is overdue
 */
export const isOverdue = dateString => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = getStartOfToday();
  return date < today;
};

/**
 * Get number of days until a date
 * Returns negative if overdue
 */
export const getDaysUntil = dateString => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = getStartOfToday();
  const diff = date - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Format a date for display
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return 'No date';

  const date = new Date(dateString);

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    case 'long':
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'relative':
      return getRelativeTimeString(dateString);

    default:
      return date.toLocaleDateString();
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 */
export const getRelativeTimeString = dateString => {
  if (!dateString) return 'No date';

  const days = getDaysUntil(dateString);

  if (days === null) return 'No date';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
};

/**
 * Get deadline urgency level
 */
export const getDeadlineUrgency = dateString => {
  if (!dateString) return 'none';

  const days = getDaysUntil(dateString);

  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days === 0) return 'critical';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'soon';
  return 'normal';
};

/**
 * Get color for deadline urgency
 */
export const getUrgencyColor = urgency => {
  const colors = {
    none: '#64748b',
    normal: '#3b82f6',
    soon: '#f59e0b',
    urgent: '#f97316',
    critical: '#ef4444',
    overdue: '#dc2626',
  };
  return colors[urgency] || colors.normal;
};

/**
 * Parse recurrence pattern (for future use)
 */
export const parseRecurrence = pattern => {
  // Simple recurrence patterns
  // Could be expanded for complex rules
  const patterns = {
    daily: { interval: 1, unit: 'day' },
    weekly: { interval: 7, unit: 'day' },
    biweekly: { interval: 14, unit: 'day' },
    monthly: { interval: 1, unit: 'month' },
    yearly: { interval: 1, unit: 'year' },
  };

  return patterns[pattern] || null;
};

/**
 * Get next occurrence of a recurring event
 */
export const getNextOccurrence = (baseDate, recurrence) => {
  if (!baseDate || !recurrence) return null;

  const date = new Date(baseDate);
  const pattern = parseRecurrence(recurrence);

  if (!pattern) return null;

  switch (pattern.unit) {
    case 'day':
      date.setDate(date.getDate() + pattern.interval);
      break;
    case 'month':
      date.setMonth(date.getMonth() + pattern.interval);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + pattern.interval);
      break;
  }

  return date.toISOString();
};

/**
 * Check if a date falls within a custom range
 */
export const isInDateRange = (dateString, startDate, endDate) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date

  return date >= start && date <= end;
};

/**
 * Get calendar week number
 */
export const getWeekNumber = dateString => {
  const date = dateString ? new Date(dateString) : new Date();
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Group dates by timeframe
 */
export const groupByTimeframe = dates => {
  const groups = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
    someday: [],
  };

  dates.forEach(item => {
    const dateString = item.date || item.dueDate;

    if (!dateString) {
      groups.someday.push(item);
    } else if (isOverdue(dateString)) {
      groups.overdue.push(item);
    } else if (isToday(dateString)) {
      groups.today.push(item);
    } else {
      const days = getDaysUntil(dateString);
      if (days === 1) {
        groups.tomorrow.push(item);
      } else if (days <= 7) {
        groups.thisWeek.push(item);
      } else {
        groups.later.push(item);
      }
    }
  });

  return groups;
};
