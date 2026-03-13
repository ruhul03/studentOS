import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import './NotificationToast.css';

export function NotificationToast({ notifications, onClear }) {
  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((note, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="toast-card"
          >
            <div className="toast-icon">
              <Bell size={20} />
            </div>
            <div className="toast-content">
              <span>{note}</span>
            </div>
            <button className="toast-close" onClick={() => onClear(index)}>
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
