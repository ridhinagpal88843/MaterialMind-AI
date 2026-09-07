import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Orbit, 
  Layers, 
  Cpu, 
  GitCompare, 
  Zap, 
  Menu, 
  X,
  Activity
} from 'lucide-react';
import { getHealth } from '../api';

const navItems = [
  { name: 'Explorer', path: '/explorer', icon: Compass },
  { name: '3D Universe', path: '/universe', icon: Orbit },
  { name: 'Clusters', path: '/clusters', icon: Layers },
  { name: 'Recommendations', path: '/recommendations', icon: Zap },
  { name: 'Similarity', path: '/similarity', icon: Cpu },
  { name: 'Compare', path: '/compare', icon: GitCompare },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check backend health
    getHealth()
      .then(res => {
        if (res.data && res.data.status === 'healthy') {
          setApiOnline(true);
        }
      })
      .catch(() => setApiOnline(false));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-space-dark/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 py-3' 
        : 'bg-space-dark/60 backdrop-blur-md border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-emerald p-[1px] shadow-lg shadow-accent-cyan/20 group-hover:shadow-accent-cyan/40 transition-all duration-300">
            <div className="w-full h-full bg-space-dark rounded-xl flex items-center justify-center">
              <Orbit className="w-5 h-5 text-accent-cyan group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-wider text-white">
                MATERIAL<span className="text-accent-cyan">MIND</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-semibold">
                AI
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-slate-400 font-mono -mt-0.5 hidden sm:block">
              INTELLIGENCE FOR MATERIALS
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-space-card/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-violet/20 text-accent-cyan border border-accent-cyan/40 shadow-sm shadow-accent-cyan/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>

        {/* Status indicator & Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-space-surface border border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${
              apiOnline 
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' 
                : 'bg-amber-500'
            }`} />
            <span className="text-[11px] text-slate-300">
              {apiOnline ? 'API ONLINE' : 'CONNECTING...'}
            </span>
          </div>

          <Link
            to="/universe"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-violet text-space-dark font-display font-semibold text-xs tracking-wider shadow-lg shadow-accent-cyan/20 hover:shadow-accent-cyan/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>EXPLORE 3D</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg bg-space-card border border-white/10 text-slate-300 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 bg-space-card/95 backdrop-blur-2xl border-b border-white/10 mt-2">
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-accent-cyan/15 text-accent-cyan' : 'text-slate-300 hover:bg-white/5'
                }`
              }
            >
              <Activity className="w-4 h-4 text-accent-cyan" />
              Home / ML Story
            </NavLink>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-accent-cyan/15 text-accent-cyan' : 'text-slate-300 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-accent-cyan" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
              <span>{apiOnline ? 'BACKEND CONNECTED' : 'CONNECTING...'}</span>
            </div>
            <Link
              to="/universe"
              className="text-xs px-3 py-1.5 rounded-md bg-accent-cyan text-space-dark font-bold tracking-wider"
            >
              LAUNCH 3D
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
