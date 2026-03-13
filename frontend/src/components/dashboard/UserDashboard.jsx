import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ShoppingBag, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import './UserDashboard.css';

export function UserDashboard({ onTabChange }) {
  const { user } = useAuth();

  // Mock stats - in a real app, these would come from the backend
  const stats = [
    { label: 'Courses', value: '6', icon: <BookOpen />, color: '#F68B1E' },
    { label: 'Pending Tasks', value: '4', icon: <Clock />, color: '#fb923c' },
    { label: 'Shared Resources', value: '12', icon: <Activity />, color: '#10b981' },
    { label: 'Sold Items', value: '3', icon: <ShoppingBag />, color: '#f59e0b' },
  ];

  const recentActivities = [
    { title: 'CSE 101 Notes uploaded', time: '2h ago', status: 'success' },
    { title: 'Assignment Due: Database Systems', time: 'Tomorrow', status: 'warning' },
    { title: 'New buyer for Scientific Calculator', time: '5h ago', status: 'info' },
  ];

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-hero">
        <div className="welcome-section">
          <h1>Welcome back, <span>{user?.username || user?.name?.split(' ')[0] || 'Student'}</span>!</h1>
          <p>Here's what's happening with your academic life today.</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card" onClick={() => onTabChange('resources')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `#F68B1E20`, color: '#F68B1E' }}>
            <BookOpen />
          </div>
          <div className="stat-info">
            <span className="stat-value">6</span>
            <span className="stat-label">Courses</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => onTabChange('planner')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `#fb923c20`, color: '#fb923c' }}>
            <Clock />
          </div>
          <div className="stat-info">
            <span className="stat-value">4</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => onTabChange('resources')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `#10b98120`, color: '#10b981' }}>
            <Activity />
          </div>
          <div className="stat-info">
            <span className="stat-value">12</span>
            <span className="stat-label">Shared Resources</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => onTabChange('market')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `#f59e0b20`, color: '#f59e0b' }}>
            <ShoppingBag />
          </div>
          <div className="stat-info">
            <span className="stat-value">3</span>
            <span className="stat-label">Sold Items</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
      </div>

      <div className="dashboard-main">
        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn glass-card" onClick={() => onTabChange('resources')}>
              <div className="action-circle"><BookOpen /></div>
              <span>Upload Notes</span>
              <Plus size={16} className="plus-icon" />
            </button>
            <button className="action-btn glass-card" onClick={() => onTabChange('planner')}>
              <div className="action-circle"><Clock /></div>
              <span>Add Task</span>
              <Plus size={16} className="plus-icon" />
            </button>
            <button className="action-btn glass-card" onClick={() => onTabChange('market')}>
              <div className="action-circle"><ShoppingBag /></div>
              <span>Sell Item</span>
              <Plus size={16} className="plus-icon" />
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="view-all-btn" onClick={() => onTabChange('events')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="activity-list glass-card">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className={`status-dot ${activity.status}`}></div>
                <div className="activity-details">
                  <p>{activity.title}</p>
                  <span>{activity.time}</span>
                </div>
                <CheckCircle2 size={16} className="check-icon" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
