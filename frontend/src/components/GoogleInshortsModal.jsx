import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  Database, 
  Layers, 
  Orbit, 
  Cpu, 
  BookOpen,
  Share2,
  Check
} from 'lucide-react';

export const GoogleGIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.24C.45 8.18 0 9.96 0 12s.45 3.82 1.24 5.4l4.04-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.6l4.04 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const INSHORTS_STORIES = [
  {
    id: 1,
    category: "DATASET GENESIS",
    categoryColor: "text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10",
    icon: Database,
    title: "1,056 Materials Project Benchmark",
    wordCount: 57,
    summary: "MaterialMind AI is trained on 1,056 real inorganic crystalline compounds calculated via Density Functional Perturbation Theory (DFPT) from Petousis et al. (Nature Sci Data). Spanning all 7 crystal systems, the dataset provides validated band gaps, optical refractive indices, and static dielectric tensors with zero synthetic entries and 100% verified physical data integrity.",
    metrics: [
      { label: "Compounds", value: "1,056" },
      { label: "Crystal Systems", value: "All 7" },
      { label: "Missing Nulls", value: "0 (100% Clean)" }
    ],
    sourceName: "Nature Scientific Data (Petousis et al.)",
    sourceUrl: "https://doi.org/10.1038/sdata.2016.134"
  },
  {
    id: 2,
    category: "UNSUPERVISED ML",
    categoryColor: "text-accent-violet border-accent-violet/30 bg-accent-violet/10",
    icon: Layers,
    title: "K-Means Partitions 4 Material Archetypes",
    wordCount: 56,
    summary: "Unsupervised K-Means clustering (K=4) segments the material universe into four distinct electronic regimes: Cluster 0 contains covalent semiconductors with balanced polarizability; Cluster 1 captures open-framework crystals with expansive unit-cell volumes; Cluster 2 isolates wide-bandgap ionic insulators; and Cluster 3 reveals rare colossal permittivity titanates crucial for energy storage capacitors.",
    metrics: [
      { label: "Clusters", value: "K = 4" },
      { label: "Silhouette Score", value: "0.2351" },
      { label: "Dominant Class", value: "Cluster 0 (39%)" }
    ],
    sourceName: "MaterialMind Clustering Engine",
    sourceUrl: "/clusters"
  },
  {
    id: 3,
    category: "FEATURE SPACE",
    categoryColor: "text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10",
    icon: Orbit,
    title: "3D PCA Explains 74.66% Total Variance",
    wordCount: 58,
    summary: "Six standardized physical descriptors are projected onto three orthogonal principal components, capturing nearly three-quarters of the total information. PC1 aligns strongly with static dielectric polarizability, PC2 mirrors unit-cell volume and packaging, and PC3 isolates wide band-gap electronic insulation. Materials are interactively navigatable in a responsive WebGL 3D coordinate sphere.",
    metrics: [
      { label: "Cumulative Variance", value: "74.66%" },
      { label: "Projected Axes", value: "3 Orthogonal (PC1-3)" },
      { label: "Render Engine", value: "Plotly WebGL" }
    ],
    sourceName: "3D Universe Visualizer",
    sourceUrl: "/universe"
  },
  {
    id: 4,
    category: "ECE SCREENING",
    categoryColor: "text-accent-amber border-accent-amber/30 bg-accent-amber/10",
    icon: Cpu,
    title: "Multi-Criteria Heuristic Discovery",
    wordCount: 59,
    summary: "Hardware engineers can query candidate crystals across four mission-critical application regimes: Next-Gen Power Electronics (wide bandgap GaN/SiC analogues), RF Microwave Substrates (controlled permittivity and low loss), High-Capacitance Dielectrics, and Optoelectronic Devices. Multi-criteria rankings provide rapid heuristic filtering accompanied by strict physical disclaimers preventing misinterpretation as lab validation.",
    metrics: [
      { label: "Target Profiles", value: "4 Domains" },
      { label: "Screening Index", value: "0.0 - 1.0" },
      { label: "Validation Tier", value: "Heuristic DFT" }
    ],
    sourceName: "ECE Recommendation Engine",
    sourceUrl: "/recommendations"
  },
  {
    id: 5,
    category: "RAPID CITATION",
    categoryColor: "text-[#FF5722] border-[#FF5722]/30 bg-[#FF5722]/10",
    icon: BookOpen,
    title: "60-Second Quick Project Overview",
    wordCount: 52,
    summary: "MaterialMind AI bridges computational materials physics and electronic engineering. In under 60 seconds, users can explore crystalline records, run Euclidean similarity queries in 6D standardized descriptor space, compare pairwise materials, and inspect full crystallographic CIF files—all powered by a production-ready FastAPI backend and responsive React frontend.",
    metrics: [
      { label: "Inference Latency", value: "< 15 ms" },
      { label: "API Endpoints", value: "7 Production Routes" },
      { label: "Source Code", value: "Full Stack Open" }
    ],
    sourceName: "Google Search Knowledge",
    sourceUrl: "https://www.google.com/search?q=materials+project+dielectric+constant+benchmark"
  }
];

export function GoogleInshortsModal({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextStory();
      if (e.key === 'ArrowLeft') prevStory();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIdx]);

  if (!isOpen) return null;

  const current = INSHORTS_STORIES[currentIdx];
  const Icon = current.icon;

  const nextStory = () => {
    setCurrentIdx((prev) => (prev + 1) % INSHORTS_STORIES.length);
  };

  const prevStory = () => {
    setCurrentIdx((prev) => (prev - 1 + INSHORTS_STORIES.length) % INSHORTS_STORIES.length);
  };

  const handleShare = () => {
    const url = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${current.title} — MaterialMind Inshorts: ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-space-card/95 border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col"
        >
          {/* Top Inshorts Progress Bars */}
          <div className="flex gap-1.5 p-3 pb-0 bg-space-dark/60">
            {INSHORTS_STORIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className="flex-1 h-1 rounded-full overflow-hidden bg-white/15 cursor-pointer focus:outline-none"
                aria-label={`Jump to story ${idx + 1}`}
              >
                <div 
                  className={`h-full transition-all duration-300 ${
                    idx === currentIdx 
                      ? 'bg-gradient-to-r from-accent-cyan to-[#FF5722] w-full' 
                      : idx < currentIdx 
                        ? 'bg-accent-cyan/60 w-full' 
                        : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-white/10 bg-space-dark/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center p-1 border border-white/10 shadow-sm">
                <GoogleGIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm text-white tracking-wide">
                    Google <span className="text-[#FF5722]">Inshorts</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/40 font-semibold">
                    60-SEC BRIEFS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Story {currentIdx + 1} of {INSHORTS_STORIES.length} • MaterialMind Digest
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                title="Share Story"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Share"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Story Body */}
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${current.categoryColor} flex items-center gap-1.5`}>
                <Icon className="w-3 h-3" />
                {current.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ~{current.wordCount} words
              </span>
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
              {current.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-space-surface/50 p-4 rounded-xl border border-white/5">
              {current.summary}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {current.metrics.map((metric, i) => (
                <div key={i} className="bg-space-dark/60 border border-white/5 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">{metric.label}</div>
                  <div className="text-xs font-semibold text-accent-cyan font-mono mt-0.5">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="px-5 py-3.5 bg-space-dark/70 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={prevStory}
                className="p-2 rounded-lg bg-space-surface border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-all active:scale-95"
                title="Previous (Left Arrow)"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextStory}
                className="p-2 rounded-lg bg-space-surface border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-all active:scale-95"
                title="Next (Right Arrow)"
                aria-label="Next story"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Source Link */}
            {current.sourceUrl.startsWith('http') ? (
              <a
                href={current.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-accent-cyan hover:underline font-mono"
              >
                <span>{current.sourceName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href={current.sourceUrl}
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs text-accent-cyan hover:underline font-mono"
              >
                <span>{current.sourceName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Minute, small "Google Inshorts" Icon Button for header integration
 */
export function GoogleInshortsButton({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative group flex items-center gap-1.5 px-2 py-1 rounded-full bg-space-surface/90 hover:bg-space-card border border-white/15 hover:border-accent-cyan/40 shadow-sm transition-all duration-200 active:scale-95 focus:outline-none ${className}`}
        title="Google Inshorts — 60-Sec Scientific Briefs"
        aria-label="Google Inshorts"
      >
        {/* Minute Google G Icon */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          <GoogleGIcon className="w-3.5 h-3.5" />
        </div>

        {/* Small Inshorts Text Badge */}
        <span className="text-[11px] font-mono font-medium tracking-tight text-slate-300 group-hover:text-white hidden sm:inline">
          Inshorts
        </span>

        {/* Tiny pulsing news notification beacon */}
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5722] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF5722]"></span>
        </span>

        {/* Micro Tooltip */}
        <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap rounded bg-space-dark/95 border border-white/15 px-2 py-0.5 text-[10px] font-mono text-slate-200 shadow-xl z-50">
          Google Inshorts (60s Briefs)
        </span>
      </button>

      {/* Interactive Modal */}
      <GoogleInshortsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default GoogleInshortsButton;
