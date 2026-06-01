import { motion } from 'framer-motion';
import { playToggleSound } from '../../../utils/notificationSound';

export function NotificationSettings({ notifications, setNotifications }) {
  const notificationItems = [
    { id: 'email_tasks', label: 'Email Reminders for Tasks', desc: 'Get notified 24h before task deadlines.' },
    { id: 'email_market', label: 'New Marketplace Messages', desc: 'Alert me when someone inquires about my listing.' },
    { id: 'push_events', label: 'Campus Event Alerts', desc: 'Real-time notifications for upcoming university events.' },
    { id: 'push_resources', label: 'Resource Updates', desc: 'Notify when new materials are shared for my courses.' }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-on-surface tracking-tight">Notification Channels</h2>
        <p className="text-sm text-on-surface-variant font-medium opacity-70">Define how the system communicates critical updates.</p>
      </div>
      <div className="space-y-4">
        {notificationItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/30 transition-all group">
            <div>
              <p className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-xs text-on-surface-variant font-medium opacity-80">{item.desc}</p>
            </div>
            <button 
              onClick={() => { setNotifications({...notifications, [item.id]: !notifications[item.id]}); playToggleSound(); }}
              className={`w-12 h-7 rounded-full relative p-1 transition-all flex items-center ${
                notifications[item.id] ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/30'
              }`}
            >
              <motion.div 
                layout
                className={`w-5 h-5 rounded-full shadow-lg ${notifications[item.id] ? 'bg-on-primary ml-auto' : 'bg-outline-variant'}`} 
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
