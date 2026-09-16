import React, { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('history');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [histRes, favRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/favorites')
      ]);
      const histData = await histRes.json();
      const favData = await favRes.json();

      if (histData.success) setHistory(histData.history);
      if (favData.success) setFavorites(favData.favorites);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }
    setError('');
    setLoading(true);
    setAudioUrl('');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice: language === 'hi' ? 'Hindi Female' : 'English Female' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate speech');

      setAudioUrl(data.audioUrl);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleClearFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setFavorites([]);
    } catch (err) {
      console.error('Failed to clear favorites:', err);
    }
  };

  const toggleFavorite = async (item, e) => {
    e.stopPropagation();
    const exists = favorites.some(f => f.text === item.text);

    if (exists) {
      const updatedFavorites = favorites.filter(f => f.text !== item.text);
      setFavorites(updatedFavorites);
    } else {
      try {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.text, language: item.language, voice: item.voice })
        });
        const data = await res.json();
        if (data.success) setFavorites(data.favorites);
      } catch (err) {
        console.error('Failed to add favorite:', err);
      }
    }
  };

  const isFavorite = (itemText) => {
    return favorites.some(f => f.text === itemText);
  };

  const handleSelectItem = (item) => {
    setText(item.text);
    setLanguage(item.language);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-500 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-slate-950/75 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-tr from-pink-500 to-cyan-400 rounded-2xl shadow-lg shadow-pink-500/30 mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            SonicCraft AI
          </h1>
          <p className="text-sm text-slate-300 mt-1">Transform your text into crystal clear professional audio</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-pink-300">Input Text</label>
              <span className="text-xs text-slate-400">{text.length}/500</span>
            </div>
            <textarea
              rows="4"
              maxLength="500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your script here..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 resize-none shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300 mb-2">Voice Model</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3.5 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 shadow-inner"
            >
              <option value="en-US">English (US) - Professional Female</option>
              <option value="hi-IN">Hindi - Natural Female</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:opacity-95 active:scale-[0.99] font-bold py-4 rounded-xl transition-all duration-300 shadow-xl shadow-purple-600/30 disabled:opacity-50 text-white tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Synthesizing Audio...
              </span>
            ) : 'Generate Speech'}
          </button>
        </form>

        {/* Audio Player & Download Output */}
        {audioUrl && (
          <div className="mt-6 p-5 bg-purple-950/60 border border-purple-500/30 rounded-2xl backdrop-blur-md space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Ready to Play</p>
              <a
                href={audioUrl}
                download="soniccraft-speech.mp3"
                className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-cyan-200 border border-cyan-500/40 px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 font-medium shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download MP3
              </a>
            </div>
            <audio controls src={audioUrl} className="w-full accent-cyan-400" autoPlay />
          </div>
        )}

        {/* Tabs Section (History & Favorites) */}
        <div className="mt-8 border-t border-white/15 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('history')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                History ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'favorites'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                Favorites ({favorites.length})
              </button>
            </div>

            {activeTab === 'history' && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full transition-all duration-150 font-medium"
              >
                Clear All
              </button>
            )}

            {activeTab === 'favorites' && favorites.length > 0 && (
              <button
                onClick={handleClearFavorites}
                className="text-xs bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full transition-all duration-150 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* List Display with Toggle & Click-to-Load */}
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {activeTab === 'history' ? (
              history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 bg-slate-900/40 rounded-2xl border border-slate-800">No history records found.</p>
              ) : (
                history.map((item, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleSelectItem(item)}
                    className="p-3.5 bg-slate-900/70 hover:bg-slate-900 border border-white/5 hover:border-cyan-400/50 rounded-xl transition-all duration-200 flex justify-between items-center gap-4 cursor-pointer group"
                  >
                    <p className="text-sm text-slate-200 truncate max-w-[280px] group-hover:text-cyan-200">{item.text}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                        {item.language}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(item, e)}
                        title={isFavorite(item.text) ? 'Remove from Favorites' : 'Add to Favorites'}
                        className={`p-1.5 rounded-xl border transition-all ${
                          isFavorite(item.text)
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-300'
                        }`}
                      >
                        ★
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              favorites.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 bg-slate-900/40 rounded-2xl border border-slate-800">No favorite items saved yet.</p>
              ) : (
                favorites.map((item, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleSelectItem(item)}
                    className="p-3.5 bg-slate-900/70 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-400/60 rounded-xl transition-all duration-200 flex justify-between items-center gap-4 cursor-pointer group"
                  >
                    <p className="text-sm text-slate-200 truncate max-w-[280px] group-hover:text-amber-200">{item.text}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                        ★ Saved
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(item, e)}
                        title="Remove from Favorites"
                        className="p-1.5 rounded-xl border bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;