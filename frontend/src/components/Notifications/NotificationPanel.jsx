import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NotificationPanel({ show, toggleShow, wsNotifications, onNavigate }) {
  const { user } = useAuth();
  const [appNotifications, setAppNotifications] = useState([]);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${user.id}`);
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
        fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      } catch (apiErr) {
        console.log('API not available, using localStorage');
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
    <div className="notification-wrapper">
      <button 
        className="icon-btn notification-btn" 
        onClick={toggleShow}
        title="Notifications"
      >
        <Bell size={18} />
        {getUnreadCount() > 0 && (
          <span className="notification-badge">{getUnreadCount()}</span>
        )}
      </button>

      {show && (
        <div className="notification-panel-dropdown">
          <div className="notification-panel-header">
            <h4>Notifications</h4>
            <div className="panel-actions">
              <button 
                className={`mute-toggle-btn ${isMuted ? 'muted' : ''}`}
                onClick={toggleMute}
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              >
                {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
              </button>
              <button 
                className="close-panel-btn" 
                onClick={toggleShow}
              >
                ×
              </button>
            </div>
          </div>
          <div className="notification-panel-list">
            {appNotifications.length > 0 ? (
              appNotifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-panel-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    markNotificationAsRead(notification.id);
                    if (notification.type === 'review_posted' || notification.type === 'comment_posted' || notification.type === 'reply_posted') {
                      onNavigate('reviews');
                    } else if (notification.type === 'resource_uploaded') {
                      onNavigate('resources');
                    } else if (notification.type === 'direct_message') {
                      onNavigate('home');
                    }
                    toggleShow();
                  }}
                >
                  <div className="notification-panel-icon">
                    <Bell size={16} />
                  </div>
                  <div className="notification-panel-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <span className="notification-panel-time">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="notification-panel-indicator"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <Bell size={24} />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
