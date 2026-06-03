import { motion } from 'framer-motion';
import { Clock, GraduationCap, ChevronRight, CalendarCheck } from 'lucide-react';

export function ScheduleTimeline({ schedule, onTabChange }) {
  const scheduleColors = ['primary', 'secondary', 'tertiary', 'error'];

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <section className="bg-surface-container border border-outline-variant rounded-2xl p-8 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight">Today's Schedule</h2>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Daily Agenda • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
        <button 
          onClick={() => onTabChange('planner')}
          className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full hover:bg-primary hover:text-on-primary transition-all active:scale-95 cursor-pointer"
        >
          OPEN PLANNER
        </button>
      </div>
      
      {schedule.length > 0 ? (
        <div className="relative space-y-8 pl-12 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:via-secondary/50 before:to-transparent before:rounded-full">
          {schedule.map((task, index) => (
            <motion.div 
              key={task.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative"
            >
              <div className={`absolute left-[-42px] top-1 w-5 h-5 rounded-full bg-surface-container border-4 border-surface shadow-[0_0_10px_rgba(0,0,0,0.1)] flex items-center justify-center z-10`}>
                 <div className={`w-2 h-2 rounded-full bg-${scheduleColors[index % scheduleColors.length]}`}></div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 hover:bg-surface-container-high hover:border-outline-variant transition-all hover:shadow-md cursor-pointer group" onClick={() => onTabChange('planner')}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className={`text-[10px] font-bold text-${scheduleColors[index % scheduleColors.length]} uppercase tracking-widest mb-1 flex items-center gap-1.5`}>
                      <Clock size={14} />
                      {formatTime(task.dueDate)}
                    </div>
                    <h3 className="text-lg font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant bg-surface-variant/50 px-2 py-0.5 rounded border border-outline-variant/20">
                        <GraduationCap size={14} /> 
                        {task.courseCode}
                      </span>
                      <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-outline"></span>
                        {task.type}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-outline group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-surface-container-low/50 rounded-xl border border-outline-variant/30">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline-variant mb-4 shadow-inner">
            <CalendarCheck size={32} />
          </div>
          <h3 className="text-on-surface font-bold">Clear Skies!</h3>
          <p className="text-on-surface-variant text-xs mt-1 text-center max-w-[200px]">No tasks scheduled for today. Enjoy your free time or plan ahead.</p>
        </div>
      )}
    </section>
  );
}
