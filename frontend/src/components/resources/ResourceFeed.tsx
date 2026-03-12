import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Resources.css';
import { Search, FileText, ArrowUpCircle, X, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Resource = {
  id: number;
  title: string;
  description: string;
  courseCode: string;
  fileUrl: string;
  type: string;
  upvotes: number;
  uploader: { name: string };
  uploadedAt: string;
};

export function ResourceFeed() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const { user } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [type, setType] = useState('Notes');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const url = search ? `http://localhost:8081/api/resources?query=${search}` : 'http://localhost:8081/api/resources';
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setPostError("You must be logged in to share resources.");
        return;
    }
    
    setPostError(null);
    try {
      console.log("Submitting resource with uploaderId:", user.id);
      const payload = {
        title, description, courseCode, fileUrl, type, uploaderId: user.id
      };
      
      const response = await fetch('http://localhost:8081/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setShowUpload(false);
        setTitle(''); setDescription(''); setCourseCode(''); setFileUrl(''); setType('Notes');
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

  const handleUpvote = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/resources/${id}/upvote`, { method: 'POST' });
      if (response.ok) {
        fetchResources();
      }
    } catch (err) {
      console.error('Upvote failed', err);
    }
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
          placeholder="Search by course code, title, or type..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence>
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
                <label>Resource Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option>Notes</option>
                  <option>Exam Paper</option>
                  <option>Lab Report</option>
                  <option>Study Guide</option>
                </select>
              </div>
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
              <label>File URL (Google Drive / Link)</label>
              <input type="url" placeholder="https://drive.google.com/..." value={fileUrl} onChange={e => setFileUrl(e.target.value)} required />
            </div>

            <button type="submit" className="submit-upload-btn">Upload to Repository</button>
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
                <div className="resource-type-badge">{res.type}</div>
                <h3 className="resource-title">{res.title}</h3>
                <span className="course-tag">{res.courseCode}</span>
                <p className="resource-desc">{res.description}</p>
                
                <div className="resource-footer">
                  <div className="resource-meta">
                    <span className="uploader-name">Uploaded by {res.uploader.name}</span>
                    <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                      <FileText size={16} /> Open Resource
                    </a>
                  </div>
                  <button 
                    className={`upvote-btn ${res.upvotes > 0 ? 'active' : ''}`} 
                    onClick={() => handleUpvote(res.id)}
                  >
                    <ArrowUpCircle size={22} /> 
                    <span className="upvote-count">{res.upvotes}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {resources.length === 0 && !loading && (
            <div className="empty-state">
              No resources match your search. Be the first to upload!
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
