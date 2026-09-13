# 🎙️ SonicCraft AI

A modern, high-performance full-stack Text-to-Speech (TTS) web application built with **React**, **Node.js**, and **Google TTS API**. Transform written scripts into crystal-clear audio with an immersive glassmorphism UI.

---

### ✨ Key Features
- 🗣️ **Instant Voice Synthesis:** Convert text up to 500 characters into natural audio.
- 🌍 **Multilingual Support:** Switch effortlessly between English (US) and Hindi voices.
- 🎧 **Interactive Audio Player:** Built-in controls with a one-click **MP3 Download** option.
- 🕒 **Persistent History:** Automatically saves recent text generations locally via JSON.
- ⭐ **Favorites & Bookmarks:** Save your best scripts so they never get lost when clearing history.
- 🎨 **Sleek UI/UX:** Styled with Tailwind CSS featuring vibrant gradients and smooth animations.

---

### 🛠️ Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js, REST API
* **Engine:** `google-tts-api` (Base64 audio streaming)
* **Storage:** Local JSON file persistence (`history.json`, `favorites.json`)

---

### 🚀 Quick Start
```bash
# 1. Clone the repository
git clone [ https://github.com/Anshika55517/Text-to-Speech.git]( https://github.com/Anshika55517/Text-to-Speech.git)
cd text-to-speech

# 2. Run Backend Server
cd server && npm install && node server.js

# 3. Run Frontend Client (in a new terminal)
cd client && npm install && npm run dev

