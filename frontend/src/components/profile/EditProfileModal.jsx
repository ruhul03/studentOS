import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AcademicIdentityFields } from './forms/AcademicIdentityFields';
import { ContactInfoFields } from './forms/ContactInfoFields';

export function EditProfileModal({ isOpen, onClose, onSave, initialData, isUpdating }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  
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

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        bio: initialData.bio || '',
        profilePicture: initialData.profilePicture || '',
        department: initialData.department || '',
        batch: initialData.batch || '',
        studentId: initialData.studentId || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        phoneNumber: initialData.phoneNumber || ''
      });
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <div className="absolute inset-0 cursor-pointer transition-opacity" onClick={onClose}></div>
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
          <button type="button" className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-8" style={{ scrollbarWidth: 'thin' }}>
            
            {error && <div className="p-4 bg-error-container/20 border border-error-container text-error rounded-lg text-sm">{error}</div>}

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
            <AcademicIdentityFields formData={formData} setFormData={setFormData} />

            {/* Section: Contact Information */}
            <ContactInfoFields formData={formData} setFormData={setFormData} />

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
            <button type="button" className="font-body-sm text-sm font-semibold text-on-surface-variant hover:text-on-surface px-6 py-2.5 rounded-lg transition-colors" onClick={onClose} disabled={isUpdating}>Cancel</button>
            <button type="submit" disabled={isUpdating} className={`font-body-sm text-sm font-semibold text-on-primary px-6 py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(192,193,255,0.2)] ${isUpdating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
