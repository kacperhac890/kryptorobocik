
import React from 'react';
import { ScalpAnalysis, SignalType } from '../types';

interface AnalysisResultProps {
  result: ScalpAnalysis;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  const isLong = result.signal === SignalType.LONG;
  const isShort = result.signal === SignalType.SHORT;

  const getSignalColor = () => {
    if (isLong) return 'text-emerald-400';
    if (isShort) return 'text-rose-400';
    return 'text-amber-400';
  };

  const getSignalBg = () => {
    if (isLong) return 'bg-emerald-500/10 border-emerald-500/30';
    if (isShort) return 'bg-rose-500/10 border-rose-500/30';
    return 'bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TACTICAL COMMAND SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-center">
        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 w-full md:w-auto min-w-[140px] ${getSignalBg()}`}>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">SIGNAL</span>
          <span className={`text-4xl font-black italic tracking-tighter ${getSignalColor()}`}>{result.signal}</span>
        </div>

        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap gap-4">
             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">COMMAND</span>
                <span className={`text-lg font-black italic uppercase ${result.executionType === 'IMMEDIATE' ? 'text-orange-500' : 'text-indigo-400'}`}>
                  {result.actionInstruction}
                </span>
             </div>
             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex-1 min-w-[100px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">LEVERAGE</span>
                <span className="text-lg font-mono font-bold text-white">{result.recommendedLeverage}</span>
             </div>
             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex-1 min-w-[100px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">SIZE</span>
                <span className="text-lg font-mono font-bold text-white">{result.positionSizing}</span>
             </div>
          </div>
          
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl">
             <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">AI ADVICE</span>
             <p className="text-xs font-medium text-slate-300 italic italic leading-relaxed">"{result.systemRiskAdvice}"</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEVELS & SPECS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">TARGET LEVELS</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500">ENTRY</span>
                <span className="text-sm font-mono font-bold text-white">{result.entryPrice}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-500">TP1 (AGG)</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{result.takeProfit}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <span className="text-[10px] font-bold text-emerald-200/60">TP2 (SAFE)</span>
                <span className="text-sm font-mono font-bold text-emerald-200">{result.takeProfitSafe}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/30">
                <span className="text-[10px] font-bold text-rose-500 uppercase">STOP LOSS</span>
                <span className="text-sm font-mono font-bold text-rose-400">{result.stopLoss}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500">RR RATIO</span>
              <span className="text-xs font-bold text-indigo-400">{result.riskRewardRatio}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">INDICATORS</h3>
            <div className="space-y-3">
              {result.indicators.slice(0, 4).map((ind, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">{ind.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300">{ind.value}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${ind.sentiment === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-500' : ind.sentiment === 'BEARISH' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
                      {ind.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ANALYSIS & REASONING */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md h-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 italic">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                MARKET EVIDENCE
              </h3>
              <span className="text-[9px] font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">
                {result.marketStructure} STRUCTURE
              </span>
            </div>

            <div className="space-y-4 mb-8">
              {result.reasoning.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-5 h-5 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-auto">
               <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">LIQUIDITY FLOW</h4>
               <p className="text-xs text-slate-400 italic leading-relaxed">
                  {result.liquidityNarrative}
               </p>
            </div>

            {result.tradeWarning && (
              <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-[10px] font-bold text-rose-400/80 uppercase italic tracking-tight">{result.tradeWarning}</span>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={onReset} className="px-6 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-800 uppercase tracking-widest transition-all">
                NEW SCAN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
