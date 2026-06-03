import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { LostFoundFiltersModal } from './LostFoundFiltersModal';
import { LostFoundItemCard } from './LostFoundItemCard';
import { LostFoundForm } from './LostFoundForm';
import { playDeleteSound, playSuccessSound, playErrorSound } from '../../utils/notificationSound';
import { Filter, PlusCircle, Search, SearchX, X } from 'lucide-react';

export function LostFoundBoard({ onProfileView }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({ status: 'ALL', category: 'All', dateRange: 'All time' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'LOST',
    category: '',
    dateLost: '',
    location: '',
    contactInfo: '',
    itemPhotos: [],
    photoPreviews: []
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const API = `${import.meta.env.VITE_API_URL}/api/lostfound`;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeFilters.status === 'ALL' ? API : `${API}?type=${activeFilters.status}`;
      const resp = await fetchWithAuth(url);
      if (resp.ok) {
        setItems(await resp.json());
      }
    } catch (err) {
      console.error('Fetch failed', err);
      // Fallback to localStorage for persistence if API fails
      const saved = localStorage.getItem('lostfound-items');
      if (saved) setItems(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, [API, activeFilters.status, user?.token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (items.length > 0) localStorage.setItem('lostfound-items', JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = activeFilters.category === 'All' || item.category === activeFilters.category;
      
      let matchDate = true;
      if (activeFilters.dateRange !== 'All time') {
        const diff = Math.abs(new Date() - new Date(item.reportedAt));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (activeFilters.dateRange === 'Last 24 hours' && days > 1) matchDate = false;
        if (activeFilters.dateRange === 'Last 7 days' && days > 7) matchDate = false;
        if (activeFilters.dateRange === 'Last 30 days' && days > 30) matchDate = false;
      }
      
      return matchSearch && matchCategory && matchDate;
    });
  }, [items, searchQuery, activeFilters]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', type: 'LOST', category: '', dateLost: '', location: '', contactInfo: '', itemPhotos: [], photoPreviews: [] });
    setShowForm(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category || '',
      dateLost: item.dateLost || '',
      location: item.location,
      contactInfo: item.contactInfo,
      itemPhotos: [],
      photoPreviews: item.photos || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const resp = await fetchWithAuth(`${API}/${id}?userId=${user.id}`, { 
        method: 'DELETE'
      });
      if (resp.ok) { playDeleteSound(); fetchItems(); }
    } catch (err) {
      playDeleteSound();
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleResolve = async (id) => {
    // Optimistic update for immediate feedback
    setItems(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
    playSuccessSound();
    
    try {
      const resp = await fetchWithAuth(`${API}/${id}/resolve`, { 
        method: 'PUT'
      });
      if (!resp.ok) {
        throw new Error('Failed to resolve on server');
      }
      // Re-fetch in background to ensure sync
      fetchItems();
    } catch (err) {
      // Revert if failed
      setItems(prev => prev.map(i => i.id === id ? { ...i, resolved: false } : i));
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("Please login to report.");
    
    setError(null);
    const payload = { ...form, reporterId: user.id };
    delete payload.itemPhotos;
    delete payload.photoPreviews;
    if (form.photoPreviews.length > 0) payload.photos = form.photoPreviews;

    try {
      const isEdit = !!editingItem;
      const url = isEdit ? `${API}/${editingItem.id}` : API;
      const resp = await fetchWithAuth(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        playSuccessSound();
        setShowForm(false);
        fetchItems();
      } else {
        playErrorSound();
        setError("Failed to save. Please try again.");
      }
    } catch (err) {
      // Offline fallback
      const newItem = { ...payload, id: Date.now(), reporter: user, reportedAt: new Date().toISOString(), resolved: false };
      if (editingItem) {
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...newItem, id: editingItem.id } : i));
      } else {
        setItems(prev => [newItem, ...prev]);
      }
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto pb-16 px-4 lg:px-0 animate-fade-in overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Community Network</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">
            Lost & <span className="text-primary">Found</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-medium max-w-md">Reunite with your missing items or help others find theirs.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 sm:flex-none px-6 py-4 bg-surface-container border border-outline-variant rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-surface-variant transition-all flex items-center justify-center gap-3"
          >
            <Filter size={20} />
            Filters
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none px-8 py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <PlusCircle size={20} />
            Report Item
          </motion.button>
        </div>
      </div>

      {/* Search Bar & Fast Filters */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-2 mb-10 flex flex-col md:flex-row gap-2 items-stretch shrink-0 shadow-inner">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            className="w-full bg-transparent border-none rounded-2xl py-4 pl-14 pr-4 text-on-surface focus:outline-none text-sm font-medium" 
            placeholder="Search items, descriptions, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-surface-container-high rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'LOST', label: 'Lost' },
            { id: 'FOUND', label: 'Found' }
          ].map(btn => (
            <button 
              key={btn.id}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilters.status === btn.id 
                  ? 'bg-surface text-on-surface shadow-md' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveFilters({ ...activeFilters, status: btn.id })}
            >{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Board Grid */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-surface-container-low rounded-2xl animate-pulse border border-outline-variant/20"></div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-24">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <LostFoundItemCard 
                  key={item.id} 
                  item={item} 
                  user={user}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onResolve={handleResolve}
                  onProfileView={onProfileView}
                  onPhotoClick={setSelectedPhoto}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-container/20 rounded-[3rem] border border-dashed border-outline-variant/30">
            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-container flex items-center justify-center text-outline-variant mb-6 shadow-inner">
              <SearchX size={48} />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">No Items Found</h3>
            <p className="text-on-surface-variant text-sm max-w-xs font-medium opacity-70">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <LostFoundForm 
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        form={form}
        setForm={setForm}
        error={error}
      />

      <LostFoundFiltersModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={(newFilters) => setActiveFilters(newFilters)}
      />

      {/* Photo Viewer */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-white hover:text-primary transition-all w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-md" 
                onClick={() => setSelectedPhoto(null)}
              >
                <X size={24} />
              </button>
              
              <img 
                src={selectedPhoto} 
                alt="Enlarged view" 
                className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </div>
  );
}
