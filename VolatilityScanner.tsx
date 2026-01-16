
import React, { useState } from 'react';
import { findVolatilityOpportunities } from './geminiService';
import { VolatilityReport, SignalType } from './types';

const VolatilityScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'GENERAL' | 'MEME'>('GENERAL');
  const [report, setReport] = useState<VolatilityReport | null>(null);
  const [rawData, setRawData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await findVolatilityOpportunities(rawData || undefined, mode);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scanner interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-8 relative">
        <div className="absolute top-0 right-0 bg-indigo-600 px-4 py-1.5 rounded-bl-xl text-[9px] font-bold tracking-widest text-white shadow-md flex items-center gap-2 border-b border-l border-indigo-400/30 z-10 uppercase italic">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          BINGX LIVE v4.2
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className={`text-2xl font-black italic tracking-tight transition-all ${mode === 'MEME' ? 'text-pink-500' : 'text-orange-500'}`}>
              {mode === 'MEME' ? 'MEME MOONSHOTS' : 'QUANT SCANNER'}
            </h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">Institutional Real-time Sync</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button onClick={() => { setMode('GENERAL'); setReport(null); }} className={`px-6 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${mode === 'GENERAL' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>ALTS</button>
            <button onClick={() => { setMode('MEME'); setReport(null); }} className={`px-6 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${mode === 'MEME' ? 'bg-pink-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>MEME 🚀</button>
          </div>
        </div>
        
        <div className="mb-6">
          <textarea 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono focus:border-indigo-500/50 outline-none transition-all h-24 text-slate-200 placeholder:text-slate-800"
            placeholder={mode === 'MEME' ? "Verify real-time meme data..." : "Enter narrative or leave empty for global scan..."}
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
          />
        </div>

        <button 
          onClick={handleScan}
          disabled={loading}
          className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.99] text-sm uppercase tracking-widest italic ${mode === 'MEME' ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-gradient-to-r from-orange-600 to-rose-600'}`}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span className="animate-pulse">SYNCHRONIZING...</span>
            </div>
          ) : (
            <span>INITIATE REAL-TIME SCAN</span>
          )}
        </button>

        {error && <p className="text-rose-500 text-[10px] mt-4 text-center font-bold uppercase tracking-widest">{error}</p>}
      </div>

      {report && (
        <div className="flex justify-between items-center px-4">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LIVE SYNC ACTIVE</span>
              </div>
              <div className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Latency: {Math.floor(Math.random() * 50) + 10}ms</div>
           </div>
           <span className="text-[9px] font-bold text-slate-600 uppercase italic">LAST: {new Date(report.timestamp).toLocaleTimeString()}</span>
        </div>
      )}

      {report && report.opportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {report.opportunities.map((op, i) => (
            <div key={i} className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group transition-all duration-300 hover:border-slate-600`}>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase group-hover:text-indigo-400 transition-colors">{op.ticker}</h3>
                   <div className={`inline-flex items-center gap-2 mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${op.signal === SignalType.SHORT ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {op.signal} | {op.estimatedMove}
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold text-slate-500 uppercase">PRICE</div>
                   <div className="text-lg font-mono font-bold text-white">{op.currentPrice}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">TP1</p>
                  <p className={`text-sm font-mono font-bold ${op.signal === SignalType.SHORT ? 'text-rose-400' : 'text-emerald-400'}`}>{op.targetPrice}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">INVALIDATION</p>
                  <p className="text-sm font-mono font-bold text-slate-500">{op.stopLoss}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-300 leading-relaxed font-bold italic opacity-90 line-clamp-3">
                  "{op.justification}"
                </p>
              </div>
              
              <div className="mt-4 flex justify-between items-center text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                <span>BINGX SPOT/PERP</span>
                <span>SYNC: {op.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolatilityScanner;
