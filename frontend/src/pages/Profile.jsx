import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Camera, Save, X, Edit2, Shield, Trash2, AlertTriangle, GraduationCap, Book, Fingerprint, Calendar } from 'lucide-react';
import './Profile.css';

export function Profile() {
  const { user, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    department: user?.department || '',
    batch: user?.batch || '',
    studentId: user?.studentId || '',
    dateOfBirth: user?.dateOfBirth || ''
  });

  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUserData(updatedUser);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Network error. Failed to save changes.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        logout();
        navigate('/');
      } else {
        setError('Failed to delete profile.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card glass-card">
        <div className="profile-header">
          <div className="profile-image-wrapper">
            <div className="profile-image-container">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" className="profile-img" />
              ) : (
                <div className="profile-img-placeholder">
                  <User size={64} />
                </div>
              )}
              {isEditing && (
                <div 
                  className="image-upload-overlay" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload from device"
                >
                  <Camera size={32} />
                  <span>Upload</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
                capture="user"
              />
            </div>
            {isEditing && (
              <div className="image-url-field">
                <input 
                  type="text" 
                  placeholder="Or paste URL" 
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({...formData, profilePicture: e.target.value})}
                  className="image-url-input"
                />
              </div>
            )}
          </div>
          <div className="profile-title">
            <h2>{user?.username}</h2>
          </div>
          {!isEditing && (
            <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>

        {error && <div className="profile-message error">{error}</div>}
        {success && <div className="profile-message success">{success}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-sections-grid">
            <div className="form-group">
              <label><User size={16} /> Username</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              ) : (
                <div className="view-value">{user?.username}</div>
              )}
            </div>

            <div className="form-group">
              <label><Fingerprint size={16} /> Student ID</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.studentId} 
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  placeholder="e.g. 011 233 123"
                />
              ) : (
                <div className="view-value">{user?.studentId || 'Not set'}</div>
              )}
            </div>

            <div className="form-group">
              <label><Calendar size={16} /> Date of Birth</label>
              {isEditing ? (
                <input 
                  type="date" 
                  value={formData.dateOfBirth} 
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              ) : (
                <div className="view-value">{user?.dateOfBirth || 'Not set'}</div>
              )}
            </div>

            <div className="form-group">
              <label><Mail size={16} /> Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              ) : (
                <div className="view-value">{user?.email}</div>
              )}
            </div>

            <div className="form-group">
              <label><GraduationCap size={16} /> Department</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g. CSE, EEE"
                />
              ) : (
                <div className="view-value">{user?.department || 'Not set'}</div>
              )}
            </div>

            <div className="form-group">
              <label><Book size={16} /> Batch</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.batch} 
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  placeholder="e.g. 233, 221"
                />
              ) : (
                <div className="view-value">{user?.batch || 'Not set'}</div>
              )}
            </div>

            <div className="form-group bio-group">
              <label>Bio</label>
              {isEditing ? (
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell fellow students about yourself..."
                />
              ) : (
                <div className="view-value bio-view">{user?.bio || 'No bio yet.'}</div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="submit" className="save-btn"><Save size={18} /> Save Changes</button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}><X size={18} /> Cancel</button>
            </div>
          )}
        </form>

        <div className="profile-footer">
          <div className="account-info">
            <Shield size={16} />
            <span>Changes remaining: {Math.max(0, 2 - (user?.updateCount || 0))}</span>
          </div>
          <button className="delete-account-btn" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={18} /> Delete Account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <AlertTriangle size={48} color="#ef4444" />
            <h3>Delete your account?</h3>
            <p>This action is irreversible. Your shared resources (notes, items) will remain on the platform but will no longer be linked to your active profile.</p>
            <div className="modal-actions">
              <button className="confirm-delete-btn" onClick={handleDelete}>Yes, Delete Everything</button>
              <button className="cancel-delete-btn" onClick={() => setShowDeleteConfirm(false)}>Stay with us</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
