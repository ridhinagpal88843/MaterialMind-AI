import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const ScientificDisclaimer = ({ 
  mode = 'recommendation', 
  className = '', 
  compact = false,
  customSecondary = null 
}) => {
  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-md text-amber-200/90 text-sm ${
        compact ? 'p-3' : 'p-4'
      } ${className}`}
      role="region"
      aria-label="Scientific Disclaimer"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-display font-semibold tracking-wider text-amber-300 text-xs uppercase">
            HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION.
          </p>
          <p className="text-xs leading-relaxed text-amber-200/80">
            MaterialMind uses DFT-computed material descriptors and heuristic scoring to identify candidate materials.
            Results are intended for screening and exploration, not as experimental validation or direct prediction of device-level performance.
          </p>
          {(mode === 'similarity' || customSecondary) && (
            <p className="text-xs leading-relaxed text-amber-200/80 mt-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 inline text-amber-400" />
              {customSecondary || 'Similarity is a relative geometric proximity measure in standardized feature space, not a probability of physical equivalence.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScientificDisclaimer;
