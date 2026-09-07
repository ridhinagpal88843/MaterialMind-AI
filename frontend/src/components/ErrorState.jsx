import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`glass-card border-rose-500/30 bg-rose-950/20 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-semibold text-rose-200">Backend Communication Error</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {message || "MaterialMind backend is currently unreachable. Ensure the FastAPI server is running on port 8000."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-mono border border-rose-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          RETRY CONNECTION
        </button>
      )}
    </div>
  );
};

export default ErrorState;
