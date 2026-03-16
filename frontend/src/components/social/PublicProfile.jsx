import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Mail, MapPin, GraduationCap, Calendar, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import './PublicProfile.css';

export function PublicProfile({ userId, onClose, onStartChat }) {
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
      className="profile-overlay"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="profile-modal glass-card"
        onClick={e => e.stopPropagation()}
      >
        <button className="close-profile" onClick={onClose}><X size={20} /></button>
        
        <div className="profile-header">
          <div className="profile-avatar-large">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.username} />
            ) : (
              <UserIcon size={40} />
            )}
          </div>
          <h2>{profile.username}</h2>
          <p className="profile-email">{profile.email}</p>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <GraduationCap size={18} />
            <div>
              <span>Department</span>
              <p>{profile.department || 'Not specified'}</p>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={18} />
            <div>
              <span>Batch</span>
              <p>{profile.batch || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="start-chat-btn" onClick={() => onStartChat(profile)}>
            <MessageCircle size={20} />
            Send Message
          </button>
          
          <button className="view-profile-link" onClick={() => {
            navigate(`/profile/${profile.id}`);
            onClose(); 
          }}>
            Visit Full Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
