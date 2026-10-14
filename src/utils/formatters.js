/**
 * Format a numeric value as Indian Rupees (INR).
 * @param {number} amount
 * @param {boolean} compact
 * @returns {string}
 */
export function formatINR(amount, compact = false) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  if (compact && Math.abs(safeAmount) >= 100000) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(safeAmount);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Parse a YYYY-MM-DD local date string safely without UTC timezone shifting.
 * @param {string} dateStr
 * @returns {{ year: number, month: number, day: number }} month is 0-indexed (0 = Jan, 11 = Dec)
 */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return { year, month, day };
    }
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

/**
 * Format a YYYY-MM-DD string into a readable label like "13 Oct 2026"
 */
export function formatReadableDate(dateStr) {
  const { year, month, day } = parseLocalDate(dateStr);
  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get today's date as YYYY-MM-DD in local time.
 */
export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getMonthYearLabel(month, year) {
  return `${MONTHS[month] || 'October'} ${year}`;
}

export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
