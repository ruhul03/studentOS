import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LostFound.css';
import { MapPin, Phone, Plus, X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LostFoundBoard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const { user } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('LOST');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' ? 'http://localhost:8081/api/lostfound' : `http://localhost:8081/api/lostfound?type=${filter}`;
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
    if (!user) {
        setPostError("Please log in to report items.");
        return;
    }

    setPostError(null);
    try {
      console.log("Reporting item with reporterId:", user.id);
      const payload = {
        title, description, type, location, contactInfo, reporterId: user.id
      };

      const response = await fetch('http://localhost:8081/api/lostfound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowReportForm(false);
        setTitle(''); setDescription(''); setLocation(''); setContactInfo('');
        fetchItems();
      } else {
        const errorData = await response.text();
        console.error("LostFound POST Error:", errorData);
        setPostError(`Server Error: ${errorData || response.statusText}`);
      }
    } catch (err) {
      console.error('Report failed', err);
      setPostError("Network error: Could not reach the server.");
    }
  };

  const handleResolve = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/api/lostfound/${id}/resolve`, { method: 'PUT' });
      if (response.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Resolve failed', err);
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
        <button className="report-btn" onClick={() => setShowReportForm(!showReportForm)}>
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
            <h3>Report New Item</h3>

            {postError && (
              <div className="error-alert">
                 <Info size={18} />
                 <span>{postError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Item Name</label>
                <input type="text" placeholder="What did you lose/find?" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group" style={{ width: '200px' }}>
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="LOST">Lost</option>
                  <option value="FOUND">Found</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Describe the item (color, brand, etc.)" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <div style={{ position: 'relative' }}>
                   <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                   <input style={{ paddingLeft: '3rem' }} type="text" placeholder="Where? (e.g. Library 3rd Floor)" value={location} onChange={e => setLocation(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Info</label>
                <div style={{ position: 'relative' }}>
                   <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                   <input style={{ paddingLeft: '3rem' }} type="text" placeholder="Phone or Email" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-report-btn">Submit Report</button>
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
                <span className="time-ago">{new Date(item.reportedAt).toLocaleDateString()}</span>
              </div>

              <h3>{item.title}</h3>
              <p className="item-desc">{item.description}</p>

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
                <span className="reporter-name">Reported by {item.reporter.name}</span>
                {!item.resolved && user?.id === 1 && ( // Only admin for demo, or logic based on reporter
                   <button className="resolve-btn" onClick={() => handleResolve(item.id)}>
                     Mark as Resolved
                   </button>
                )}
                {item.resolved && (
                   <span className="resolved-badge">Resolved</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && !loading && (
          <div className="empty-state">
            No items reported in this category.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
