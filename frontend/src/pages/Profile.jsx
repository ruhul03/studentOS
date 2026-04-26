import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
export function Profile() {
  const { user, updateUserData, logout } = useAuth();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('viewUserId');
  const activeUserId = userId || queryUserId;
  
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);

  const isOwnProfile = !activeUserId || activeUserId === user?.id;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: '',
    department: '',
    batch: '',
    studentId: '',
    dateOfBirth: '',
    phoneNumber: ''
  });

  React.useEffect(() => {
    if (isOwnProfile) {
      setViewedUser(user);
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        profilePicture: user?.profilePicture || '',
        department: user?.department || '',
        batch: user?.batch || '',
        studentId: user?.studentId || '',
        dateOfBirth: user?.dateOfBirth || '',
        phoneNumber: user?.phoneNumber || ''
      });
    } else {
      const fetchViewedUser = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${activeUserId}`);
          if (res.ok) {
            const data = await res.json();
            setViewedUser(data);
          } else {
            setError('User not found');
          }
        } catch (err) {
          setError('Failed to fetch user');
        } finally {
          setLoading(false);
        }
      };
      fetchViewedUser();
    }
  }, [activeUserId, user, isOwnProfile]);

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

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!viewedUser && !loading) return <div className="profile-error">User not found.</div>;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {(!isOwnProfile || userId) && (
        <button 
          className="mb-6 flex items-center gap-2 text-outline hover:text-white transition-colors text-sm font-medium" 
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
      )}

      {/* Profile Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative z-10">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-surface-variant bg-surface-container flex items-center justify-center relative">
            {viewedUser?.profilePicture ? (
              <img src={viewedUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-outline flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl">person</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Title & Primary Actions */}
        <div className="flex-1 text-center md:text-left pt-2">
          <h1 className="font-h1 text-h1 text-on-surface mb-2">{viewedUser?.username}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
            {viewedUser?.department ? `${viewedUser.department} Undergraduate` : 'Student'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {isOwnProfile && (
              <button 
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-body-sm text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_4px_20px_rgba(192,193,255,0.2)]"
                onClick={() => setIsEditing(true)}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-error-container/20 border border-error-container text-error rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-secondary-container/20 border border-secondary-container text-secondary rounded-lg text-sm">{success}</div>}

      {/* Bento Grid - Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Detail Card 1: ID & Batch */}
        <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 hover:bg-surface-bright transition-colors shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <span className="material-symbols-outlined">badge</span>
            <h3 className="font-h3 text-h3 text-on-surface">Academic Identity</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Student ID</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.studentId || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Batch</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.batch ? `Class of ${viewedUser.batch}` : 'Not specified'}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Department</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.department || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Detail Card 2: Contact Info */}
        <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 hover:bg-surface-bright transition-colors shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <span className="material-symbols-outlined">contact_mail</span>
            <h3 className="font-h3 text-h3 text-on-surface">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">University Email</p>
              <p className="font-body-lg text-sm text-on-surface truncate">{viewedUser?.email}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Username</p>
              <p className="font-body-lg text-sm text-on-surface truncate">{viewedUser?.username}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Phone / WhatsApp</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.phoneNumber || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-label-caps text-xs text-outline mb-1 uppercase tracking-wider font-semibold">Date of Birth</p>
              <p className="font-body-lg text-sm text-on-surface">{viewedUser?.dateOfBirth ? new Date(viewedUser.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 hover:bg-surface-bright transition-colors shadow-sm mb-12">
        <div className="flex items-center gap-3 mb-4 text-primary">
          <span className="material-symbols-outlined">article</span>
          <h3 className="font-h3 text-h3 text-on-surface">Biography</h3>
        </div>
        <p className="font-body-lg text-sm text-on-surface-variant leading-relaxed">
          {viewedUser?.bio || 'This student hasn\'t added a biography yet.'}
        </p>
      </div>

      {/* Danger Zone */}
      {isOwnProfile && (
        <div className="border-t border-error-container/30 pt-8 mt-12 mb-8">
          <h3 className="font-h3 text-h3 text-error mb-4">Danger Zone</h3>
          <div className="bg-surface-container-high border border-error-container/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-body-lg text-base font-semibold text-on-surface mb-1">Delete Account</p>
              <p className="font-body-sm text-sm text-on-surface-variant">Once you delete your account, there is no going back. Please be certain.</p>
              <p className="text-xs text-outline mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                Changes remaining: {Math.max(0, 2 - (user?.updateCount || 0))}
              </p>
            </div>
            <button 
              className="shrink-0 bg-transparent border border-error text-error hover:bg-error hover:text-on-error px-6 py-2.5 rounded-lg font-body-sm text-sm transition-colors flex items-center gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="absolute inset-0 cursor-pointer transition-opacity" onClick={() => setIsEditing(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface-container w-full max-w-2xl rounded-xl border border-outline-variant/50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50 shrink-0">
                <h2 className="font-h2 text-h2 text-on-surface">Edit Profile</h2>
                <button type="button" className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest" onClick={() => setIsEditing(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-8" style={{ scrollbarWidth: 'thin' }}>
                  
                  {/* Profile Image Edit */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                      {formData.profilePicture ? (
                        <img src={formData.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-primary/20" />
                      ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-surface-container-highest border-2 border-outline-variant text-outline">
                          <span className="material-symbols-outlined text-4xl">person</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-on-surface">photo_camera</span>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <h3 className="font-h3 text-h3 text-on-surface mb-1">Profile Photo</h3>
                        <p className="font-body-sm text-sm text-on-surface-variant">Recommended size: 400x400px. Max size: 2MB.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" className="font-label-caps text-xs font-semibold text-primary border border-primary/30 px-4 py-2 rounded hover:bg-primary/10 transition-colors" onClick={() => fileInputRef.current?.click()}>
                          UPLOAD NEW
                        </button>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={formData.profilePicture}
                            onChange={(e) => setFormData({...formData, profilePicture: e.target.value})}
                            placeholder="Or paste Image URL..."
                            className="w-full bg-surface-container-low border border-outline-variant/50 rounded py-2 px-3 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Academic Identity */}
                  <section className="space-y-4">
                    <h3 className="font-label-caps text-xs font-semibold tracking-wider text-primary border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                      ACADEMIC IDENTITY
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="font-body-sm text-sm text-on-surface-variant block">Username</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                          <input 
                            type="text" 
                            value={formData.username} 
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-body-sm text-sm text-on-surface-variant block">Student ID</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                          <input 
                            type="text" 
                            value={formData.studentId} 
                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-body-sm text-sm text-on-surface-variant block">Department</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">account_balance</span>
                          <input 
                            type="text" 
                            value={formData.department} 
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            placeholder="e.g. Computer Science"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-body-sm text-sm text-on-surface-variant block">Batch / Cohort</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">group</span>
                          <input 
                            type="text" 
                            value={formData.batch} 
                            onChange={(e) => setFormData({...formData, batch: e.target.value})}
                            placeholder="e.g. Class of 2025"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section: Contact Information */}
                  <section className="space-y-4">
                    <h3 className="font-label-caps text-xs font-semibold tracking-wider text-secondary border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>contact_mail</span>
                      CONTACT INFORMATION
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="font-body-sm text-sm text-on-surface-variant block">University Email</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                          <input 
                            type="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-10 pr-4 text-on-surface-variant font-body-sm cursor-not-allowed opacity-70" 
                            readOnly
                            title="Email cannot be changed"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-body-sm text-sm text-on-surface-variant block">Date of Birth</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">calendar_month</span>
                          <input 
                            type="date" 
                            value={formData.dateOfBirth} 
                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="font-body-sm text-sm text-on-surface-variant block">Phone / WhatsApp</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">call</span>
                          <input 
                            type="tel" 
                            value={formData.phoneNumber} 
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section: Bio */}
                  <section className="space-y-4">
                    <h3 className="font-label-caps text-xs font-semibold tracking-wider text-tertiary border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                      SHORT BIO
                    </h3>
                    <div className="space-y-1">
                      <div className="relative">
                        <textarea 
                          value={formData.bio} 
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Share your academic interests, club memberships, and current projects..."
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 px-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-outline/50" 
                          rows="3"
                          maxLength={300}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="font-body-sm text-xs text-outline">{formData.bio?.length || 0} / 300 characters</span>
                      </div>
                    </div>
                  </section>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-high/30 flex justify-end gap-3 items-center shrink-0 rounded-b-xl">
                  <button type="button" className="font-body-sm text-sm font-semibold text-on-surface-variant hover:text-on-surface px-6 py-2.5 rounded-lg transition-colors" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="font-body-sm text-sm font-semibold bg-primary text-on-primary px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(192,193,255,0.2)]">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="absolute inset-0 transition-opacity" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface rounded-xl border border-outline-variant w-full max-w-[480px] shadow-2xl flex flex-col overflow-hidden relative z-50"
            >
              {/* Content Area */}
              <div className="p-8 flex flex-col items-center text-center">
                {/* Prominent Warning Icon */}
                <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-error text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                {/* Title & Message */}
                <h2 className="font-h2 text-h2 text-on-surface mb-2">Delete Account</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Are you absolutely sure? This action is permanent and cannot be undone.
                </p>
              </div>
              
              {/* Input Area */}
              <div className="px-8 pb-8 w-full">
                <label className="block font-body-sm text-body-sm text-on-surface-variant text-center mb-4" htmlFor="confirm-delete">
                  To confirm, type <span className="font-bold text-on-surface">DELETE</span> below:
                </label>
                <div className="relative">
                  <input 
                    id="confirm-delete" 
                    type="text" 
                    placeholder="DELETE" 
                    autoComplete="off"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-error focus:ring-1 focus:ring-error text-center placeholder-on-surface-variant/50 transition-colors" 
                  />
                </div>
              </div>
              
              {/* Action Buttons Area */}
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex flex-col-reverse sm:flex-row gap-4 justify-end items-center">
                <button 
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-h3 text-h3 text-on-surface border border-outline-variant hover:bg-surface-container-high hover:border-outline focus:outline-none focus:ring-2 focus:ring-outline transition-all duration-200"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                >
                  Keep Account
                </button>
                <button 
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-h3 text-h3 bg-error text-on-error hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-surface shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${deleteConfirmText !== 'DELETE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'DELETE'}
                >
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  Delete My Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
