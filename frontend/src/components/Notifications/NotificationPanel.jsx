import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../api';
import { Bell, BellOff, X, Star, FileText, MessageCircle } from 'lucide-react';

export function NotificationPanel({ show, toggleShow, wsNotifications, onNavigate, onMessageClick }) {
  const { user } = useAuth();
  const [appNotifications, setAppNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('notificationsMuted') === 'true';
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('notificationsMuted', newMuted.toString());
  };

  useEffect(() => {
    if (wsNotifications && wsNotifications.length > 0) {
      setAppNotifications(prev => {
        const newItems = wsNotifications.filter(wsN => {
          const isDuplicate = prev.some(p =>
            (wsN.id && p.id === wsN.id) ||
            (wsN.createdAt && wsN.message === p.message && wsN.createdAt === p.createdAt)
          );
          return !isDuplicate;
        });
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev];
      });
    }
  }, [wsNotifications]);

  useEffect(() => {
    if (user) {
      fetchAppNotifications();
    }
  }, [user]);

  const fetchAppNotifications = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/notifications/${user?.id}`);
      if (response.ok) {
        const userNotifications = await response.json();
        setAppNotifications(userNotifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    try {
      try {
      fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      } catch (apiErr) {
      }

      const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = savedNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

      setAppNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const getUnreadCount = () => {
    if (isMuted) return 0;
    return appNotifications.filter(n => !n.read).length;
  };

  return (
    <div className="relative">
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all relative"
        onClick={toggleShow}
        title="Notifications"
      >
        <Bell size={20} className={`${getUnreadCount() > 0 ? 'fill-current' : ''}`} />
        {getUnreadCount() > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-on-primary text-[10px] font-black flex items-center justify-center rounded-full border-2 border-surface-container">
            {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-80 md:w-96 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/50 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-on-surface">Notifications</h4>
            <div className="flex items-center gap-1">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isMuted ? 'text-error bg-error/10' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'}`}
                onClick={toggleMute}
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              >
                {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
              </button>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
                onClick={toggleShow}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className={`${showAll ? 'max-h-[70vh]' : 'max-h-[400px]'} overflow-y-auto custom-scrollbar transition-all duration-300`}>
            {appNotifications.length > 0 ? (
              <div className="p-2 space-y-1">
                {(showAll ? appNotifications : appNotifications.slice(0, 10)).map(notification => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all group relative ${notification.read ? 'opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : 'bg-primary/5 hover:bg-primary/10'}`}
                    onClick={() => {
                      markNotificationAsRead(notification.id);
                      if (notification.type === 'review_posted' || notification.type === 'comment_posted' || notification.type === 'reply_posted') {
                        onNavigate('reviews');
                      } else if (notification.type === 'resource_uploaded') {
                        onNavigate('resources');
                      }
                      toggleShow();
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.read ? 'bg-surface-container text-on-surface-variant' : 'bg-primary text-on-primary shadow-lg shadow-primary/20'}`}>
                      {notification.type === 'review_posted' ? <Star size={20} /> :
                          notification.type === 'resource_uploaded' ? <FileText size={20} /> : <Bell size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-sm leading-snug mb-1 ${notification.read ? 'font-medium text-on-surface' : 'font-bold text-on-surface'}`}>
                        {notification.title}
                      </h5>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                        {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!notification.read && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(73,75,214,0.5)]"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/20">
                  <Bell size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface mb-1">All caught up!</p>
                  <p className="text-xs text-on-surface-variant">No new notifications to show.</p>
                </div>
              </div>
            )}
          </div>

          {appNotifications.length > 10 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="w-full p-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors border-t border-outline-variant"
            >
              {showAll ? 'Show Less' : `View All Notifications (${appNotifications.length})`}
            </button>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </div>
  );
}
