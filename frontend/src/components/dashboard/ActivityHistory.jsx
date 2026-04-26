import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export function ActivityHistory({ onBack, onNavigate }) {
  const { user } = useAuth();
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/activities`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
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
      case 'resources': return 'menu_book';
      case 'market': return 'shopping_bag';
      case 'planner': return 'schedule';
      case 'profile': return 'person';
      case 'reviews': return 'chat';
      case 'lostfound': return 'check_circle';
      default: return 'history';
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

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'success': return 'text-secondary bg-secondary/10';
      case 'warning': return 'text-tertiary bg-tertiary/10';
      case 'info': return 'text-primary bg-primary/10';
      default: return 'text-outline bg-outline/10';
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">
            Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Timeline</span>
          </h1>
          <p className="text-on-surface-variant text-base">Your academic journey, tracked and organized.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest rounded-xl text-sm font-bold text-on-surface transition-all active:scale-95 shadow-sm" 
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Dashboard
        </button>
      </div>

      <div className="relative">
        {/* Vertical Timeline Line */}
        {activities.length > 0 && (
          <div className="absolute left-6 top-2 bottom-0 w-[2px] bg-gradient-to-b from-primary/30 via-outline-variant/20 to-transparent"></div>
        )}

        <div className="flex flex-col gap-8 relative z-10">
          {activities.length > 0 ? (
            activities.map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="flex items-start gap-8 group"
                onClick={() => onNavigate(item.type)}
              >
                {/* Timeline Dot & Icon */}
                <div className="relative shrink-0 pt-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300 relative z-10 ${getStatusColorClass(item.status)}`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getActivityIcon(item.type)}
                    </span>
                  </div>
                  {/* Pulse Effect for Recent Items */}
                  {index === 0 && (
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping -z-10 scale-110"></div>
                  )}
                </div>
                
                {/* Content Card */}
                <div className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 hover:bg-surface-container hover:border-primary/30 transition-all cursor-pointer shadow-sm relative overflow-hidden group/card">
                  {/* Decorative corner glow */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl transition-opacity group-hover/card:opacity-100 opacity-0"></div>

                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{item.type}</span>
                      <h3 className="text-lg font-bold text-on-surface group-hover/card:text-primary transition-colors">{item.title}</h3>
                    </div>
                    <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-md whitespace-nowrap">{formatActivityTime(item.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{item.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover/card:opacity-100 transition-all -translate-x-2 group-hover/card:translate-x-0">
                    Explore Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low border border-outline-variant/30 rounded-3xl">
              <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-outline mb-6">
                <span className="material-symbols-outlined text-4xl">history_toggle_off</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Silence in the archives</h3>
              <p className="text-on-surface-variant text-center max-w-sm">Your activity history is currently empty. Your actions on StudentOS will be chronologically preserved here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
