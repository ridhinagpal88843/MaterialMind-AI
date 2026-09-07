import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  ArrowUpDown, 
  GitCompare,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMaterials } from '../api';
import MaterialCard from '../components/MaterialCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cluster, setCluster] = useState(searchParams.get('cluster') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'material_id');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  
  const [materials, setMaterials] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const fetchList = () => {
    setLoading(true);
    setError(null);

    getMaterials({
      page,
      pageSize: 20,
      cluster: cluster !== '' ? cluster : undefined,
      search: search.trim() || undefined,
      sortBy: sortBy || undefined,
      sortOrder,
    })
      .then((res) => {
        const data = res.data || res;
        setMaterials(data.materials || []);
        setTotalCount(data.total ?? data.total_count ?? 0);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching materials:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load materials from API.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchList();

    const params = {};
    if (search) params.search = search;
    if (cluster !== '') params.cluster = cluster;
    if (sortBy !== 'material_id') params.sort_by = sortBy;
    if (sortOrder !== 'asc') params.sort_order = sortOrder;
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  }, [page, cluster, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchList();
  };

  const handleClusterSelect = (c) => {
    setCluster(c);
    setPage(1);
  };

  const toggleCompare = (materialId) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(materialId)) {
        return prev.filter((id) => id !== materialId);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 materials simultaneously.');
        return prev;
      }
      return [...prev, materialId];
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>DFT Database Exploration</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Material Explorer
          </h1>
          <div className="text-xs font-mono text-slate-400">
            Showing <span className="text-accent-cyan font-bold">{materials.length}</span> of{' '}
            <span className="text-white font-bold">{totalCount}</span> materials
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-space-card/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by formula (e.g. SiC, GaN) or ID (e.g. mp-8062)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0D1322] border border-white/20 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors font-mono shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-accent-cyan text-space-dark text-xs font-mono font-bold rounded-lg hover:bg-cyan-300 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0D1322] border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan font-mono cursor-pointer"
            >
              <option value="material_id">Sort by Material ID</option>
              <option value="formula">Sort by Formula</option>
              <option value="band_gap">Sort by Band Gap (eV)</option>
              <option value="poly_total">Sort by Permittivity (ε_total)</option>
              <option value="density">Sort by Density (g/cm³)</option>
              <option value="volume">Sort by Volume (Å³)</option>
              <option value="cluster">Sort by Cluster</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div className="lg:col-span-2">
            <button
              onClick={() => {
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                setPage(1);
              }}
              className="w-full flex items-center justify-center gap-2 bg-space-surface hover:bg-white/5 border border-white/10 rounded-xl py-2.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-accent-cyan" />
              <span>{sortOrder === 'asc' ? 'ASC' : 'DESC'}</span>
            </button>
          </div>

        </div>

        {/* Cluster Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-mono text-slate-400 mr-2">Cluster:</span>
          
          <button
            onClick={() => handleClusterSelect('')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              cluster === ''
                ? 'bg-accent-cyan text-space-dark font-bold shadow-md shadow-accent-cyan/20'
                : 'bg-space-surface text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Clusters
          </button>

          {[0, 1, 2, 3].map((c) => (
            <button
              key={c}
              onClick={() => handleClusterSelect(c.toString())}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                cluster === c.toString()
                  ? 'bg-accent-cyan text-space-dark font-bold shadow-md shadow-accent-cyan/20'
                  : 'bg-space-surface text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Cluster {c}
            </button>
          ))}

          {(search || cluster !== '') && (
            <button
              onClick={() => {
                setSearch('');
                setCluster('');
                setPage(1);
              }}
              className="ml-auto text-xs text-slate-500 hover:text-rose-400 font-mono transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Material Grid */}
      {loading ? (
        <LoadingState message="Querying 1,056 Materials..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchList} />
      ) : materials.length === 0 ? (
        <div className="bg-space-card/40 rounded-2xl p-12 text-center border border-white/10 space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-display font-semibold text-slate-300">
            No Materials Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or removing the cluster filter to explore the rest of the 1,056 materials.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${page}-${cluster}-${search}-${sortBy}-${sortOrder}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {materials.map((m, idx) => (
              <motion.div
                key={m.material_id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.025, 0.3), ease: [0.22, 1, 0.36, 1] }}
              >
                <MaterialCard
                  material={m}
                  onSelectCompare={toggleCompare}
                  isCompared={selectedForCompare.includes(m.material_id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-space-card/60 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-surface border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-slate-400">
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-surface border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Comparison Drawer / Bottom Floating Bar */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-space-card/95 backdrop-blur-2xl border border-accent-cyan/40 shadow-2xl shadow-accent-cyan/20 rounded-2xl px-6 py-3.5 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-accent-cyan" />
            <div className="text-xs font-mono">
              <span className="text-white font-bold">{selectedForCompare.length}</span> / 4 materials selected
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/compare?ids=${selectedForCompare.join(',')}`}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-violet text-space-dark text-xs font-mono font-bold tracking-wider hover:scale-105 transition-transform"
            >
              Compare Now
            </Link>

            <button
              onClick={() => setSelectedForCompare([])}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
