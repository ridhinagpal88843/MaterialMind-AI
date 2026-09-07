import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "INITIALIZING MATERIAL DATA...", count = 4 }) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center space-y-6">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute w-8 h-8 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <Loader2 className="w-4 h-4 text-cyan-400 animate-pulse absolute" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="font-mono text-xs text-cyan-400 tracking-widest uppercase animate-pulse">{message}</p>
        <p className="text-xs text-slate-500">Querying MaterialMind FastAPI Engine...</p>
      </div>

      {count > 0 && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 opacity-40">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl space-y-3 animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded w-1/3" />
              <div className="h-6 bg-slate-700/40 rounded w-2/3" />
              <div className="space-y-1.5 pt-2">
                <div className="h-3 bg-slate-700/30 rounded w-full" />
                <div className="h-3 bg-slate-700/30 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingState;
