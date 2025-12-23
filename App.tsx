import React, { useState, useCallback } from 'react';
import { FavoriteItem, Recommendation } from './types';
import { getRecommendations, getWorksByCreator } from './services/geminiService';
import InputForm from './components/InputForm';
import ItemList from './components/ItemList';
import Card from './components/Card';
import Button from './components/Button';
import InfoFinder from './components/InfoFinder';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vibe' | 'info'>('vibe');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (item: FavoriteItem) => {
    setFavorites((prev) => [item, ...prev]);
  };

  const handleRemove = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGetRecommendations = useCallback(async () => {
    if (favorites.length === 0) return;
    
    setLoading(true);
    setError(null);
    setRecommendations([]); // Clear previous

    try {
      const result = await getRecommendations(favorites);
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  const handleLoadMore = useCallback(async () => {
    if (favorites.length === 0) return;
    
    setLoading(true);
    setError(null);
    // Do NOT clear previous recommendations here

    try {
      // Pass existing titles to exclude
      const excludeTitles = recommendations.map(r => r.title);
      const result = await getRecommendations(favorites, excludeTitles);
      
      // Append new recommendations
      setRecommendations(prev => [...prev, ...result.recommendations]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [favorites, recommendations]);

  const handleMoreByCreator = async (creator: string, category: string, currentTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWorksByCreator(creator, category, currentTitle);
      if (result.recommendations.length === 0) {
        setError(`Couldn't find more works by ${creator}`);
      } else {
        // Append these with a little tweak to reason if needed, but for now just append
        const taggedRecs = result.recommendations.map(r => ({
          ...r,
          reason: `More by ${creator}: ${r.reason}`
        }));
        setRecommendations(prev => [...prev, ...taggedRecs]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFavorites([]);
    setRecommendations([]);
    setError(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <div className="bg-white/90 p-4 rounded-2xl border-2 border-black shadow-hard inline-block backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#FFD93D" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6.5 17H20" />
            </svg>
            <h1 className="text-4xl md:text-6xl font-black text-cartoon-dark drop-shadow-[2px_2px_0_rgba(255,217,61,1)] tracking-tighter">
              PopCulture Pal
            </h1>
          </div>
          <p className="text-md md:text-lg font-bold text-gray-800">
            Your Personal Media Assistant
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <Button 
          onClick={() => setActiveTab('vibe')} 
          variant={activeTab === 'vibe' ? 'primary' : 'secondary'}
          className="text-lg"
        >
          ✨ Vibe Matcher
        </Button>
        <Button 
          onClick={() => setActiveTab('info')} 
          variant={activeTab === 'info' ? 'primary' : 'secondary'}
          className="text-lg"
        >
          🔍 Info Finder
        </Button>
      </div>

      <main className="max-w-4xl mx-auto">
        {activeTab === 'vibe' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Input and List */}
            <section className="flex flex-col gap-6">
              <InputForm onAdd={handleAdd} />
              
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <h2 className="text-2xl font-bold border-b-4 border-cartoon-yellow inline-block text-black bg-white/80 px-2">Your Collection</h2>
                  {favorites.length > 0 && (
                    <button onClick={handleReset} className="text-xs font-bold underline hover:text-red-500 text-black bg-white/80 px-1">
                      Reset All
                    </button>
                  )}
                </div>
                <ItemList items={favorites} onRemove={handleRemove} />
              </div>
            </section>

            {/* Right Column: Recommendations */}
            <section className="flex flex-col gap-6">
               <div className="sticky top-4 z-10">
                 <Button 
                  onClick={handleGetRecommendations} 
                  disabled={loading || favorites.length === 0}
                  className={`w-full text-xl py-4 flex items-center justify-center gap-2 ${loading ? 'animate-pulse' : ''} ${favorites.length > 0 ? 'bg-cartoon-green' : 'bg-gray-300'}`}
                 >
                   {loading && recommendations.length === 0 ? (
                     <>
                       <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Thinking...
                     </>
                   ) : (
                     <>
                       <span>✨ Match My Vibe!</span>
                     </>
                   )}
                 </Button>
               </div>

               {error && (
                 <Card color="bg-red-100" className="border-red-500 text-black">
                   <p className="font-bold">Error:</p>
                   <p>{error}</p>
                 </Card>
               )}

               {recommendations.length > 0 && (
                 <div className="animate-in slide-in-from-bottom-5 fade-in duration-500">
                   <div className="bg-cartoon-purple text-black p-4 border-2 border-black shadow-hard rounded-xl mb-4 transform -rotate-1">
                     <h2 className="text-2xl font-black text-center uppercase tracking-widest">Top Picks</h2>
                   </div>
                   
                   <div className="space-y-4">
                     {recommendations.map((rec, index) => (
                       <Card key={index} className="hover:-translate-y-1 transition-transform duration-300 bg-white">
                         <div className="flex items-start gap-3">
                           <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">
                             {index + 1}
                           </div>
                           <div className="w-full">
                             <span className="text-xs font-black uppercase tracking-wide text-gray-600 block mb-1">
                               {rec.category}
                             </span>
                             <h3 className="text-xl font-bold mb-0 text-black">{rec.title}</h3>
                             {rec.creator && (
                               <p className="text-sm font-bold text-gray-500 mb-2">by {rec.creator}</p>
                             )}
                             <p className="text-sm text-gray-800 italic border-l-4 border-cartoon-yellow pl-3 leading-relaxed mt-2">
                               "{rec.reason}"
                             </p>
                             
                             {/* New: "More by this creator" Button - Enabled for all categories if creator exists */}
                             {rec.creator && !rec.reason.startsWith('More by') && (
                               <div className="mt-3 text-right">
                                 <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleMoreByCreator(rec.creator!, rec.category, rec.title)}
                                    className="border-dashed"
                                    disabled={loading}
                                 >
                                    More by {rec.creator} +
                                 </Button>
                               </div>
                             )}
                           </div>
                         </div>
                       </Card>
                     ))}
                   </div>
                   
                   {/* Load More Button */}
                   <div className="mt-6 text-center">
                     <Button 
                       onClick={handleLoadMore} 
                       disabled={loading}
                       variant="secondary"
                       className="w-full text-lg py-3 border-dashed"
                     >
                       {loading ? 'Finding more gems...' : '➕ Give me more!'}
                     </Button>
                   </div>

                 </div>
               )}

               {favorites.length > 0 && recommendations.length === 0 && !loading && !error && (
                 <div className="hidden md:block text-center p-8 bg-white border-2 border-black border-dashed rounded-xl">
                   <p className="font-bold text-gray-500 rotate-1">
                     Results will appear here...
                   </p>
                 </div>
               )}
            </section>
          </div>
        ) : (
          /* Info Finder Tab */
          <div className="flex justify-center items-start min-h-[400px]">
             <InfoFinder />
          </div>
        )}
      </main>

      <footer className="mt-16 flex justify-center pb-4">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => window.open('https://pix-media.com/', '_blank')}
          className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-hard-sm font-bold text-xs uppercase tracking-widest hover:bg-white"
        >
          Pix Media 🌐
        </Button>
      </footer>
    </div>
  );
};

export default App;