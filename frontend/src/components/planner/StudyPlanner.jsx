import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { PlannerModal } from './PlannerModal';

export function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'course' | 'type'
  const [weekOffset, setWeekOffset] = useState(0);
  const { user } = useAuth();
  const API = import.meta.env.VITE_API_URL;

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetchWithAuth(`${API}/api/planner/user/${user.id}`);
      if (response.ok) setTasks(await response.json());
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  }, [user, API]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleTask = async (id) => {
    try {
      await fetchWithAuth(`${API}/api/planner/${id}/toggle`, { method: 'PUT' });
      fetchTasks();
    } catch (err) { console.error('Failed to toggle task', err); }
  };

  const deleteTask = async (id) => {
    try {
      await fetchWithAuth(`${API}/api/planner/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) { console.error('Failed to delete task', err); }
  };

  // Week calculation
  const weekData = useMemo(() => {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff + weekOffset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const endOfWeek = new Date(days[6]);
    endOfWeek.setHours(23, 59, 59, 999);

    return { days, start: startOfWeek, end: endOfWeek };
  }, [weekOffset]);

  const isToday = (d) => new Date().toDateString() === d.toDateString();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  // Map tasks to calendar
  const calendarTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      const d = new Date(t.dueDate);
      return d >= weekData.start && d <= weekData.end;
    });
  }, [tasks, weekData]);

  const getTaskPosition = (task) => {
    const d = new Date(task.dueDate);
    let dayIndex = d.getDay() - 1; // 0=Mon
    if (dayIndex === -1) dayIndex = 6; // Sunday
    
    const hour = d.getHours() + d.getMinutes() / 60;
    const startHour = 8;
    const endHour = 22;
    const topPct = ((hour - startHour) / (endHour - startHour)) * 100;
    
    return { dayIndex, topPct: Math.max(0, Math.min(95, topPct)) };
  };

  const getCourseColor = (code) => {
    const colors = [
      'bg-primary/20 text-primary border-primary/30',
      'bg-secondary/20 text-secondary border-secondary/30',
      'bg-tertiary/20 text-tertiary border-tertiary/30',
    ];
    const sum = (code || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  const formatWeekRange = () => {
    const opts = { month: 'short', day: 'numeric' };
    return `${weekData.start.toLocaleDateString('en-US', opts)} - ${weekData.end.toLocaleDateString('en-US', opts)}`;
  };

  // Sort tasks
  const daysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / 864e5) : 999;
  const pendingTasks = useMemo(() => {
    const p = tasks.filter(t => !t.completed);
    if (sortBy === 'course') return [...p].sort((a, b) => (a.courseCode || '').localeCompare(b.courseCode || ''));
    if (sortBy === 'type') return [...p].sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    return [...p].sort((a, b) => daysLeft(a.dueDate) - daysLeft(b.dueDate));
  }, [tasks, sortBy]);

  const completedTasks = tasks.filter(t => t.completed);

  const getCourseColorClass = (code) => {
    const sum = (code || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const cls = [
      'bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/30',
      'bg-tertiary-fixed/10 text-tertiary-fixed border-tertiary-fixed/30',
      'bg-primary-fixed/10 text-primary-fixed border-primary-fixed/30',
    ];
    return cls[sum % cls.length];
  };

  const calcDaysLeft = (ds) => {
    if (!ds) return null;
    return Math.ceil((new Date(ds) - new Date()) / 864e5);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Left: Weekly Calendar */}
      <section className="flex-[1.8] bg-surface-container-low border border-outline-variant rounded-3xl p-8 flex flex-col min-h-[700px] relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight mb-1">Academic Calendar</h1>
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">{formatWeekRange()}</p>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-high/50 backdrop-blur-xl p-1.5 rounded-2xl border border-outline-variant/30 shadow-lg">
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95" 
              onClick={() => setWeekOffset(w => w - 1)}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button 
              className="px-5 py-2 text-xs font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors" 
              onClick={() => setWeekOffset(0)}
            >
              Today
            </button>
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95" 
              onClick={() => setWeekOffset(w => w + 1)}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all ${
                    isToday(d) ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : 'text-on-surface'
                  }`}>
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
                            className={`absolute left-0 w-full p-3 rounded-2xl border cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all z-10 ${colorCls}`}
                            style={{ top: `${topPct}%` }}
                            title={`${t.title} - ${t.courseCode}`}
                          >
                            <span className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{t.courseCode}</span>
                            <p className="text-[11px] font-bold leading-tight line-clamp-2">{t.title}</p>
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

      {/* Right: Action Items */}
      {/* Right: Action Items */}
      <section className="flex-1 bg-surface-container-low border border-outline-variant rounded-3xl flex flex-col h-full relative overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-outline-variant/30 bg-surface-container-high/30 backdrop-blur-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-black text-on-surface tracking-tight">Focus List</h2>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60 mt-1">{pendingTasks.length} PENDING TASKS</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-background/50 rounded-xl border border-outline-variant/30">
            {['date', 'course', 'type'].map(s => (
              <button 
                key={s} 
                onClick={() => setSortBy(s)} 
                className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all ${
                  sortBy === s ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-surface-container-low/50">
          <AnimatePresence mode='popLayout'>
            {pendingTasks.map(task => {
              const dl = calcDaysLeft(task.dueDate);
              const isUrgent = dl !== null && dl <= 2 && dl >= 0;
              const isOverdue = dl !== null && dl < 0;
              
              return (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} 
                  key={task.id}
                  className={`group relative bg-surface-container-high/50 rounded-2xl border transition-all hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] ${
                    isOverdue ? 'border-error/50' : isUrgent ? 'border-secondary/50' : 'border-outline-variant/30'
                  }`}
                >
                  <div className="p-4 flex gap-4">
                    <div className="pt-0.5">
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleTask(task.id)} 
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isOverdue ? 'border-error bg-error/10' : isUrgent ? 'border-secondary bg-secondary/10' : 'border-outline-variant hover:border-primary'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </motion.button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-sm font-bold text-on-surface leading-tight">{task.title}</h4>
                        <button 
                          onClick={() => deleteTask(task.id)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10 transition-all shrink-0"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getCourseColor(task.courseCode)}`}>
                          {task.courseCode || 'GENERAL'}
                        </span>
                        
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                          isOverdue ? 'text-error' : isUrgent ? 'text-secondary' : 'text-on-surface-variant opacity-60'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {isOverdue ? 'error' : 'schedule'}
                          </span>
                          {isOverdue ? 'Overdue' : dl === 0 ? 'Due Today' : `${dl} Days Left`}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {completedTasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">Completed ({completedTasks.length})</span>
                <div className="w-8 h-[1px] bg-outline-variant/20 flex-1 ml-4"></div>
              </div>
              
              <div className="space-y-2">
                {completedTasks.slice(0, 5).map(task => (
                  <motion.div layout key={task.id} className="group bg-surface-container/30 rounded-xl p-3 flex gap-4 opacity-50 hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-primary text-[14px] font-black">check</span>
                    </button>
                    <span className="text-xs font-medium text-on-surface line-through truncate flex-1">{task.title}</span>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
              <div className="w-20 h-20 rounded-[2.5rem] bg-surface-container-highest flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">task_alt</span>
              </div>
              <h3 className="text-lg font-black text-on-surface mb-2">Clean Slate!</h3>
              <p className="text-xs font-medium">No pending tasks found. Enjoy your free time or add a new goal.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modern Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-12 right-12 z-[60] w-16 h-16 bg-primary text-on-primary rounded-[2rem] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center transition-all group overflow-hidden"
        onClick={() => setShowModal(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-500">add</span>
      </motion.button>

      <PlannerModal isOpen={showModal} onClose={() => setShowModal(false)} onTaskCreated={fetchTasks} />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #464554; }
      `}} />
    </div>
  );
}
