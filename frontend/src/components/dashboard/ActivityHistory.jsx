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
  // Mock expanded activities
  const activities = [
    { 
      id: 1,
      title: 'CSE 101 Notes uploaded', 
      description: 'You shared "Lecture 5: Memory Management" in Resource Sharing.',
      time: '2 hours ago', 
      type: 'resources',
      status: 'success',
      icon: <BookOpen size={18} />
    },
    { 
      id: 2,
      title: 'New buyer for Scientific Calculator', 
      description: 'Salman message you regarding your listing in Marketplace.',
      time: '5 hours ago', 
      type: 'market',
      status: 'info',
      icon: <ShoppingBag size={18} />
    },
    { 
      id: 3,
      title: 'Assignment Due: Database Systems', 
      description: 'Reminder: "Project Proposal" is due in 24 hours.',
      time: 'Yesterday at 11:59 PM', 
      type: 'planner',
      status: 'warning',
      icon: <Clock size={18} />
    },
    { 
      id: 4,
      title: 'Profile Updated', 
      description: 'You updated your Department and Student ID.',
      time: '2 days ago', 
      type: 'profile',
      status: 'success',
      icon: <Activity size={18} />
    },
    { 
      id: 5,
      title: 'Course Review Posted', 
      description: 'You reviewed "Advanced Algorithms" by Dr. X.',
      time: '3 days ago', 
      type: 'reviews',
      status: 'success',
      icon: <MessageCircle size={18} />
    }
  ];

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
        {activities.map((item) => (
          <div 
            key={item.id} 
            className="activity-card glass-card"
            onClick={() => onNavigate(item.type)}
          >
            <div className="activity-type-icon" style={{ backgroundColor: `${getStatusColor(item.status)}15`, color: getStatusColor(item.status) }}>
              {item.icon}
            </div>
            
            <div className="activity-main">
              <div className="activity-brief">
                <h3>{item.title}</h3>
                <span className="activity-time">{item.time}</span>
              </div>
              <p className="activity-desc">{item.description}</p>
            </div>

            <div className="activity-action">
              <ChevronRight size={20} className="chevron" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
