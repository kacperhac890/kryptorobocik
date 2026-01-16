
import React, { useState, useRef, useEffect } from 'react';
import { analyzeChart, analyzeChartFromLink } from 'geminiService';
import { ScalpAnalysis, AnalysisRecord, SignalType, TradingStyle } from 'types';
import AnalysisResult from 'AnalysisResult';
import HistoryList from 'HistoryList';
import VolatilityScanner from 'VolatilityScanner';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYZER' | 'SCANNER'>('ANALYZER');
  const [analyzerMode, setAnalyzerMode] = useState<'IMAGE' | 'LINK'>('IMAGE');
  const [tradingStyle, setTradingStyle] = useState<TradingStyle>('CONSERVATIVE');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chartUrl, setChartUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScalpAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scalp_history_v3');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Storage corrupted.");
      }
    }

    const handleGlobalPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setSelectedImage(e.target?.result as string);
              setAnalyzerMode('IMAGE');
              setResult(null);
              setError(null);
              setActiveTab('ANALYZER');
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const saveToHistory = (newAnalysis: ScalpAnalysis, image: string) => {
    const record: AnalysisRecord = { id: crypto.randomUUID(), timestamp: Date.now(), image, analysis: newAnalysis };
    setHistory(prev => {
      const updated = [record, ...prev].slice(0, 10);
      localStorage.setItem('scalp_history_v3', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      let analysis: ScalpAnalysis;
      if (analyzerMode === 'IMAGE' && selectedImage) {
        analysis = await analyzeChart(selectedImage, tradingStyle);
        saveToHistory(analysis, selectedImage);
      } else if (analyzerMode === 'LINK' && chartUrl) {
        analysis = await analyzeChartFromLink(chartUrl, tradingStyle);
        saveToHistory(analysis, ''); 
      } else {
        throw new Error("Brak danych.");
      }
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd krytyczny silnika.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setChartUrl('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight italic">BINGX <span className="text-indigo-500">QUANT</span></h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">v5.0 Tactical</p>
            </div>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setActiveTab('ANALYZER')}
              className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ANALYZER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              ANALYZER
            </button>
            <button 
              onClick={() => setActiveTab('SCANNER')}
              className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'SCANNER' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              SCANNER
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === 'ANALYZER' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9 space-y-6">
              {!result && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-sm font-bold flex items-center gap-2 italic">
                      <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                      CONFIG
                    </h2>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button onClick={() => setTradingStyle('CONSERVATIVE')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tradingStyle === 'CONSERVATIVE' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>CONSERVATIVE</button>
                      <button onClick={() => setTradingStyle('AGGRESSIVE')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tradingStyle === 'AGGRESSIVE' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>AGGRESSIVE</button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-2 mb-6">
                      <button onClick={() => setAnalyzerMode('IMAGE')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${analyzerMode === 'IMAGE' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>IMAGE</button>
                      <button onClick={() => setAnalyzerMode('LINK')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${analyzerMode === 'LINK' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>LINK</button>
                    </div>

                    {analyzerMode === 'IMAGE' ? (
                      !selectedImage ? (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-800 rounded-xl p-10 text-center hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer">
                          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l-3 3m0 0l-3-3m3 3V3m0 18a9 9 0 110-18 9 9 0 010 18z" /></svg>
                          </div>
                          <p className="text-sm font-bold text-slate-300 uppercase italic">DROP CHART HERE</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase">OR PASTE (CTRL+V)</p>
                          <input type="file" ref={fileInputRef} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onloadend = () => setSelectedImage(r.result as string);
                              r.readAsDataURL(file);
                            }
                          }} accept="image/*" className="hidden" />
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-black/40">
                          <img src={selectedImage} alt="Input" className="w-full h-auto max-h-[400px] object-contain" />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button onClick={reset} className="bg-slate-900/80 p-2 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          {!analyzing && (
                            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-center">
                              <button onClick={handleAnalyze} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase italic shadow-lg transform active:scale-95 transition-all">
                                ANALYZE {tradingStyle}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="space-y-4">
                        <input type="text" placeholder="Paste TradingView link..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono outline-none text-slate-300 focus:border-indigo-500/50 transition-all" value={chartUrl} onChange={(e) => setChartUrl(e.target.value)} />
                        {!analyzing && chartUrl && (
                          <button onClick={handleAnalyze} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold uppercase italic tracking-widest transition-all text-xs">ANALYZE LINK ({tradingStyle})</button>
                        )}
                      </div>
                    )}

                    {error && <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold">{error}</div>}
                    {analyzing && (
                      <div className="mt-6 space-y-4">
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 animate-[progress_3s_ease-in-out_infinite] origin-left"></div>
                        </div>
                        <p className="text-center text-indigo-400 font-bold uppercase text-[10px] animate-pulse italic">PROCESSING TACTICAL PLAN...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {result && <AnalysisResult result={result} onReset={reset} />}
            </div>
            
            <div className="lg:col-span-3">
              <HistoryList history={history} onSelect={(h) => {
                setResult(h.analysis);
                if (h.image) { setSelectedImage(h.image); setAnalyzerMode('IMAGE'); } else { setAnalyzerMode('LINK'); }
              }} />
            </div>
          </div>
        ) : (
          <VolatilityScanner />
        )}
      </main>

      <footer className="mt-auto border-t border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">BingX Quant Core v5.0 Tactical</p>
          <p className="text-slate-800 text-[8px] uppercase font-bold tracking-tight text-center italic">Not financial advice. Use Stop-Loss at all times.</p>
        </div>
      </footer>

      <style>{`
        @keyframes progress { 0% { transform: scaleX(0); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(1); } }
      `}</style>
    </div>
  );
};

export default App;
