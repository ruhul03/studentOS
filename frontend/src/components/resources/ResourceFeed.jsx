import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { ResourceModal } from './ResourceModal';

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
    // Delay refresh slightly to give backend time to persist
    setTimeout(() => fetchResources(), 600);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchResources();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 
          'X-User-Id': user?.id, 
          'X-User-Role': user?.role 
        }
      });
      if (response.ok) fetchResources();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleUpvote = async (id) => {
    if (!user) {
      alert('You must be logged in to upvote resources.');
      return;
    }
    if (userUpvotes[id]) return;
    
    const newUpvotes = { ...userUpvotes, [id]: true };
    setUserUpvotes(newUpvotes);
    localStorage.setItem('userUpvotes', JSON.stringify(newUpvotes));
    
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/resources/${id}/upvote`, { 
        method: 'POST',
        headers: { 
          'X-User-Id': user.id,
          'X-User-Role': user.role
        }
      });
      if (response.ok) fetchResources();
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

  const typeConfig = {
    'Notes': { icon: 'description', color: 'text-primary', bg: 'bg-primary/10' },
    'Exam Paper': { icon: 'quiz', color: 'text-secondary', bg: 'bg-secondary/10' },
    'Study Guide': { icon: 'menu_book', color: 'text-tertiary', bg: 'bg-tertiary/10' },
    'Textbook': { icon: 'picture_as_pdf', color: 'text-primary', bg: 'bg-primary/10' },
    'Link': { icon: 'link', color: 'text-secondary', bg: 'bg-secondary/10' }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    try {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    } catch (e) {
      return 'U';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Study Resources</h1>
              <p className="text-base text-on-surface-variant">Discover notes, past papers, and guides to power your studies.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <span className="material-symbols-outlined">share</span>
              Share Resource
            </button>
          </div>
          
          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full bg-surface-container-high border border-outline-variant rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-sm" 
              placeholder="Search for courses, topics, or authors..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all uppercase border ${
                  activeFilter === filter 
                    ? 'bg-primary text-on-primary border-primary shadow-md' 
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
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

        {loading && resources.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-surface-container-low/40 rounded-3xl border border-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredResources.map((res, idx) => {
                if (!res || !res.id) return null;
                const config = typeConfig[res.type] || typeConfig['Notes'];
                const isFeatured = idx % 5 === 0;
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={res.id}
                    className={`relative bg-surface-container-low/40 backdrop-blur-xl border border-white/[0.03] rounded-3xl p-8 flex flex-col justify-between group hover:bg-surface-container-high/50 transition-all shadow-2xl hover:shadow-primary/5 ${isFeatured ? 'md:col-span-2' : 'col-span-1'}`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                       {canManageResource(res.uploader?.id) && (
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteResource(res.id); }} className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all">
                           <span className="material-symbols-outlined text-[20px]">delete</span>
                         </button>
                       )}
                    </div>

                    <div className="mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center mb-6 shadow-xl`}>
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{config.icon}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-80">
                          {res.type || 'Resource'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-on-surface-variant/20"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                          {res.courseCode || 'GENERAL'}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-on-surface mb-2 group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                        {res.title || 'Untitled Resource'}
                      </h3>
                      <p className="text-sm text-on-surface-variant/60 leading-relaxed line-clamp-2">
                        {res.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-[10px] font-black text-primary border border-white/5">
                          {res.anonymous ? '?' : getInitials(res.uploader?.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface opacity-80">{res.anonymous ? 'Anonymous' : (res.uploader?.name || 'User')}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">Contributor</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${userUpvotes[res.id] ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' : 'bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10'}`}
                          onClick={() => handleUpvote(res.id)}
                          disabled={!!userUpvotes[res.id]}
                        >
                          <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                          {res.upvotes || 0}
                        </button>
                        
                        <a 
                          href={res.fileUrl?.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL}${res.fileUrl || ''}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                          download
                        >
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {filteredResources.length === 0 && !loading && (
          <div className="text-center p-12 border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No resources found</h3>
            <p className="text-on-surface-variant">
              {search 
                ? `We couldn't find anything matching "${search}" in ${activeFilter}.` 
                : `No resources available in ${activeFilter}. Be the first to share!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
