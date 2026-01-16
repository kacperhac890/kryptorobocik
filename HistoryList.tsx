
import React from 'react';
import { AnalysisRecord, SignalType } from './types';

interface HistoryListProps {
  history: AnalysisRecord[];
  onSelect: (record: AnalysisRecord) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-fit">
      <div className="p-4 border-b border-slate-800 bg-slate-900/40">
        <h2 className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-slate-400 italic">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          HISTORY LOGS
        </h2>
      </div>

      <div className="divide-y divide-slate-800/40 max-h-[500px] overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-700">
            <p className="text-[10px] uppercase font-bold tracking-widest">EMPTY BUFFER</p>
          </div>
        ) : (
          history.map((record) => (
            <button
              key={record.id}
              onClick={() => onSelect(record)}
              className="w-full p-4 flex gap-4 hover:bg-indigo-500/5 transition-all text-left group"
            >
              <div className="w-14 h-10 bg-slate-950 rounded-lg border border-slate-800 flex-shrink-0 overflow-hidden relative">
                {record.image ? (
                  <img src={record.image} alt="Chart" className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800 italic text-[8px] font-black uppercase">LINK</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded italic ${
                    record.analysis.signal === SignalType.LONG ? 'text-emerald-500 bg-emerald-500/10' : 
                    record.analysis.signal === SignalType.SHORT ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 bg-slate-800'
                  }`}>
                    {record.analysis.signal}
                  </span>
                  <span className="text-[8px] text-slate-600 font-bold uppercase">
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                  {record.analysis.entryPrice}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default HistoryList;
