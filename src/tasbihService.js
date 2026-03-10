/**
 * Tasbih Service — handles Dhikr counting with persistence.
 */

const vscode = require('vscode');

let tasbihCounter = 0;
let tasbihItem = null;

/**
 * Initialize the Tasbih status bar item.
 * @returns {vscode.StatusBarItem}
 */
function createTasbihItem() {
    tasbihItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
    tasbihItem.command = 'prayerTime.incrementTasbih';
    tasbihItem.tooltip = 'Click to increment Tasbih | Right-click/Command to reset';
    updateTasbihUI();
    tasbihItem.show();
    return tasbihItem;
}

/**
 * Increment the counter and update the UI.
 */
function incrementTasbih() {
    tasbihCounter++;
    updateTasbihUI();
}

/**
 * Reset the counter and update the UI.
 */
function resetTasbih() {
    tasbihCounter = 0;
    updateTasbihUI();
}

/**
 * Update the status bar text.
 */
function updateTasbihUI() {
    if (!tasbihItem) return;
    tasbihItem.text = `📿 Tasbih: ${tasbihCounter}`;
}

function disposeTasbih() {
    if (tasbihItem) {
        tasbihItem.dispose();
        tasbihItem = null;
    }
}

module.exports = {
    createTasbihItem,
    incrementTasbih,
    resetTasbih,
    disposeTasbih
};
