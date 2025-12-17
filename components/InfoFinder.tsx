import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';
import { lookupMediaInfo } from '../services/geminiService';

const InfoFinder: React.FC = () => {
  const [mode, setMode] = useState<'streaming' | 'israeli'>('streaming');
  const [query, setQuery] = useState('');
  const [searchCurrentAiring, setSearchCurrentAiring] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // validation only if not in "current airing" discovery mode
    if (!searchCurrentAiring && !query.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // If searchCurrentAiring is true, query is ignored by service
      const data = await lookupMediaInfo(query, mode, searchCurrentAiring);
      setResult(data);
    } catch (err) {
      setError("Failed to fetch info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse **bold** text from Gemini and preserve newlines
  const renderResult = (text: string) => {
    // Split by **text** patterns
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-black text-cartoon-blue">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <Card title="Quick Info Finder" color="bg-cartoon-purple" className="mb-6 text-black">
        
        {/* Toggle Mode */}
        <div className="flex bg-black p-1 rounded-lg mb-4">
          <button
            onClick={() => { setMode('streaming'); setResult(null); setSearchCurrentAiring(false); }}
            className={`flex-1 py-3 text-lg font-bold rounded-md transition-colors ${mode === 'streaming' ? 'bg-cartoon-yellow text-black' : 'text-white hover:text-gray-300'}`}
          >
            Streaming 📺
          </button>
          <button
            onClick={() => { setMode('israeli'); setResult(null); }}
            className={`flex-1 py-3 text-lg font-bold rounded-md transition-colors ${mode === 'israeli' ? 'bg-cartoon-blue text-black' : 'text-white hover:text-gray-300'}`}
          >
            Israeli TV 🇮🇱
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <label className="block font-bold mb-2 text-lg text-black">
              {mode === 'streaming' ? 'Movie / Series Name' : 'Israeli Series Name'}
            </label>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'streaming' ? "e.g. Breaking Bad" : "e.g. Fauda"}
              disabled={mode === 'israeli' && searchCurrentAiring}
              className={`w-full border-2 border-black rounded-xl p-4 text-xl text-white placeholder-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-yellow-400 ${mode === 'israeli' && searchCurrentAiring ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-black'}`}
            />
          </div>

          {/* Israeli Option: Check All Channels (Discovery Mode) */}
          {mode === 'israeli' && (
            <div className="bg-white/50 p-3 rounded-lg border-2 border-black/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={searchCurrentAiring}
                  onChange={(e) => setSearchCurrentAiring(e.target.checked)}
                  className="w-6 h-6 border-2 border-black rounded text-cartoon-blue focus:ring-cartoon-yellow cursor-pointer"
                />
                <span className="font-bold text-black text-lg leading-tight">
                  Discover currently airing series <span className="text-red-500 font-extrabold text-sm ml-1 uppercase tracking-wider">(Beta)</span><br/>
                  <span className="text-xs font-normal opacity-75">(Ignores name input, searches all channels)</span>
                </span>
              </label>
            </div>
          )}

          <Button type="submit" variant="secondary" disabled={loading || (!searchCurrentAiring && !query.trim())} className="mt-2 w-full justify-center text-xl py-4">
            {loading ? 'Searching...' : (mode === 'israeli' && searchCurrentAiring ? 'Show Current Series 📋' : 'Find Info 🔎')}
          </Button>
        </form>
      </Card>

      {/* Results Area */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card color="bg-white" className="border-2 border-black shadow-hard">
            <h3 className="font-black text-xl mb-3 text-cartoon-dark border-b-2 border-gray-200 pb-2">Result:</h3>
            {/* whitespace-pre-wrap ensures the \n from API creates a new line */}
            <p className="text-md font-medium leading-relaxed text-black whitespace-pre-wrap">
              {renderResult(result)}
            </p>
          </Card>
        </div>
      )}

      {error && (
        <Card color="bg-red-100" className="mt-4 border-red-500">
          <p className="text-red-800 font-bold text-lg">{error}</p>
        </Card>
      )}
    </div>
  );
};

export default InfoFinder;