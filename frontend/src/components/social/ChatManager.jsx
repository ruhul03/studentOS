import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatModal } from './ChatModal';
import { PublicProfile } from './PublicProfile';
import { NotificationToast } from '../NotificationToast/NotificationToast';

export function ChatManager({ 
  wsNotifications, 
  messageEvent, 
  clearNotification, 
  setMessageEvent,
  selectedUserProfile,
  setSelectedUserProfile 
}) {
  const [activeChatUser, setActiveChatUser] = useState(null);
  
  // Need to read isMuted from localStorage dynamically, ideally through state, 
  // but since NotificationToast renders unconditionally in this component space and controls itself, it's fine.
  const [isMuted, setIsMuted] = useState(localStorage.getItem('notificationsMuted') === 'true');

  useEffect(() => {
    // Optional: listen to storage changes for mute toggle
    const handleStorageChange = () => {
      setIsMuted(localStorage.getItem('notificationsMuted') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (messageEvent) {
      const fetchSender = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${messageEvent.senderId}`);
          if (res.ok) {
            const senderData = await res.json();
            if (!activeChatUser || activeChatUser.id !== messageEvent.senderId) {
              setActiveChatUser(senderData);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      fetchSender();
      setMessageEvent(null);
    }
  }, [messageEvent, activeChatUser, setMessageEvent]);

  return (
    <>
      {!isMuted && (
        <NotificationToast 
          notifications={wsNotifications} 
          onClear={clearNotification} 
        />
      )}

      <AnimatePresence>
        {selectedUserProfile && (
          <PublicProfile 
            userId={selectedUserProfile} 
            onClose={() => setSelectedUserProfile(null)} 
            onStartChat={(profile) => {
              setSelectedUserProfile(null);
              setActiveChatUser(profile);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChatUser && (
          <ChatModal 
            otherUser={activeChatUser} 
            onClose={() => setActiveChatUser(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
