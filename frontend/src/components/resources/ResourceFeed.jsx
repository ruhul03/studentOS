import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { ResourceModal } from './ResourceModal';
import { ResourceCard } from './ResourceCard';
import { playDeleteSound, playSuccessSound } from '../../utils/notificationSound';

export function ResourceFeed() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Resources');
  const { user } = useAuth();
  
  const [userUpvotes, setUserUpvotes] = useState(() => {
    try {
      const saved = localStorage.getItem('userUpvotes');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      return {};
    }
  });

  const canManageResource = (uploaderId) => {
    if (!user || !uploaderId) return false;
    return user.id === uploaderId || user.role?.toUpperCase() === 'ADMIN';
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const url = search 
        ? `${import.meta.env.VITE_API_URL}/api/resources?query=${encodeURIComponent(search)}` 
        : `${import.meta.env.VITE_API_URL}/api/resources`;
      
      const response = await fetchWithAuth(url);
      if (response.ok) {
        const data = await response.json();
        setResources(Array.isArray(data) ? data : []);
      } else {
        console.warn('Resources fetch returned status:', response.status, '- keeping existing data');
      }
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceCreated = () => {
    setTimeout(() => fetchResources(), 600);
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchResources(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': user?.id, 'X-User-Role': user?.role }
      });
      if (response.ok) {
        playDeleteSound();
        fetchResources();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleUpvote = async (id) => {
    if (!user) { alert('You must be logged in to upvote resources.'); return; }
    if (userUpvotes[id]) return;
    
    const newUpvotes = { ...userUpvotes, [id]: true };
    setUserUpvotes(newUpvotes);
    localStorage.setItem('userUpvotes', JSON.stringify(newUpvotes));
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/resources/${id}/upvote`, { 
        method: 'POST',
        headers: { 'X-User-Id': user.id, 'X-User-Role': user.role }
      });
      if (response.ok) {
        playSuccessSound();
        fetchResources();
      }
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const filters = useMemo(() => ['All Resources', 'Lecture Notes', 'Exam Papers', 'Study Guides', 'Textbooks'], []);

  const filteredResources = useMemo(() => {
    if (!Array.isArray(resources)) return [];
    return resources.filter(res => {
      if (!res) return false;
      if (activeFilter === 'All Resources') return true;
      const typeMap = { 'Lecture Notes': 'Notes', 'Exam Papers': 'Exam Paper', 'Study Guides': 'Study Guide', 'Textbooks': 'Textbook' };
      return res.type === typeMap[activeFilter];
    });
  }, [resources, activeFilter]);

  const renderEmptyState = () => {
    if (filteredResources.length > 0 || loading) return null;
    
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-outline-variant/30 rounded-2xl bg-surface-container/30">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-outline mb-5">
          <span className="material-symbols-outlined text-[36px]">
            {search ? 'search_off' : 'folder_open'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-1">
          {search ? 'No results found' : 'No resources yet'}
        </h3>
        <p className="text-sm text-on-surface-variant text-center max-w-sm">
          {search 
            ? `No resources match "${search}". Try a different search term.`
            : `No resources in ${activeFilter}. Be the first to contribute!`}
        </p>
        {search && (
          <button onClick={() => setSearch('')} className="mt-4 text-sm text-primary font-semibold hover:underline">
            Clear search
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Study Resources</h1>
            <p className="text-sm text-on-surface-variant mt-1">Discover notes, past papers, and guides shared by your peers.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:shadow-primary/30 hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">upload</span>
            Share Resource
          </button>
        </div>

        {/* ── Search & Filters ── */}
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
              placeholder="Search by course code, title, or topic..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                  activeFilter === filter 
                    ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20' 
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <ResourceModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onResourceCreated={handleResourceCreated} 
        />

        {/* ── Results Count ── */}
        {!loading && filteredResources.length > 0 && (
          <p className="text-xs text-on-surface-variant">
            Showing <span className="font-semibold text-on-surface">{filteredResources.length}</span> resource{filteredResources.length !== 1 ? 's' : ''}
            {activeFilter !== 'All Resources' && <> in <span className="font-semibold text-primary">{activeFilter}</span></>}
          </p>
        )}

        {/* ── Cards Grid ── */}
        {loading && resources.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-56 bg-surface-container/50 rounded-2xl border border-outline-variant/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredResources.map((res, idx) => (
                <ResourceCard 
                  key={res.id} 
                  res={res} 
                  idx={idx} 
                  canManageResource={canManageResource}
                  handleDeleteResource={handleDeleteResource}
                  handleUpvote={handleUpvote}
                  userUpvotes={userUpvotes}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {renderEmptyState()}
      </div>
    </div>
  );
}
