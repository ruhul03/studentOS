import * as React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { Login } from '../../pages/Login';
import { Register } from '../../pages/Register';
import { ResourceFeed } from '../resources/ResourceFeed';
import { CampusServicesDirectory } from '../services/CampusServicesDirectory';
import { StudyPlanner } from '../planner/StudyPlanner';
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
import { Bell, BookOpen, Map, Calendar, ShoppingBag, MessageCircle, ClipboardList, Menu, Activity, User } from 'lucide-react';
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
  const { notifications, messageEvent, clearNotification, setMessageEvent } = useWebSockets(user?.id);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);

  // Handle incoming message events
  React.useEffect(() => {
    if (messageEvent) {
      // If chat is already open with this user, don't necessarily need a toast?
      // But user wanted notification OR chat panel opening.
      // Let's show a toast and offer to open chat if not already open.
      
      const fetchSender = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${messageEvent.senderId}`);
          if (res.ok) {
            const senderData = await res.json();
            // Show notification toast logic could be here, or we use the notifications array
            // Let's add it to notifications for now so it shows in Toast
            // But we actually want to pop up the ChatModal if not active
            
            if (!activeChatUser || activeChatUser.id !== messageEvent.senderId) {
              setActiveChatUser(senderData);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      fetchSender();
      setMessageEvent(null); // Clear handled event
    }
  }, [messageEvent, activeChatUser]);

  // Derive activeTab solely from URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'home';

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
          </nav>

          <div className="navbar-actions desktop-only">
            <GlobalSearch onNavigate={handleTabChange} />
            
            <div className="user-controls">
              <button className="icon-btn" onClick={handleBroadcastTest} title="Test Broadcast">
                <Bell size={18} />
              </button>
              
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
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'activity' && (
            <ActivityHistory 
              onBack={() => handleTabChange('home')} 
              onNavigate={handleTabChange}
            />
          )}
        </div>
      </main>

      <NotificationToast 
        notifications={notifications} 
        onClear={clearNotification} 
      />

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
