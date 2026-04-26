import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceModal } from './ResourceModal';

export function ResourceFeed() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Resources');
  const { user } = useAuth();
  
  // Local upvote tracking
  const [userUpvotes, setUserUpvotes] = useState(() => {
    const saved = localStorage.getItem('userUpvotes');
    return saved ? JSON.parse(saved) : {};
  });

  const canManageResource = (uploaderId) => {
    if (!user) return false;
    return user.id === uploaderId || user.role?.toUpperCase() === 'ADMIN';
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const url = search ? `${import.meta.env.VITE_API_URL}/api/resources?query=${search}` : `${import.meta.env.VITE_API_URL}/api/resources`;
      const response = await fetch(url);
      if (response.ok) {
        setResources(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchResources();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 
          'X-User-Id': user.id, 
          'X-User-Role': user.role 
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${id}/upvote`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Role': user.role
        }
      });
      if (response.ok) fetchResources();
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const filters = ['All Resources', 'Lecture Notes', 'Exam Papers', 'Study Guides', 'Textbooks'];

  const filteredResources = resources.filter(res => {
    if (activeFilter === 'All Resources') return true;
    if (activeFilter === 'Lecture Notes' && res.type === 'Notes') return true;
    if (activeFilter === 'Exam Papers' && res.type === 'Exam Paper') return true;
    if (activeFilter === 'Study Guides' && res.type === 'Study Guide') return true;
    if (activeFilter === 'Textbooks' && res.type === 'Textbook') return true;
    return false;
  });

  const [showModal, setShowModal] = useState(false);

  const getIconForType = (type) => {
    switch (type) {
      case 'Notes': return { icon: 'description', colorClass: 'text-primary', bgClass: 'bg-primary/10' };
      case 'Exam Paper': return { icon: 'quiz', colorClass: 'text-secondary', bgClass: 'bg-secondary/10' };
      case 'Study Guide': return { icon: 'menu_book', colorClass: 'text-tertiary', bgClass: 'bg-tertiary/10' };
      case 'Textbook': return { icon: 'picture_as_pdf', colorClass: 'text-primary', bgClass: 'bg-primary/10' };
      case 'Link': return { icon: 'link', colorClass: 'text-secondary', bgClass: 'bg-secondary/10' };
      default: return { icon: 'description', colorClass: 'text-primary', bgClass: 'bg-primary/10' };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        {/* Header & Search Section */}
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

          {/* Filter Chips */}
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
          onResourceCreated={fetchResources} 
        />

        {/* Resource Grid Bento Style */}
        {loading && resources.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-64 bg-surface-container rounded-xl border border-outline-variant/30 p-6 animate-pulse ${i === 1 ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'}`}></div>
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredResources.map((res, idx) => {
                const { icon, colorClass, bgClass } = getIconForType(res.type);
                const isFeatured = idx === 0;
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={res.id}
                    className={`bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all hover:shadow-[0px_4px_20px_rgba(0,0,0,0.4)] ${isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
                        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-1 bg-surface-container border border-outline-variant/50 rounded text-outline text-xs font-semibold uppercase tracking-wider">
                          {res.type}
                        </span>
                        {canManageResource(res.uploader.id) && (
                           <button onClick={() => handleDeleteResource(res.id)} className="text-error hover:text-error/80 transition-colors">
                             <span className="material-symbols-outlined text-[18px]">delete</span>
                           </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {res.courseCode ? `${res.courseCode}: ` : ''}{res.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 h-[40px]">
                        {res.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-auto border-t border-outline-variant/20 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-xs text-outline font-bold">
                            {getInitials(res.anonymous ? 'Anonymous' : res.uploader.name)}
                          </div>
                          <span className="text-sm text-on-surface-variant">
                            {res.anonymous ? 'Anonymous Student' : res.uploader.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            className={`flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 transition-colors ${userUpvotes[res.id] ? 'bg-secondary/20 text-secondary' : 'text-outline hover:text-on-surface bg-surface-container-high'}`}
                            onClick={() => handleUpvote(res.id)}
                            disabled={userUpvotes[res.id]}
                          >
                            <span className="material-symbols-outlined text-[16px]">{userUpvotes[res.id] ? 'thumb_up' : 'thumb_up'}</span>
                            {res.upvotes}
                          </button>
                          
                          <a 
                            href={res.fileUrl.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL}${res.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 rounded-full bg-surface-container-high hover:bg-surface-variant text-outline hover:text-primary transition-colors flex items-center justify-center"
                            download
                          >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                          </a>
                        </div>
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
