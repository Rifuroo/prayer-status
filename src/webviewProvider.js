/**
 * Webview Provider — Aesthetic Sidebar Dashboard (v2 - Premium Edition)
 */

const vscode = require('vscode');

class PrayerDashboardProvider {
    constructor(extensionUri, globalState) {
        this._extensionUri = extensionUri;
        this._globalState = globalState;
        this._view = undefined;
        this._data = undefined;
        this._settings = undefined;
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'togglePrayer':
                    const today = new Date().toDateString();
                    let tracker = this._globalState.get('prayerTracker', {});
                    if (!tracker[today]) tracker[today] = {};

                    tracker[today][data.prayer] = data.checked;
                    await this._globalState.update('prayerTracker', tracker);

                    // Refresh UI to sync progress bar
                    this.update(this._data, this._settings);
                    break;
                case 'refresh':
                    vscode.commands.executeCommand('prayerTime.refresh');
                    break;
            }
        });

        if (this._data && this._settings) {
            this.update(this._data, this._settings);
        }
    }

    update(data, settings) {
        if (!this._view) return;
        this._data = data;
        this._settings = settings;

        const today = new Date().toDateString();
        const tracker = this._globalState.get('prayerTracker', {})[today] || {};

        this._view.webview.postMessage({
            type: 'update',
            timings: data.timings,
            hijri: data.hijri,
            city: data.city,
            country: data.country,
            isRamadan: data.hijri.isRamadan && settings.ramadanMode,
            tracker: tracker
        });
    }

    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --bg: var(--vscode-sideBar-background);
            --text: var(--vscode-sideBar-foreground);
            --accent: #4a90e2;
            --accent-gradient: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            --card-bg: var(--vscode-welcomePage-tileBackground);
            --border: var(--vscode-widget-border);
            --success: #2ecc71;
            --warning: #f1c40f;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            padding: 12px;
            margin: 0;
            user-select: none;
        }

        .header-card {
            background: var(--accent-gradient);
            border-radius: 16px;
            padding: 20px 15px;
            color: white;
            text-align: center;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
        }

        .header-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            pointer-events: none;
        }

        .ramadan-badge {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            display: inline-block;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .location {
            font-size: 0.85rem;
            opacity: 0.8;
            margin-bottom: 4px;
        }

        .hijri-date {
            font-size: 1.4rem;
            font-weight: 800;
        }

        .progress-container {
            margin-bottom: 24px;
            padding: 0 5px;
        }

        .progress-label {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            margin-bottom: 8px;
            font-weight: 600;
            opacity: 0.8;
        }

        .progress-bar {
            height: 8px;
            background: var(--card-bg);
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid var(--border);
        }

        .progress-fill {
            height: 100%;
            background: var(--accent);
            width: 0%;
            transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 0 10px var(--accent);
        }

        .section-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.6;
            margin-bottom: 12px;
            padding-left: 5px;
            font-weight: 700;
        }

        .prayer-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .prayer-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .prayer-card:hover {
            border-color: var(--accent);
            transform: scale(1.02);
        }

        .prayer-card.next {
            border: 2px solid var(--accent);
            background: rgba(74, 144, 226, 0.05);
        }

        .prayer-card.completed {
            opacity: 0.7;
            background: rgba(46, 204, 113, 0.05);
        }

        .prayer-main {
            display: flex;
            flex-direction: column;
        }

        .prayer-name {
            font-weight: 700;
            font-size: 0.95rem;
            margin-bottom: 2px;
        }

        .prayer-time {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--accent);
        }

        .status-badge {
            font-size: 0.65rem;
            background: var(--accent);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            width: fit-content;
            margin-top: 4px;
        }

        .check-container {
            width: 28px;
            height: 28px;
            border: 2px solid var(--border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-size: 14px;
        }

        .check-container.active {
            background: var(--success);
            border-color: var(--success);
            color: white;
            box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
        }

        .footer-actions {
            margin-top: 30px;
            display: flex;
            gap: 10px;
        }

        .btn-refresh {
            background: var(--card-bg);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 10px;
            border-radius: 8px;
            width: 100%;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background 0.2s;
        }

        .btn-refresh:hover {
            background: var(--vscode-toolbar-hoverBackground);
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .prayer-card {
            animation: fadeIn 0.4s ease forwards;
        }
    </style>
</head>
<body>
    <div class="header-card">
        <div id="ramadan-badge"></div>
        <div class="location" id="loc-text">Locating...</div>
        <div class="hijri-date" id="date-text">-- : --</div>
    </div>

    <div class="progress-container">
        <div class="progress-label">
            <span>Daily Progress</span>
            <span id="progress-pct">0%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
        </div>
    </div>

    <div class="section-title">Prayer Schedule</div>
    <div class="prayer-list" id="prayer-list">
        <!-- Cards injected via JS -->
    </div>

    <div class="footer-actions">
        <button class="btn-refresh" onclick="refresh()">
            <span>🔄</span> Refresh Times
        </button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

        function refresh() {
            vscode.postMessage({ type: 'refresh' });
        }

        function toggle(prayer, isChecked) {
            vscode.postMessage({ 
                type: 'togglePrayer', 
                prayer: prayer, 
                checked: !isChecked 
            });
        }

        let lastDataStr = '';

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.type === 'update') {
                const { timings, hijri, city, country, isRamadan, tracker } = msg;
                
                // Prevent flicker: Only re-render if something actually changed
                const currentDataStr = JSON.stringify({ timings, date: hijri.date, tracker });
                if (currentDataStr === lastDataStr) return;
                lastDataStr = currentDataStr;

                // Header
                document.getElementById('loc-text').innerText = city + ', ' + country;
                document.getElementById('date-text').innerText = hijri.date;
                document.getElementById('ramadan-badge').innerHTML = isRamadan ? '<span class="ramadan-badge">🌙 Ramadan</span>' : '';

                // List
                const list = document.getElementById('prayer-list');
                list.innerHTML = '';
                
                let completedCount = 0;
                const now = new Date();
                let nextPrayerFound = false;

                PRAYERS.forEach((p, index) => {
                    const isChecked = tracker[p] || false;
                    if (isChecked) completedCount++;

                    // Determine "Next" prayer
                    const [h, m] = timings[p].split(':').map(Number);
                    const pTime = new Date();
                    pTime.setHours(h, m, 0, 0);
                    
                    let statusClass = '';
                    let badgeText = '';
                    
                    if (!nextPrayerFound && pTime > now) {
                        statusClass = 'next';
                        badgeText = '<div class="status-badge">Next</div>';
                        nextPrayerFound = true;
                    }
                    if (isChecked) statusClass += ' completed';

                    const card = document.createElement('div');
                    card.className = 'prayer-card ' + statusClass;
                    card.style.animationDelay = (index * 0.05) + 's';
                    card.onclick = () => toggle(p, isChecked);
                    
                    card.innerHTML = \`
                        <div class="prayer-main">
                            <span class="prayer-name">\${p}</span>
                            <span class="prayer-time">\${timings[p]}</span>
                            \${badgeText}
                        </div>
                        <div class="check-container \${isChecked ? 'active' : ''}">
                            \${isChecked ? '✔' : ''}
                        </div>
                    \`;
                    list.appendChild(card);
                });

                // Progress
                const pct = Math.round((completedCount / PRAYERS.length) * 100);
                document.getElementById('progress-pct').innerText = pct + '%';
                document.getElementById('progress-fill').style.width = pct + '%';
            }
        });
    </script>
</body>
</html>`;
    }
}

module.exports = { PrayerDashboardProvider };
