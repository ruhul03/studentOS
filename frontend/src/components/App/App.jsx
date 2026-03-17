import * as React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { Login } from '../../pages/Login';
import { Register } from '../../pages/Register';
import { ResourceFeed } from '../resources/ResourceFeed';
import { CampusServicesDirectory } from '../services/CampusServicesDirectory';
import { StudyPlanner } from '../planner/StudyPlanner';
import { UiuCalculator } from '../calculator/UiuCalculator';
import { LostFoundBoard } from '../lostfound/LostFoundBoard';
import { StudentMarketplace } from '../marketplace/StudentMarketplace';
import { CourseReviews } from '../reviews/CourseReviews';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { LandingPage } from '../../pages/LandingPage';
import { UserDashboard } from '../dashboard/UserDashboard';
import { AdminDashboard } from '../../pages/AdminDashboard';
import { ForgotCredentials } from '../../pages/ForgotCredentials';
import { ActivityHistory } from '../dashboard/ActivityHistory';
import { About } from '../../pages/About';
import { Privacy } from '../../pages/Privacy';
import { Terms } from '../../pages/Terms';
import { Profile } from '../../pages/Profile';
import { PublicProfile } from '../social/PublicProfile';
import { ChatModal } from '../social/ChatModal';
import ScrollToTop from './ScrollToTop';
import { Bell, BellOff, BookOpen, Map, Calendar, ShoppingBag, MessageCircle, ClipboardList, Menu, Activity, User, Calculator, Shield } from 'lucide-react';
import { EventsAnnouncements } from '../events/EventsAnnouncements';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSockets } from '../../hooks/useWebSockets';
import { NotificationToast } from '../NotificationToast/NotificationToast';
import { useLocation } from 'react-router-dom';
import './App.css';
import './BackgroundEffects.css';

// A simple protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications: wsNotifications, messageEvent, clearNotification, setMessageEvent } = useWebSockets(user?.id);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [appNotifications, setAppNotifications] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('notificationsMuted') === 'true';
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('notificationsMuted', newMuted.toString());
  };

  // Sync WebSocket notifications with App state
  React.useEffect(() => {
    if (wsNotifications.length > 0) {
      setAppNotifications(prev => {
        // Find all notifications in wsNotifications that aren't already in appNotifications
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

  // Handle incoming message events
  React.useEffect(() => {
    if (messageEvent) {
      // If it's a message object, we could show a toast or open chat
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
  }, [messageEvent, activeChatUser]);

  // Derive activeTab solely from URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'home';

  // Fetch app notifications on component mount and user change
  React.useEffect(() => {
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
      // Try API first
      try {
        fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
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

  const handleBroadcastTest = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('📢 Attention: New campus resources have been uploaded! Check them out in the Resource Sharing tab.')
      });
    } catch (err) {
      console.error('Broadcast failed', err);
    }
  };

  const handleTabChange = (tab) => {
    window.scrollTo(0, 0);
    navigate(`/dashboard?tab=${tab}`);
  };

  return (
    <div className="premium-layout">
      {/* Background Animated Elements */}
      <div className="background-glows">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <div className="glow glow-3"></div>
      </div>

      <div className="navbar-wrapper animate-in">
        <header className="navbar glass-card">
          <div className="logo" onClick={() => handleTabChange('home')}>
            UIU StudentOS
          </div>
          
          <nav className="nav-links desktop-only">
            <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleTabChange('home')}>Dashboard</button>
            <button className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => handleTabChange('resources')}>Resources</button>
            <button className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => handleTabChange('services')}>Services</button>
            <button className={`nav-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => handleTabChange('planner')}>Planner</button>
            <button className={`nav-tab ${activeTab === 'lostfound' ? 'active' : ''}`} onClick={() => handleTabChange('lostfound')}>Lost & Found</button>
            <button className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => handleTabChange('market')}>Market</button>
            <button className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => handleTabChange('events')}>Events</button>
            <button className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')}>Reviews</button>
            <button className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => handleTabChange('calculator')}>UIU Calc</button>
          </nav>

          <div className="navbar-actions desktop-only">
            <GlobalSearch onNavigate={handleTabChange} />
            
            <div className="user-controls">
              <div className="notification-wrapper">
                <button 
                  className="icon-btn notification-btn" 
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {getUnreadCount() > 0 && (
                    <span className="notification-badge">{getUnreadCount()}</span>
                  )}
                </button>
                
                {/* Notification Panel */}
                {showNotificationPanel && (
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
                          onClick={() => setShowNotificationPanel(false)}
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
                              // Navigate to relevant section based on notification type
                              if (notification.type === 'review_posted' || notification.type === 'comment_posted' || notification.type === 'reply_posted') {
                                handleTabChange('reviews');
                              } else if (notification.type === 'resource_uploaded') {
                                handleTabChange('resources');
                              } else if (notification.type === 'direct_message') {
                                // For DMs, we could ideally open the chat modal
                                // For now, taking to home/profile is a safe fallback
                                handleTabChange('home');
                              }
                              setShowNotificationPanel(false);
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
              
              <button 
                className={`profile-pill ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                <div className="avatar-mini">
                  <User size={14} />
                </div>
                <span>{user?.username || 'User'}</span>
              </button>

              <button onClick={logout} className="exit-btn">Logout</button>
            </div>
          </div>
        </header>
      </div>

      <div className="mobile-header mobile-only animate-in">
         <GlobalSearch onNavigate={handleTabChange} />
      </div>

      <nav className="mobile-nav mobile-only">
        <button className={`mobile-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleTabChange('home')}>
          <Activity size={20} />
          <span>Home</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => handleTabChange('resources')}>
          <BookOpen size={20} />
          <span>Study</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => handleTabChange('services')}>
          <Map size={20} />
          <span>Services</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => handleTabChange('planner')}>
          <ClipboardList size={20} />
          <span>Plan</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
          <User size={20} />
          <span>Profile</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => handleTabChange('calculator')}>
          <Calculator size={20} />
          <span>UIU Calc</span>
        </button>
      </nav>
      
      <main className="main-viewport animate-in">
        <div className="content-container">
          {activeTab === 'home' && <UserDashboard onTabChange={handleTabChange} />}
          {activeTab === 'resources' && <ResourceFeed />}
          {activeTab === 'services' && <CampusServicesDirectory />}
          {activeTab === 'planner' && <StudyPlanner />}
          {activeTab === 'lostfound' && <LostFoundBoard onProfileView={setSelectedUserProfile} />}
          {activeTab === 'market' && <StudentMarketplace onProfileView={setSelectedUserProfile} />}
          {activeTab === 'events' && <EventsAnnouncements />}
          {activeTab === 'reviews' && <CourseReviews onProfileView={setSelectedUserProfile} />}
          {activeTab === 'calculator' && <UiuCalculator />}
          {(activeTab === 'profile' || queryParams.get('viewUserId')) && <Profile />}
          {activeTab === 'activity' && (
            <ActivityHistory 
              onBack={() => handleTabChange('home')} 
              onNavigate={handleTabChange}
            />
          )}
        </div>
      </main>

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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/forgot-credentials" element={<ForgotCredentials />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
