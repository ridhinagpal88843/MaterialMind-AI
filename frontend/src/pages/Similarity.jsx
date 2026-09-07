import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Cpu, 
  Search, 
  Info, 
  ArrowRight, 
  Layers, 
  Compass, 
  Sparkles,
  GitCompare,
  Sliders
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getSimilarMaterials } from '../api';
import ClusterBadge from '../components/ClusterBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ScientificDisclaimer from '../components/ScientificDisclaimer';

const VERIFIED_SAMPLES = [
  { id: 'mp-8062', formula: 'SiC', tag: 'Wide Gap' },
  { id: 'mp-830', formula: 'GaN', tag: 'Direct Gap' },
  { id: 'mp-1602', formula: 'SiS2', tag: 'Dielectric' },
  { id: 'mp-468', formula: 'AlF3', tag: 'Insulator' },
  { id: 'mp-871', formula: 'FeSi', tag: 'Dense Intermetallic' },
];

export default function Similarity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || 'mp-8062';

  const [queryInput, setQueryInput] = useState(initialId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(5);

  const runSearch = (idOrFormula, n = 5) => {
    if (!idOrFormula.trim()) return;
    setLoading(true);
    setError(null);

    const isId = idOrFormula.trim().toLowerCase().startsWith('mp-');
    const payload = {
      topN: n,
      ...(isId ? { materialId: idOrFormula.trim() } : { formula: idOrFormula.trim() }),
    };

    getSimilarMaterials(payload)
      .then((res) => {
        const resData = res.data || res;
        setData(resData);
        setLoading(false);
        if (resData?.query_material?.material_id) {
          setSearchParams({ id: resData.query_material.material_id }, { replace: true });
        }
      })
      .catch((err) => {
        console.error('Error in similarity search:', err);
        setError(err.response?.data?.detail || err.message || `No material matching "${idOrFormula}" found.`);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialId) {
      runSearch(initialId, topN);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(queryInput, topN);
  };

  const queryMat = data?.query_material;
  const queryProps = queryMat?.raw_properties || queryMat || {};
  const neighborsList = data?.neighbors || data?.similar_materials || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          <span>Standardized 6D Feature Space Nearest Neighbors</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Material Similarity Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Given a selected query material, calculates Euclidean distance across standardized 6-feature descriptors to identify nearest geometric analogues in the 1,056-material database.
        </p>
      </div>

      {/* Prominent Scientific Disclaimer */}
      <ScientificDisclaimer
        customSecondary="Similarity is a relative geometric proximity measure in standardized feature space, not a probability of physical equivalence."
      />

      {/* Query Search Form */}
      <div className="bg-space-card/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Material ID (e.g. mp-8062) or Formula (e.g. SiC, GaN)..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full bg-[#0D1322] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors font-mono shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={topN}
              onChange={(e) => {
                const newN = parseInt(e.target.value, 10);
                setTopN(newN);
                if (queryMat?.material_id) {
                  runSearch(queryMat.material_id, newN);
                }
              }}
              className="bg-[#0D1322] border border-white/20 rounded-xl px-3 py-3 text-xs font-mono text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
            >
              <option value="5">Top 5 Neighbors</option>
              <option value="10">Top 10 Neighbors</option>
              <option value="20">Top 20 Neighbors</option>
            </select>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-violet text-space-dark font-display font-bold text-xs tracking-wider shadow-lg shadow-accent-cyan/20 hover:scale-105 active:scale-95 transition-all"
            >
              FIND ANALOGUES
            </button>
          </div>
        </form>

        {/* Quick Sample Verified Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs font-mono">
          <span className="text-slate-500 text-[11px] mr-1">Sample Queries:</span>
          {VERIFIED_SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setQueryInput(s.id);
                runSearch(s.id, topN);
              }}
              className="px-2.5 py-1 rounded-lg bg-space-surface hover:bg-white/10 text-slate-300 hover:text-accent-cyan border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <span className="font-semibold text-white">{s.formula}</span>
              <span className="text-[10px] text-slate-400">({s.id})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute inset-0 rounded-full border border-accent-cyan/30 animate-pulse" />
            <div className="absolute inset-3 rounded-full border border-accent-cyan/20" />
            <div className="absolute inset-6 rounded-full border border-accent-cyan/15" />
            <div className="absolute inset-9 rounded-full border border-accent-cyan/10" />
            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-accent-cyan/25" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-accent-cyan/25" />
            {/* Rotating radar sweep */}
            <div 
              className="absolute inset-0 rounded-full overflow-hidden animate-spin"
              style={{ animationDuration: '2.5s', animationTimingFunction: 'linear' }}
            >
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-accent-cyan/40 via-accent-cyan/10 to-transparent rounded-tl-full origin-bottom-right" />
            </div>
            {/* Center target pip */}
            <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-lg shadow-accent-cyan/80 animate-ping absolute" />
            <div className="w-2 h-2 rounded-full bg-white absolute" />
            {/* Detected orbital blips */}
            <div className="absolute top-5 right-7 w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
            <div className="absolute bottom-7 left-8 w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-mono text-xs text-accent-cyan tracking-widest uppercase animate-pulse">
              SCANNING 6D STANDARDIZED FEATURE SPACE...
            </p>
            <p className="text-xs text-slate-400">
              Measuring Euclidean distance across 1,056 materials for <span className="text-white font-mono">{queryInput}</span>
            </p>
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => runSearch(queryInput, topN)} />
      ) : !data || !queryMat ? null : (
        <div className="space-y-8">
          
          {/* Query Material Anchor Card */}
          <div className="bg-gradient-to-r from-space-card via-space-surface to-space-card rounded-2xl p-6 border border-accent-cyan/40 shadow-xl shadow-accent-cyan/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan font-bold uppercase tracking-wider">
                    QUERY ANCHOR
                  </span>
                  <span className="font-mono text-xs text-accent-cyan font-semibold">
                    {queryMat.material_id}
                  </span>
                  <ClusterBadge clusterId={queryMat.cluster} />
                </div>
                <h2 className="text-3xl font-display font-black text-white">
                  {queryMat.formula}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Reference vector in standardized 6D space
                </p>
              </div>

              {/* Anchor Features */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-space-dark/60 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-[10px] block">BAND GAP</span>
                  <span className="text-white font-semibold">
                    {queryProps.band_gap !== undefined 
                      ? `${Number(queryProps.band_gap).toFixed(2)} eV` 
                      : '—'}
                  </span>
                </div>

                <div className="bg-space-dark/60 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-[10px] block">PERMITTIVITY (ε)</span>
                  <span className="text-white font-semibold">
                    {queryProps.poly_total !== undefined 
                      ? Number(queryProps.poly_total).toFixed(2) 
                      : '—'}
                  </span>
                </div>

                <div className="bg-space-dark/60 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-[10px] block">DENSITY</span>
                  <span className="text-white font-semibold">
                    {queryProps.density !== undefined 
                      ? `${Number(queryProps.density).toFixed(2)} g/cm³` 
                      : '—'}
                  </span>
                </div>

                <div className="bg-space-dark/60 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-[10px] block">IONIC FRAC</span>
                  <span className="text-white font-semibold">
                    {queryProps.ionic_polarization_fraction !== undefined 
                      ? `${(Number(queryProps.ionic_polarization_fraction) * 100).toFixed(1)}%` 
                      : '—'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Similar Materials Ranked List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Top {neighborsList.length} Nearest Materials in Standardized 6D Space
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Sorted by lowest Euclidean distance
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {neighborsList.map((sim, idx) => {
                const isClosest = idx === 0;
                const distVal = sim.euclidean_distance ?? sim.distance;
                const props = sim.raw_properties || sim;

                return (
                  <motion.div
                    key={sim.material_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, scale: 1.005 }}
                    className={`bg-space-card/80 backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 hover:border-accent-cyan/40 ${
                      isClosest ? 'border-accent-cyan/50 shadow-lg shadow-accent-cyan/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm ${
                          isClosest 
                            ? 'bg-accent-cyan text-space-dark font-bold' 
                            : 'bg-space-surface text-slate-400 border border-white/10'
                        }`}>
                          #{idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-accent-cyan font-semibold">
                              {sim.material_id}
                            </span>
                            <ClusterBadge clusterId={sim.cluster} />
                            {sim.cluster === queryMat.cluster ? (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                Same Cluster
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                                Cross-Cluster Neighbor
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-bold text-2xl text-white">
                            {sim.formula}
                          </h4>
                        </div>
                      </div>

                      {/* Middle: Metrics from backend */}
                      <div className="flex items-center gap-4 bg-space-surface/80 p-3 rounded-xl border border-white/5">
                        <div className="text-right">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                            EUCLIDEAN DISTANCE (d)
                          </span>
                          <span className="text-lg font-mono font-bold text-slate-200">
                            {distVal !== undefined ? Number(distVal).toFixed(4) : '—'}
                          </span>
                        </div>

                        <div className="h-8 w-px bg-white/10" />

                        <div className="text-right">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-accent-cyan block">
                            SIMILARITY SCORE (API)
                          </span>
                          <span className="text-2xl font-mono font-black text-accent-cyan">
                            {sim.similarity_pct !== undefined 
                              ? `${Number(sim.similarity_pct).toFixed(2)}%`
                              : sim.similarity_score !== undefined
                              ? `${(Number(sim.similarity_score) * 100).toFixed(2)}%`
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Right action */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/material/${sim.material_id}`}
                          className="px-3.5 py-2 rounded-xl bg-space-surface hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3 text-accent-cyan" />
                        </Link>

                        <Link
                          to={`/compare?ids=${queryMat.material_id},${sim.material_id}`}
                          className="px-3.5 py-2 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/30 text-xs font-mono text-accent-cyan flex items-center gap-1.5 transition-colors"
                        >
                          <GitCompare className="w-3 h-3" />
                          <span>Compare</span>
                        </Link>
                      </div>

                    </div>

                    {/* Features row */}
                    <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-mono">
                      <div className="bg-space-dark/50 p-2 rounded-lg">
                        <span className="text-slate-500 text-[9px] block">BAND GAP</span>
                        <span className="text-slate-300">
                          {props.band_gap !== undefined ? `${Number(props.band_gap).toFixed(2)} eV` : '—'}
                        </span>
                      </div>
                      <div className="bg-space-dark/50 p-2 rounded-lg">
                        <span className="text-slate-500 text-[9px] block">PERMITTIVITY</span>
                        <span className="text-slate-300">
                          {props.poly_total !== undefined ? Number(props.poly_total).toFixed(2) : '—'}
                        </span>
                      </div>
                      <div className="bg-space-dark/50 p-2 rounded-lg">
                        <span className="text-slate-500 text-[9px] block">ELECTRONIC</span>
                        <span className="text-slate-300">
                          {props.poly_electronic !== undefined ? Number(props.poly_electronic).toFixed(2) : '—'}
                        </span>
                      </div>
                      <div className="bg-space-dark/50 p-2 rounded-lg">
                        <span className="text-slate-500 text-[9px] block">IONIC FRAC</span>
                        <span className="text-slate-300">
                          {props.ionic_polarization_fraction !== undefined 
                            ? `${(Number(props.ionic_polarization_fraction) * 100).toFixed(1)}%` 
                            : '—'}
                        </span>
                      </div>
                      <div className="bg-space-dark/50 p-2 rounded-lg">
                        <span className="text-slate-500 text-[9px] block">DENSITY</span>
                        <span className="text-slate-300">
                          {props.density !== undefined ? `${Number(props.density).toFixed(2)} g/cm³` : '—'}
                        </span>
                      </div>
                      <div className="bg-space-dark/50 p-2 rounded-lg">
                        <span className="text-slate-500 text-[9px] block">VOLUME</span>
                        <span className="text-slate-300">
                          {props.volume !== undefined ? `${Number(props.volume).toFixed(1)} Å³` : '—'}
                        </span>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
