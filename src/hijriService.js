/**
 * Hijri Service — extracts Hijri date and detects Ramadan month.
 */

/**
 * Parse Hijri data from Aladhan API response.
 * @param {Object} apiData - The 'data' object from Aladhan API response
 * @returns {Object} { date: string, month: number, isRamadan: boolean }
 */
function parseHijriData(apiData) {
    if (!apiData || !apiData.date || !apiData.date.hijri) {
        return { date: '---', month: 0, isRamadan: false };
    }

    const hijri = apiData.date.hijri;
    const day = hijri.day;
    const monthName = hijri.month.en;
    const monthNum = hijri.month.number; // Ramadan is 9
    const year = hijri.year;

    return {
        date: `${day} ${monthName} ${year}`,
        month: monthNum,
        isRamadan: monthNum === 9
    };
}

module.exports = {
    parseHijriData
};
