/**
 * Quran Service — fetches random verses from AlQuran.cloud API.
 */

const axios = require('axios');

const API_RANDOM_AYAH = 'https://api.alquran.cloud/v1/ayah/random/editions/quran-uthmani,en.sahih';

/**
 * Fetch a random Ayah with Arabic text and English translation.
 * @returns {Promise<Object|null>} { arabic: string, english: string, reference: string } or null
 */
async function fetchRandomAyah() {
    try {
        const response = await axios.get(API_RANDOM_AYAH, { timeout: 10000 });
        if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
            const arabicData = response.data.data[0];
            const englishData = response.data.data[1];

            return {
                arabic: arabicData.text,
                english: englishData.text,
                reference: `Surah ${arabicData.surah.englishName} [${arabicData.surah.number}:${arabicData.numberInSurah}]`
            };
        }
        return null;
    } catch (error) {
        console.error('[Prayer Time] Failed to fetch random Ayah:', error.message);
        return null;
    }
}

module.exports = {
    fetchRandomAyah
};
