import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bell, X } from 'lucide-react';

export function NotificationToast({ notifications, onClear, onClick }) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {notifications.map((note, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-4 p-4 bg-surface-container-highest/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl shadow-black/50 min-w-[320px] max-w-[450px] ${onClick ? 'cursor-pointer hover:bg-surface-container-highest transition-colors' : ''}`}
            onClick={() => {
              if (onClick) onClick(note);
              onClear(index);
            }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${
              note.type === 'direct_message' 
                ? 'bg-secondary/10 text-secondary shadow-secondary/10' 
                : 'bg-primary/10 text-primary shadow-primary/10'
            }`}>
              {note.type === 'direct_message' ? <MessageCircle size={20} className="fill-current" /> : <Bell size={20} className="fill-current" />}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-sm font-bold text-on-surface leading-tight">
                {note.title || 'Notification'}
              </div>
              <div className="text-xs font-normal text-on-surface-variant line-clamp-2 leading-relaxed">
                {note.message}
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onClear(index);
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
