/**
 * Countdown Logic — central ticker for 1-second live updates.
 */

const { fetchPrayerTimes } = require('./prayerService');
const { updateUI, setArrivalAlert } = require('./statusBar');
const { checkNotifications } = require('./notifier');

let ticker = null;

/**
 * Start the live ticker.
 */
function startTicker(settingsGetter) {
    stopTicker();

    const tick = async () => {
        try {
            const settings = settingsGetter();
            const data = await fetchPrayerTimes(settings.city, settings.country, settings.method);

            updateUI(data, settings);
            checkNotifications(data, settings, () => {
                setArrivalAlert();
            });
        } catch (err) {
            console.error('[Prayer Time] Tick error:', err);
        }
    };

    // Initial tick
    tick();

    // 1-second interval
    ticker = setInterval(tick, 1000);
}

function stopTicker() {
    if (ticker) {
        clearInterval(ticker);
        ticker = null;
    }
}

module.exports = {
    startTicker,
    stopTicker
};
