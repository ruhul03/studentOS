import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export function UserDashboard({ onTabChange }) {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState({
    totalCourses: 0,
    pendingTasks: 0,
    sharedResources: 0,
    soldItems: 0,
    completedTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todos, setTodos] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
      ...options.headers
    };
    return fetch(url, { ...options, headers });
  }, [user?.token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API}/api/users/${user.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, [user?.id, API, fetchWithAuth]);

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API}/api/planner/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch todos', err);
    }
  }, [user?.id, API, fetchWithAuth]);

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API}/api/planner/user/${user.id}?completed=false`);
      if (response.ok) {
        const data = await response.json();
        const today = new Date().toDateString();
        const todayTasks = data.filter(task => {
          if (!task.dueDate) return false;
          return new Date(task.dueDate).toDateString() === today;
        });
        setSchedule(todayTasks.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to fetch schedule', err);
    }
  }, [user?.id, API, fetchWithAuth]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.slice(0, 2));
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  }, [API, fetchWithAuth]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API}/api/users/${user.id}/activities?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data);
      }
    } catch (err) {
      console.error('Failed to fetch activities', err);
    }
  }, [user?.id, API, fetchWithAuth]);

  useEffect(() => {
    if (user?.id) {
      fetchStats();
      fetchTodos();
      fetchSchedule();
      fetchEvents();
      fetchActivities();
    }
  }, [user?.id, fetchStats, fetchTodos, fetchSchedule, fetchEvents, fetchActivities]);

  const handleToggleTodo = async (taskId) => {
    try {
      const resp = await fetchWithAuth(`${API}/api/planner/${taskId}/toggle`, { method: 'PUT' });
      if (resp.ok) {
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeleteTodo = async (taskId) => {
    try {
      const resp = await fetchWithAuth(`${API}/api/planner/${taskId}`, { method: 'DELETE' });
      if (resp.ok) {
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleAddQuickTodo = async () => {
    if (!newTodoText.trim()) return;
    setIsAddingTodo(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = tomorrow.toISOString().split('T')[0] + 'T23:59:00';

      const resp = await fetchWithAuth(`${API}/api/planner`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTodoText.trim(),
          description: '',
          courseCode: 'General',
          type: 'Assignment',
          dueDate,
          userId: user.id,
        }),
      });
      if (resp.ok) {
        setNewTodoText('');
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to add quick todo', err);
    } finally {
      setIsAddingTodo(false);
    }
  };

  const handleQuickTodoKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddQuickTodo();
    }
  };

  const getPriorityInfo = (task) => {
    if (!task.dueDate) return { label: 'No Due Date', color: 'outline' };
    const now = new Date();
    const due = new Date(task.dueDate);
    const hoursLeft = (due - now) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return { label: 'Overdue', color: 'error' };
    if (hoursLeft < 24) return { label: 'Due Soon', color: 'error' };
    if (hoursLeft < 72) return { label: 'Medium Priority', color: 'primary' };
    return { label: 'Low Priority', color: 'secondary' };
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const scheduleColors = ['primary', 'secondary', 'tertiary', 'error'];

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-16 animate-fade-in px-4 lg:px-0">
      {/* Header & Quick Stats */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="font-h1 text-4xl font-black text-on-surface tracking-tight">Dashboard</h1>
            <p className="text-on-surface-variant text-sm font-medium opacity-80">Welcome back, {user?.name?.split(' ')[0] || 'Student'}. Here's your academic summary.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Courses Active', val: statsData.totalCourses, icon: 'book', color: 'primary', tab: 'services' },
            { label: 'Pending Tasks', val: statsData.pendingTasks, icon: 'task_alt', color: 'secondary', tab: 'planner' },
            { label: 'Shared Files', val: statsData.sharedResources, icon: 'folder_shared', color: 'tertiary', tab: 'resources' },
            { label: 'Completed', val: statsData.completedTasks, icon: 'check_circle', color: 'error', tab: 'planner' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden bg-surface-container border border-outline-variant rounded-2xl p-6 cursor-pointer group transition-all hover:shadow-xl hover:shadow-black/20 hover:border-${stat.color}/30`}
              onClick={() => onTabChange(stat.tab)}
            >
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}/5 rounded-full blur-2xl group-hover:bg-${stat.color}/10 transition-colors`}></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-[10px] text-on-surface-variant font-bold tracking-[0.2em] uppercase opacity-70">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color} group-hover:rotate-6 transition-transform shadow-inner`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
              </div>
              <div className="font-h1 text-4xl font-black text-on-surface relative z-10 tabular-nums leading-none">
                {stat.val}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Schedule & Tasks */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Daily Timeline */}
          <section className="bg-surface-container border border-outline-variant rounded-2xl p-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">Today's Schedule</h2>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Daily Agenda • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
              </div>
              <button 
                onClick={() => onTabChange('planner')}
                className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full hover:bg-primary hover:text-on-primary transition-all active:scale-95"
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
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="relative"
                  >
                    <div className={`absolute left-[-42px] top-1 w-5 h-5 rounded-full bg-surface-container border-4 border-surface shadow-[0_0_10px_rgba(0,0,0,0.1)] flex items-center justify-center z-10`}>
                       <div className={`w-2 h-2 rounded-full bg-${scheduleColors[index % scheduleColors.length]}`}></div>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 hover:bg-surface-container-high hover:border-outline-variant transition-all hover:shadow-md cursor-pointer group" onClick={() => onTabChange('planner')}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-[10px] font-bold text-${scheduleColors[index % scheduleColors.length]} uppercase tracking-widest mb-1 flex items-center gap-1.5`}>
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {formatTime(task.dueDate)}
                          </div>
                          <h3 className="text-lg font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{task.title}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant bg-surface-variant/50 px-2 py-0.5 rounded border border-outline-variant/20">
                              <span className="material-symbols-outlined text-[14px]">school</span> 
                              {task.courseCode}
                            </span>
                            <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-outline"></span>
                              {task.type}
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-surface-container-low/50 rounded-xl border border-outline-variant/30">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline-variant mb-4 shadow-inner">
                  <span className="material-symbols-outlined text-3xl">event_available</span>
                </div>
                <h3 className="text-on-surface font-bold">Clear Skies!</h3>
                <p className="text-on-surface-variant text-xs mt-1 text-center max-w-[200px]">No tasks scheduled for today. Enjoy your free time or plan ahead.</p>
              </div>
            )}
          </section>

          {/* Quick Tasks List */}
          <section className="bg-surface-container border border-outline-variant rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">Active To-Do</h2>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Quick Management</p>
              </div>
              <button 
                onClick={() => onTabChange('planner')}
                className="text-[10px] font-bold text-outline hover:text-on-surface transition-colors tracking-widest"
              >
                VIEW ALL →
              </button>
            </div>

            {/* Quick Add Bar */}
            <div className="relative flex items-center gap-3 mb-6 bg-surface-container-high p-2 rounded-xl border border-outline-variant/50 group focus-within:border-primary transition-all shadow-inner">
              <span className="material-symbols-outlined text-outline ml-2 group-focus-within:text-primary transition-colors">add_task</span>
              <input
                type="text"
                className="flex-1 bg-transparent border-none text-sm text-on-surface placeholder:text-outline/70 focus:ring-0 py-2"
                placeholder="What needs to be done?"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={handleQuickTodoKeyDown}
                disabled={isAddingTodo}
              />
              <button
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                onClick={handleAddQuickTodo}
                disabled={isAddingTodo || !newTodoText.trim()}
              >
                {isAddingTodo ? 'Adding...' : 'Add'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {todos.length > 0 ? (
                todos.map((task, idx) => {
                  const priority = getPriorityInfo(task);
                  return (
                    <motion.div 
                      key={task.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                        task.completed 
                          ? 'border-outline-variant/20 bg-surface-variant/10 opacity-60' 
                          : `border-${priority.color}/20 bg-${priority.color}/5 hover:bg-${priority.color}/10 hover:border-${priority.color}/40`
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button 
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            task.completed 
                              ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' 
                              : `border-2 border-${priority.color}/30 bg-surface group-hover:border-${priority.color}`
                          }`}
                          onClick={() => handleToggleTodo(task.id)}
                        >
                          {task.completed && <span className="material-symbols-outlined text-[16px] font-black">check</span>}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-bold text-on-surface truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[10px] font-bold uppercase tracking-wider text-${priority.color} opacity-80`}>{priority.label}</span>
                             {task.courseCode && task.courseCode !== 'General' && (
                               <span className="text-[10px] text-on-surface-variant font-medium bg-outline-variant/10 px-1.5 rounded uppercase tracking-widest">{task.courseCode}</span>
                             )}
                          </div>
                        </div>
                      </div>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-outline/50 hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); handleDeleteTodo(task.id); }}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-surface-variant/10 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-3">list_alt</span>
                  <p className="text-on-surface-variant text-sm font-medium">Your checklist is empty.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Events & News */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Upcoming Events */}
          <section className="bg-surface-container border border-outline-variant rounded-2xl p-8 h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">Campus Life</h2>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Trending Events</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">campaign</span>
            </div>

            <div className="space-y-8">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <motion.article 
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className="group cursor-pointer flex flex-col gap-3"
                    onClick={() => onTabChange('events')}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-highest border border-outline-variant shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all">
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity`}></div>
                      <div className="absolute inset-0 flex items-center justify-center bg-surface-container-high/50 backdrop-blur-sm z-0">
                         <span className="material-symbols-outlined text-4xl text-primary/30" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {index === 0 ? 'rocket_launch' : 'celebration'}
                         </span>
                      </div>
                      <div className="absolute bottom-3 left-3 z-20">
                         <span className={`text-[10px] font-black text-on-primary bg-primary px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg`}>
                            {event.organizer || 'CAMPUS EVENT'}
                         </span>
                      </div>
                    </div>
                    <div className="px-1">
                      <h3 className="text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Soon'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {event.location?.split(',')[0] || 'TBA'}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 grayscale opacity-40">
                  <span className="material-symbols-outlined text-5xl mb-3">festival</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-center">No major events<br/>recorded yet</p>
                </div>
              )}
            </div>

            <button 
               onClick={() => onTabChange('events')}
               className="w-full mt-10 py-3 rounded-xl border border-outline-variant text-xs font-black text-on-surface-variant hover:bg-surface-container-high hover:text-primary hover:border-primary/30 transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              BROWSE ALL EVENTS
            </button>
          </section>

          {/* Activity Feed Mini */}
          {recentActivities.length > 0 && (
            <section className="bg-surface-container border border-outline-variant rounded-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-on-surface tracking-tight uppercase">Recent Actions</h2>
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-center p-3 rounded-xl bg-surface-container-low/50 border border-transparent hover:border-outline-variant transition-all cursor-pointer group" onClick={() => onTabChange('activity')}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.status === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {activity.type === 'planner' ? 'bolt' : activity.type === 'resources' ? 'description' : 'circle_notifications'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate leading-none mb-1">{activity.title}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium opacity-60 uppercase tracking-widest">
                         {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
