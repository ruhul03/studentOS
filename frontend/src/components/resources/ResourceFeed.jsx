import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Resources.css';
import { Search, FileText, ArrowUpCircle, X, Plus, Info, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ResourceFeed() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const { user } = useAuth();
  
  // Local upvote tracking
  const [userUpvotes, setUserUpvotes] = useState(() => {
    const saved = localStorage.getItem('userUpvotes');
    return saved ? JSON.parse(saved) : {};
  });

  // Permission check function
  const canManageResource = (uploaderId) => {
    if (!user) return false;
    return user.id === uploaderId || user.role?.toUpperCase() === 'ADMIN';
  };

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'link'
  const [type, setType] = useState('Notes');
  const [anonymous, setAnonymous] = useState(false);
  
  // Edit State
  const [editingResource, setEditingResource] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

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

  const handleEditResource = (resource) => {
    setTitle(resource.title);
    setDescription(resource.description);
    setCourseCode(resource.courseCode);
    setCourseTitle(resource.courseTitle);
    setSelectedFile(null);
    setFileUrl(resource.fileUrl.startsWith('/uploads/') ? '' : resource.fileUrl);
    setUploadMethod(resource.fileUrl.startsWith('/uploads/') ? 'file' : 'link');
    setType(resource.type);
    setAnonymous(resource.anonymous || false);
    setEditingResource(resource);
    setShowEditForm(true);
    setShowUpload(false);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!user || !editingResource) return;

    try {
      const formData = new FormData();
      formData.append('resource', JSON.stringify({
        title, description, courseCode, courseTitle, type, uploaderId: user.id, anonymous,
        fileUrl: uploadMethod === 'link' ? fileUrl : ''
      }));
      if (uploadMethod === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${editingResource.id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        setShowEditForm(false);
        setEditingResource(null);
        setTitle(''); setDescription(''); setCourseCode(''); setCourseTitle(''); setSelectedFile(null); setType('Notes');
        setAnonymous(false);
        fetchResources();
      } else {
        const errorText = await response.text();
        alert(`Failed to update resource: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Update failed', err);
      alert(`Update error: ${err.message}`);
    }
  };

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

      if (response.ok) {
        fetchResources();
      } else {
        const errorText = await response.text();
        alert(`Failed to delete resource: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) {
        setPostError("You must be logged in to share resources.");
        return;
    }
    
    setPostError(null);
    try {
      console.log("Submitting resource with uploaderId:", user.id);
      
      const formData = new FormData();
      formData.append('resource', JSON.stringify({
        title, description, courseCode, courseTitle, type, uploaderId: user.id, anonymous,
        fileUrl: uploadMethod === 'link' ? fileUrl : ''
      }));
      if (uploadMethod === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadMethod === 'link' && !fileUrl) {
        setPostError("Please provide a link to the resource.");
        return;
      } else if (uploadMethod === 'file' && !selectedFile) {
        setPostError("Please select a file to upload.");
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setShowUpload(false);
        setTitle(''); setDescription(''); setCourseCode(''); setCourseTitle(''); setFileUrl(''); setType('Notes');
        setAnonymous(false);
        fetchResources(); // refresh feed
      } else {
        const errorData = await response.text();
        console.error("Server responded with error:", errorData);
        setPostError(`Server Error: ${errorData || response.statusText}`);
      }
    } catch (err) {
      console.error('Upload failed', err);
      setPostError("Network error: Could not reach the server.");
    }
  };

  const handleUpvote = async (id) => {
    if (!user) {
      alert('You must be logged in to upvote resources.');
      return;
    }
    
    // Check if already upvoted
    if (userUpvotes[id]) {
      return;
    }
    
    console.log('Attempting to upvote resource:', id);
    
    // Update local state immediately
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
      
      console.log('Upvote response status:', response.status);
      
      if (response.ok) {
        console.log('Upvote successful');
        fetchResources();
      } else {
        const errorText = await response.text();
        console.error('Upvote failed:', response.status, errorText);
      }
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const hasUserUpvoted = (resource) => {
    if (!user) return false;
    // Check local state first for immediate response
    return userUpvotes[resource.id] || false;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="resources-container"
    >
      <div className="resources-header">
        <div>
           <h2>Study Resources</h2>
           <p className="text-dim">Discover and share academic materials</p>
        </div>
        <button className="upload-btn" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? <X size={20} /> : <Plus size={20} />}
          {showUpload ? 'Close' : 'Share Resource'}
        </button>
      </div>

      <div className="resources-search glass-card">
        <Search size={22} className="search-icon" />
        <input 
          type="text" 
          placeholder="Find class notes, exam papers, or study guides..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {showEditForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '3rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="upload-form" 
            onSubmit={handleUpdateResource}
          >
            <h3>Edit Resource</h3>
            
            {postError && (
              <div className="error-alert">
                 <Info size={18} />
                 <span>{postError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" placeholder="e.g. CSE 2118" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Course Title</label>
                <input type="text" placeholder="e.g. Data Communication" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Resource Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option>Notes</option>
                  <option>Exam Paper</option>
                  <option>Lab Report</option>
                  <option>Study Guide</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label" title="Share this resource without revealing your identity">
                <input 
                  type="checkbox" 
                  checked={anonymous} 
                  onChange={(e) => setAnonymous(e.target.checked)} 
                />
                <span>Share Anonymously</span>
              </label>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input type="text" placeholder="Descriptive title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Briefly explain what's in this file..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Attachment Method</label>
              <div className="upload-method-toggle">
                <button 
                  type="button" 
                  className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
                  onClick={() => setUploadMethod('file')}
                >
                  File Upload
                </button>
                <button 
                  type="button" 
                  className={`method-btn ${uploadMethod === 'link' ? 'active' : ''}`}
                  onClick={() => setUploadMethod('link')}
                >
                   External Link
                </button>
              </div>
            </div>

            {uploadMethod === 'file' ? (
              <div className="form-group">
                <label>Attachment (PDF, Image, ZIP)</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    id="edit-file-upload"
                    style={{ display: 'none' }}
                    onChange={e => setSelectedFile(e.target.files[0])} 
                    className="file-input"
                  />
                  <label htmlFor="edit-file-upload" className="file-input-label premium-file-label">
                    <Plus size={16} /> {selectedFile ? selectedFile.name : 'Change file (optional)'}
                  </label>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>External URL (Google Drive / Link)</label>
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/..." 
                  value={fileUrl} 
                  onChange={e => setFileUrl(e.target.value)} 
                  required 
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-upload-btn">
                <FileText size={20} />
                Update Resource
              </button>
              <button type="button" className="cancel-btn" onClick={() => {
                setShowEditForm(false);
                setEditingResource(null);
                setTitle(''); setDescription(''); setCourseCode(''); setCourseTitle(''); setSelectedFile(null); setType('Notes');
              }}>Cancel</button>
            </div>
          </motion.form>
        )}
        {showUpload && (
          <motion.form 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '3rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="upload-form" 
            onSubmit={handleUpload}
          >
            <h3>Share a Resource</h3>
            
            {postError && (
              <div className="error-alert">
                 <Info size={18} />
                 <span>{postError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" placeholder="e.g. CSE 2118" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Course Title</label>
                <input type="text" placeholder="e.g. Data Communication" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Resource Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option>Notes</option>
                  <option>Exam Paper</option>
                  <option>Lab Report</option>
                  <option>Study Guide</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label" title="Share this resource without revealing your identity">
                <input 
                  type="checkbox" 
                  checked={anonymous} 
                  onChange={(e) => setAnonymous(e.target.checked)} 
                />
                <span>Share Anonymously</span>
              </label>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input type="text" placeholder="Descriptive title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Briefly explain what's in this file..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Attachment Method</label>
              <div className="upload-method-toggle">
                <button 
                  type="button" 
                  className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
                  onClick={() => setUploadMethod('file')}
                >
                  File Upload
                </button>
                <button 
                  type="button" 
                  className={`method-btn ${uploadMethod === 'link' ? 'active' : ''}`}
                  onClick={() => setUploadMethod('link')}
                >
                   External Link
                </button>
              </div>
            </div>

            {uploadMethod === 'file' ? (
              <div className="form-group">
                <label>Attachment (PDF, Image, ZIP)</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    id="file-upload"
                    style={{ display: 'none' }}
                    onChange={e => setSelectedFile(e.target.files[0])} 
                    required 
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-input-label premium-file-label">
                    <Plus size={16} /> {selectedFile ? selectedFile.name : 'Select File'}
                  </label>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>External URL (Google Drive / Link)</label>
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/..." 
                  value={fileUrl} 
                  onChange={e => setFileUrl(e.target.value)} 
                  required 
                />
              </div>
            )}

            <button type="submit" className="submit-upload-btn">
              <FileText size={20} />
              Upload to Repository
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {loading && resources.length === 0 ? (
        <div className="loading-grid">
           {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <motion.div layout className="resources-grid">
          <AnimatePresence>
            {resources.map((res) => (
              <motion.div 
                layout
                key={res.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="resource-card"
              >
                <div className="resource-header">
                  <div className="resource-type-badge">{res.type}</div>
                  {canManageResource(res.uploader.id) && (
                    <div className="management-actions">
                      <button className="edit-btn" onClick={() => handleEditResource(res)} title="Edit Resource">
                        <Edit2 size={14} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteResource(res.id)} title="Delete Resource">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="resource-content">
                  <h3 className="resource-title">{res.title}</h3>
                  <div className="course-info">
                    <span className="course-code">{res.courseCode}</span>
                    <span className="course-title">{res.courseTitle}</span>
                  </div>
                  <p className="resource-desc">{res.description}</p>
                </div>
                
                <div className="resource-footer">
                  <div className="uploader-info">
                    <div className="uploader-details">
                      <span className="uploader-name">
                        {res.anonymous ? 'Anonymous Student' : res.uploader.name}
                      </span>
                      <span className="upload-time">Uploaded recently</span>
                    </div>
                  </div>
                  
                  <div className="resource-actions">
                    <a 
                      href={res.fileUrl.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL}${res.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="download-btn"
                      download
                    >
                      <ArrowUpCircle size={16} style={{ transform: 'rotate(180deg)' }} />
                      <span>Download</span>
                    </a>
                    <button 
                      className={`upvote-btn ${res.upvotes > 0 ? 'active' : ''} ${userUpvotes[res.id] ? 'upvoted' : ''}`} 
                      onClick={() => handleUpvote(res.id)}
                      title={userUpvotes[res.id] ? 'You have already upvoted' : 'Upvote this resource'}
                      disabled={userUpvotes[res.id]}
                    >
                      <span className="upvote-count">
                        {userUpvotes[res.id] ? '✓ Helpful' : res.upvotes}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {resources.length === 0 && !loading && (
            <div className="empty-state-container">
              <div className="empty-state-icon">
                <Search size={48} className="text-dim" />
              </div>
              <h3>{search ? 'No matches found' : 'No resources yet'}</h3>
              <p className="text-dim">
                {search 
                  ? `We couldn't find anything for "${search}". Try another keyword.` 
                  : "Be the first to share study materials with your peers!"}
              </p>
              {!search && (
                <button className="upload-btn-secondary" onClick={() => setShowUpload(true)}>
                   <Plus size={18} /> Share Resource
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
