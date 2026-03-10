/**
 * Notifier module — handles popup notifications, Ramadan greetings, sounds, and Doa.
 */

const vscode = require('vscode');
const { parseTime, getTodayKey, getSuhoorTime } = require('./utils');

let notifiedToday = {};
let lastDate = null;
let greetedRamadanYear = null;

const DOA_AFTER_ADZAN = {
    arabic: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
    transliteration: "Allahumma Rabba hadhihid-da'watit-tammah, was-salatil-qa'imah, 'ati Muhammadanil-wasilata wal-fadhilah, wab'athhu maqamam-mahmudanil-ladhi wa'adtah.",
    translation: "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and favor, and raise him to the honored station You have promised him."
};

/**
 * Play a notification sound by opening a beep command or a vscode-compatible sound.
 * Note: VS Code doesn't have a native 'playSound' API, so we use a system alert via showInformationMessage with custom logic.
 */
function playAdzanSound(settings) {
    if (!settings.playAdzanSound) return;
    // We can use the system default notification sound that comes with showInformationMessage.
    // In more advanced cases, one could use a library, but to keep it zero-dep, we rely on VS Code's native beep.
    vscode.commands.executeCommand('workbench.action.playAudioCue.onDebugBreak'); // Using a built-in audio cue
}

function showDoaAfterAdzan() {
    vscode.window.showInformationMessage(
        `📜 Doa After Adzan:\n\n${DOA_AFTER_ADZAN.arabic}\n\n${DOA_AFTER_ADZAN.transliteration}\n\n${DOA_AFTER_ADZAN.translation}`,
        { modal: true }
    );
}

function checkNotifications(data, settings, onArrival) {
    if (!data || !settings.notifications) return;

    const today = getTodayKey();
    if (lastDate !== today) {
        notifiedToday = {};
        lastDate = today;
    }

    // Ramadan Greeting
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
            onArrival(); // Red color highlight

            const label = (settings.ramadanMode && name === 'Maghrib') ? 'Iftar' : name;

            // Notification with Sound
            playAdzanSound(settings);

            vscode.window.showInformationMessage(`🕌 It's time for ${label} (${timeStr})`, 'Show Doa').then(selection => {
                if (selection === 'Show Doa') {
                    showDoaAfterAdzan();
                }
            });
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
