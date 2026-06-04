import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketplaceItemCard } from './MarketplaceItemCard';
import { MarketplaceItemModal } from './MarketplaceItemModal';
import { MarketplaceForm } from './MarketplaceForm';
import { useMarketplace } from '../../hooks/useMarketplace';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { ShoppingCart, Search, Store } from 'lucide-react';
import SEO from '../SEO/SEO';

export function StudentMarketplace({ onProfileView }) {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { 
    items, 
    isLoading, 
    error, 
    saveListing, 
    deleteListing, 
    markAsSold, 
    refetch 
  } = useMarketplace(activeCategory);

  const filteredItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter(item => 
      !search || 
      (item.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
      (item.description?.toLowerCase() || '').includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    deleteListing({ id, userId: user.id });
  };

  const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other'];

  if (isLoading) return <LoadingState message="Loading campus marketplace..." />;
  if (error) return <ErrorState message="Failed to load marketplace listings." onRetry={refetch} />;

  // SEO Schema for Marketplace
  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Campus Marketplace | StudentOS",
    "description": "Buy and sell textbooks, gadgets, and campus essentials safely with peers at United International University.",
    "url": "https://student-os-uiu.vercel.app/marketplace"
  };

  return (
    <div className="flex flex-col md:h-full w-full max-w-7xl mx-auto max-md:pb-32 md:pb-16 px-4 lg:px-0 animate-fade-in md:overflow-y-auto md:custom-scrollbar overflow-x-hidden">
      <SEO 
        title="Campus Marketplace | StudentOS" 
        description="Buy and sell textbooks, gadgets, and campus essentials safely with peers at United International University."
        schema={marketplaceSchema}
      />
      
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
            className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            onClick={handleOpenCreate}
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            List New Item
          </motion.button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-3 mb-10 flex flex-col xl:flex-row gap-4 items-stretch shrink-0 shadow-inner">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
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
        {filteredItems.length > 0 ? (
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
              <Store size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Marketplace Empty</h3>
            <p className="text-on-surface-variant text-sm max-w-xs font-medium opacity-70 mb-8">Be the first to list an item or try adjusting your current filters.</p>
            <button className="px-8 py-3 bg-secondary text-on-secondary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 transition-all hover:scale-105 cursor-pointer" onClick={handleOpenCreate}>
              Start Selling
            </button>
          </div>
        )}
      </div>

      <MarketplaceForm 
        show={showForm}
        onClose={() => setShowForm(false)}
        onSave={saveListing}
        editingItem={editingItem}
      />

      <MarketplaceItemModal 
        show={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onProfileView={onProfileView}
      />

    </div>
  );
}

