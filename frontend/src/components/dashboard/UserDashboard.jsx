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
  Shield,
  ArrowUpRight
} from 'lucide-react';
import './UserDashboard.css';

export function UserDashboard({ onTabChange }) {
  const { user } = useAuth();
  const [statsData, setStatsData] = React.useState({
    totalCourses: 0,
    pendingTasks: 0,
    sharedResources: 0,
    soldItems: 0,
    completedTasks: 0
  });
  const [recentActivities, setRecentActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/stats`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/activities?limit=3`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
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
        <div className="stat-card action-upload" onClick={() => onTabChange('resources')}>
          <div className="card-shimmer"></div>
          <div className="stat-header">
            <div className="card-icon"><BookOpen size={24} /></div>
            <ArrowUpRight size={18} className="arrow-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{statsData.totalCourses}</span>
            <span className="stat-label">Courses Active</span>
          </div>
        </div>

        <div className="stat-card action-task" onClick={() => onTabChange('planner')}>
          <div className="card-shimmer"></div>
          <div className="stat-header">
            <div className="card-icon"><Clock size={24} /></div>
            <ArrowUpRight size={18} className="arrow-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{statsData.pendingTasks}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>

        <div className="stat-card action-sell" onClick={() => onTabChange('resources')}>
          <div className="card-shimmer"></div>
          <div className="stat-header">
            <div className="card-icon"><Activity size={24} /></div>
            <ArrowUpRight size={18} className="arrow-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{statsData.sharedResources}</span>
            <span className="stat-label">Shared Resources</span>
          </div>
        </div>

        <div className="stat-card action-sell" onClick={() => onTabChange('market')}>
          <div className="card-shimmer"></div>
          <div className="stat-header">
            <div className="card-icon"><ShoppingBag size={24} /></div>
            <ArrowUpRight size={18} className="arrow-icon" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{statsData.soldItems}</span>
            <span className="stat-label">Market Items</span>
          </div>
        </div>

        {user?.role === 'ADMIN' ? (
          <div className="stat-card action-admin" onClick={() => window.location.href='/admin'}>
            <div className="card-shimmer"></div>
            <div className="stat-header">
              <div className="card-icon"><Shield size={24} /></div>
              <ArrowUpRight size={18} className="arrow-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-value" style={{fontSize: '1.25rem', letterSpacing: '0'}}>ADM</span>
              <span className="stat-label">System Control</span>
            </div>
          </div>
        ) : (
          <div className="stat-card action-task" onClick={() => onTabChange('planner')}>
            <div className="card-shimmer"></div>
            <div className="stat-header">
              <div className="card-icon"><CheckCircle2 size={24} /></div>
              <ArrowUpRight size={18} className="arrow-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{statsData.completedTasks}</span>
              <span className="stat-label">Tasks Completed</span>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-main-single">
        {/* Recent Activity */}
        <section className="recent-activity-section full-width">
          <div className="section-header">
            <h3>Recent Activity Feed</h3>
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
                <p>No recent activity yet. Start exploring StudentOS!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
