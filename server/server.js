const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HISTORY_FILE = path.join(__dirname, 'history.json');
const FAVORITES_FILE = path.join(__dirname, 'favorites.json');

app.use(cors());
app.use(express.json());

const getFromFile = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveToFile = (filePath, entry, limit = 20) => {
  const data = getFromFile(filePath);
  data.unshift(entry);
  if (data.length > limit) data.pop();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is working fine!' });
});

app.get('/api/voices', (req, res) => {
  const voices = [
    { name: 'English Female', language: 'en', gender: 'Female' },
    { name: 'Hindi Female', language: 'hi', gender: 'Female' }
  ];
  res.status(200).json({ voices });
});

// History Endpoints
app.get('/api/history', (req, res) => {
  try {
    const history = getFromFile(HISTORY_FILE);
    res.status(200).json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

app.delete('/api/history', (req, res) => {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
    res.status(200).json({ success: true, message: 'History cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history.' });
  }
});

// Favorites Endpoints
app.get('/api/favorites', (req, res) => {
  try {
    const favorites = getFromFile(FAVORITES_FILE);
    res.status(200).json({ success: true, favorites });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

app.post('/api/favorites', (req, res) => {
  const { text, language, voice } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  try {
    const favorites = getFromFile(FAVORITES_FILE);
    // Avoid duplicate favorites
    if (!favorites.some(f => f.text === text)) {
      saveToFile(FAVORITES_FILE, { text, language, voice, createdAt: new Date().toISOString() }, 50);
    }
    res.status(200).json({ success: true, favorites: getFromFile(FAVORITES_FILE) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite.' });
  }
});

app.delete('/api/favorites', (req, res) => {
  try {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify([], null, 2));
    res.status(200).json({ success: true, message: 'Favorites cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear favorites.' });
  }
});

// TTS Endpoint
app.post('/api/tts', async (req, res) => {
  const { text, language, voice } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text input cannot be empty.' });
  }
  if (text.length > 500) {
    return res.status(400).json({ error: 'Text exceeds maximum limit of 500 characters.' });
  }

  try {
    const langCode = language ? language.split('-')[0] : 'en';

    const base64Audio = await googleTTS.getAudioBase64(text, {
      lang: langCode,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    });

    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    saveToFile(HISTORY_FILE, {
      text,
      language: language || 'en-US',
      voice: voice || 'English Female',
      createdAt: new Date().toISOString()
    }, 20);

    return res.status(200).json({
      success: true,
      audioUrl: audioUrl
    });
  } catch (err) {
    console.error('TTS Generation Error:', err);
    return res.status(500).json({ error: 'Failed to generate speech audio.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});