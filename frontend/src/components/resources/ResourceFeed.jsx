import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { ResourceModal } from './ResourceModal';
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

  // Per-type visual config: accent color, icon, border color, badge style
  const typeConfig = {
    'Notes':      { icon: 'description',   label: 'Lecture Notes', accent: '#6750A4', border: 'border-l-[#6750A4]', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    'Exam Paper': { icon: 'quiz',          label: 'Exam Paper',    accent: '#E8622A', border: 'border-l-[#E8622A]', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    'Study Guide':{ icon: 'menu_book',     label: 'Study Guide',   accent: '#2DA44E', border: 'border-l-[#2DA44E]', badge: 'bg-green-500/10 text-green-400 border-green-500/20'  },
    'Textbook':   { icon: 'picture_as_pdf',label: 'Textbook',      accent: '#0969DA', border: 'border-l-[#0969DA]', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'    },
    'Link':       { icon: 'link',          label: 'Link',          accent: '#8250DF', border: 'border-l-[#8250DF]', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'},
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    try { return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }
    catch (e) { return 'U'; }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
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
              {filteredResources.map((res, idx) => {
                if (!res || !res.id) return null;
                const cfg = typeConfig[res.type] || typeConfig['Notes'];

                return (
                  <motion.div
                    layout
                    key={res.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className={`group flex flex-col bg-surface-container border border-outline-variant/50 border-l-4 ${cfg.border} rounded-2xl overflow-hidden hover:border-outline hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300`}
                  >
                    {/* ── Card Header: Type + Actions ── */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${cfg.badge}`}>
                        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </span>

                      {canManageResource(res.uploader?.id) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteResource(res.id); }}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-error/10 text-error/70 hover:bg-error hover:text-white flex items-center justify-center transition-all duration-200"
                          title="Delete resource"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      )}
                    </div>

                    {/* ── Card Body: Course + Title + Description ── */}
                    <div className="flex-1 px-5 pb-4 space-y-2">
                      {/* Course info row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-on-surface bg-surface-container-high border border-outline-variant/60 px-2 py-0.5 rounded-md tracking-wider">
                          {res.courseCode || 'GENERAL'}
                        </span>
                        {res.courseTitle && (
                          <span className="text-[11px] text-on-surface-variant truncate max-w-[160px]" title={res.courseTitle}>
                            {res.courseTitle}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-[16px] font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {res.title || 'Untitled Resource'}
                      </h3>

                      {/* Description */}
                      <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-3">
                        {res.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* ── Card Footer: Author + Upvote + Download ── */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant/30 bg-surface-container-low/50">
                      {/* Author */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 border border-primary/20">
                          {res.anonymous ? '?' : getInitials(res.uploader?.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-on-surface leading-none truncate">
                            {res.anonymous ? 'Anonymous' : (res.uploader?.name || 'User')}
                          </p>
                          {res.uploadedAt && (
                            <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-none">
                              {formatDate(res.uploadedAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Upvote */}
                        <button
                          onClick={() => handleUpvote(res.id)}
                          disabled={!!userUpvotes[res.id]}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                            userUpvotes[res.id]
                              ? 'bg-primary text-on-primary shadow-md shadow-primary/30'
                              : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/60 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                          }`}
                          title={userUpvotes[res.id] ? 'Upvoted' : 'Upvote'}
                        >
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: userUpvotes[res.id] ? "'FILL' 1" : "" }}>
                            thumb_up
                          </span>
                          <span>{res.upvotes || 0}</span>
                        </button>

                        {/* Download */}
                        <a
                          href={res.fileUrl?.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL}${res.fileUrl || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all duration-200 shadow-sm"
                          download
                          title="Download resource"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          <span>Get</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {filteredResources.length === 0 && !loading && (
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
        )}
      </div>
    </div>
  );
}
