import { motion } from 'framer-motion';

export function CalendarStrip() {
  const days = [];
  const today = new Date();
  
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    days.push({
      date: d.getDate(),
      day: d.toLocaleString('default', { weekday: 'short' }),
      isToday: i === 0,
      full: d
    });
  }

  return (
    <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar bg-surface-container border border-outline-variant p-3 sm:p-4 rounded-2xl relative scroll-smooth">
      <div className="absolute inset-0 bg-primary/5 -z-10 blur-xl"></div>
      {days.map((day, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[54px] py-2 sm:py-3 rounded-xl transition-all shrink-0 ${
            day.isToday 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105 sm:scale-110' 
              : 'hover:bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter mb-1 ${day.isToday ? 'opacity-90' : 'opacity-60'}`}>
            {day.day}
          </span>
          <span className={`text-lg sm:text-xl font-black ${day.isToday ? '' : 'text-on-surface'}`}>
            {day.date}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
