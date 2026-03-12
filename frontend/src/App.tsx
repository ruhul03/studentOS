import * as React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResourceFeed } from './components/resources/ResourceFeed';
import { CampusServicesDirectory } from './components/services/CampusServicesDirectory';
import { StudyPlanner } from './components/planner/StudyPlanner';
import { LostFoundBoard } from './components/lostfound/LostFoundBoard';
import { StudentMarketplace } from './components/marketplace/StudentMarketplace';
import { CourseReviews } from './components/reviews/CourseReviews';
import { GlobalSearch } from './components/GlobalSearch';
import { Bell } from 'lucide-react';
import { EventsAnnouncements } from './components/events/EventsAnnouncements';
import { useWebSockets } from './hooks/useWebSockets';
import { NotificationToast } from './components/NotificationToast';
import './App.css';

// A simple protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resources');
  const { notifications, clearNotification } = useWebSockets();

  const handleBroadcastTest = async () => {
    try {
      await fetch('http://localhost:8081/api/notifications/broadcast', {
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
        <div className="logo" onClick={() => setActiveTab('resources')} style={{cursor: 'pointer'}}>StudentOS</div>
        
        <nav className="nav-links">
          <button className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Resources</button>
          <button className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services</button>
          <button className={`nav-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>Planner</button>
          <button className={`nav-tab ${activeTab === 'lostfound' ? 'active' : ''}`} onClick={() => setActiveTab('lostfound')}>Lost&Found</button>
          <button className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>Market</button>
          <button className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
          <button className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </nav>

        <GlobalSearch onNavigate={setActiveTab} />
        
        <div className="user-menu">
          <button className="broadcast-btn" onClick={handleBroadcastTest} title="Test Broadcast">
            <Bell size={20} />
          </button>
          <span className="welcome-text">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <main className="main-content">
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
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
