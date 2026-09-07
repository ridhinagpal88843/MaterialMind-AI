import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  GitCompare, 
  Plus, 
  X, 
  Info, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Database, 
  Sliders 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { compareMaterials } from '../api';
import ClusterBadge from '../components/ClusterBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ScientificDisclaimer from '../components/ScientificDisclaimer';

const DEFAULT_COMPARE = ['mp-8062', 'mp-830']; // SiC and GaN (verified in dataset)

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idsParam = searchParams.get('ids');
  
  const [selectedIds, setSelectedIds] = useState(() => {
    if (idsParam) {
      const parsed = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      return parsed.length >= 2 ? parsed.slice(0, 4) : DEFAULT_COMPARE;
    }
    return DEFAULT_COMPARE;
  });

  const [inputNewId, setInputNewId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComparison = (ids) => {
    if (!ids || ids.length < 2) return;
    setLoading(true);
    setError(null);

    compareMaterials(ids)
      .then((res) => {
        const resData = res.data || res;
        setData(resData);
        setLoading(false);
        setSearchParams({ ids: ids.join(',') }, { replace: true });
      })
      .catch((err) => {
        console.error('Error fetching comparison:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to compare selected materials.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComparison(selectedIds);
  }, []);

  const handleAddMaterial = (e) => {
    e.preventDefault();
    const cleanId = inputNewId.trim();
    if (!cleanId) return;

    if (selectedIds.includes(cleanId)) {
      alert('Material already in comparison.');
      return;
    }

    if (selectedIds.length >= 4) {
      alert('Maximum 4 materials can be compared simultaneously.');
      return;
    }

    const nextIds = [...selectedIds, cleanId];
    setSelectedIds(nextIds);
    setInputNewId('');
    fetchComparison(nextIds);
  };

  const handleRemoveMaterial = (idToRemove) => {
    if (selectedIds.length <= 2) {
      alert('At least 2 materials are required for comparison.');
      return;
    }
    const nextIds = selectedIds.filter((id) => id !== idToRemove);
    setSelectedIds(nextIds);
    fetchComparison(nextIds);
  };

  // Helper to get pairwise distance regardless of whether dict of dicts or 2D array
  const getPairwiseDistance = (mId1, mId2, rIdx, cIdx) => {
    if (data?.pairwise_euclidean_distances) {
      const dist = data.pairwise_euclidean_distances[mId1]?.[mId2];
      if (dist !== undefined) return dist;
    }
    if (data?.distance_matrix && Array.isArray(data.distance_matrix)) {
      return data.distance_matrix[rIdx]?.[cIdx];
    }
    return undefined;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan uppercase tracking-wider">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Multi-Material 6D Feature Space Comparator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Material Comparison Dossier
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Side-by-side analysis of raw DFT-computed properties, standardized 6D descriptors, and pairwise geometric Euclidean distance matrix.
        </p>
      </div>

      {/* Prominent Scientific Disclaimer */}
      <ScientificDisclaimer />

      {/* Selected Material Pills & Add Form */}
      <div className="bg-space-card/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Materials ({selectedIds.length}/4):</span>
          {selectedIds.map((id) => (
            <div
              key={id}
              className="flex items-center gap-2 bg-space-surface border border-accent-cyan/30 rounded-xl px-3 py-1.5 text-xs font-mono text-white shadow-sm"
            >
              <span className="text-accent-cyan font-bold">{id}</span>
              <button
                onClick={() => handleRemoveMaterial(id)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add material input */}
        {selectedIds.length < 4 && (
          <form onSubmit={handleAddMaterial} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add Material ID (e.g. mp-1602)..."
              value={inputNewId}
              onChange={(e) => setInputNewId(e.target.value)}
              className="bg-[#0D1322] border border-white/20 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-accent-cyan text-space-dark hover:bg-cyan-300 transition-colors"
              title="Add to comparison"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>
          </form>
        )}
      </div>

      {/* Loading / Error States */}
      {loading ? (
        <LoadingState message="Generating side-by-side comparison dossier..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchComparison(selectedIds)} />
      ) : !data || !data.materials ? null : (
        <div className="space-y-8">
          
          {/* Side-by-side Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.materials.map((m) => (
              <div
                key={m.material_id}
                className="bg-space-card/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-accent-cyan font-semibold">
                      {m.material_id}
                    </span>
                    <ClusterBadge clusterId={m.cluster} />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white">
                    {m.formula}
                  </h3>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <Link
                    to={`/material/${m.material_id}`}
                    className="block text-center text-xs font-mono text-accent-cyan hover:underline bg-white/5 py-1.5 rounded-lg transition-colors"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pairwise Euclidean Distance Matrix */}
          {(data.pairwise_euclidean_distances || data.distance_matrix) && (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-space-card/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-accent-cyan" />
                  <h3 className="font-display font-bold text-base text-white">
                    Pairwise Euclidean Distance Matrix (Standardized 6D Space)
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Lower distance = closer geometric resemblance
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3 text-left">Material</th>
                      {data.materials.map((m) => (
                        <th key={m.material_id} className="py-2.5 px-3">
                          {m.formula} <span className="text-[9px] text-slate-500">({m.material_id})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.materials.map((mRow, rIdx) => (
                      <tr key={mRow.material_id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 text-left font-bold text-white">
                          {mRow.formula} <span className="text-[9px] text-slate-400 font-normal font-mono">({mRow.material_id})</span>
                        </td>
                        {data.materials.map((mCol, cIdx) => {
                          const dist = getPairwiseDistance(mRow.material_id, mCol.material_id, rIdx, cIdx);
                          const isSelf = mRow.material_id === mCol.material_id;

                          return (
                            <td
                              key={mCol.material_id}
                              className={`py-2.5 px-3 font-mono font-bold ${
                                isSelf
                                  ? 'text-slate-600 bg-space-dark/30'
                                  : dist !== undefined && dist < 1.5
                                  ? 'text-accent-cyan bg-cyan-500/10'
                                  : dist !== undefined && dist < 3.0
                                  ? 'text-accent-violet bg-violet-500/10'
                                  : 'text-slate-300'
                              }`}
                            >
                              {dist !== undefined ? Number(dist).toFixed(4) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Side-by-side Raw Properties Table */}
          <div className="bg-space-card/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Database className="w-4 h-4 text-accent-cyan" />
              <h3 className="font-display font-bold text-base text-white">
                Existing DFT-Computed Raw Properties
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Property</th>
                    {data.materials.map((m) => (
                      <th key={m.material_id} className="py-2.5 px-3 text-accent-cyan">
                        {m.formula} ({m.material_id})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">Band Gap (eV)</td>
                    {data.materials.map((m) => (
                      <td key={m.material_id} className="py-2 px-3">
                        {m.raw_properties?.band_gap !== undefined ? `${Number(m.raw_properties.band_gap).toFixed(3)} eV` : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">Total Permittivity (ε)</td>
                    {data.materials.map((m) => (
                      <td key={m.material_id} className="py-2 px-3">
                        {m.raw_properties?.poly_total !== undefined ? Number(m.raw_properties.poly_total).toFixed(3) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">Electronic Permittivity</td>
                    {data.materials.map((m) => (
                      <td key={m.material_id} className="py-2 px-3">
                        {m.raw_properties?.poly_electronic !== undefined ? Number(m.raw_properties.poly_electronic).toFixed(3) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">Ionic Polarization Fraction</td>
                    {data.materials.map((m) => (
                      <td key={m.material_id} className="py-2 px-3">
                        {m.raw_properties?.ionic_polarization_fraction !== undefined
                          ? `${(Number(m.raw_properties.ionic_polarization_fraction) * 100).toFixed(2)}%`
                          : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">Density (g/cm³)</td>
                    {data.materials.map((m) => (
                      <td key={m.material_id} className="py-2 px-3">
                        {m.raw_properties?.density !== undefined ? `${Number(m.raw_properties.density).toFixed(3)}` : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">Volume (Å³)</td>
                    {data.materials.map((m) => (
                      <td key={m.material_id} className="py-2 px-3">
                        {m.raw_properties?.volume !== undefined ? `${Number(m.raw_properties.volume).toFixed(2)}` : '—'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Side-by-side Standardized Features Table */}
          <div className="bg-space-card/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="w-4 h-4 text-accent-violet" />
              <h3 className="font-display font-bold text-base text-white">
                Standardized Engineered Descriptors (Z-Scores)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Engineered Descriptor</th>
                    {data.materials.map((m) => (
                      <th key={m.material_id} className="py-2.5 px-3 text-accent-violet">
                        {m.formula} ({m.material_id})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {['band_gap', 'poly_total', 'poly_electronic', 'ionic_polarization_fraction', 'density', 'volume'].map((feat) => {
                    const zKey = `z_${feat}`;
                    return (
                      <tr key={feat} className="hover:bg-white/5">
                        <td className="py-2 px-3 font-semibold text-white">{feat}</td>
                        {data.materials.map((m) => {
                          const val = m.standardized_features?.[zKey] ?? m.standardized_features?.[feat];
                          return (
                            <td key={m.material_id} className="py-2 px-3">
                              {val !== undefined ? (
                                <span className={val >= 0 ? 'text-accent-cyan' : 'text-rose-400'}>
                                  {val >= 0 ? `+${Number(val).toFixed(4)}` : Number(val).toFixed(4)} σ
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
