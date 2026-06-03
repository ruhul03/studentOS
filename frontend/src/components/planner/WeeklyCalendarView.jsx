import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function WeeklyCalendarView({
  weekData,
  formatWeekRange,
  setWeekOffset,
  playTabSound,
  isToday,
  dayNames,
  timeSlots,
  calendarTasks,
  getTaskPosition,
  getCourseColor,
  weekOffset,
  onEditTask
}) {
  return (
    <section className="flex-[1.8] bg-surface-container-low border border-outline-variant rounded-3xl p-8 flex flex-col min-h-[700px] relative overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-1">Academic Calendar</h1>
          <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">{formatWeekRange()}</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-high/50 backdrop-blur-xl p-1.5 rounded-2xl border border-outline-variant/30 shadow-lg">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95 cursor-pointer"
            onClick={() => { setWeekOffset(w => w - 1); playTabSound(); }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="px-5 py-2 text-xs font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors cursor-pointer"
            onClick={() => { setWeekOffset(0); playTabSound(); }}
          >
            Today
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95 cursor-pointer"
            onClick={() => { setWeekOffset(w => w + 1); playTabSound(); }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar relative z-10">
        <div className="min-w-[800px] flex flex-col h-full">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-4 ml-16 mb-6">
            {weekData.days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isToday(d) ? 'text-primary' : 'text-on-surface-variant opacity-40'}`}>
                  {dayNames[i]}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all ${isToday(d) ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'text-on-surface'}`}>
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="flex-1 relative border-t border-outline-variant/20 pt-4" style={{ height: '800px' }}>
            {/* Time Slots Labels */}
            <div className="absolute left-0 top-4 w-12 flex flex-col h-full justify-between pr-4">
              {timeSlots.map(t => (
                <span key={t} className="text-[10px] font-black text-on-surface-variant/40 uppercase text-right h-0 flex items-center justify-end">
                  {t > 12 ? t - 12 : t} {t >= 12 ? 'PM' : 'AM'}
                </span>
              ))}
            </div>

            {/* Grid Lines */}
            <div className="absolute left-16 right-0 top-4 h-full flex flex-col justify-between pointer-events-none">
              {timeSlots.map(t => (
                <div key={t} className="border-b border-outline-variant/10 w-full h-0"></div>
              ))}
            </div>

            {/* Calendar Content Area */}
            <div className="absolute left-16 right-0 top-4 h-full grid grid-cols-7 gap-4">
              {weekData.days.map((d, dayIdx) => (
                <div key={dayIdx} className={`relative h-full ${isToday(d) ? 'bg-primary/5 rounded-2xl' : ''}`}>
                  {calendarTasks
                    .filter(t => getTaskPosition(t).dayIndex === dayIdx)
                    .map(t => {
                      const { topPct } = getTaskPosition(t);
                      const colorCls = getCourseColor(t.courseCode);
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={t.id}
                          className={`absolute left-0 w-full p-2 rounded-md cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all z-10 ${colorCls}`}
                          style={{ top: `${topPct}%`, minHeight: '48px' }}
                          title={`${t.title} - ${t.courseCode}`}
                          onClick={() => onEditTask(t)}
                        >
                          <span className="block text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">{t.courseCode}</span>
                          <p className="text-[11px] font-medium leading-tight line-clamp-2">{t.title}</p>
                        </motion.div>
                      );
                    })}
                </div>
              ))}
            </div>

            {/* Current Time Indicator */}
            {weekOffset === 0 && (() => {
              const now = new Date();
              const hour = now.getHours() + now.getMinutes() / 60;
              if (hour < 8 || hour > 22) return null;
              const topPct = ((hour - 8) / 14) * 100;
              return (
                <div className="absolute left-16 right-0 z-20 pointer-events-none" style={{ top: `${topPct + 4}%` }}>
                  <div className="relative w-full border-t-2 border-secondary shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)]">
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-secondary"></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
