import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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
import { Inbox } from '../inbox/Inbox';
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
import { SettingsPage } from '../dashboard/SettingsPage';
import { HelpPage } from '../dashboard/HelpPage';
import { useWebSockets } from '../../hooks/useWebSockets';
import { ProtectedRoute, AdminRoute } from '../routes/ProtectedRoutes';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Navbar } from '../Navigation/Navbar';
import { MobileNav } from '../Navigation/MobileNav';
import { ChatManager } from '../social/ChatManager';
import { useIsMobile } from '../../hooks/useIsMobile';

function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { notifications: wsNotifications, messageEvent, clearNotification, setMessageEvent } = useWebSockets(user?.id);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [chatOpenUserId, setChatOpenUserId] = useState(null);
  const [unreadDMCount, setUnreadDMCount] = useState(0);

  // Derive activeTab solely from URL
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'home';

  useEffect(() => {
    import('../../api').then(({ fetchWithAuth }) => {
      if (user) {
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/messages/unread-count`)
          .then(res => res.json())
          .then(count => setUnreadDMCount(count))
          .catch(console.error);
      }
    });
  }, [user]);

  useEffect(() => {
    if (messageEvent) {
       setUnreadDMCount(prev => prev + 1);
    }
  }, [messageEvent]);

  useEffect(() => {
     if (activeTab === 'inbox') {
        setUnreadDMCount(0);
     }
  }, [activeTab]);

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
        onMessageClick={setChatOpenUserId}
        unreadDMCount={unreadDMCount}
      />
      <MobileNav 
        activeTab={activeTab} 
        onNavigate={handleTabChange} 
        unreadDMCount={unreadDMCount}
      />

      <main className="flex flex-col md:ml-64 max-md:pt-[124px] md:pt-16 min-h-[100dvh] md:min-h-screen w-full md:w-[calc(100%-256px)] pb-20 md:pb-0">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col flex-1 h-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={isMobile ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col flex-1 h-full w-full"
            >
              {activeTab === 'home' && <UserDashboard onTabChange={handleTabChange} />}
              {activeTab === 'inbox' && <Inbox messageEvent={messageEvent} onProfileView={setSelectedUserProfile} />}
              {activeTab === 'resources' && <ResourceFeed onProfileView={setSelectedUserProfile} onMessageClick={setChatOpenUserId} />}
              {activeTab === 'services' && <CampusServicesDirectory />}
              {activeTab === 'planner' && <StudyPlanner />}
              {activeTab === 'lostfound' && <LostFoundBoard onProfileView={setSelectedUserProfile} />}
              {activeTab === 'market' && <StudentMarketplace onProfileView={setSelectedUserProfile} />}
              {activeTab === 'events' && <EventsAnnouncements />}
              {activeTab === 'reviews' && <CourseReviews onProfileView={setSelectedUserProfile} />}
              {activeTab === 'calculator' && <UiuCalculator />}
              {(activeTab === 'profile' || queryParams.get('viewUserId')) && <Profile />}
              {activeTab === 'settings' && <SettingsPage />}
              {activeTab === 'help' && <HelpPage />}
              {activeTab === 'activity' && (
                <ActivityHistory 
                  onBack={() => handleTabChange('home')} 
                  onNavigate={handleTabChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ChatManager 
        wsNotifications={wsNotifications}
        messageEvent={messageEvent}
        clearNotification={clearNotification}
        setMessageEvent={setMessageEvent}
        selectedUserProfile={selectedUserProfile}
        setSelectedUserProfile={setSelectedUserProfile}
        chatOpenUserId={chatOpenUserId}
        setChatOpenUserId={setChatOpenUserId}
      />
    </DashboardLayout>
  );
}

import { FeatureCalculator } from '../../pages/features/FeatureCalculator';
import { FeatureMarketplace } from '../../pages/features/FeatureMarketplace';
import { FeatureReviews } from '../../pages/features/FeatureReviews';
import { FeatureResources } from '../../pages/features/FeatureResources';
import { VerifyEmail } from '../../pages/VerifyEmail';

function App() {
  const [isWakingServer, setIsWakingServer] = useState(false);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || '';
    
    const timeout = setTimeout(() => setIsWakingServer(true), 1500);

    fetch(`${API}/api/ping`)
      .then(() => {
        clearTimeout(timeout);
        setIsWakingServer(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setIsWakingServer(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AuthProvider>
      {isWakingServer && (
        <div className="fixed top-0 left-0 w-full bg-blue-600 text-white text-xs py-1.5 px-4 text-center z-[100] flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top-2">
          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Waking up backend server. This may take up to 30 seconds...
        </div>
      )}
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyEmail />} />
          
          {/* Public Feature SEO Pages */}
          <Route path="/features/calculator" element={<FeatureCalculator />} />
          <Route path="/features/marketplace" element={<FeatureMarketplace />} />
          <Route path="/features/reviews" element={<FeatureReviews />} />
          <Route path="/features/resources" element={<FeatureResources />} />

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
