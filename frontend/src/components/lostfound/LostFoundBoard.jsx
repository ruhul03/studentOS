import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LostFoundFiltersModal } from './LostFoundFiltersModal';

export function LostFoundBoard({ onProfileView }) {
  const [items, setItems] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    status: 'ALL',
    category: 'All',
    dateRange: 'All time'
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('LOST');
  const [category, setCategory] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [itemPhotos, setItemPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const savedItems = localStorage.getItem('lostfound-items');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (err) {
        console.error('Failed to load saved items:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('lostfound-items', JSON.stringify(items));
    }
  }, [items]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const newPhotoPreview = reader.result;
          setPhotoPreviews(prev => [...prev, newPhotoPreview]);
          setItemPhotos(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      } else {
        setPostError('Please select a valid image file');
      }
    }
  };

  const removePhoto = (index) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setItemPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  const closePhotoViewer = () => {
    setShowPhotoViewer(false);
    setSelectedPhoto(null);
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    setCategory(item.category || '');
    setDateLost(item.dateLost || '');
    setLocation(item.location);
    setContactInfo(item.contactInfo);
    setPhotoPreviews(item.photos || (item.photo ? [item.photo] : []));
    setItemPhotos(item.photos || []);
    setShowReportForm(true);
    setPostError(null);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = activeFilters.status === 'ALL' 
        ? `${import.meta.env.VITE_API_URL}/api/lostfound` 
        : `${import.meta.env.VITE_API_URL}/api/lostfound?type=${activeFilters.status}`;
      const response = await fetch(url);
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeFilters.status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
        setPostError("Please log in to report items.");
        return;
    }

    setPostError(null);
    try {
      const isEdit = !!editingItem;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/lostfound/${editingItem.id}` 
        : `${import.meta.env.VITE_API_URL}/api/lostfound`;
      
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const requestData = { title, description, type, category, dateLost, location, contactInfo, reporterId: user.id };
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        if (photoPreviews.length > 0) {
          const newItem = { ...result, photos: photoPreviews };
          if (isEdit) {
            setItems(prevItems => prevItems.map(item => item.id === editingItem.id ? newItem : item));
          } else {
            setItems(prevItems => [newItem, ...prevItems]);
          }
        } else {
          fetchItems();
        }
        
        setShowReportForm(false);
        setEditingItem(null);
        setTitle(''); setDescription(''); setLocation(''); setContactInfo(''); setCategory(''); setDateLost('');
        setItemPhotos([]); setPhotoPreviews([]);
      } else {
        const errorData = await response.text();
        setPostError(`Server Error (${response.status}): ${errorData || response.statusText}`);
      }
    } catch (err) {
      console.error('Report failed:', err);
      const newItem = {
        id: Date.now(),
        title, description, type, category, dateLost, location, contactInfo,
        photos: photoPreviews,
        reporter: user,
        reportedAt: new Date().toISOString(),
        resolved: false
      };
      
      if (editingItem) {
        setItems(prevItems => prevItems.map(item => item.id === editingItem.id ? { ...item, ...newItem, id: editingItem.id } : item));
      } else {
        setItems(prevItems => [newItem, ...prevItems]);
      }
      
      setShowReportForm(false);
      setEditingItem(null);
      setTitle(''); setDescription(''); setLocation(''); setContactInfo(''); setCategory(''); setDateLost('');
      setItemPhotos([]); setPhotoPreviews([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lostfound/${id}?userId=${user.id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchItems();
      } else {
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
      }
    } catch (err) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
    }
  };

  const handleResolve = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lostfound/${id}/resolve`, { method: 'PUT' });
      if (response.ok) {
        fetchItems();
      } else {
        const updatedItems = items.map(item => item.id === id ? { ...item, resolved: true } : item);
        setItems(updatedItems);
        localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
      }
    } catch (err) {
      const updatedItems = items.map(item => item.id === id ? { ...item, resolved: true } : item);
      setItems(updatedItems);
      localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
    }
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBadgeInfo = (item) => {
    const days = getDaysAgo(item.reportedAt);
    if (item.type === 'LOST') {
      return {
        text: days === 0 ? 'Missing Today' : `Missing ${days} Days`,
        bgClass: 'bg-error-container',
        textClass: 'text-on-error'
      };
    } else {
      return {
        text: days === 0 ? 'Just Found' : `Found ${days} Days Ago`,
        bgClass: 'bg-secondary-container',
        textClass: 'text-on-secondary-container'
      };
    }
  };

  const filteredItems = items.filter(item => {
    // Text search
    if (searchQuery && 
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (activeFilters.category !== 'All' && item.category !== activeFilters.category) {
      // If the item doesn't have a category, or it doesn't match
      return false;
    }
    
    // Date Range filter
    if (activeFilters.dateRange !== 'All time') {
      const daysAgo = getDaysAgo(item.reportedAt);
      if (activeFilters.dateRange === 'Last 24 hours' && daysAgo > 1) return false;
      if (activeFilters.dateRange === 'Last 7 days' && daysAgo > 7) return false;
      if (activeFilters.dateRange === 'Last 30 days' && daysAgo > 30) return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full max-w-[1440px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">
            Lost & <span className="text-transparent bg-clip-text bg-gradient-to-r from-error to-secondary">Found</span>
          </h1>
          <p className="text-on-surface-variant text-base">Reunite with your missing items or help others find theirs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-surface-variant border border-outline-variant hover:bg-surface-bright text-on-surface text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (showReportForm) {
                setShowReportForm(false);
                setEditingItem(null);
                setTitle(''); setDescription(''); setLocation(''); setContactInfo(''); setCategory(''); setDateLost('');
              } else {
                setShowReportForm(true);
              }
            }}
            className="bg-primary text-on-primary text-sm font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">{showReportForm ? 'close' : 'add'}</span>
            {showReportForm ? 'Cancel Report' : 'Report Item'}
          </motion.button>
        </div>
      </div>

      {/* Search and Filter Module */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shrink-0">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">search</span>
          <input 
            type="text"
            className="w-full bg-background border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
            placeholder="Search for 'keys', 'blue backpack'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <button 
            className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${activeFilters.status === 'ALL' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-bright border-transparent'}`}
            onClick={() => setActiveFilters({ ...activeFilters, status: 'ALL' })}
          >All Items</button>
          <button 
            className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${activeFilters.status === 'LOST' ? 'bg-error/10 text-error border-error/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-bright border-transparent'}`}
            onClick={() => setActiveFilters({ ...activeFilters, status: 'LOST' })}
          >Lost</button>
          <button 
            className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${activeFilters.status === 'FOUND' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-bright border-transparent'}`}
            onClick={() => setActiveFilters({ ...activeFilters, status: 'FOUND' })}
          >Found</button>
        </div>
      </div>

      <AnimatePresence>
        {showReportForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface-container-high w-full max-w-2xl rounded-xl border border-outline-variant shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">
                    {editingItem ? 'Edit Report' : (type === 'LOST' ? 'Report Lost Item' : 'Report Found Item')}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">Please provide detailed information to help us locate the item.</p>
                </div>
                <button 
                  type="button"
                  className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-colors"
                  onClick={() => {
                    setShowReportForm(false);
                    setEditingItem(null);
                    setTitle(''); setDescription(''); setLocation(''); setContactInfo(''); setCategory(''); setDateLost('');
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Body (Form) */}
              <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {postError && (
                  <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    <span className="text-sm">{postError}</span>
                  </div>
                )}

                <form id="report-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Item Name */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Item Name</label>
                    <input 
                      type="text" 
                      className="bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline" 
                      placeholder="e.g., MacBook Pro 14-inch, Blue Water Bottle" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Report Type</label>
                    <div className="relative">
                      <select 
                        className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                      >
                        <option value="LOST">Lost Item</option>
                        <option value="FOUND">Found Item</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Category</label>
                    <div className="relative">
                      <select 
                        className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing & Accessories</option>
                        <option value="Books & Materials">Books & Documents</option>
                        <option value="Keys & Lanyards">Keys & IDs</option>
                        <option value="Wallets & IDs">Wallets & IDs</option>
                        <option value="Other">Other</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Date Lost/Found */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Date {type === 'LOST' ? 'Lost' : 'Found'}</label>
                    <input 
                      type="date" 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                      style={{ colorScheme: 'dark' }}
                      value={dateLost}
                      onChange={e => setDateLost(e.target.value)}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Contact Info</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline" 
                      placeholder="Your phone number or email" 
                      value={contactInfo} 
                      onChange={e => setContactInfo(e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Location Lost/Found */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Last Known Location</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                      <input 
                        type="text" 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline" 
                        placeholder="e.g., Library 2nd Floor, Main Cafeteria" 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Detailed Description</label>
                    <textarea 
                      className="bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline resize-none" 
                      placeholder="Provide identifying marks, colors, brand names, or specific contents..." 
                      rows="3"
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      required 
                    ></textarea>
                  </div>

                  {/* Image Upload */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-bold tracking-wider uppercase text-on-surface-variant">Photo of Item (Optional)</label>
                    
                    {photoPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant group">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                className="bg-error text-white p-2 rounded-full hover:bg-error/80 transition-colors"
                                onClick={() => removePhoto(index)}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        <label className="aspect-square border-2 border-outline-variant/30 rounded-xl flex flex-col items-center justify-center text-center hover:bg-surface hover:border-outline transition-colors cursor-pointer group">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-2xl">add</span>
                          <span className="text-xs text-on-surface-variant mt-1">Add More</span>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                        </label>
                      </div>
                    ) : (
                      <label className="border-2 border-outline-variant/30 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-surface hover:border-outline transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-2xl">add_photo_alternate</span>
                        </div>
                        <p className="text-sm text-on-surface font-medium">Click to upload or drag and drop</p>
                        <p className="text-[12px] text-on-surface-variant mt-1">PNG, JPG, or HEIC up to 5MB</p>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                      </label>
                    )}
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container/50">
                <button 
                  type="button"
                  className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-variant transition-colors"
                  onClick={() => {
                    setShowReportForm(false);
                    setEditingItem(null);
                    setTitle(''); setDescription(''); setLocation(''); setContactInfo(''); setCategory(''); setDateLost('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="report-form"
                  className="px-6 py-2.5 rounded-lg bg-[#6366F1] text-white text-sm font-medium hover:bg-[#5255D9] transition-colors shadow-md flex items-center gap-2"
                >
                  <span>{editingItem ? 'Update Report' : 'Submit Report'}</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredItems.map((item) => {
            const badgeInfo = getBadgeInfo(item);
            
            return (
              <motion.div 
                layout
                key={item.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden group hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col ${item.resolved ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="relative h-48 bg-surface-variant overflow-hidden flex items-center justify-center bg-gradient-to-br from-surface-variant to-background">
                  {item.photos && item.photos.length > 0 ? (
                    <img 
                      src={item.photos[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                      onClick={() => openPhotoViewer(item.photos[0])}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[64px] text-outline/30">{item.type === 'LOST' ? 'search' : 'inventory_2'}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none"></div>
                  
                  <div className={`absolute top-3 left-3 ${badgeInfo.bgClass} ${badgeInfo.textClass} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md`}>
                    {item.resolved ? 'RESOLVED' : badgeInfo.text}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col relative z-10 bg-surface-container-low">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-on-surface line-clamp-1">{item.title}</h3>
                    <span className="material-symbols-outlined text-outline text-[20px]">
                      {item.type === 'LOST' ? 'help_center' : 'where_to_vote'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{item.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-outline-variant/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-on-surface-variant text-[13px]">
                      <div className="flex items-center gap-1.5 font-medium truncate max-w-[60%]">
                        <span className="material-symbols-outlined text-[16px] shrink-0">location_on</span>
                        <span className="truncate">{item.location}</span>
                      </div>
                      <span className="shrink-0">{new Date(item.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-on-surface-variant text-[13px]">
                      <div className="flex items-center gap-1.5 font-medium truncate max-w-[60%] hover:text-on-surface cursor-pointer transition-colors" onClick={() => onProfileView && onProfileView(item.reporter.id)}>
                        <span className="material-symbols-outlined text-[16px] shrink-0">person</span>
                        <span className="truncate">{item.reporter?.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex gap-2">
                        {user && (user.id === item.reporter?.id || user.role === 'ADMIN') && !item.resolved && (
                          <button 
                            className="text-primary hover:text-primary-fixed-dim transition-colors"
                            onClick={() => handleResolve(item.id)}
                            title="Mark as Resolved"
                          >
                            <span className="material-symbols-outlined text-[18px]">task_alt</span>
                          </button>
                        )}
                        {user && (user.id === item.reporter?.id || user.role === 'ADMIN') && (
                          <button 
                            className="text-error hover:text-error-container transition-colors"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center border border-outline-variant/30 rounded-xl bg-surface-container-highest mt-4">
             <span className="material-symbols-outlined text-4xl text-outline mb-4">search_off</span>
             <h3 className="text-xl font-bold text-on-surface mb-2">No items found</h3>
             <p className="text-on-surface-variant">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {showPhotoViewer && selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
            onClick={closePhotoViewer}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors bg-surface-container-highest/50 p-2 rounded-full" 
                onClick={closePhotoViewer}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <img 
                src={selectedPhoto} 
                alt="Full size photo" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-outline-variant/50"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Modal */}
      <LostFoundFiltersModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={(newFilters) => setActiveFilters(newFilters)}
      />
    </div>
  );
}
