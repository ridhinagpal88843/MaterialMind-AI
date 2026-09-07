import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, ExternalLink, ShieldCheck, Database, Layers, Terminal } from 'lucide-react';
import ScientificDisclaimer from './ScientificDisclaimer';

export default function Footer() {
  return (
    <footer className="bg-space-dark border-t border-white/5 pt-12 pb-8 text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Scientific Disclaimer at footer top */}
        <ScientificDisclaimer compact={true} />

        {/* 4-column footer links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 border-t border-white/5">
          
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet p-[1px]">
                <div className="w-full h-full bg-space-dark rounded-lg flex items-center justify-center">
                  <Orbit className="w-4 h-4 text-accent-cyan" />
                </div>
              </div>
              <span className="font-display font-bold text-white text-base tracking-wider">
                MATERIAL<span className="text-accent-cyan">MIND</span> AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent clustering and heuristic selection platform for electronic and dielectric materials, driven by unsupervised machine learning on 1,056 DFT-characterized compounds.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Phases 1–8 Frozen Architecture</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explorer" className="hover:text-accent-cyan transition-colors">
                  Material Explorer
                </Link>
              </li>
              <li>
                <Link to="/universe" className="hover:text-accent-cyan transition-colors">
                  3D PCA Feature Projection
                </Link>
              </li>
              <li>
                <Link to="/clusters" className="hover:text-accent-cyan transition-colors">
                  K-Means Clustering (K = 4)
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-accent-cyan transition-colors">
                  ECE Application Screening
                </Link>
              </li>
              <li>
                <Link to="/similarity" className="hover:text-accent-cyan transition-colors">
                  Standardized Similarity Engine
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-accent-cyan transition-colors">
                  Multi-Material Comparator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: ML Pipeline Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              ML Pipeline (Phases 1–8)
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-accent-cyan" />
                <span>1,056 Materials (MP DFT)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-accent-violet" />
                <span>6 Standardized Features</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-accent-emerald" />
                <span>K-Means (k=4, Silhouette 0.2351)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Orbit className="w-3 h-3 text-amber-400" />
                <span>PCA PC1-PC3 (74.66% Var)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: API & References */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              API & Engineering
            </h4>
            <div className="space-y-2 text-xs">
              <a 
                href="/docs" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-accent-cyan hover:underline"
              >
                <span>FastAPI Swagger Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="/redoc" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                <span>ReDoc Specification</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-[11px] text-slate-500 pt-2">
                Built with React, Vite, Tailwind CSS, Plotly.js, and FastAPI. Powered by Materials Project DFT data.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} MATERIALMIND AI. Digital Materials Laboratory.
          </div>
          <div className="flex items-center gap-4">
            <span>Heuristic ECE Screening Only</span>
            <span>•</span>
            <span>Unsupervised Clustering</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
