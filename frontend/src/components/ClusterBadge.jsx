import React from 'react';

const CLUSTER_CONFIG = {
  0: {
    label: 'Cluster 0',
    title: 'Semiconductor-like',
    bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    dot: 'bg-cyan-400',
  },
  1: {
    label: 'Cluster 1',
    title: 'Moderate-Gap Capacitives',
    bg: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
    dot: 'bg-violet-400',
  },
  2: {
    label: 'Cluster 2',
    title: 'High-Permittivity Dielectrics',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  3: {
    label: 'Cluster 3',
    title: 'Extreme Descriptors',
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    dot: 'bg-amber-400',
  },
};

export const ClusterBadge = ({ cluster, clusterId, showTitle = false, className = '' }) => {
  const actualCluster = cluster !== undefined ? cluster : clusterId;
  const config = CLUSTER_CONFIG[actualCluster] || {
    label: `Cluster ${actualCluster}`,
    title: 'Group',
    bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.label}</span>
      {showTitle && <span className="opacity-70 font-sans">({config.title})</span>}
    </span>
  );
};

export default ClusterBadge;
