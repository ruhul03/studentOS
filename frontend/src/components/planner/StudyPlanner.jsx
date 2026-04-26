import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
      const response = await fetch(`${API}/api/planner/user/${user.id}`);
      if (response.ok) setTasks(await response.json());
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  }, [user, API]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleTask = async (id) => {
    try {
      await fetch(`${API}/api/planner/${id}/toggle`, { method: 'PUT' });
      fetchTasks();
    } catch (err) { console.error('Failed to toggle task', err); }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API}/api/planner/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) { console.error('Failed to delete task', err); }
  };

  // Week calculation
  const weekData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Adjust to Monday. If Sunday (0), go back 6 days.
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff + weekOffset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    const endOfWeek = new Date(days[6]);
    endOfWeek.setHours(23, 59, 59, 999);
    return { days, start: startOfWeek, end: endOfWeek };
  }, [weekOffset]);

  const isToday = (d) => new Date().toDateString() === d.toDateString();
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const timeSlots = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];

  // Map tasks to calendar
  const calendarTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= weekData.start && d <= weekData.end;
    });
  }, [tasks, weekData]);

  const getTaskPosition = (task) => {
    const d = new Date(task.dueDate);
    let dayIndex = d.getDay() - 1; // 0=Mon
    if (dayIndex === -1) dayIndex = 6; // Sunday
    
    // We now show all 7 days in the grid
    if (dayIndex < 0 || dayIndex > 6) return null; 

    const hour = d.getHours();
    const minutes = d.getMinutes();
    const totalHours = hour + minutes / 60;
    
    // Map 8 AM - 10 PM (14 hours)
    const startHour = 8;
    const endHour = 22;
    const topPct = Math.max(0, Math.min(95, ((totalHours - startHour) / (endHour - startHour)) * 100));
    return { dayIndex, topPct };
  };

  const colorClasses = [
    { bg: 'rgba(78,222,163,0.12)', border: 'rgba(78,222,163,0.35)', text: '#4edea3' },
    { bg: 'rgba(192,193,255,0.12)', border: 'rgba(192,193,255,0.35)', text: '#c0c1ff' },
    { bg: 'rgba(255,183,131,0.12)', border: 'rgba(255,183,131,0.35)', text: '#ffb783' },
    { bg: 'rgba(255,180,171,0.12)', border: 'rgba(255,180,171,0.35)', text: '#ffb4ab' },
  ];

  const getColor = (code) => {
    const sum = (code || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colorClasses[sum % colorClasses.length];
  };

  const formatWeekRange = () => {
    const s = weekData.days[0];
    const e = weekData.days[4];
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${s.toLocaleDateString('en-US', opts)} - ${e.toLocaleDateString('en-US', opts)}`;
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
    <div className="w-full h-full flex flex-col lg:flex-row gap-6">
      {/* Left: Weekly Calendar */}
      <section className="flex-[1.5] bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col min-h-[600px] relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-on-background mb-1">Weekly Plan</h1>
            <p className="text-sm text-on-surface-variant">{formatWeekRange()}</p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-outline-variant">
            <button className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors" onClick={() => setWeekOffset(w => w - 1)}>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="px-3 py-1 text-sm text-on-surface font-medium" onClick={() => setWeekOffset(0)}>Today</button>
            <button className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors" onClick={() => setWeekOffset(w => w + 1)}>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-2 min-w-[800px]">
            {/* Day Headers */}
            <div className="col-start-2 col-span-7 grid grid-cols-7 gap-1 mb-4 border-b border-outline-variant pb-2">
              {weekData.days.map((d, i) => (
                <div key={i} className="text-center">
                  <span className={`text-xs font-bold tracking-wider uppercase ${isToday(d) ? 'text-inverse-primary relative' : 'text-on-surface-variant'}`}>
                    {dayNames[i]} {d.getDate()}
                    {isToday(d) && <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-inverse-primary"></div>}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="col-span-8 row-start-2 relative h-[700px] border-t border-outline-variant/30">
              <div className="absolute left-0 top-0 w-12 flex flex-col h-full justify-between text-right pr-4 text-[10px] font-bold tracking-wider text-on-surface-variant/60">
                {timeSlots.map(t => <span key={t} className="h-0 flex items-center justify-end">{t}</span>)}
              </div>
              <div className="absolute left-12 right-0 top-0 h-full flex flex-col justify-between">
                {timeSlots.map((_, i) => <div key={i} className="border-b border-outline-variant/10 w-full h-0"></div>)}
              </div>

              {/* Task blocks */}
              <div className="absolute left-12 right-0 top-0 h-full grid grid-cols-7 gap-1 px-1">
                {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                  <div key={dayIdx} className={`relative ${isToday(weekData.days[dayIdx]) ? 'bg-surface-variant/20 rounded-md' : ''}`}>
                    {calendarTasks.filter(t => {
                      const pos = getTaskPosition(t);
                      return pos && pos.dayIndex === dayIdx;
                    }).map(t => {
                      const pos = getTaskPosition(t);
                      const clr = getColor(t.courseCode);
                      return (
                        <div key={t.id} className="absolute left-0 w-full p-2 rounded cursor-pointer hover:brightness-125 transition-all" style={{
                          top: `${pos.topPct}%`, backgroundColor: clr.bg, border: `1px solid ${clr.border}`, color: clr.text,
                        }} title={`${t.title}\n${t.courseCode} · ${t.type}`}>
                          <p className="text-[10px] font-bold tracking-wider uppercase mb-0.5 truncate">{t.courseCode}</p>
                          <p className="text-xs leading-tight truncate">{t.title}</p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Current time indicator */}
              {weekOffset === 0 && (() => {
                const now = new Date();
                let dayIdx = now.getDay() - 1;
                if (dayIdx === -1) dayIdx = 6;
                if (dayIdx < 0 || dayIdx > 6) return null;
                const hour = now.getHours() + now.getMinutes() / 60;
                const topPct = Math.max(0, Math.min(100, ((hour - 8) / 10) * 100));
                return (
                  <div className="absolute left-12 right-0" style={{ top: `${topPct}%` }}>
                    <div className="border-t border-inverse-primary z-10 relative">
                      <div className="w-2 h-2 rounded-full bg-inverse-primary absolute -left-1 -top-1"></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Right: Action Items */}
      <section className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col h-full relative">
        <div className="p-6 pb-4 border-b border-outline-variant/50 flex justify-between items-end shrink-0">
          <div>
            <h2 className="text-lg font-bold text-on-background">Action Items</h2>
            <p className="text-sm text-on-surface-variant mt-1">{pendingTasks.length} pending</p>
          </div>
          <div className="flex items-center gap-1">
            {['date', 'course', 'type'].map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`text-xs px-2 py-1 rounded transition-colors ${sortBy === s ? 'bg-inverse-primary/20 text-inverse-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {s === 'date' ? 'Due' : s === 'course' ? 'Course' : 'Type'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          <AnimatePresence>
            {pendingTasks.map(task => {
              const dl = calcDaysLeft(task.dueDate);
              const isUrgent = dl !== null && dl <= 2 && dl >= 0;
              const isOverdue = dl !== null && dl < 0;
              return (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={task.id}
                  className={`group bg-surface rounded-lg border ${isOverdue ? 'border-error/70' : isUrgent ? 'border-error/50' : 'border-outline-variant'} p-3 flex gap-4 hover:border-inverse-primary/50 hover:bg-surface-variant/50 transition-all`}>
                  <div className="pt-1">
                    <div onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded border-2 ${isOverdue || isUrgent ? 'border-error' : 'border-outline-variant hover:border-inverse-primary'} cursor-pointer flex items-center justify-center transition-colors`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-normal text-on-background truncate">{task.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {(isUrgent || isOverdue) && <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>}
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all" title="Delete">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.courseCode && <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getCourseColorClass(task.courseCode)}`}>{task.courseCode}</span>}
                      {task.type && <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">{task.type}</span>}
                      {task.dueDate && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-error font-bold' : isUrgent ? 'text-error' : 'text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {isOverdue ? 'Overdue' : dl === 0 ? 'Due Today' : `${dl}d left`}
                        </span>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-on-surface-variant mt-1 truncate">{task.description}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {completedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Completed ({completedTasks.length})</p>
              {completedTasks.map(task => (
                <motion.div layout key={task.id} className="group bg-surface/50 rounded-lg border border-outline-variant/50 p-3 flex gap-4 opacity-60 mb-2">
                  <div className="pt-1">
                    <div onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded border-2 border-inverse-primary bg-inverse-primary cursor-pointer flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex justify-between items-center">
                    <h4 className="text-base font-normal text-on-surface-variant line-through truncate">{task.title}</h4>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all shrink-0" title="Delete">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tasks.length === 0 && (
            <div className="p-6 text-center border border-outline-variant/30 rounded-lg bg-surface-container-highest mt-4">
              <span className="material-symbols-outlined text-3xl text-outline mb-2">event_available</span>
              <p className="text-sm text-on-surface-variant">No tasks yet. Click + to add one!</p>
            </div>
          )}
        </div>

      </section>

      {/* FAB - Global to this tab */}
      <button
        className="fixed bottom-10 right-10 z-[60] bg-gradient-to-tr from-[#6366F1] to-[#A855F7] text-white rounded-2xl p-5 shadow-[0_12px_40px_rgba(99,102,241,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group hover:shadow-[0_15px_45px_rgba(99,102,241,0.6)]"
        onClick={() => setShowModal(true)}
        aria-label="Add New Task"
      >
        <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-180 duration-500">add</span>
      </button>

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
