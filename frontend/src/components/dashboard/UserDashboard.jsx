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
  Activity,
  Shield
} from 'lucide-react';
import './UserDashboard.css';

export function UserDashboard({ onTabChange }) {
  const { user } = useAuth();
  const [statsData, setStatsData] = React.useState({
    totalCourses: 0,
    pendingTasks: 0,
    sharedResources: 0,
    soldItems: 0
  });
  const [recentActivities, setRecentActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    const fetchActivities = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/activities?limit=3`);
        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data);
        }
      } catch (err) {
        console.error('Failed to fetch activities', err);
      }
    };

    if (user?.id) {
      fetchStats();
      fetchActivities();
    }
  }, [user?.id]);

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

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
          <div className="stat-icon" style={{ backgroundColor: `var(--aura-purple-glow)`, color: 'var(--aura-purple)' }}>
            <BookOpen />
          </div>
          <div className="stat-info">
            <span className="stat-value">{statsData.totalCourses}</span>
            <span className="stat-label">Courses</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => onTabChange('planner')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `var(--aura-cyan-glow)`, color: 'var(--aura-cyan)' }}>
            <Clock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{statsData.pendingTasks}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => onTabChange('resources')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `var(--aura-pink-glow)`, color: 'var(--aura-pink)' }}>
            <Activity />
          </div>
          <div className="stat-info">
            <span className="stat-value">{statsData.sharedResources}</span>
            <span className="stat-label">Shared Resources</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => onTabChange('market')} style={{cursor: 'pointer'}}>
          <div className="stat-icon" style={{ backgroundColor: `rgba(255, 255, 255, 0.1)`, color: 'white' }}>
            <ShoppingBag />
          </div>
          <div className="stat-info">
            <span className="stat-value">{statsData.soldItems}</span>
            <span className="stat-label">Sold Items</span>
          </div>
          <TrendingUp size={16} className="trend-icon" />
        </div>
      </div>

      <div className="dashboard-main">
        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-stack">
            <div className="actions-grid">
              <button className="action-btn action-upload glass-card" onClick={() => onTabChange('resources')}>
                <div className="shimmer-overlay"></div>
                <div className="action-circle"><BookOpen /></div>
                <span>Upload Notes</span>
              </button>
              <button className="action-btn action-task glass-card" onClick={() => onTabChange('planner')}>
                <div className="shimmer-overlay"></div>
                <div className="action-circle"><Clock /></div>
                <span>Add Task</span>
              </button>
              <button className="action-btn action-sell glass-card" onClick={() => onTabChange('market')}>
                <div className="shimmer-overlay"></div>
                <div className="action-circle"><ShoppingBag /></div>
                <span>Sell Item</span>
              </button>
            </div>
            
            {user?.role === 'ADMIN' && (
              <div className="admin-actions-grid">
                <button className="action-btn action-admin glass-card" onClick={() => window.location.href='/admin'}>
                  <div className="shimmer-overlay"></div>
                  <div className="action-circle"><Shield /></div>
                  <span>System Control</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="view-all-btn" onClick={() => onTabChange('activity')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="activity-list glass-card">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="activity-item" onClick={() => onTabChange(activity.type)} style={{cursor: 'pointer'}}>
                  <div className={`status-dot ${activity.status}`}></div>
                  <div className="activity-details">
                    <p>{activity.title}</p>
                    <span>{formatActivityTime(activity.timestamp)}</span>
                  </div>
                  <CheckCircle2 size={16} className="check-icon" />
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <p>No recent activity yet. Start exploring!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
