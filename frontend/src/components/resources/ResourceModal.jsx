import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function ResourceModal({ isOpen, onClose, onResourceCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [type, setType] = useState('Notes');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resourceTypes = ['Notes', 'Exam Paper', 'Study Guide', 'Textbook', 'Link'];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseCode('');
    setType('Notes');
    setFileUrl('');
    setSelectedFile(null);
    setIsAnonymous(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!courseCode.trim()) { setError('Course code is required'); return; }
    if (!selectedFile && !fileUrl.trim()) { 
      setError('Please provide either a file or an external URL'); 
      return; 
    }

    setIsSubmitting(true);
    setError('');

    try {
      const resourceRequest = {
        title: title.trim(),
        description: description.trim(),
        courseCode: courseCode.trim(),
        courseTitle: '', // Optional
        fileUrl: fileUrl.trim(),
        type,
        uploaderId: user.id,
        anonymous: isAnonymous
      };

      const formData = new FormData();
      formData.append('resource', new Blob([JSON.stringify(resourceRequest)], { type: 'application/json' }));
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errorData = await resp.text();
        throw new Error(errorData || 'Failed to share resource');
      }

      resetForm();
      onClose();
      onResourceCreated?.();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--primary)' }}>share</span>
            Share Resource
          </h2>
          <button style={styles.closeBtn} onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.body}>
          {error && (
            <div style={styles.error}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Title *</label>
            <input style={styles.input} placeholder="e.g., Mid-term Solved Question 2023" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Course Code *</label>
              <input style={styles.input} placeholder="e.g., CSE 303" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Type</label>
              <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
                {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>File Upload</label>
            <div style={styles.fileInputContainer}>
              <input 
                type="file" 
                onChange={handleFileChange} 
                style={styles.fileInput}
                id="resource-file"
              />
              <label htmlFor="resource-file" style={styles.fileLabel}>
                <span className="material-symbols-outlined">upload_file</span>
                {selectedFile ? selectedFile.name : 'Choose a file...'}
              </label>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Or External URL (Google Drive, OneDrive, etc.)</label>
            <input style={styles.input} placeholder="https://drive.google.com/..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, minHeight: 60, resize: 'vertical' }} placeholder="Provide some context about this resource..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div style={styles.checkboxRow}>
            <input 
              type="checkbox" 
              id="anonymous-check" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              style={styles.checkbox}
            />
            <label htmlFor="anonymous-check" style={styles.checkboxLabel}>Share anonymously</label>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={handleClose}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Sharing...' : 'Share Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem',
  },
  container: {
    backgroundColor: 'var(--surface-container-high)', width: '100%', maxWidth: '500px',
    display: 'flex', flexDirection: 'column',
    borderRadius: '16px', border: '1px solid var(--outline-variant)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden',
    animation: 'zoomIn 0.15s ease-out forwards',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px', borderBottom: '1px solid rgba(70,69,84,0.3)',
    background: 'rgba(52,52,61,0.3)', flexShrink: 0,
  },
  headerTitle: {
    fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', margin: 0,
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  closeBtn: {
    color: 'var(--on-surface-variant)', background: 'transparent', border: 'none',
    padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex',
    transition: 'background-color 0.2s',
  },
  body: { 
    padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px',
    flex: 1,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' },
  input: {
    width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)',
    borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem', color: 'var(--on-surface)',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  fileInputContainer: {
    position: 'relative',
    width: '100%',
  },
  fileInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: '0',
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--surface-container)',
    border: '1px solid var(--outline-variant)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--on-surface-variant)',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    minHeight: '38px',
  },
  row: { display: 'flex', gap: '12px' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '0.85rem', color: 'var(--on-surface-variant)', cursor: 'pointer' },
  footer: { 
    display: 'flex', justifyContent: 'flex-end', gap: '10px', 
    padding: '12px 20px', borderTop: '1px solid rgba(70,69,84,0.2)',
    backgroundColor: 'rgba(52,52,61,0.1)', flexShrink: 0,
  },
  cancelBtn: {
    padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
    color: 'var(--on-surface-variant)', background: 'transparent', border: 'none', cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
    backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
  },
  error: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
    borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
    backgroundColor: 'rgba(239,68,68,0.12)', color: '#ffb4ab', border: '1px solid rgba(239,68,68,0.25)',
  },
};
