import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Marketplace.css';
import { Tag, Phone, Search, Image as ImageIcon, Plus, X, Camera, Upload } from 'lucide-react';
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
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  const closePhotoViewer = () => {
    setShowPhotoViewer(false);
    setSelectedPhoto(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="marketplace-container">
      <div className="market-header">
        <div>
          <h2>Campus Marketplace</h2>
          <p>Buy and sell items within the student community.</p>
        </div>
        <button className="sell-btn" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditingItem(null);
            setTitle(''); setDescription(''); setPrice(''); setCondition('Good'); setCategory('Books'); setContactInfo('');
            setPhotoPreviews([]); setItemPhotos([]);
          } else {
            setShowForm(true);
          }
        }}>
          <Tag size={18} /> {showForm ? 'Cancel' : 'Sell an Item'}
        </button>
      </div>

      <div className="market-controls">
        <div className="search-bar market-search">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for books, electronics, or campus essentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form className="sell-form glass-card" onSubmit={handleSubmit}>
          <h3>{editingItem ? 'Edit Listing' : 'List an Item for Sale'}</h3>
          <div className="form-row">
            <input type="text" placeholder="Item Name (e.g. Intro to Algorithms Book)" value={title} onChange={e => setTitle(e.target.value)} required />
            <div className="price-input">
              <span className="currency-symbol">$</span>
              <input type="number" step="0.01" min="0" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
          </div>
          <textarea placeholder="Description (Edition, details, why selling...)" value={description} onChange={e => setDescription(e.target.value)} required />
          <div className="form-row">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>
            <select value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="New">Like New</option>
              <option value="Good">Good Condition</option>
              <option value="Fair">Fair / Very Used</option>
            </select>
          </div>

          <div className="form-group photo-upload-section">
            <label>Item Photos</label>
            <div className="photo-upload-container">
              {photoPreviews.length > 0 ? (
                <div className="photo-preview-grid">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="photo-preview-item">
                      <img src={preview} alt={`Preview ${index}`} />
                      <button type="button" className="remove-photo-btn" onClick={() => removePhoto(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {photoPreviews.length < 5 && (
                    <label className="add-photo-btn-inline">
                      <Plus size={24} />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                    </label>
                  )}
                </div>
              ) : (
                <label className="photo-upload-placeholder-market">
                  <div className="upload-icons">
                    <Camera size={32} />
                    <Upload size={16} className="upload-sub-icon" />
                  </div>
                  <span>Add photos of your item (max 5)</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                </label>
              )}
            </div>
          </div>

          <input type="text" placeholder="Contact Info (Email or Phone)" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
          <button type="submit" className="submit-listing-btn">
            {editingItem ? 'Update Listing' : 'Publish Listing'}
          </button>
        </form>
      )}

      <div className="market-grid">
        {items.map(item => (
          <div key={item.id} className="market-card glass-card">
            <div className="item-image-container" onClick={() => {
              const photos = JSON.parse(item.photosJson || '[]');
              if (photos.length > 0) openPhotoViewer(photos[0]);
            }}>
              {item.photosJson && JSON.parse(item.photosJson).length > 0 ? (
                <img src={JSON.parse(item.photosJson)[0]} alt={item.title} className="item-main-image" />
              ) : (
                <div className="item-image-placeholder">
                   <ImageIcon size={32} className="image-icon" />
                </div>
              )}
              {item.photosJson && JSON.parse(item.photosJson).length > 1 && (
                <div className="photo-count-badge">+{JSON.parse(item.photosJson).length - 1}</div>
              )}
            </div>
            
            <div className="market-card-content">
              <div className="market-card-header">
                <h3>{item.title}</h3>
                <span className="item-price">${Number(item.price).toFixed(2)}</span>
              </div>
              
              <div className="item-badges">
                <span className="badge category-badge">{item.category}</span>
                <span className="badge condition-badge">{item.condition}</span>
              </div>
              
              <p className="item-desc">{item.description}</p>
              
              <div className="seller-info">
                <div className="seller-details">
                  <span className="seller-name" onClick={() => onProfileView(item.seller.id)} style={{ cursor: 'pointer' }}>
                    Sold by {item.seller.name}
                  </span>
                  <span className="posted-time">Listed {new Date(item.listedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="contact-action">
                  {(user?.id == item.seller.id || user?.role === 'ADMIN') ? (
                    <div className="owner-actions">
                      <button className="edit-action-btn" onClick={() => startEdit(item)}>Edit</button>
                      <button className="delete-action-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                      {!item.sold && (
                        <button className="mark-sold-btn" onClick={() => markAsSold(item.id)}>
                          Sold
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="contact-badge">
                      <Phone size={14} /> {item.contactInfo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty-state-market">
            <div className="empty-icon-container">
              <Tag size={64} className="empty-tag-icon" />
              <div className="icon-pulse"></div>
            </div>
            <h3>{search || activeCategory !== 'All' ? 'No matches found' : 'Marketplace is Open'}</h3>
            <p>
              {search || activeCategory !== 'All' 
                ? "We couldn't find what you're looking for. Try a different search term or category." 
                : "The student market is currently empty. Be the first to list something!"}
            </p>
            {!search && activeCategory === 'All' && (
              <button className="btn-create-listing" onClick={() => setShowForm(true)}>
                <Plus size={18} />
                <span>List Your Item</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPhotoViewer && selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="photo-viewer-overlay"
            onClick={closePhotoViewer}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="photo-viewer-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-viewer-btn" onClick={closePhotoViewer}>
                <X size={24} />
              </button>
              <img src={selectedPhoto} alt="Item Detail" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
