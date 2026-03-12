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
    { label: 'Courses', value: '6', icon: <BookOpen />, color: '#6366f1' },
    { label: 'Pending Tasks', value: '4', icon: <Clock />, color: '#f59e0b' },
    { label: 'Shared Resources', value: '12', icon: <Activity />, color: '#10b981' },
    { label: 'Sold Items', value: '3', icon: <ShoppingBag />, color: '#ec4899' },
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
          <h1>Welcome back, <span>{user?.name || 'Student'}</span>!</h1>
          <p>Here's what's happening with your academic life today.</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <TrendingUp size={16} className="trend-icon" />
          </div>
        ))}
      </div>

      <div className="dashboard-main">
        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn glass-card" onClick={() => onTabChange('study')}>
              <div className="action-circle"><BookOpen /></div>
              <span>Upload Notes</span>
              <Plus size={16} className="plus-icon" />
            </button>
            <button className="action-btn glass-card" onClick={() => onTabChange('plan')}>
              <div className="action-circle"><Clock /></div>
              <span>Add Task</span>
              <Plus size={16} className="plus-icon" />
            </button>
            <button className="action-btn glass-card" onClick={() => onTabChange('shop')}>
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
            <button className="view-all-btn">View All <ArrowRight size={14} /></button>
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
