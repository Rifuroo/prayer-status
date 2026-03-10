/**
 * Prayer time service — fetches from Aladhan API with daily caching and auto IP-location.
 */

const axios = require('axios');
const { PRAYER_NAMES, getTodayKey, cleanTimeStr } = require('./utils');
const { parseHijriData } = require('./hijriService');

const API_BASE = 'https://api.aladhan.com/v1/timingsByCity';
const IP_API = 'http://ip-api.com/json';

// In-memory cache
let cache = {
    dateKey: null,
    locationKey: null,
    data: null,
    hijri: null
};

/**
 * Auto-detect location via IP if city/country are not provided.
 */
async function detectLocation() {
    try {
        const response = await axios.get(IP_API, { timeout: 5000 });
        if (response.data && response.data.status === 'success') {
            return {
                city: response.data.city,
                country: response.data.country
            };
        }
    } catch (err) {
        console.error('[Prayer Time] Location detection failed:', err.message);
    }
    return null;
}

/**
 * Fetch prayer times and Hijri data.
 */
async function fetchPrayerTimes(city, country, method) {
    const todayKey = getTodayKey();

    // If city/country empty, try auto-detect
    if (!city || !country) {
        const loc = await detectLocation();
        if (loc) {
            city = loc.city;
            country = loc.country;
        } else {
            // Fallback defaults if IP detection fails
            city = city || 'Malang';
            country = country || 'Indonesia';
        }
    }

    const locationKey = `${city}-${country}-${method}`;

    if (cache.dateKey === todayKey && cache.locationKey === locationKey && cache.data) {
        return { timings: cache.data, hijri: cache.hijri, city, country };
    }

    try {
        const response = await axios.get(API_BASE, {
            params: { city, country, method },
            timeout: 10000
        });

        if (response.data && response.data.code === 200 && response.data.data) {
            const timings = response.data.data.timings;
            const prayerTimes = {};

            for (const name of PRAYER_NAMES) {
                prayerTimes[name] = cleanTimeStr(timings[name]);
            }

            const hijriData = parseHijriData(response.data.data);

            cache.dateKey = todayKey;
            cache.locationKey = locationKey;
            cache.data = prayerTimes;
            cache.hijri = hijriData;

            return { timings: prayerTimes, hijri: hijriData, city, country };
        }
        return null;
    } catch (error) {
        console.error('[Prayer Time] Fetch failed:', error.message);
        return null;
    }
}

function invalidateCache() {
    cache.dateKey = null;
    cache.data = null;
}

module.exports = {
    fetchPrayerTimes,
    invalidateCache
};
