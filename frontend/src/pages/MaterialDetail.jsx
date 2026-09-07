import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Orbit, 
  Cpu, 
  Layers, 
  GitCompare, 
  ShieldAlert, 
  Database, 
  Sliders, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getMaterialDetail, getSimilarMaterials } from '../api';
import ClusterBadge from '../components/ClusterBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ScientificDisclaimer from '../components/ScientificDisclaimer';

export default function MaterialDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getMaterialDetail(id)
      .then((res) => {
        const matData = res.data || res;
        setDetail(matData);
        return getSimilarMaterials({ materialId: id, topN: 4 });
      })
      .then((simRes) => {
        const simData = simRes?.data || simRes;
        const neighbors = simData?.neighbors || simData?.similar_materials || [];
        setSimilar(neighbors);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching material details:', err);
        setError(err.response?.data?.detail || err.message || `Material ${id} not found.`);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <LoadingState message={`Retrieving DFT profile for ${id}...`} />;
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Material record not found.'} />
        <div className="text-center mt-6">
          <Link
            to="/explorer"
            className="inline-flex items-center gap-2 text-xs font-mono text-accent-cyan hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Material Explorer
          </Link>
        </div>
      </div>
    );
  }

  const {
    material_id,
    formula,
    cluster,
    raw_properties,
    standardized_features,
    distance_to_cluster_centroid,
    cluster_centroid_distance,
    cluster_interpretation,
  } = detail;

  const centroidDist = distance_to_cluster_centroid ?? cluster_centroid_distance;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/explorer"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-accent-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Material Explorer</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/similarity?id=${material_id}`}
            className="px-3 py-1.5 rounded-lg bg-space-card hover:bg-space-surface border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Similarity Search</span>
          </Link>

          <Link
            to={`/compare?ids=${material_id}`}
            className="px-3 py-1.5 rounded-lg bg-space-card hover:bg-space-surface border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <GitCompare className="w-3.5 h-3.5 text-accent-violet" />
            <span>Add to Compare</span>
          </Link>

          <Link
            to="/universe"
            className="px-3 py-1.5 rounded-lg bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/30 text-xs font-mono text-accent-cyan flex items-center gap-2 transition-all"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Locate in 3D</span>
          </Link>
        </div>
      </div>

      {/* Hero Material Card */}
      <div className="bg-space-card/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-accent-cyan font-semibold">
                {material_id}
              </span>
              <ClusterBadge clusterId={cluster} />
            </div>

            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-wide">
              {formula}
            </h1>

            <p className="text-xs font-mono text-slate-400">
              {cluster_interpretation || 'Materials Project DFT Characterization Record'}
            </p>
          </div>

          {/* Cluster Proximity Metric */}
          <div className="bg-space-surface/90 rounded-xl p-4 border border-white/5 space-y-1 min-w-[220px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Cluster Centroid Distance
            </span>
            <span className="text-2xl font-mono font-bold text-accent-violet block">
              {centroidDist !== undefined && centroidDist !== null
                ? Number(centroidDist).toFixed(4)
                : '—'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">
              Euclidean distance in 6D space
            </span>
          </div>

        </div>
      </div>

      {/* Property Separation: Raw DFT vs Standardized 6D Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section A: Existing DFT-Computed Raw Properties */}
        <div className="bg-space-card/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Database className="w-4 h-4 text-accent-cyan" />
            <h2 className="font-display font-bold text-base text-white">
              Existing DFT-Computed Raw Properties
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            
            <div className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Band Gap (eV)</span>
              <span className="text-lg font-bold text-white block">
                {raw_properties?.band_gap !== undefined ? `${Number(raw_properties.band_gap).toFixed(3)} eV` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">Electronic structure</span>
            </div>

            <div className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Total Permittivity (ε)</span>
              <span className="text-lg font-bold text-white block">
                {raw_properties?.poly_total !== undefined ? Number(raw_properties.poly_total).toFixed(3) : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">poly_total</span>
            </div>

            <div className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Electronic Permittivity</span>
              <span className="text-lg font-bold text-white block">
                {raw_properties?.poly_electronic !== undefined ? Number(raw_properties.poly_electronic).toFixed(3) : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">poly_electronic</span>
            </div>

            <div className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Ionic Polarization</span>
              <span className="text-lg font-bold text-white block">
                {raw_properties?.ionic_polarization_fraction !== undefined 
                  ? `${(Number(raw_properties.ionic_polarization_fraction) * 100).toFixed(2)}%` 
                  : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">f_ionic fraction</span>
            </div>

            <div className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Density (g/cm³)</span>
              <span className="text-lg font-bold text-white block">
                {raw_properties?.density !== undefined ? `${Number(raw_properties.density).toFixed(3)}` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">Physical mass density</span>
            </div>

            <div className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Unit Cell Volume (Å³)</span>
              <span className="text-lg font-bold text-white block">
                {raw_properties?.volume !== undefined ? `${Number(raw_properties.volume).toFixed(2)}` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 block">Lattice volume</span>
            </div>

          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed font-sans bg-space-surface/30 p-3 rounded-lg border border-white/5">
            <Info className="w-3.5 h-3.5 text-accent-cyan inline mr-1.5 -mt-0.5" />
            Computed from Density Functional Theory (DFT) within the Materials Project. Dielectric constants reflect orientation-averaged polycrystalline values.
          </div>
        </div>

        {/* Section B: Standardized Engineered Descriptors (Z-scores) */}
        <div className="bg-space-card/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-accent-violet" />
            <h2 className="font-display font-bold text-base text-white">
              Standardized Engineered Descriptors (6D Space)
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            Z-score standardized coordinates transformed by <code className="text-accent-cyan">models/final_scaler.joblib</code> for K-Means and Euclidean proximity calculations.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {standardized_features &&
              Object.entries(standardized_features).map(([feat, val], idx) => {
                const numVal = Number(val);
                const widthPercent = Math.min(100, Math.max(8, Math.abs(numVal) * 25));
                const isPositive = numVal >= 0;
                const displayName = feat.startsWith('z_') ? feat.slice(2) : feat;

                return (
                  <div key={feat} className="bg-space-surface/70 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">{displayName}</span>
                      <span className={`font-bold ${isPositive ? 'text-accent-cyan' : 'text-rose-400'}`}>
                        {numVal > 0 ? `+${numVal.toFixed(4)}` : numVal.toFixed(4)} σ
                      </span>
                    </div>

                    {/* Animated Visual Deviation Bar */}
                    <div className="w-full h-1.5 bg-space-dark rounded-full overflow-hidden flex items-center">
                      <motion.div
                        className={`h-full rounded-full ${isPositive ? 'bg-accent-cyan shadow-sm shadow-accent-cyan/50' : 'bg-rose-400 shadow-sm shadow-rose-400/50'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.15 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Nearest Similar Materials Preview */}
      <div className="bg-space-card/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent-cyan" />
            <h3 className="font-display font-bold text-base text-white">
              Nearest Neighbors in Standardized 6D Feature Space
            </h3>
          </div>
          <Link
            to={`/similarity?id=${material_id}`}
            className="text-xs font-mono text-accent-cyan hover:underline"
          >
            Full Similarity Engine →
          </Link>
        </div>

        {similar.length === 0 ? (
          <p className="text-xs text-slate-400">Loading nearest neighbors...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((sim) => {
              const distVal = sim.euclidean_distance ?? sim.distance;
              return (
                <div
                  key={sim.material_id}
                  className="bg-space-surface/80 rounded-xl p-4 border border-white/5 hover:border-accent-cyan/30 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-accent-cyan block">
                        {sim.material_id}
                      </span>
                      <h4 className="font-display font-bold text-white text-base">
                        {sim.formula}
                      </h4>
                    </div>
                    <ClusterBadge clusterId={sim.cluster} />
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Distance:</span>
                    <span className="text-slate-200">
                      {distVal !== undefined ? Number(distVal).toFixed(3) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Similarity:</span>
                    <span className="text-accent-cyan font-bold">
                      {sim.similarity_pct !== undefined
                        ? `${Number(sim.similarity_pct).toFixed(1)}%`
                        : sim.similarity_score !== undefined
                        ? `${(Number(sim.similarity_score) * 100).toFixed(1)}%`
                        : '—'}
                    </span>
                  </div>

                  <Link
                    to={`/material/${sim.material_id}`}
                    className="block text-center text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 py-1.5 rounded-lg transition-colors font-medium mt-2"
                  >
                    View Material
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Scientific Disclaimer */}
      <ScientificDisclaimer />

    </div>
  );
}
