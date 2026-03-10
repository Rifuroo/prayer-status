/**
 * Prayer Time Reminder — Ultra-Enhanced Entry Point
 */

const vscode = require('vscode');
const { fetchPrayerTimes, invalidateCache } = require('./src/prayerService');
const { createStatusBarItems, disposeUI, updateUI, setArrivalAlert } = require('./src/statusBar');
const { stopTicker } = require('./src/countdown');
const { PRAYER_NAMES, getSuhoorTime } = require('./src/utils');
const { checkNotifications, clearNotificationHistory } = require('./src/notifier');
const { fetchRandomAyah } = require('./src/quranService');
const { createTasbihItem, incrementTasbih, resetTasbih, disposeTasbih } = require('./src/tasbihService');
const { PrayerDashboardProvider } = require('./src/webviewProvider');

let ticker = null;
let dashboardProvider = null;

function getConfig() {
    const config = vscode.workspace.getConfiguration('prayer');
    return {
        city: config.get('city', 'Malang'),
        country: config.get('country', 'Indonesia'),
        method: config.get('method', 11),
        notifications: config.get('notifications', true),
        ramadanMode: config.get('ramadanMode', true),
        showHijriDate: config.get('showHijriDate', true),
        showSeconds: config.get('showSeconds', true),
        playAdzanSound: config.get('playAdzanSound', true),
        dailyAyatEnabled: config.get('dailyAyatEnabled', true)
    };
}

async function showScheduleCommand() {
    try {
        const settings = getConfig();
        const data = await fetchPrayerTimes(settings.city, settings.country, settings.method);
        if (!data) return;

        const { timings, hijri, city, country } = data;
        const now = new Date();
        const items = [];

        for (const name of PRAYER_NAMES) {
            const timeStr = timings[name];
            const [h, m] = timeStr.split(':').map(Number);
            const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
            const isPast = now > pDate;
            const icon = isPast ? '✅' : '🕐';
            let label = name;
            if (settings.ramadanMode && name === 'Maghrib') label = 'Maghrib (Iftar)';
            let detail = isPast ? 'Passed' : 'Upcoming';
            if (name === 'Fajr' && settings.ramadanMode) detail += ` | Suhoor: ${getSuhoorTime(timings['Fajr'])}`;

            items.push({ label: `${icon} ${label}`, description: timeStr, detail: detail });
        }
        vscode.window.showQuickPick(items, { title: `📅 ${hijri.date} — ${city}, ${country}` });
    } catch (err) {
        console.error('[Prayer Time] showSchedule error:', err);
    }
}

async function triggerDailyAyat(settings) {
    if (!settings.dailyAyatEnabled) return;
    const ayah = await fetchRandomAyah();
    if (ayah) {
        vscode.window.showInformationMessage(
            `📖 Ayah of the Day:\n\n${ayah.arabic}\n\n"${ayah.english}"\n\n— ${ayah.reference}`,
            { modal: true }
        );
    }
}

/**
 * Activation
 */
async function activate(context) {
    console.log('[Prayer Time] Activating Ultra Update...');

    // 1. Sidebar Webview
    dashboardProvider = new PrayerDashboardProvider(context.extensionUri, context.globalState);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('prayerTime.dashboard', dashboardProvider)
    );

    // 2. Status Bars
    createStatusBarItems();
    createTasbihItem();

    // 3. Command Registration
    context.subscriptions.push(
        vscode.commands.registerCommand('prayerTime.showSchedule', showScheduleCommand),
        vscode.commands.registerCommand('prayerTime.refresh', async () => {
            invalidateCache();
            clearNotificationHistory();
            vscode.window.showInformationMessage('Refreshing prayer times...');
        }),
        vscode.commands.registerCommand('prayerTime.toggleRamadanMode', () => {
            const config = vscode.workspace.getConfiguration('prayer');
            const current = config.get('ramadanMode', true);
            config.update('ramadanMode', !current, vscode.ConfigurationTarget.Global);
        }),
        vscode.commands.registerCommand('prayerTime.incrementTasbih', () => incrementTasbih()),
        vscode.commands.registerCommand('prayerTime.resetTasbih', () => resetTasbih())
    );

    // 4. Start Ticker
    let lastMinute = -1;

    const tick = async () => {
        try {
            const settings = getConfig();
            const data = await fetchPrayerTimes(settings.city, settings.country, settings.method);
            if (data) {
                const now = new Date();
                const currentMinute = now.getMinutes();
                const currentDay = now.toDateString();

                // 1. Status Bar needs 1s update for the live countdown
                updateUI(data, settings);
                checkNotifications(data, settings, () => setArrivalAlert());

                // 2. Dashboard only needs updates once per minute (it only shows HH:mm)
                // or when the day changes.
                if (currentMinute !== lastMinute || context.globalState.get('lastUpdateDay') !== currentDay) {
                    dashboardProvider.update(data, settings);
                    lastMinute = currentMinute;
                    context.globalState.update('lastUpdateDay', currentDay);
                }
            }
        } catch (err) { console.error('[Prayer Time] Tick error:', err); }
    };

    tick();
    ticker = setInterval(tick, 1000);

    // 5. Daily Ayat
    triggerDailyAyat(getConfig());
}

/**
 * Deactivation
 */
function deactivate() {
    if (ticker) clearInterval(ticker);
    disposeUI();
    disposeTasbih();
}

module.exports = { activate, deactivate };
