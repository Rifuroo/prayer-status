/**
 * Status Bar Logic — manages dual items (countdown + hijri)
 * and interactive features like color changes and clicks.
 */

const vscode = require('vscode');
const { parseTime, formatDurationHMS, getSuhoorTime, PRAYER_NAMES } = require('./utils');

let countdownItem = null;
let hijriItem = null;

function createStatusBarItems() {
    // 1. Countdown Item (Right)
    countdownItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    countdownItem.command = 'prayerTime.showSchedule';
    countdownItem.tooltip = 'Click to view today\'s schedule';
    countdownItem.text = '🕌 Loading...';
    countdownItem.show();

    // 2. Hijri Item (Right, lower priority = more to the right)
    hijriItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    hijriItem.command = 'prayerTime.showSchedule';
    hijriItem.text = '📅 Loading...';
    hijriItem.show();

    return { countdownItem, hijriItem };
}

/**
 * Update the status bars based on current prayer data and settings.
 */
function updateUI(data, settings) {
    if (!countdownItem || !hijriItem) {
        console.error('[Prayer Time] Status bar items not initialized');
        return;
    }

    if (!data) {
        countdownItem.text = '$(warning) 🕌 Unavailable';
        countdownItem.backgroundColor = undefined;
        hijriItem.text = '';
        hijriItem.hide();
        return;
    }

    const { timings, hijri } = data;
    const now = new Date();
    const isRamadan = hijri && hijri.isRamadan && settings.ramadanMode;

    // HIJRI DATE
    if (settings.showHijriDate && hijri && hijri.date) {
        hijriItem.text = `📅 ${hijri.date}`;
        hijriItem.show();
    } else {
        hijriItem.hide();
    }

    // NEXT PRAYER & COUNTDOWN
    let nextTarget = null;
    let label = '';
    let smallestDiff = Infinity;

    const trackList = [...PRAYER_NAMES];
    let suhoorTime = null;

    if (isRamadan) {
        suhoorTime = getSuhoorTime(timings['Fajr']);
    }

    // Check all prayers
    for (const name of trackList) {
        const pDate = parseTime(timings[name]);
        const diff = pDate.getTime() - now.getTime();

        if (diff > 0 && diff < smallestDiff) {
            smallestDiff = diff;
            nextTarget = pDate;
            label = name;
        }
    }

    // Check Suhoor special label for Ramadan
    if (isRamadan && suhoorTime) {
        const sDate = parseTime(suhoorTime);
        const sDiff = sDate.getTime() - now.getTime();
        if (sDiff > 0 && sDiff < smallestDiff) {
            smallestDiff = sDiff;
            nextTarget = sDate;
            label = 'Suhoor';
        }
    }

    // Iftar label for Maghrib in Ramadan
    if (isRamadan && label === 'Maghrib') {
        label = 'Iftar';
    }

    if (nextTarget) {
        const diffSecs = Math.floor(smallestDiff / 1000);
        const countdownStr = formatDurationHMS(diffSecs, settings.showSeconds);

        const prefix = (label === 'Suhoor') ? '⭐' : (label === 'Iftar') ? '🌙' : '🕌';
        countdownItem.text = `${prefix} ${label} ${countdownStr}`;

        // COLOR LOGIC — Yellow: 10 mins before (600s)
        if (diffSecs <= 600 && diffSecs > 0) {
            countdownItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            countdownItem.backgroundColor = undefined;
        }

        const tooltipTime = label === 'Suhoor' ? suhoorTime : (label === 'Iftar' ? timings['Maghrib'] : timings[label]);
        countdownItem.tooltip = `Next: ${label} at ${tooltipTime}\nClick to view schedule`;
    } else {
        countdownItem.text = '🕌 All prayers done';
        countdownItem.backgroundColor = undefined;
        countdownItem.tooltip = 'All prayers for today have passed';
    }
}

function disposeUI() {
    if (countdownItem) countdownItem.dispose();
    if (hijriItem) hijriItem.dispose();
    countdownItem = null;
    hijriItem = null;
}

function setArrivalAlert() {
    if (countdownItem) {
        countdownItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }
}

module.exports = {
    createStatusBarItems,
    updateUI,
    disposeUI,
    setArrivalAlert
};
