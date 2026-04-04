import * as React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import { LandingPage } from '../../pages/LandingPage';
import { UserDashboard } from '../dashboard/UserDashboard';
import { AdminDashboard } from '../../pages/AdminDashboard';
import { ForgotCredentials } from '../../pages/ForgotCredentials';
import { ActivityHistory } from '../dashboard/ActivityHistory';
import { About } from '../../pages/About';
import { Privacy } from '../../pages/Privacy';
import { Terms } from '../../pages/Terms';
import { Profile } from '../../pages/Profile';
import ScrollToTop from './ScrollToTop';
import { EventsAnnouncements } from '../events/EventsAnnouncements';
import { useWebSockets } from '../../hooks/useWebSockets';
import { ProtectedRoute, AdminRoute } from '../routes/ProtectedRoutes';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Navbar } from '../Navigation/Navbar';
import { MobileNav } from '../Navigation/MobileNav';
import { ChatManager } from '../social/ChatManager';

import './App.css';
import './BackgroundEffects.css';

function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications: wsNotifications, messageEvent, clearNotification, setMessageEvent } = useWebSockets(user?.id);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  // Derive activeTab solely from URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'home';

  const handleTabChange = (tab) => {
    window.scrollTo(0, 0);
    navigate(`/dashboard?tab=${tab}`);
  };

  return (
    <DashboardLayout>
      <Navbar 
        activeTab={activeTab} 
        onNavigate={handleTabChange} 
        wsNotifications={wsNotifications} 
      />
      <MobileNav 
        activeTab={activeTab} 
        onNavigate={handleTabChange} 
      />
      
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

      <ChatManager 
        wsNotifications={wsNotifications}
        messageEvent={messageEvent}
        clearNotification={clearNotification}
        setMessageEvent={setMessageEvent}
        selectedUserProfile={selectedUserProfile}
        setSelectedUserProfile={setSelectedUserProfile}
      />
    </DashboardLayout>
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
