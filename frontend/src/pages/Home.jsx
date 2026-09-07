import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Orbit, 
  Layers, 
  Compass, 
  Cpu, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Activity, 
  Sliders
} from 'lucide-react';
import { getSummary } from '../api';
import AnimatedCounter from '../components/AnimatedCounter';
import ScientificDisclaimer from '../components/ScientificDisclaimer';
import MagneticButton from '../components/MagneticButton';
import OrbitingSphere from '../components/OrbitingSphere';

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const workflowSectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    getSummary()
      .then((res) => {
        setSummary(res.data || res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load summary:', err);
        setLoading(false);
      });
  }, []);

  const pipelineSteps = [
    {
      num: '01',
      title: 'DISCOVER',
      subtitle: '1,056 Materials Curated',
      desc: 'High-purity DFT-computed electronic and dielectric materials curated from Materials Project with complete dielectric tensors and electronic structures.',
      icon: Database,
      link: '/explorer',
      linkText: 'Explore Dataset',
      color: 'from-cyan-500/20 to-cyan-500/5',
      border: 'border-cyan-500/30',
      badge: 'Materials Project DFT',
      accentColor: '#00F0FF',
    },
    {
      num: '02',
      title: 'STRUCTURE',
      subtitle: '6 Engineered Descriptors',
      desc: 'Selected through physical relevance & low collinearity: band_gap, poly_total, poly_electronic, ionic_polarization_fraction, density, and volume.',
      icon: Sliders,
      link: '/explorer',
      linkText: 'View Descriptors',
      color: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      badge: 'Feature Engineering',
      accentColor: '#38BDF8',
    },
    {
      num: '03',
      title: 'CLUSTER',
      subtitle: 'K-Means with K = 4',
      desc: 'Unsupervised grouping across standardized 6D space. Silhouette score = 0.2351, isolating distinct dielectric-electronic material archetypes.',
      icon: Layers,
      link: '/clusters',
      linkText: 'Inspect Clusters',
      color: 'from-violet-500/20 to-violet-500/5',
      border: 'border-violet-500/30',
      badge: 'K-Means (k=4)',
      accentColor: '#8B5CF6',
    },
    {
      num: '04',
      title: 'MAP',
      subtitle: '3D PCA Feature-Space Projection',
      desc: 'Linear dimensionality reduction projecting 6D standardized descriptors to 3 principal axes explaining 74.66% cumulative dataset variance.',
      icon: Orbit,
      link: '/universe',
      linkText: 'Launch 3D Universe',
      color: 'from-fuchsia-500/20 to-fuchsia-500/5',
      border: 'border-fuchsia-500/30',
      badge: '74.66% Variance',
      accentColor: '#C084FC',
    },
    {
      num: '05',
      title: 'COMPARE',
      subtitle: 'Standardized 6D Proximity',
      desc: 'Geometric Euclidean distance in standardized feature space identifies nearest neighbors for functional substitution and analogue search.',
      icon: Cpu,
      link: '/similarity',
      linkText: 'Find Similar',
      color: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      badge: 'Euclidean Distance',
      accentColor: '#10B981',
    },
    {
      num: '06',
      title: 'SCREEN',
      subtitle: 'Heuristic ECE Screening',
      desc: 'Transparent multi-criteria screening scoring candidate materials for Power Electronics, Capacitives, RF High-Frequency, and Optoelectronics.',
      icon: Zap,
      link: '/recommendations',
      linkText: 'Screen Materials',
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      badge: 'Heuristic Scoring',
      accentColor: '#F59E0B',
    },
  ];

  // Staggered motion container variants
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28, scale: shouldReduceMotion ? 1 : 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative space-y-24 py-6 overflow-hidden">
      
      {/* 
        The Orbiting Sphere Canvas (Signature Scroll Transition)
        Renders the central glowing nucleus + 6 quantum nodes that detach,
        flow into the workflow section, and settle around the 6 cards.
      */}
      <OrbitingSphere targetSectionRef={workflowSectionRef} />

      {/* Hero Section with Cinematic Staggered Entrance */}
      <section className="relative min-h-[82vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-8">
        
        {/* Soft background ambient blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-accent-cyan/15 via-accent-violet/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-accent-emerald/10 rounded-full blur-2xl pointer-events-none" />

        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          
          {/* 1. Tagline Badge */}
          <motion.div variants={heroItemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D1322]/80 border border-accent-cyan/30 text-accent-cyan text-xs font-mono tracking-widest uppercase shadow-lg shadow-accent-cyan/10">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent-cyan" />
              <span>Digital Materials Laboratory</span>
            </div>
          </motion.div>

          {/* 2. Main Title */}
          <motion.h1 
            variants={heroItemVariants}
            className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none"
          >
            MATERIAL<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-emerald">MIND</span> AI
          </motion.h1>

          {/* 3. Subtitle */}
          <motion.p 
            variants={heroItemVariants}
            className="text-xl sm:text-2xl font-light text-slate-300 tracking-wider"
          >
            "INTELLIGENCE FOR MATERIALS."
          </motion.p>

          <motion.p 
            variants={heroItemVariants}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Unsupervised machine learning, 3D PCA feature-space projection, and heuristic multi-criteria screening across 1,056 DFT-characterized electronic and dielectric materials.
          </motion.p>

          {/* 4. Magnetic CTA Buttons */}
          <motion.div 
            variants={heroItemVariants}
            className="flex flex-wrap items-center justify-center gap-4 pt-6"
          >
            <Link to="/universe">
              <MagneticButton variant="primary" as="div" className="flex items-center gap-2">
                <Orbit className="w-4 h-4" />
                <span>EXPLORE 3D UNIVERSE</span>
              </MagneticButton>
            </Link>

            <Link to="/explorer">
              <MagneticButton variant="secondary" as="div" className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-cyan" />
                <span>MATERIAL EXPLORER</span>
              </MagneticButton>
            </Link>

            <Link to="/recommendations">
              <MagneticButton variant="secondary" as="div" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-violet" />
                <span>ECE SCREENING</span>
              </MagneticButton>
            </Link>
          </motion.div>

          {/* 5. Scientific Disclaimer */}
          <motion.div variants={heroItemVariants} className="pt-6">
            <ScientificDisclaimer />
          </motion.div>

        </motion.div>
      </section>

      {/* Live Dataset Summary Stats Bar */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="bg-[#0D1322]/85 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl hover:border-accent-cyan/30 transition-colors"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Activity className="w-4 h-4 text-accent-cyan" />
              <span className="uppercase tracking-wider">LIVE BACKEND ML METRICS</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Single Source of Truth
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            
            {/* Stat 1: Materials */}
            <div className="space-y-1 group">
              <span className="text-3xl sm:text-4xl font-display font-black text-accent-cyan block group-hover:scale-105 transition-transform">
                <AnimatedCounter target={summary?.total_materials ?? 1056} duration={1.2} />
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Materials Curated
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">DFT Computed</span>
            </div>

            {/* Stat 2: Features */}
            <div className="space-y-1 group">
              <span className="text-3xl sm:text-4xl font-display font-black text-accent-violet block group-hover:scale-105 transition-transform">
                <AnimatedCounter target={summary?.feature_count ?? 6} duration={0.8} />
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Engineered Features
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">Standardized 6D</span>
            </div>

            {/* Stat 3: Clusters */}
            <div className="space-y-1 group">
              <span className="text-3xl sm:text-4xl font-display font-black text-accent-emerald block group-hover:scale-105 transition-transform">
                <AnimatedCounter target={summary?.clusters_count ?? summary?.optimal_k ?? 4} duration={0.8} />
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                K-Means Clusters
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">Optimal K = 4</span>
            </div>

            {/* Stat 4: Silhouette */}
            <div className="space-y-1 group">
              <span className="text-3xl sm:text-4xl font-display font-black text-amber-400 block font-mono group-hover:scale-105 transition-transform">
                {summary?.silhouette_score !== undefined && summary?.silhouette_score !== null
                  ? Number(summary.silhouette_score).toFixed(4)
                  : '0.2351'}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Silhouette Score
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">K-Means Metric</span>
            </div>

            {/* Stat 5: PCA Variance */}
            <div className="space-y-1 col-span-2 md:col-span-1 group">
              <span className="text-3xl sm:text-4xl font-display font-black text-fuchsia-400 block font-mono group-hover:scale-105 transition-transform">
                {summary?.pca_cumulative_variance !== undefined
                  ? `${(Number(summary.pca_cumulative_variance) * 100).toFixed(2)}%`
                  : '74.66%'}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                PCA PC1–PC3 Variance
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">3D Projection</span>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 
        Interactive ML Storyline: The Discovery Workflow
        The central sphere decomposes into 6 quantum nodes that settle around these 6 cards.
      */}
      <section 
        ref={workflowSectionRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-4"
      >
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 text-xs font-mono text-accent-cyan uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-accent-cyan" />
            <span>Machine Learning Pipeline</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-wide">
            The Discovery Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From raw DFT dielectric tensors to unsupervised clustering, 3D PCA feature-space projection, and heuristic candidate screening.
          </p>
        </div>

        {/* 6 Workflow Cards with Staggered Scroll Reveal & Micro-Interactions */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                id={`workflow-card-${idx}`}
                data-workflow-card={idx}
                variants={cardVariants}
                className={`group relative bg-[#0D1322]/85 hover:bg-[#121A2D]/95 backdrop-blur-md rounded-2xl p-6 border ${step.border} hover:border-accent-cyan/60 transition-all duration-300 hover:shadow-2xl hover:shadow-accent-cyan/10 hover:-translate-y-1.5 hover:scale-[1.015] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-3xl font-black text-slate-700 group-hover:text-accent-cyan/60 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#070A12] border border-white/10 text-slate-300">
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/10 text-accent-cyan group-hover:scale-110 group-hover:border-accent-cyan/40 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white tracking-wide group-hover:text-accent-cyan transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-3">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <Link
                    to={step.link}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-cyan hover:text-white transition-colors"
                  >
                    <span>{step.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </section>

      {/* Key Architectural Anchors & Applications */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0D1322] via-[#121A2D] to-[#0D1322] rounded-2xl p-8 border border-white/10 space-y-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-white">
                Heuristic ECE Screening Profiles
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Transparent multi-criteria scoring profiles for electronic engineering applications.
              </p>
            </div>
            <Link to="/recommendations">
              <MagneticButton variant="outline" as="div" className="text-xs font-mono font-semibold tracking-wider">
                RUN SCREENING ENGINE →
              </MagneticButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-xl bg-[#070A12]/80 border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
              <span className="text-xs font-mono text-accent-cyan font-bold block">
                01. POWER ELECTRONICS
              </span>
              <p className="text-xs text-slate-400">
                Prioritizes higher band gap as an electronic robustness screening criterion, along with suitable density and dielectric stability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070A12]/80 border border-white/5 space-y-2 hover:border-violet-500/30 transition-colors">
              <span className="text-xs font-mono text-accent-violet font-bold block">
                02. CAPACITIVES & STORAGE
              </span>
              <p className="text-xs text-slate-400">
                Targets high total permittivity and high ionic polarization fraction for electrostatic charge retention.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070A12]/80 border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors">
              <span className="text-xs font-mono text-accent-emerald font-bold block">
                03. RF HIGH FREQUENCY
              </span>
              <p className="text-xs text-slate-400">
                Screens for moderate permittivity and strong electronic polarization contributions for high-speed signal propagation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#070A12]/80 border border-white/5 space-y-2 hover:border-amber-500/30 transition-colors">
              <span className="text-xs font-mono text-amber-400 font-bold block">
                04. OPTOELECTRONICS
              </span>
              <p className="text-xs text-slate-400">
                Filters for moderate band gaps matching visible and near-infrared spectral regimes for photoactive exploration.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
