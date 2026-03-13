import * as React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { Bell, BookOpen, Map, Calendar, ShoppingBag, MessageCircle, ClipboardList, Menu, Activity } from 'lucide-react';
import { EventsAnnouncements } from '../events/EventsAnnouncements';
import { useWebSockets } from '../../hooks/useWebSockets';
import { NotificationToast } from '../NotificationToast/NotificationToast';
import './App.css';

// A simple protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { notifications, clearNotification } = useWebSockets();

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

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo" onClick={() => setActiveTab('home')} style={{cursor: 'pointer'}}>UIU StudentOS</div>
        
        <nav className="nav-links desktop-only">
          <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Dashboard</button>
          <button className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Resources</button>
          <button className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
          <button className={`nav-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>Planner</button>
          <button className={`nav-tab ${activeTab === 'lostfound' ? 'active' : ''}`} onClick={() => setActiveTab('lostfound')}>Lost&Found</button>
          <button className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>Market</button>
          <button className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
          <button className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </nav>

        <div className="search-container desktop-only">
          <GlobalSearch onNavigate={setActiveTab} />
        </div>
        
        <div className="user-menu">
          <button className="broadcast-btn" onClick={handleBroadcastTest} title="Test Broadcast">
            <Bell size={20} />
          </button>
          <span className="welcome-text desktop-only">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="mobile-header mobile-only">
         <GlobalSearch onNavigate={setActiveTab} />
      </div>

      <nav className="mobile-nav mobile-only">
        <button className={`mobile-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Activity size={20} />
          <span>Home</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
          <BookOpen size={20} />
          <span>Study</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          <Map size={20} />
          <span>Services</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
          <ClipboardList size={20} />
          <span>Plan</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
          <ShoppingBag size={20} />
          <span>Shop</span>
        </button>
      </nav>
      
      <main className="main-content">
        {activeTab === 'home' && <UserDashboard onTabChange={setActiveTab} />}
        {activeTab === 'resources' && <ResourceFeed />}
        {activeTab === 'services' && <CampusServicesDirectory />}
        {activeTab === 'planner' && <StudyPlanner />}
        {activeTab === 'lostfound' && <LostFoundBoard />}
        {activeTab === 'market' && <StudentMarketplace />}
        {activeTab === 'events' && <EventsAnnouncements />}
        {activeTab === 'reviews' && <CourseReviews />}
      </main>

      <NotificationToast 
        notifications={notifications} 
        onClear={clearNotification} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
