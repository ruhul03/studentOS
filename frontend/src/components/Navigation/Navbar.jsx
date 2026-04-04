import React, { useState } from 'react';
import { User } from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { NotificationPanel } from '../Notifications/NotificationPanel';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ activeTab, onNavigate, wsNotifications }) {
  const { user, logout } = useAuth();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  return (
    <div className="navbar-wrapper animate-in">
      <header className="navbar glass-card">
        <div className="logo" onClick={() => onNavigate('home')}>
          UIU StudentOS
        </div>
        
        <nav className="nav-links desktop-only">
          <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>Dashboard</button>
          <button className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => onNavigate('resources')}>Resources</button>
          <button className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => onNavigate('services')}>Services</button>
          <button className={`nav-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => onNavigate('planner')}>Planner</button>
          <button className={`nav-tab ${activeTab === 'lostfound' ? 'active' : ''}`} onClick={() => onNavigate('lostfound')}>Lost & Found</button>
          <button className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => onNavigate('market')}>Market</button>
          <button className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => onNavigate('events')}>Events</button>
          <button className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => onNavigate('reviews')}>Reviews</button>
          <button className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => onNavigate('calculator')}>UIU Calc</button>
        </nav>

        <div className="navbar-actions desktop-only">
          <GlobalSearch onNavigate={onNavigate} />
          
          <div className="user-controls">
            <NotificationPanel 
              show={showNotificationPanel} 
              toggleShow={() => setShowNotificationPanel(!showNotificationPanel)} 
              wsNotifications={wsNotifications} 
              onNavigate={onNavigate} 
            />
            
            <button 
              className={`profile-pill ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate('profile')}
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
  );
}
