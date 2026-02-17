# 🎵 YouTube Lyrics Modal – Userscript

A floating, draggable lyrics panel for YouTube videos.  
Paste, save, export and import song lyrics without leaving the video page.

Perfect for reading lyrics while listening to music without switching tabs.

---

## ✨ Features

- 🎤 Adds a **Lyrics button** inside `#owner` (next to Subscribe area)
- 🪟 Draggable modal (no overlay)
- 💾 Auto-save lyrics per video (using `localStorage`)
- 📦 Export all saved lyrics + URLs to JSON
- 📥 Import JSON backup
- 🧩 Collapsible top toolbar
- 🔒 Data stored locally in your browser only

---

## 📸 What It Does

When you're watching a video on:

👉 https://www.youtube.com/watch?v=...

You’ll see a new **Lyrics** button near the channel owner section.

Click it and a movable modal appears where you can:

- Paste lyrics
- Save them
- Automatically reload them next time you visit the same video
- Export everything as backup
- Import previous backups

---

## 🧠 How It Works

The script:

- Detects video page changes (SPA navigation support)
- Uses `localStorage` with this structure:

```json
{
  "videoId": {
    "url": "https://www.youtube.com/watch?v=XXXX",
    "lyrics": "Song lyrics text..."
  }
}
```

Everything is stored locally in your browser.

No servers.  
No external APIs.  
No tracking.

---

## 📦 Installation

### 1️⃣ Install Tampermonkey

- Chrome / Firefox / Edge: https://tampermonkey.net

---

### 2️⃣ Create a new script

Paste the full userscript code.

Make sure your header includes:

```js
// @match        https://www.youtube.com/*
// @grant        none
```

Save.

Refresh YouTube.

Done.

---

## 💾 Export Backup

Click:

Toolbar → Export JSON

This downloads a file like:

```
youtube-lyrics-backup.json
```

---

## 📥 Import Backup

Click:

Toolbar → Import JSON

Select your backup file.

Your lyrics will be restored instantly.

---

## 🛠 Storage Details

Key used in `localStorage`:

```
yt-lyrics-storage
```

You can inspect it in:

DevTools → Application → Local Storage → youtube.com

---

## 🚀 Future Improvements (Ideas)

- 🔍 Auto-search lyrics from Genius
- 🌐 Auto-translate lyrics
- 🎨 Dark / Light theme toggle
- 📝 Markdown support
- 📌 Pin mode

---

## ⚠️ Notes

- Works only on video pages
- Data is local per browser
- Clearing browser storage will remove lyrics (unless exported)

---

## 🧑‍💻 Author

Personal productivity project for better music immersion.

---

## 📜 License

MIT – Free to modify and improve.
