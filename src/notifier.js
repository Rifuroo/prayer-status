/**
 * Notifier module — handles popup notifications and Ramadan greetings.
 */

const vscode = require('vscode');
const { parseTime, getTodayKey, getSuhoorTime } = require('./utils');

let notifiedToday = {};
let lastDate = null;
let greetedRamadanYear = null;

function checkNotifications(data, settings, onArrival) {
    if (!data || !settings.notifications) return;

    const today = getTodayKey();
    if (lastDate !== today) {
        notifiedToday = {};
        lastDate = today;
    }

    // Ramadan Greeting (once per year)
    if (data.hijri.isRamadan && settings.ramadanMode) {
        const year = data.hijri.date.split(' ').pop();
        if (greetedRamadanYear !== year) {
            vscode.window.showInformationMessage('Ramadan Mubarak! 🌙 Ramadan has begun.');
            greetedRamadanYear = year;
        }
    }

    const { timings } = data;
    const now = new Date();

    const track = [...Object.keys(timings)];
    if (settings.ramadanMode) {
        track.push('Suhoor');
    }

    for (const name of track) {
        if (notifiedToday[name]) continue;

        let timeStr = timings[name];
        if (name === 'Suhoor') {
            timeStr = getSuhoorTime(timings['Fajr']);
        }
        if (name === 'Iftar') {
            timeStr = timings['Maghrib'];
        }

        const pDate = parseTime(timeStr);
        const diff = now.getTime() - pDate.getTime();

        // 0-60 seconds after
        if (diff >= 0 && diff <= 60000) {
            notifiedToday[name] = true;
            onArrival(); // Trigger red color in status bar

            const label = (settings.ramadanMode && name === 'Maghrib') ? 'Iftar' : name;
            vscode.window.showInformationMessage(`🕌 It's time for ${label} (${timeStr})`);
        }
    }
}

function clearNotificationHistory() {
    notifiedToday = {};
}

module.exports = {
    checkNotifications,
    clearNotificationHistory
};
