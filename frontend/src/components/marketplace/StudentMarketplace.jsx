import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentMarketplace({ onProfileView }) {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('Books');
  const [contactInfo, setContactInfo] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [itemPhotos, setItemPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPhotoPreviews(prev => [...prev, reader.result]);
          setItemPhotos(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (index) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setItemPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  const fetchItems = async () => {
    try {
      const url = activeCategory === 'All' 
        ? `${import.meta.env.VITE_API_URL}/api/marketplace` 
        : `${import.meta.env.VITE_API_URL}/api/marketplace?category=${activeCategory}`;
        
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        if (search) {
          data = data.filter((item) => 
            item.title.toLowerCase().includes(search.toLowerCase()) || 
            item.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace items', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeCategory, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const isEdit = !!editingItem;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/marketplace/${editingItem.id}` 
        : `${import.meta.env.VITE_API_URL}/api/marketplace`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, 
          description, 
          price: parseFloat(price), 
          condition, 
          category, 
          contactInfo, 
          sellerId: user.id,
          photosJson: JSON.stringify(photoPreviews)
        })
      });

      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        setTitle(''); setDescription(''); setPrice(''); setCondition('Good'); setCategory('Books'); setContactInfo('');
        setPhotoPreviews([]); setItemPhotos([]);
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to save listing', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) fetchItems();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setPrice(item.price);
    setCondition(item.condition);
    setCategory(item.category);
    setContactInfo(item.contactInfo);
    try {
      setPhotoPreviews(JSON.parse(item.photosJson || '[]'));
    } catch (e) {
      setPhotoPreviews([]);
    }
    setShowForm(true);
  };

  const markAsSold = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/${id}/sold`, { method: 'PUT' });
      fetchItems();
    } catch (err) {
      console.error('Failed to mark item as sold', err);
    }
  };

  const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other'];

  const getConditionStyles = (cond) => {
    switch (cond) {
      case 'New': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'Good': return 'text-tertiary bg-tertiary/10 border-tertiary/20';
      case 'Fair': return 'text-error bg-error/10 border-error/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1440px] mx-auto pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Marketplace</span>
          </h1>
          <p className="text-on-surface-variant text-base">Trade textbooks, gadgets, and essentials with your peers.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="bg-surface-container border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm w-full md:w-64 placeholder-outline transition-shadow" 
              placeholder="Search items..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-gradient-to-tr from-primary to-primary-fixed text-on-primary rounded-xl px-8 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 flex items-center justify-center gap-2"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingItem(null);
                setTitle(''); setDescription(''); setPrice(''); setCondition('Good'); setCategory('Books'); setContactInfo('');
                setPhotoPreviews([]); setItemPhotos([]);
              } else {
                setShowForm(true);
              }
            }}
          >
            <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add_shopping_cart'}</span>
            {showForm ? 'Cancel Listing' : 'Create Listing'}
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-8 shrink-0">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'All' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            {/* Modal Backdrop */}
            <div 
              className="absolute inset-0 bg-background/90 backdrop-blur-sm transition-opacity cursor-pointer"
              onClick={() => {
                setShowForm(false);
                setEditingItem(null);
                setTitle(''); setDescription(''); setPrice(''); setCondition('New'); setCategory('Books'); setContactInfo('');
                setPhotoPreviews([]); setItemPhotos([]);
              }}
            ></div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-50 bg-surface-container w-full max-w-2xl rounded-xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">{editingItem ? 'Edit Listing' : 'List New Item'}</h3>
                <button 
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setTitle(''); setDescription(''); setPrice(''); setCondition('New'); setCategory('Books'); setContactInfo('');
                    setPhotoPreviews([]); setItemPhotos([]);
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="list-item-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Photo Upload Zone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Item Photos</label>
                    {photoPreviews.length > 0 ? (
                      <div className="flex flex-wrap gap-4 p-4 border border-outline-variant rounded-lg bg-surface">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-outline-variant group">
                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" className="text-white hover:text-error transition-colors" onClick={() => removePhoto(index)}>
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        {photoPreviews.length < 5 && (
                          <label className="w-20 h-20 border border-outline-variant/30 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-surface-variant transition-colors group">
                            <span className="material-symbols-outlined text-outline group-hover:text-primary text-[24px]">add</span>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="border border-outline-variant/30 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-variant/50 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors border border-outline-variant/50">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-2xl">add_photo_alternate</span>
                        </div>
                        <p className="text-sm text-on-surface font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-[12px] text-on-surface-variant">SVG, PNG, JPG or GIF (max. 5MB)</p>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                      </label>
                    )}
                  </div>

                  {/* Title and Category */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Item Title</label>
                      <input 
                        type="text" 
                        className="bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline" 
                        placeholder="e.g. Calculus Early Transcendentals" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="sm:w-1/2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Category</label>
                      <div className="relative">
                        <select 
                          className="w-full appearance-none bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                          value={category} 
                          onChange={e => setCategory(e.target.value)}
                        >
                          <option value="Books">Books</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Condition */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="sm:w-1/2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          className="w-full bg-surface border border-outline-variant rounded-md py-2.5 pl-8 pr-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline" 
                          placeholder="0.00" 
                          value={price} 
                          onChange={e => setPrice(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="sm:w-1/2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Condition</label>
                      <div className="flex rounded-md border border-outline-variant overflow-hidden">
                        <button 
                          type="button"
                          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${condition === 'New' ? 'bg-primary/20 text-primary border-r border-outline-variant' : 'bg-surface text-on-surface hover:bg-surface-variant border-r border-outline-variant'}`}
                          onClick={() => setCondition('New')}
                        >
                          New
                        </button>
                        <button 
                          type="button"
                          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${condition === 'Used' ? 'bg-primary/20 text-primary' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
                          onClick={() => setCondition('Used')}
                        >
                          Used
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Description</label>
                    <textarea 
                      className="bg-surface border border-outline-variant rounded-md px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline resize-none min-h-[120px]" 
                      placeholder="Describe the item, including any wear and tear..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      required 
                    ></textarea>
                  </div>
                  
                  {/* Contact Info (Required by Backend) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">Contact Info</label>
                    <input 
                      type="text" 
                      className="bg-surface border border-outline-variant rounded-md px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline" 
                      placeholder="Email or Phone number" 
                      value={contactInfo} 
                      onChange={e => setContactInfo(e.target.value)} 
                      required 
                    />
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-outline-variant flex justify-end gap-3 bg-surface-container/50">
                <button 
                  type="button"
                  className="px-6 py-2 border border-outline-variant text-on-surface text-sm font-medium rounded hover:bg-surface-variant transition-colors"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setTitle(''); setDescription(''); setPrice(''); setCondition('New'); setCategory('Books'); setContactInfo('');
                    setPhotoPreviews([]); setItemPhotos([]);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="list-item-form"
                  className="px-6 py-2 bg-primary text-on-primary-fixed-variant text-sm font-medium rounded hover:bg-primary-container transition-colors"
                >
                  {editingItem ? 'Update Listing' : 'Post Listing'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid / Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.map(item => {
            const photos = item.photosJson ? JSON.parse(item.photosJson) : [];
            const mainPhoto = photos.length > 0 ? photos[0] : null;

            return (
              <motion.div 
                layout
                key={item.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden group hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 flex flex-col ${item.sold ? 'opacity-50 grayscale' : ''}`}
              >
                <div 
                  className="relative h-48 w-full bg-surface-container-highest cursor-pointer flex items-center justify-center"
                  onClick={() => openItemModal(item)}
                >
                  {mainPhoto ? (
                    <img src={mainPhoto} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="material-symbols-outlined text-[64px] text-outline/30">storefront</span>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-primary text-sm font-bold px-3 py-1 rounded-lg border border-primary/20">
                    ${Number(item.price).toFixed(0)}
                  </div>
                  
                  {item.sold && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="bg-error text-white font-bold px-4 py-2 rounded-lg text-lg transform -rotate-12 border-2 border-white">SOLD</span>
                    </div>
                  )}

                  {photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-on-surface text-[10px] font-bold px-2 py-1 rounded-md border border-outline-variant/50">
                      +{photos.length - 1}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1 relative z-10 bg-surface-container-low">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-on-surface line-clamp-1">{item.title}</h3>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant mb-4 flex-1 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/50">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getConditionStyles(item.condition)}`}>
                      {item.condition === 'New' ? 'Like New' : item.condition}
                    </span>
                    <span className="text-sm text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> 
                      {getTimeAgo(item.listedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors line-clamp-1" onClick={() => onProfileView && onProfileView(item.seller?.id)}>
                      Sold by {item.seller?.name || 'Anonymous'}
                    </span>

                    <div className="flex gap-2">
                      {(user?.id === item.seller?.id || user?.role === 'ADMIN') ? (
                        <>
                          <button className="text-primary hover:text-primary-fixed transition-colors" onClick={() => startEdit(item)} title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {!item.sold && (
                            <button className="text-secondary hover:text-secondary-fixed transition-colors" onClick={() => markAsSold(item.id)} title="Mark as Sold">
                              <span className="material-symbols-outlined text-[18px]">task_alt</span>
                            </button>
                          )}
                          <button className="text-error hover:text-error-container transition-colors" onClick={() => handleDelete(item.id)} title="Delete">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant border border-outline-variant rounded px-2 py-1 bg-surface">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          {item.contactInfo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {items.length === 0 && !search && activeCategory === 'All' && (
          <div className="col-span-full p-12 text-center border border-outline-variant/30 rounded-xl bg-surface-container-highest mt-4 flex flex-col items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-outline mb-4">storefront</span>
             <h3 className="text-xl font-bold text-on-surface mb-2">Marketplace is Open</h3>
             <p className="text-on-surface-variant mb-6">The student market is currently empty. Be the first to list something!</p>
             <button className="bg-primary text-on-primary-fixed-variant px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2" onClick={() => setShowForm(true)}>
               <span className="material-symbols-outlined text-sm">add</span>
               List Your Item
             </button>
          </div>
        )}
        
        {items.length === 0 && (search || activeCategory !== 'All') && (
          <div className="col-span-full p-12 text-center border border-outline-variant/30 rounded-xl bg-surface-container-highest mt-4">
             <span className="material-symbols-outlined text-4xl text-outline mb-4">search_off</span>
             <h3 className="text-xl font-bold text-on-surface mb-2">No matches found</h3>
             <p className="text-on-surface-variant">We couldn't find what you're looking for. Try a different search term or category.</p>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      <AnimatePresence>
        {showItemModal && selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            {/* Modal Backdrop */}
            <div 
              className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-md transition-opacity cursor-pointer"
              onClick={closeItemModal}
            ></div>

            {/* Pop-up Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-50 bg-surface-container w-full max-w-5xl rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button (Absolute) */}
              <button 
                className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors z-20"
                onClick={closeItemModal}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {/* Left: Image Canvas */}
              <div className="w-full md:w-1/2 bg-surface-container-lowest relative min-h-[300px] md:min-h-full border-b md:border-b-0 md:border-r border-outline-variant flex items-center justify-center overflow-hidden">
                {/* Glassmorphism Badge */}
                <div className="absolute top-6 left-6 z-10 bg-surface-container-lowest/60 backdrop-blur-md border border-outline-variant/50 px-4 py-1 rounded flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-inverse-primary">
                    {selectedItem.category === 'Electronics' ? 'headphones' : 
                     selectedItem.category === 'Books' ? 'menu_book' : 
                     selectedItem.category === 'Furniture' ? 'chair' : 
                     selectedItem.category === 'Clothing' ? 'checkroom' : 'sell'}
                  </span>
                  <span className="text-[12px] font-bold tracking-wider text-on-surface uppercase">{selectedItem.category}</span>
                </div>
                
                {selectedItem.photosJson && JSON.parse(selectedItem.photosJson).length > 0 ? (
                  <img 
                    src={JSON.parse(selectedItem.photosJson)[0]} 
                    alt={selectedItem.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-in-out" 
                  />
                ) : (
                  <span className="material-symbols-outlined text-[120px] text-outline/30">storefront</span>
                )}
                
                {/* Subtle Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-80 pointer-events-none"></div>
              </div>

              {/* Right: Content & Actions */}
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-4">
                  {/* Title & Header Info */}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1 tracking-tight">{selectedItem.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-sm">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Posted {getTimeAgo(selectedItem.listedAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-outline"></span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> Campus Marketplace</span>
                    </div>
                  </div>

                  {/* Price & Condition Row */}
                  <div className="flex items-end gap-6 my-4 pb-4 border-b border-outline-variant/30">
                    <span className="text-4xl font-bold text-inverse-primary leading-none">${Number(selectedItem.price).toFixed(2)}</span>
                    <div className="flex flex-col gap-1 pb-[2px]">
                      <span className="text-[12px] font-bold tracking-wider text-on-surface-variant uppercase">Condition</span>
                      <div className={`px-2 py-[2px] rounded text-[12px] font-bold uppercase flex items-center gap-1 w-fit border ${getConditionStyles(selectedItem.condition)}`}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        {selectedItem.condition === 'New' ? 'Like New' : selectedItem.condition}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="flex flex-col gap-2 mt-4">
                    <h3 className="text-lg font-bold text-on-surface">Item Details</h3>
                    <div className="text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                      {selectedItem.description}
                    </div>
                  </div>

                  {/* Seller Info Box */}
                  <div className="mt-6 p-4 bg-surface-container-high border border-outline-variant rounded-lg flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => { closeItemModal(); onProfileView && onProfileView(selectedItem.seller?.id); }}>
                      <span className="material-symbols-outlined text-on-surface-variant">person</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-on-surface font-semibold cursor-pointer hover:underline" onClick={() => { closeItemModal(); onProfileView && onProfileView(selectedItem.seller?.id); }}>{selectedItem.seller?.name || 'Anonymous'}</span>
                      <span className="text-[12px] font-bold tracking-wider text-on-surface-variant uppercase">Verified Student</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-outline-variant/30 shrink-0">
                  <button 
                    className="flex-1 bg-inverse-primary hover:bg-primary-container text-surface-container-lowest hover:text-on-primary-container text-[12px] font-bold tracking-wider uppercase px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                    onClick={() => window.location.href = `mailto:${selectedItem.contactInfo}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Contact Seller
                  </button>
                  <button className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-variant text-on-surface text-[12px] font-bold tracking-wider uppercase px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 group">
                    <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors">bookmark_border</span>
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
