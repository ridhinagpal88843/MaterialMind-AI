import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';

// Pages
import Home from './pages/Home';
import Explorer from './pages/Explorer';
import MaterialDetail from './pages/MaterialDetail';
import MaterialUniverse from './pages/MaterialUniverse';
import Clusters from './pages/Clusters';
import Recommendations from './pages/Recommendations';
import Similarity from './pages/Similarity';
import Compare from './pages/Compare';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/explorer" element={<PageTransition><Explorer /></PageTransition>} />
        <Route path="/material/:id" element={<PageTransition><MaterialDetail /></PageTransition>} />
        <Route path="/universe" element={<PageTransition><MaterialUniverse /></PageTransition>} />
        <Route path="/clusters" element={<PageTransition><Clusters /></PageTransition>} />
        <Route path="/clusters/:id" element={<PageTransition><Clusters /></PageTransition>} />
        <Route path="/recommendations" element={<PageTransition><Recommendations /></PageTransition>} />
        <Route path="/similarity" element={<PageTransition><Similarity /></PageTransition>} />
        <Route path="/compare" element={<PageTransition><Compare /></PageTransition>} />
        
        {/* Fallback */}
        <Route path="*" element={<PageTransition><Home /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <CustomCursor />
      <div className="min-h-screen bg-space-dark text-slate-100 flex flex-col selection:bg-accent-cyan/30 selection:text-white">
        
        {/* Fixed Navigation Header */}
        <Navbar />

        {/* Dynamic Route Viewport with Cinematic Page Transitions */}
        <main className="flex-1 pt-20 pb-16 overflow-hidden">
          <AnimatedRoutes />
        </main>

        {/* Global Footer with Scientific Disclaimer */}
        <Footer />
        
      </div>
    </Router>
  );
}
