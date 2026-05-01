import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function PublicProfile({ userId, onClose, onStartChat }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
        if (response.ok) {
          setProfile(await response.json());
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) return null;
  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[2000] p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-surface-container rounded-[2.5rem] p-8 relative shadow-2xl border border-outline-variant overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
        
        <button 
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all" 
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border-4 border-surface-container-high shadow-xl overflow-hidden">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            )}
          </div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight">{profile.username}</h2>
          <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">{profile.email}</p>
        </div>

        <div className="space-y-3 mb-8 relative z-10">
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Department</span>
              <p className="text-sm font-bold text-on-surface">{profile.department || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 hover:border-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Batch</span>
              <p className="text-sm font-bold text-on-surface">{profile.batch || 'Not specified'}</p>
            </div>
          </div>
          
          {profile.phoneNumber && (
            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 hover:border-tertiary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Contact</span>
                <p className="text-sm font-bold text-on-surface">{profile.phoneNumber}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {profile.phoneNumber && (
              <a 
                href={`https://wa.me/${profile.phoneNumber.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white p-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#25D366]/20"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                WhatsApp
              </a>
            )}
            <button 
              className={`flex items-center justify-center gap-2 bg-primary text-on-primary p-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 ${!profile.phoneNumber ? 'col-span-2' : ''}`}
              onClick={() => onStartChat(profile)}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Message
            </button>
          </div>
          
          <button 
            className="text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-widest py-3 transition-colors flex items-center justify-center gap-2" 
            onClick={() => {
              navigate(`/dashboard?tab=profile&viewUserId=${profile.id}`);
              onClose(); 
            }}
          >
            Visit Full Profile
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
