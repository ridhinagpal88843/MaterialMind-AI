import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Orbit, 
  Layers, 
  Info, 
  Maximize2, 
  HelpCircle, 
  Activity, 
  RotateCcw,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { getPca } from '../api';
import PlotlyChart from '../components/PlotlyChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ScientificDisclaimer from '../components/ScientificDisclaimer';

const CLUSTER_COLORS = {
  0: '#06B6D4', // Cyan
  1: '#8B5CF6', // Violet
  2: '#10B981', // Emerald
  3: '#F59E0B', // Amber
};

const CLUSTER_NAMES = {
  0: 'Cluster 0: Wide-Gap Insulators',
  1: 'Cluster 1: Moderate-Gap Capacitives',
  2: 'Cluster 2: High-Permittivity Dielectrics',
  3: 'Cluster 3: Extreme Descriptors Group',
};

export default function MaterialUniverse() {
  const navigate = useNavigate();
  const [pcaData, setPcaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    setError(null);

    getPca()
      .then((res) => {
        const data = res.data || res;
        setPcaData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching PCA coordinates:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load PCA data from API.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingState message="Projecting 1,056 Materials into 3D PCA Feature-Space..." />;
  }

  if (error || !pcaData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Failed to load PCA coordinate matrix.'} />
      </div>
    );
  }

  const {
    coordinates = [],
    explained_variance_ratio = {},
    explained_variance = {},
    cumulative_variance_explained,
    loadings = {},
  } = pcaData;

  const evRatio = {
    PC1: explained_variance_ratio?.PC1 ?? explained_variance?.PC1 ?? 0.3708,
    PC2: explained_variance_ratio?.PC2 ?? explained_variance?.PC2 ?? 0.2100,
    PC3: explained_variance_ratio?.PC3 ?? explained_variance?.PC3 ?? 0.1658,
  };

  const cumVar = cumulative_variance_explained ?? 0.7466;

  // Filter coordinates based on cluster selection
  const filteredCoords = selectedCluster === 'ALL'
    ? coordinates
    : coordinates.filter((p) => p.cluster === parseInt(selectedCluster, 10));

  // Build Plotly traces (one per cluster for legend toggle)
  const clustersPresent = [0, 1, 2, 3];
  const traces = clustersPresent.map((cId) => {
    const pts = filteredCoords.filter((p) => p.cluster === cId);
    
    return {
      name: CLUSTER_NAMES[cId],
      x: pts.map((p) => (p.pc1 !== undefined ? p.pc1 : p.PC1)),
      y: pts.map((p) => (p.pc2 !== undefined ? p.pc2 : p.PC2)),
      z: pts.map((p) => (p.pc3 !== undefined ? p.pc3 : p.PC3)),
      text: pts.map((p) => p.material_id),
      customdata: pts.map((p) => ({
        material_id: p.material_id,
        formula: p.formula,
        cluster: p.cluster,
      })),
      hovertemplate:
        '<b>%{customdata.formula}</b> (%{customdata.material_id})<br>' +
        'Cluster: %{customdata.cluster}<br>' +
        'PC1: %{x:.2f} | PC2: %{y:.2f} | PC3: %{z:.2f}' +
        '<extra></extra>',
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 3.5,
        color: CLUSTER_COLORS[cId] || '#94a3b8',
        opacity: 0.85,
      },
    };
  });

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
      xaxis: {
        title: `PC1 (${(Number(evRatio.PC1) * 100).toFixed(1)}%)`,
        backgroundcolor: 'rgba(10, 15, 29, 0.4)',
        gridcolor: 'rgba(255, 255, 255, 0.08)',
        showbackground: true,
        zerolinecolor: 'rgba(6, 182, 212, 0.4)',
        color: '#94a3b8',
        titlefont: { color: '#06b6d4', size: 11 },
      },
      yaxis: {
        title: `PC2 (${(Number(evRatio.PC2) * 100).toFixed(1)}%)`,
        backgroundcolor: 'rgba(10, 15, 29, 0.4)',
        gridcolor: 'rgba(255, 255, 255, 0.08)',
        showbackground: true,
        zerolinecolor: 'rgba(139, 92, 246, 0.4)',
        color: '#94a3b8',
        titlefont: { color: '#8b5cf6', size: 11 },
      },
      zaxis: {
        title: `PC3 (${(Number(evRatio.PC3) * 100).toFixed(1)}%)`,
        backgroundcolor: 'rgba(10, 15, 29, 0.4)',
        gridcolor: 'rgba(255, 255, 255, 0.08)',
        showbackground: true,
        zerolinecolor: 'rgba(16, 185, 129, 0.4)',
        color: '#94a3b8',
        titlefont: { color: '#10b981', size: 11 },
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.2 },
      },
    },
    legend: {
      x: 0.02,
      y: 0.98,
      font: { color: '#cbd5e1', size: 11 },
      bgcolor: 'rgba(7, 10, 18, 0.8)',
      bordercolor: 'rgba(255, 255, 255, 0.1)',
      borderwidth: 1,
    },
  };

  const handlePointClick = (event) => {
    if (event.points && event.points.length > 0) {
      const pt = event.points[0];
      const matId = pt.customdata?.material_id || pt.text;
      if (matId) {
        navigate(`/material/${matId}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan uppercase tracking-wider">
            <Orbit className="w-3.5 h-3.5" />
            <span>Standardized 6D Space Dimensionality Reduction</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            3D PCA Feature-Space Projection
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            This projection summarizes variance in the standardized 6D feature space across 1,056 materials. The principal components represent axes of statistical variance, not independent physical properties.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-space-card/80 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-slate-400 px-2">Filter:</span>
          {['ALL', '0', '1', '2', '3'].map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedCluster(opt)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedCluster === opt
                  ? 'bg-accent-cyan text-space-dark font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt === 'ALL' ? 'All (1,056)' : `C${opt}`}
            </button>
          ))}
        </div>
      </div>

      {/* Variance Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-space-card/70 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent-cyan block">
            PC1 Explained Variance
          </span>
          <span className="text-2xl font-mono font-bold text-white block">
            {(Number(evRatio.PC1) * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400 block">Strongest: poly_total (-0.56)</span>
        </div>

        <div className="bg-space-card/70 backdrop-blur-md rounded-xl p-4 border border-violet-500/20 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent-violet block">
            PC2 Explained Variance
          </span>
          <span className="text-2xl font-mono font-bold text-white block">
            {(Number(evRatio.PC2) * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400 block">Strongest: density (+0.71)</span>
        </div>

        <div className="bg-space-card/70 backdrop-blur-md rounded-xl p-4 border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent-emerald block">
            PC3 Explained Variance
          </span>
          <span className="text-2xl font-mono font-bold text-white block">
            {(Number(evRatio.PC3) * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400 block">Strongest: band_gap (+0.68)</span>
        </div>

        <div className="bg-space-card/70 backdrop-blur-md rounded-xl p-4 border border-fuchsia-500/20 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-fuchsia-400 block">
            Cumulative PC1–PC3
          </span>
          <span className="text-2xl font-mono font-bold text-white block">
            {(Number(cumVar) * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400 block">3D Variance Captured</span>
        </div>

      </div>

      {/* Main 3D Plot Viewport */}
      <div className="relative bg-space-card/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 sm:p-4 overflow-hidden shadow-2xl">
        <div className="h-[600px] sm:h-[700px] w-full">
          <PlotlyChart
            data={traces}
            layout={layout}
            onClick={handlePointClick}
          />
        </div>

        <div className="absolute bottom-6 right-6 bg-space-dark/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Click any point to open its material detail dossier</span>
        </div>
      </div>

      {/* PCA Axes & Feature Loadings Table */}
      <div className="bg-space-card/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <BarChart2 className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-display font-bold text-base text-white">
            PCA Axes and Feature Loadings
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Loadings define how each standardized engineered feature projects onto the principal components.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Engineered Feature</th>
                <th className="py-2.5 px-3 text-accent-cyan">PC1 Loading</th>
                <th className="py-2.5 px-3 text-accent-violet">PC2 Loading</th>
                <th className="py-2.5 px-3 text-accent-emerald">PC3 Loading</th>
                <th className="py-2.5 px-3 text-slate-400">Primary Variance Association</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loadings &&
                Object.entries(loadings).map(([feature, vals]) => (
                  <tr key={feature} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 font-semibold text-white">{feature}</td>
                    <td className="py-2 px-3 text-accent-cyan font-mono">
                      {vals?.PC1 !== undefined ? Number(vals.PC1).toFixed(4) : '—'}
                    </td>
                    <td className="py-2 px-3 text-accent-violet font-mono">
                      {vals?.PC2 !== undefined ? Number(vals.PC2).toFixed(4) : '—'}
                    </td>
                    <td className="py-2 px-3 text-accent-emerald font-mono">
                      {vals?.PC3 !== undefined ? Number(vals.PC3).toFixed(4) : '—'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-400">
                      {feature === 'poly_total' || feature === 'poly_electronic' || feature === 'ionic_polarization_fraction'
                        ? 'Permittivity / Dielectric response'
                        : feature === 'density' || feature === 'volume'
                        ? 'Lattice density & packing'
                        : 'Electronic band gap'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer */}
      <ScientificDisclaimer />

    </div>
  );
}
