# 🕌 Prayer Time Reminder

[![Version](https://img.shields.io/visual-studio-marketplace/v/riflo.prayer-time-reminder)](https://marketplace.visualstudio.com/items?itemName=riflo.prayer-time-reminder)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/riflo.prayer-time-reminder)](https://marketplace.visualstudio.com/items?itemName=riflo.prayer-time-reminder)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/riflo.prayer-time-reminder)](https://marketplace.visualstudio.com/items?itemName=riflo.prayer-time-reminder)

**Professional Islamic prayer reminder with live HH:MM:SS countdown, Hijri date display, and special Ramadan features — right in your VS Code status bar.**

---

## ✨ Features

- 🕒 **Live HH:MM:SS Countdown** — Watch the time tick down every second in your status bar
- 🌙 **Ramadan Mode** — Auto-detects Ramadan, shows **Suhoor** and **Iftar** labels with greetings
- 📅 **Hijri Date** — Displays the current Hijri date right next to the countdown
- 📍 **Auto-Location** — Automatically detects your city via IP if not configured
- 🎨 **Smart UI Colors** — Status bar turns **Yellow** 10 min before prayer, **Red** when it's time
- 🔔 **Popup Notifications** — Get notified for every prayer, Suhoor, and Iftar
- 📋 **Interactive Schedule** — Click the status bar to see today's full prayer schedule


## 🛠️ Commands

Open the Command Palette (`Ctrl+Shift+P`) and search:

| Command | Description |
|---------|-------------|
| `Prayer Time: Show Today's Schedule` | View all prayer times + Hijri date |
| `Prayer Time: Refresh` | Manually refresh from API |
| `Prayer Time: Toggle Ramadan Mode` | Toggle Suhoor/Iftar labels on/off |

---

## ⚙️ Configuration

Add to your `settings.json`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `prayer.city` | `string` | `"Malang"` | City name for prayer time calculation |
| `prayer.country` | `string` | `"Indonesia"` | Country name for prayer time calculation |
| `prayer.method` | `number` | `11` | Calculation method ([see methods](https://aladhan.com/calculation-methods)) |
| `prayer.notifications` | `boolean` | `true` | Enable/disable popup notifications |
| `prayer.ramadanMode` | `boolean` | `true` | Enable Suhoor/Iftar labels and Ramadan greetings |
| `prayer.showHijriDate` | `boolean` | `true` | Show Hijri date in status bar |
| `prayer.showSeconds` | `boolean` | `true` | Show seconds in countdown (HH:MM:SS vs HH:MM) |

### Example

```json
{
  "prayer.city": "Jakarta",
  "prayer.country": "Indonesia",
  "prayer.method": 11,
  "prayer.notifications": true,
  "prayer.ramadanMode": true
}
```

---

## 🕐 Prayers Tracked

| Prayer | Arabic |
|--------|--------|
| Fajr | الفجر |
| Dhuhr | الظهر |
| Asr | العصر |
| Maghrib | المغرب |
| Isha | العشاء |

During **Ramadan**, the extension also tracks:
- ⭐ **Suhoor** (Fajr - 10 minutes)
- 🌙 **Iftar** (Maghrib)

---

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code → Extensions (`Ctrl+Shift+X`)
2. Search **"Prayer Time Reminder"**
3. Click **Install**

Or install directly: [Prayer Time Reminder on Marketplace](https://marketplace.visualstudio.com/items?itemName=riflo.prayer-time-reminder)

### From VSIX
```bash
code --install-extension prayer-time-reminder-1.1.0.vsix
```

### From Source
```bash
git clone https://github.com/Rifuroo/prayer-status.git
cd prayer-status
npm install
```
Then press `F5` in VS Code to launch the Extension Development Host.

---

## 🌐 API

Prayer times are fetched from the [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api), a free and reliable source for Islamic prayer time data worldwide.

---

## 📄 License

MIT © [Rifuroo](https://github.com/Rifuroo)
