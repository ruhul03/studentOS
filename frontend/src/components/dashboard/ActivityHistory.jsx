import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ShoppingBag, 
  Activity,
  Calendar,
  MessageCircle,
  FileText,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import './ActivityHistory.css';

export function ActivityHistory({ onBack, onNavigate }) {
  const { user } = useAuth();
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/activities`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (err) {
        console.error('Failed to fetch activities', err);
      }
    };

    if (user?.id) {
      fetchActivities();
    }
  }, [user?.id]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'resources': return <BookOpen size={18} />;
      case 'market': return <ShoppingBag size={18} />;
      case 'planner': return <Clock size={18} />;
      case 'profile': return <Activity size={18} />;
      case 'reviews': return <MessageCircle size={18} />;
      case 'lostfound': return <CheckCircle2 size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#F68B1E';
    }
  };

  return (
    <div className="activity-history-container">
      <div className="activity-header">
        <div className="header-titles">
          <h1>Activity <span>History</span></h1>
          <p>A comprehensive log of your academic and social interactions.</p>
        </div>
        <button className="back-dashboard-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="activity-feed">
        {activities.length > 0 ? (
          activities.map((item) => (
            <div 
              key={item.id} 
              className="activity-card glass-card"
              onClick={() => onNavigate(item.type)}
            >
              <div className="activity-type-icon" style={{ backgroundColor: `${getStatusColor(item.status)}15`, color: getStatusColor(item.status) }}>
                {getActivityIcon(item.type)}
              </div>
              
              <div className="activity-main">
                <div className="activity-brief">
                  <h3>{item.title}</h3>
                  <span className="activity-time">{formatActivityTime(item.timestamp)}</span>
                </div>
                <p className="activity-desc">{item.description}</p>
              </div>

              <div className="activity-action">
                <ChevronRight size={20} className="chevron" />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-history glass-card">
            <p>Your activity history is currently empty. Start interacting with the platform to see your journey here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
