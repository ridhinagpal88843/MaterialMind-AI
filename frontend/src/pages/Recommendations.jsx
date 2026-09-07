import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldAlert, 
  Info, 
  Layers, 
  ChevronRight, 
  Sliders, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Database 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getRecommendations } from '../api';
import ClusterBadge from '../components/ClusterBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ScientificDisclaimer from '../components/ScientificDisclaimer';

const PROFILES = [
  {
    id: 'POWER_ELECTRONICS',
    name: 'Power Electronics',
    tag: 'Electronic Robustness',
    desc: 'Prioritizes high band gap as an electronic robustness screening criterion, along with suitable density and stable dielectric response.',
    caveat: 'Higher band gap is used as an electronic robustness screening criterion. It is not a prediction of breakdown voltage or critical breakdown field.',
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/40',
    accent: 'text-accent-cyan',
  },
  {
    id: 'DIELECTRIC_CAPACITIVE',
    name: 'Dielectric / Capacitive',
    tag: 'Charge Storage',
    desc: 'Targets high total dielectric permittivity (poly_total) and high ionic polarization fraction for electrostatic charge storage.',
    caveat: 'Permittivity is computed from DFT orientation-averaged polycrystalline tensors. Does not account for breakdown or leakage currents.',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/40',
    accent: 'text-accent-violet',
  },
  {
    id: 'RF_HIGH_FREQUENCY',
    name: 'RF / High Frequency',
    tag: 'Low Permittivity & Speed',
    desc: 'Screens for moderate-to-low permittivity with strong electronic contributions to minimize signal propagation delay.',
    caveat: 'A higher band gap is used as a heuristic insulating-character screening criterion. The model does not predict RF leakage, dielectric loss, or high-frequency device performance.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/40',
    accent: 'text-accent-emerald',
  },
  {
    id: 'OPTOELECTRONIC',
    name: 'Optoelectronic',
    tag: 'Band-Gap Compatibility',
    desc: 'Screens for target band gaps matching visible to near-infrared spectra alongside electronic polarizability.',
    caveat: 'Band-gap matching is an initial compatibility screening criterion only. The model does not predict optical absorption coefficients, transition dipole moments, or quantum efficiency.',
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/40',
    accent: 'text-amber-400',
  },
];

export default function Recommendations() {
  const [activeProfile, setActiveProfile] = useState('POWER_ELECTRONICS');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(5);

  const fetchRecommendations = (profile, n) => {
    setLoading(true);
    setError(null);

    getRecommendations({ applicationProfile: profile, topN: n })
      .then((res) => {
        const resData = res.data || res;
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error running recommendation engine:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch recommendations from backend engine.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecommendations(activeProfile, topN);
  }, [activeProfile, topN]);

  const currentProfileInfo = PROFILES.find((p) => p.id === activeProfile);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Multi-Criteria Heuristic Screening Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          ECE Material Recommendations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Screening candidate materials across the 1,056-material database using transparent, standardized feature weighting. Scores are relative heuristic screening indices, not experimental performance predictions.
        </p>
      </div>

      {/* Prominent Scientific Disclaimer */}
      <ScientificDisclaimer />

      {/* Profile Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROFILES.map((p) => {
          const isActive = p.id === activeProfile;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProfile(p.id)}
              className={`text-left p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                isActive
                  ? `bg-space-card/90 ${p.border} shadow-xl shadow-accent-cyan/10`
                  : 'bg-space-card/50 hover:bg-space-card/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-space-surface border border-white/10 ${p.accent}`}>
                    {p.tag}
                  </span>
                  {isActive && <Sparkles className={`w-3.5 h-3.5 ${p.accent} animate-pulse`} />}
                </div>

                <h3 className="font-display font-bold text-base text-white">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {p.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className={isActive ? p.accent : 'text-slate-500'}>
                  {isActive ? 'Active Engine' : 'Select Profile'}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? p.accent : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Profile Scientific Caveat Box */}
      {currentProfileInfo && (
        <div className="bg-space-card/60 backdrop-blur-md rounded-xl p-4 border border-amber-500/30 flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-amber-400 font-semibold uppercase tracking-wider block">
              Profile Screening Methodology Note:
            </span>
            <p className="text-slate-300 mt-0.5">
              {currentProfileInfo.caveat}
            </p>
          </div>
        </div>
      )}

      {/* Number of candidates selector */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-slate-400">
          Ranked Results from Backend Recommendation Engine ({data?.total_candidates ?? data?.recommendations?.length ?? 0} candidates analyzed)
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Show Top:</span>
          {[5, 10, 20].map((n) => (
            <button
              key={n}
              onClick={() => setTopN(n)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                topN === n
                  ? 'bg-accent-cyan text-space-dark font-bold'
                  : 'bg-space-surface text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <LoadingState message={`Computing heuristic candidate screening for ${currentProfileInfo?.name}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchRecommendations(activeProfile, topN)} />
      ) : !data?.recommendations || data.recommendations.length === 0 ? (
        <div className="bg-space-card/50 rounded-xl p-12 text-center text-slate-400">
          No candidates matched this screening profile.
        </div>
      ) : (
        <div className="space-y-4">
          {data.recommendations.map((rec, idx) => {
            const isFirst = rec.rank === 1;
            const recScore = rec.recommendation_score ?? rec.score;
            const props = rec.raw_properties ?? rec.properties ?? {};

            return (
              <motion.div
                key={rec.material_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, scale: 1.005 }}
                className={`bg-space-card/80 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 hover:border-accent-cyan/40 ${
                  isFirst ? 'border-accent-cyan/50 shadow-xl shadow-accent-cyan/10' : 'border-white/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left: Rank, ID, Formula */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg ${
                      isFirst 
                        ? 'bg-gradient-to-br from-accent-cyan to-accent-violet text-space-dark shadow-md shadow-accent-cyan/30' 
                        : 'bg-space-surface text-slate-400 border border-white/10'
                    }`}>
                      #{rec.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-accent-cyan font-semibold">
                          {rec.material_id}
                        </span>
                        <ClusterBadge clusterId={rec.cluster} />
                      </div>
                      <h3 className="font-display font-bold text-2xl text-white">
                        {rec.formula}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl">
                        {rec.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Right: Heuristic Screening Score */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="bg-space-surface/90 rounded-xl p-4 border border-white/5 text-right min-w-[200px]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        HEURISTIC SCREENING SCORE
                      </span>
                      <span className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald block">
                        {recScore !== undefined ? Number(recScore).toFixed(4) : '—'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block">
                        Index (0.0 to 1.0) • Not a probability
                      </span>
                    </div>

                    <Link
                      to={`/material/${rec.material_id}`}
                      className="px-4 py-2 rounded-xl bg-space-surface hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-2 transition-colors self-stretch sm:self-auto justify-center"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5 text-accent-cyan" />
                    </Link>
                  </div>

                </div>

                {/* Bottom: Feature Contributions & Physical Properties */}
                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
                  
                  <div className="bg-space-surface/50 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] block">BAND GAP</span>
                    <span className="text-white font-semibold">
                      {props.band_gap !== undefined ? `${Number(props.band_gap).toFixed(2)} eV` : '—'}
                    </span>
                  </div>

                  <div className="bg-space-surface/50 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] block">PERMITTIVITY (ε)</span>
                    <span className="text-white font-semibold">
                      {props.poly_total !== undefined ? Number(props.poly_total).toFixed(2) : '—'}
                    </span>
                  </div>

                  <div className="bg-space-surface/50 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] block">DENSITY</span>
                    <span className="text-slate-300">
                      {props.density !== undefined ? `${Number(props.density).toFixed(2)} g/cm³` : '—'}
                    </span>
                  </div>

                  <div className="bg-space-surface/50 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] block">IONIC POLARIZATION</span>
                    <span className="text-slate-300">
                      {props.ionic_polarization_fraction !== undefined 
                        ? `${(Number(props.ionic_polarization_fraction) * 100).toFixed(1)}%` 
                        : '—'}
                    </span>
                  </div>

                  <div className="bg-space-surface/50 p-2.5 rounded-lg border border-white/5 col-span-2">
                    <span className="text-slate-400 text-[10px] block">TOP CONTRIBUTING DESCRIPTOR</span>
                    <span className="text-accent-cyan font-semibold">
                      {rec.feature_contributions
                        ? Object.entries(rec.feature_contributions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                        : 'N/A'}
                    </span>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
