import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Cpu, Layers, Sparkles } from 'lucide-react';
import ClusterBadge from './ClusterBadge';

export default function MaterialCard({ material, onSelectCompare, isCompared }) {
  if (!material) return null;

  const {
    material_id,
    formula,
    cluster,
    band_gap,
    poly_total,
    density,
    volume,
    ionic_polarization_fraction,
  } = material;

  return (
    <div className="group relative bg-[#0D1322]/80 hover:bg-[#121A2D]/95 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-accent-cyan/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-accent-cyan/10 hover:-translate-y-1 hover:scale-[1.01] flex flex-col justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="font-mono text-xs text-accent-cyan font-medium tracking-wider block">
              {material_id}
            </span>
            <h3 className="text-xl font-display font-bold text-white tracking-wide group-hover:text-accent-cyan transition-colors">
              {formula}
            </h3>
          </div>
          <ClusterBadge clusterId={cluster} />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
          <div className="bg-[#070A12]/60 p-2.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <span className="text-slate-400 block text-[10px]">BAND GAP</span>
            <span className="text-white font-semibold text-sm">
              {band_gap !== undefined && band_gap !== null ? `${Number(band_gap).toFixed(2)} eV` : '—'}
            </span>
          </div>

          <div className="bg-[#070A12]/60 p-2.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <span className="text-slate-400 block text-[10px]">PERMITTIVITY (ε)</span>
            <span className="text-white font-semibold text-sm">
              {poly_total !== undefined && poly_total !== null ? Number(poly_total).toFixed(2) : '—'}
            </span>
          </div>

          <div className="bg-[#070A12]/60 p-2.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <span className="text-slate-400 block text-[10px]">DENSITY</span>
            <span className="text-slate-300">
              {density !== undefined && density !== null ? `${Number(density).toFixed(2)} g/cm³` : '—'}
            </span>
          </div>

          <div className="bg-[#070A12]/60 p-2.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <span className="text-slate-400 block text-[10px]">IONIC POLARIZATION</span>
            <span className="text-slate-300">
              {ionic_polarization_fraction !== undefined && ionic_polarization_fraction !== null 
                ? `${(Number(ionic_polarization_fraction) * 100).toFixed(1)}%` 
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
        <Link
          to={`/material/${material_id}`}
          className="flex items-center gap-1 text-slate-300 hover:text-accent-cyan font-medium transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/similarity?id=${material_id}`}
            title="Find similar materials in 6D feature space"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-accent-cyan border border-white/5 transition-all hover:scale-110"
          >
            <Cpu className="w-3.5 h-3.5" />
          </Link>

          {onSelectCompare && (
            <button
              onClick={() => onSelectCompare(material_id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all border ${
                isCompared
                  ? 'bg-accent-violet/30 text-accent-violet border-accent-violet/50'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:border-white/20 hover:scale-105'
              }`}
            >
              {isCompared ? 'Selected' : '+ Compare'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
