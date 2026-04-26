import { motion, AnimatePresence } from 'framer-motion';

export function NotificationToast({ notifications, onClear }) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {notifications.map((note, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-center gap-4 p-4 bg-surface-container-highest/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl shadow-black/50 min-w-[320px] max-w-[450px]"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10 shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            </div>
            <div className="flex-1 text-sm font-bold text-on-surface leading-tight">
              {note}
            </div>
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all shrink-0" 
              onClick={() => onClear(index)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
