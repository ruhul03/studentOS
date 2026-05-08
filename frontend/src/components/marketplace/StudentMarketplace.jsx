import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketplaceItemCard } from './MarketplaceItemCard';
import { MarketplaceItemModal } from './MarketplaceItemModal';
import { MarketplaceForm } from './MarketplaceForm';

export function StudentMarketplace({ onProfileView }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'Good',
    category: 'Books',
    contactInfo: '',
    itemPhotos: [],
    photoPreviews: []
  });

  const API = `${import.meta.env.VITE_API_URL}/api/marketplace`;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'All' ? API : `${API}?category=${activeCategory}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  }, [API, activeCategory, user?.token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', price: '', condition: 'Good', category: 'Books', contactInfo: '', itemPhotos: [], photoPreviews: [] });
    setShowForm(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      price: item.price,
      condition: item.condition,
      category: item.category,
      contactInfo: item.contactInfo,
      itemPhotos: [],
      photoPreviews: item.photosJson ? JSON.parse(item.photosJson) : []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      const resp = await fetch(`${API}/${id}?userId=${user.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (resp.ok) fetchItems();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const markAsSold = async (id) => {
    try {
      const resp = await fetch(`${API}/${id}/sold`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (resp.ok) fetchItems();
    } catch (err) {
      console.error('Failed to mark as sold', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("Login required");
    
    setError(null);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      sellerId: user.id,
      photosJson: JSON.stringify(form.photoPreviews)
    };
    delete payload.itemPhotos;
    delete payload.photoPreviews;

    try {
      const isEdit = !!editingItem;
      const url = isEdit ? `${API}/${editingItem.id}` : API;
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowForm(false);
        fetchItems();
      } else {
        setError("Save failed. Try again.");
      }
    } catch (err) {
      console.error('Save failed', err);
      setError("Network error. Listing not saved.");
    }
  };

  const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other'];

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto pb-16 px-4 lg:px-0 animate-fade-in overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Student Economy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none">
            Campus <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-medium max-w-md">Trade textbooks, gadgets, and campus essentials with your peers safely.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            onClick={handleOpenCreate}
          >
            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            List New Item
          </motion.button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-3 mb-10 flex flex-col xl:flex-row gap-4 items-stretch shrink-0 shadow-inner">
        <div className="relative flex-1 group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="w-full bg-transparent border-none rounded-2xl py-4 pl-14 pr-4 text-on-surface focus:outline-none text-sm font-bold placeholder:text-outline/60" 
            placeholder="Search items, categories, sellers..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-surface-container-high rounded-2xl overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-surface text-on-surface shadow-md' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
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
              {filteredItems.map(item => (
                <MarketplaceItemCard 
                  key={item.id} 
                  item={item} 
                  user={user}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onMarkAsSold={markAsSold}
                  onProfileView={onProfileView}
                  onOpenModal={setSelectedItem}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-container/20 rounded-[3rem] border border-dashed border-outline-variant/30">
            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-container flex items-center justify-center text-outline-variant mb-6 shadow-inner">
              <span className="material-symbols-outlined text-[48px]">storefront</span>
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Marketplace Empty</h3>
            <p className="text-on-surface-variant text-sm max-w-xs font-medium opacity-70 mb-8">Be the first to list an item or try adjusting your current filters.</p>
            <button className="px-8 py-3 bg-secondary text-on-secondary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 transition-all hover:scale-105" onClick={handleOpenCreate}>
              Start Selling
            </button>
          </div>
        )}
      </div>

      <MarketplaceForm 
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        form={form}
        setForm={setForm}
        error={error}
      />

      <MarketplaceItemModal 
        show={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onProfileView={onProfileView}
      />

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
