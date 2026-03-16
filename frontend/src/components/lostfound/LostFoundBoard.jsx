import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LostFound.css';
import { MapPin, Phone, Plus, X, AlertTriangle, CheckCircle2, Info, FileText, Package, Search, Calendar, User, Edit, Trash2, Eye, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LostFoundBoard({ onProfileView }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('LOST');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [itemPhotos, setItemPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { user } = useAuth();

  // Load items from localStorage on component mount
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

  // Save items to localStorage whenever they change
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
          console.log('Photo added successfully');
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
      const url = filter === 'ALL' ? `${import.meta.env.VITE_API_URL}/api/lostfound` : `${import.meta.env.VITE_API_URL}/api/lostfound?type=${filter}`;
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
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
        setPostError("Please log in to report items.");
        return;
    }

    // Prevent multiple submissions
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    setPostError(null);
    try {
      const isEdit = !!editingItem;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/lostfound/${editingItem.id}` 
        : `${import.meta.env.VITE_API_URL}/api/lostfound`;
      
      // Get auth token
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Prepare request data - don't include photo in JSON for now
      const requestData = {
        title, 
        description, 
        type, 
        location, 
        contactInfo, 
        reporterId: user.id
      };
      
      console.log('Sending request to:', url);
      console.log('Request body:', requestData);
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        
        // If we have photos and got a successful response, add them to the result
        if (photoPreviews.length > 0) {
          // For now, just include the photo previews in the local item
          const newItem = {
            ...result,
            photos: photoPreviews
          };
          
          if (isEdit) {
            setItems(prevItems => 
              prevItems.map(item => 
                item.id === editingItem.id ? newItem : item
              )
            );
          } else {
            setItems(prevItems => [newItem, ...prevItems]);
          }
        } else {
          // Normal fetch without photos
          fetchItems();
        }
        
        setShowReportForm(false);
        setEditingItem(null);
        setTitle(''); setDescription(''); setLocation(''); setContactInfo('');
        setItemPhotos([]);
        setPhotoPreviews([]);
      } else {
        const errorData = await response.text();
        console.log('Error response:', errorData);
        setPostError(`Server Error (${response.status}): ${errorData || response.statusText}`);
      }
    } catch (err) {
      console.error('Report failed:', err);
      // Fallback: Add item locally if backend is not available
      const newItem = {
        id: Date.now(), // Temporary ID
        title,
        description,
        type,
        location,
        contactInfo,
        photos: photoPreviews, // Include multiple photos in local fallback
        reporter: user,
        reportedAt: new Date().toISOString(),
        resolved: false
      };
      
      if (editingItem) {
        // Update existing item locally
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === editingItem.id ? { ...item, ...newItem, id: editingItem.id } : item
          )
        );
      } else {
        // Add new item locally
        setItems(prevItems => [newItem, ...prevItems]);
      }
      
      setShowReportForm(false);
      setEditingItem(null);
      setTitle(''); setDescription(''); setLocation(''); setContactInfo('');
      setItemPhotos([]);
      setPhotoPreviews([]);
      
      setPostError("Backend server error. Item saved locally only. Check console for details.");
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lostfound/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchItems();
      } else {
        // Fallback: Delete locally if backend fails
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
      }
    } catch (err) {
      console.error('Delete failed', err);
      // Fallback: Delete locally if backend is not available
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
        // Fallback: Update locally if backend fails
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, resolved: true } : item
        );
        setItems(updatedItems);
        localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
      }
    } catch (err) {
      console.error('Resolve failed', err);
      // Fallback: Update locally if backend is not available
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, resolved: true } : item
      );
      setItems(updatedItems);
      localStorage.setItem('lostfound-items', JSON.stringify(updatedItems));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lostfound-container"
    >
      <div className="lf-header">
        <div>
          <h2>Lost & Found</h2>
          <p>Help your fellow students find their belongings</p>
        </div>
        <button className="report-btn" onClick={() => {
          if (showReportForm) {
            setShowReportForm(false);
            setEditingItem(null);
            setTitle(''); setDescription(''); setLocation(''); setContactInfo('');
          } else {
            setShowReportForm(true);
          }
        }}>
          {showReportForm ? <X size={20} /> : <Plus size={20} />}
          {showReportForm ? 'Cancel' : 'Report Item'}
        </button>
      </div>

      <div className="lf-filters">
        <button 
          className={filter === 'ALL' ? 'active' : ''} 
          onClick={() => setFilter('ALL')}
        >All Items</button>
        <button 
          className={filter === 'LOST' ? 'active' : ''} 
          onClick={() => setFilter('LOST')}
        >Lost</button>
        <button 
          className={filter === 'FOUND' ? 'active' : ''} 
          onClick={() => setFilter('FOUND')}
        >Found</button>
      </div>

      <AnimatePresence>
        {showReportForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            className="report-form" 
            onSubmit={handleSubmit}
          >
            <h3>{editingItem ? 'Edit Report' : 'Report New Item'}</h3>

            {postError && (
              <div className="error-alert">
                 <Info size={18} />
                 <span>{postError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Item Name</label>
                <input type="text" placeholder="e.g., Black backpack, iPhone charger, Student ID card" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group select-group">
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="LOST">🔴 Lost Item</option>
                  <option value="FOUND">🟢 Found Item</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Photos (Optional)</label>
              <div className="photo-upload-area">
                {photoPreviews.length > 0 ? (
                  <div className="photo-preview-grid">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="photo-preview-item" onClick={() => openPhotoViewer(preview)}>
                        <img src={preview} alt={`Item photo ${index + 1}`} />
                        <button type="button" className="remove-photo-btn" onClick={(e) => { e.stopPropagation(); removePhoto(index); }}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="add-more-photo">
                      <label className="add-photo-btn">
                        <Plus size={24} />
                        <span>Add More</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="photo-upload-placeholder">
                    <Camera size={32} />
                    <p>Add photos of the item</p>
                    <div className="photo-upload-buttons">
                      <label className="photo-upload-btn">
                        <Upload size={16} />
                        Choose File
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                      </label>
                      <label className="camera-btn">
                        <Camera size={16} />
                        Take Photo
                        <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} hidden />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Include details like color, brand, size, unique features, when/where it was lost or found" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="e.g., Library 3rd floor, Room 301, Cafeteria, Parking area" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Contact Info</label>
                <input type="text" placeholder="Your phone number or email address" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="submit-report-btn">
              {editingItem ? 'Update Report' : 'Submit Report'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div layout className="lf-grid">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`lf-card ${item.resolved ? 'resolved-card' : ''}`}
            >
              <div className="lf-card-header">
                <span className={`type-badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                  {item.type === 'LOST' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  {item.type}
                </span>
                <div className="card-meta">
                  <span className="time-ago">
                    <Calendar size={12} />
                    {new Date(item.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {(item.photos && item.photos.length > 0) && (
                <div className="item-photos">
                  {item.photos.length === 1 ? (
                    <div className="item-photo" onClick={() => openPhotoViewer(item.photos[0])}>
                      <img src={item.photos[0]} alt={item.title} />
                    </div>
                  ) : (
                    <div className="item-photo-grid">
                      {item.photos.slice(0, 4).map((photo, index) => (
                        <div key={index} className="item-photo-thumb" onClick={() => openPhotoViewer(photo)}>
                          <img src={photo} alt={`${item.title} ${index + 1}`} />
                          {item.photos.length > 4 && index === 3 && (
                            <div className="more-photos-overlay">
                              +{item.photos.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="item-content">
                <h3>{item.title}</h3>
                <p className="item-desc">{item.description}</p>
              </div>

              <div className="item-meta-grid">
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{item.location}</span>
                </div>
                <div className="meta-item">
                  <Phone size={16} />
                  <span>{item.contactInfo}</span>
                </div>
              </div>

              <div className="lf-card-footer">
                <div className="reporter-info" onClick={() => onProfileView(item.reporter.id)}>
                  <User size={14} />
                  <span>{item.reporter.name}</span>
                </div>
                
                <div className="footer-actions">
                  {(user?.id === item.reporter.id || user?.role === 'ADMIN') && (
                    <div className="owner-actions">
                      <button className="action-btn edit-btn" onClick={() => startEdit(item)}>
                        <Edit size={14} />
                        Edit
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                  
                  {!item.resolved && (user?.id === item.reporter.id || user?.role === 'ADMIN') && (
                    <button className="resolve-btn" onClick={() => handleResolve(item.id)}>
                      <CheckCircle2 size={16} />
                      Resolve Item
                    </button>
                  )}
                  {item.resolved && (
                    <span className="resolved-badge">
                      <CheckCircle2 size={16} />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && !loading && (
          <div className="empty-state">
            <Search size={48} />
            <h3>No items found</h3>
            <p>No items reported in this category yet.</p>
          </div>
        )}
      </motion.div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {showPhotoViewer && selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="photo-crop-modal"
            onClick={closePhotoViewer}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="photo-crop-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="photo-crop-header">
                <h3>Photo Viewer</h3>
                <button className="close-crop-btn" onClick={closePhotoViewer}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="photo-viewer-area">
                <img 
                  src={selectedPhoto} 
                  alt="Full size photo" 
                  style={{ 
                    maxWidth: '90vw', 
                    maxHeight: '80vh', 
                    width: 'auto', 
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                />
              </div>
              
              <div className="photo-crop-actions">
                <button className="cancel-crop-btn" onClick={closePhotoViewer}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
