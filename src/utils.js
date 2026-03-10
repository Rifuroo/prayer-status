/**
 * Utility functions for time parsing and formatting.
 */

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * Parse a time string in "HH:mm" format into a Date object for today.
 * @param {string} timeStr - Time string in "HH:mm" format (e.g. "05:23")
 * @returns {Date} Date object set to today with the given time
 */
function parseTime(timeStr) {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return date;
}

/**
 * Format a duration in seconds into HH:MM:SS or HH:MM format.
 * @param {number} totalSeconds - Duration in seconds
 * @param {boolean} showSeconds - Whether to include seconds in the output
 * @returns {string} Formatted countdown string
 */
function formatDurationHMS(totalSeconds, showSeconds = true) {
    if (totalSeconds <= 0) return showSeconds ? "00:00:00" : "00:00";

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

/**
 * Get Suhoor time (Fajr minus 10 minutes).
 * @param {string} fajrStr - Fajr time string "HH:mm"
 * @returns {string} Suhoor time string "HH:mm"
 */
function getSuhoorTime(fajrStr) {
    const fajrDate = parseTime(fajrStr);
    const suhoorDate = new Date(fajrDate.getTime() - (10 * 60 * 1000));
    const h = String(suhoorDate.getHours()).padStart(2, '0');
    const m = String(suhoorDate.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Get today's date as a "YYYY-MM-DD" string for cache keying.
 * @returns {string} Today's date key
 */
function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Clean API time string.
 * @param {string} timeStr - Raw time string from API
 * @returns {string} Cleaned "HH:mm" time string
 */
function cleanTimeStr(timeStr) {
    if (!timeStr) return '??:??';
    const match = timeStr.match(/(\d{1,2}:\d{2})/);
    return match ? match[1] : timeStr;
}

module.exports = {
    PRAYER_NAMES,
    parseTime,
    formatDurationHMS,
    getSuhoorTime,
    getTodayKey,
    cleanTimeStr
};
