/**
 * Prayer Time Reminder — Enhanced Entry Point
 */

const vscode = require('vscode');
const { fetchPrayerTimes, invalidateCache } = require('./src/prayerService');
const { createStatusBarItems, disposeUI } = require('./src/statusBar');
const { startTicker, stopTicker } = require('./src/countdown');
const { PRAYER_NAMES, getSuhoorTime } = require('./src/utils');
const { clearNotificationHistory } = require('./src/notifier');

function getConfig() {
    const config = vscode.workspace.getConfiguration('prayer');
    return {
        city: config.get('city', 'Malang'),
        country: config.get('country', 'Indonesia'),
        method: config.get('method', 11),
        notifications: config.get('notifications', true),
        ramadanMode: config.get('ramadanMode', true),
        showHijriDate: config.get('showHijriDate', true),
        showSeconds: config.get('showSeconds', true)
    };
}

async function showScheduleCommand() {
    try {
        const settings = getConfig();
        const data = await fetchPrayerTimes(settings.city, settings.country, settings.method);

        if (!data) {
            vscode.window.showErrorMessage('Unable to load prayer times. Check your internet connection.');
            return;
        }

        const { timings, hijri, city, country } = data;
        const now = new Date();
        const items = [];

        // Prayers
        for (const name of PRAYER_NAMES) {
            const timeStr = timings[name];
            const [h, m] = timeStr.split(':').map(Number);
            const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
            const isPast = now > pDate;
            const icon = isPast ? '✅' : '🕐';

            let label = name;
            if (settings.ramadanMode && name === 'Maghrib') label = 'Maghrib (Iftar)';

            let detail = isPast ? 'Passed' : 'Upcoming';
            if (name === 'Fajr' && settings.ramadanMode) {
                detail += ` | Suhoor: ${getSuhoorTime(timings['Fajr'])}`;
            }

            items.push({
                label: `${icon}  ${label}`,
                description: timeStr,
                detail: detail
            });
        }

        const title = `📅 ${hijri.date} — ${city}, ${country}`;
        vscode.window.showQuickPick(items, {
            title: title,
            placeHolder: 'Today\'s prayer schedule'
        });
    } catch (err) {
        console.error('[Prayer Time] showSchedule error:', err);
        vscode.window.showErrorMessage('Prayer Time: Failed to show schedule.');
    }
}

/**
 * Activation
 */
function activate(context) {
    try {
        console.log('[Prayer Time] Extension activating...');

        // Create UI
        const { countdownItem, hijriItem } = createStatusBarItems();
        context.subscriptions.push(countdownItem);
        context.subscriptions.push(hijriItem);

        // Register Commands
        context.subscriptions.push(
            vscode.commands.registerCommand('prayerTime.showSchedule', showScheduleCommand),

            vscode.commands.registerCommand('prayerTime.refresh', async () => {
                invalidateCache();
                clearNotificationHistory();
                vscode.window.showInformationMessage('Prayer times refreshed.');
            }),

            vscode.commands.registerCommand('prayerTime.toggleRamadanMode', () => {
                const config = vscode.workspace.getConfiguration('prayer');
                const current = config.get('ramadanMode', true);
                config.update('ramadanMode', !current, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Ramadan Mode ${!current ? 'Enabled' : 'Disabled'}`);
            })
        );

        // Watch config changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('prayer')) {
                    invalidateCache();
                }
            })
        );

        // Start 1s ticker
        startTicker(getConfig);

        console.log('[Prayer Time] Extension activated successfully!');
    } catch (err) {
        console.error('[Prayer Time] Activation FAILED:', err);
    }
}

/**
 * Deactivation
 */
function deactivate() {
    stopTicker();
    disposeUI();
    console.log('[Prayer Time] Extension deactivated');
}

module.exports = { activate, deactivate };
