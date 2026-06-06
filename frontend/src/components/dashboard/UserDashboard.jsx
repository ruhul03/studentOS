import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, FileText, Bell } from 'lucide-react';
import { StatCards } from './StatCards';
import { ScheduleTimeline } from './ScheduleTimeline';
import { CampusLife } from './CampusLife';
import { TodoQuickList } from './TodoQuickList';

export function UserDashboard({ onTabChange }) {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState({ totalCourses: 0, pendingTasks: 0, sharedResources: 0, completedTasks: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todos, setTodos] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
      ...options.headers
    };
    return fetch(url, { ...options, headers });
  }, [user?.token]);

  const refreshDashboard = useCallback(async (silent = false) => {
    if (!user?.id) return;
    if (!silent) setLoading(true);
    try {
      const [statsRes, todosRes, eventsRes, activitiesRes] = await Promise.all([
        fetchWithAuth(`${API}/api/users/${user.id}/stats`),
        fetchWithAuth(`${API}/api/planner/user/${user.id}`),
        fetchWithAuth(`${API}/api/events`),
        fetchWithAuth(`${API}/api/users/${user.id}/activities?limit=3`)
      ]);

      if (statsRes.ok) setStatsData(await statsRes.json());
      
      if (todosRes.ok) {
        const allTodos = await todosRes.json();
        setTodos(allTodos.slice(0, 5));
        const today = new Date().toDateString();
        setSchedule(allTodos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === today).slice(0, 4));
      }

      if (eventsRes.ok) setEvents((await eventsRes.json()).slice(0, 2));
      if (activitiesRes.ok) setRecentActivities(await activitiesRes.json());

    } catch (err) {
      console.error('Dashboard sync failed', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user?.id, API, fetchWithAuth]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleToggleTodo = async (taskId) => {
    const previousTodos = [...todos];
    const previousSchedule = [...schedule];
    const previousStats = { ...statsData };

    let isNowCompleted = false;
    const updatedTodos = todos.map(t => {
      if (t.id === taskId) {
        isNowCompleted = !t.completed;
        return { ...t, completed: isNowCompleted };
      }
      return t;
    });
    setTodos(updatedTodos);
    setSchedule(prev => prev.filter(t => t.id !== taskId || !isNowCompleted));
    setStatsData(prev => ({
      ...prev,
      pendingTasks: isNowCompleted ? Math.max(0, prev.pendingTasks - 1) : prev.pendingTasks + 1,
      completedTasks: isNowCompleted ? prev.completedTasks + 1 : Math.max(0, prev.completedTasks - 1)
    }));

    try {
      const resp = await fetchWithAuth(`${API}/api/planner/${taskId}/toggle`, { method: 'PUT' });
      if (resp.ok) {
        refreshDashboard(true);
      } else {
        throw new Error('Failed to toggle task');
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
      setTodos(previousTodos);
      setSchedule(previousSchedule);
      setStatsData(previousStats);
    }
  };

  const handleDeleteTodo = async (taskId) => {
    const previousTodos = [...todos];
    const previousSchedule = [...schedule];
    const previousStats = { ...statsData };

    const targetTodo = todos.find(t => t.id === taskId);
    if (!targetTodo) return;

    setTodos(prev => prev.filter(t => t.id !== taskId));
    setSchedule(prev => prev.filter(t => t.id !== taskId));
    setStatsData(prev => ({
      ...prev,
      pendingTasks: !targetTodo.completed ? Math.max(0, prev.pendingTasks - 1) : prev.pendingTasks,
      completedTasks: targetTodo.completed ? Math.max(0, prev.completedTasks - 1) : prev.completedTasks
    }));

    try {
      const resp = await fetchWithAuth(`${API}/api/planner/${taskId}`, { method: 'DELETE' });
      if (resp.ok) {
        refreshDashboard(true);
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      console.error('Failed to delete task', err);
      setTodos(previousTodos);
      setSchedule(previousSchedule);
      setStatsData(previousStats);
    }
  };

  const handleAddQuickTodo = async () => {
    if (!newTodoText.trim()) return;
    const text = newTodoText.trim();
    setNewTodoText('');
    setIsAddingTodo(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0] + 'T23:59:00';

    const tempId = Date.now();
    const tempTodo = {
      id: tempId,
      title: text,
      description: '',
      courseCode: 'General',
      type: 'Assignment',
      dueDate,
      completed: false,
    };

    const previousTodos = [...todos];
    const previousSchedule = [...schedule];
    const previousStats = { ...statsData };

    setTodos(prev => [tempTodo, ...prev].slice(0, 5));
    setStatsData(prev => ({
      ...prev,
      pendingTasks: prev.pendingTasks + 1
    }));

    try {
      const resp = await fetchWithAuth(`${API}/api/planner`, {
        method: 'POST',
        body: JSON.stringify({
          title: text,
          description: '',
          courseCode: 'General',
          type: 'Assignment',
          dueDate,
          userId: user.id,
        }),
      });
      if (resp.ok) {
        refreshDashboard(true);
      } else {
        throw new Error('Failed to add task');
      }
    } catch (err) {
      console.error('Failed to add quick todo', err);
      setTodos(previousTodos);
      setSchedule(previousSchedule);
      setStatsData(previousStats);
      setNewTodoText(text);
    } finally {
      setIsAddingTodo(false);
    }
  };

  if (loading && !statsData.totalCourses) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

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

        <StatCards stats={statsData} user={user} onTabChange={onTabChange} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-8">
           <ScheduleTimeline schedule={schedule} onTabChange={onTabChange} />
           <TodoQuickList 
              todos={todos} 
              onToggle={handleToggleTodo} 
              onDelete={handleDeleteTodo} 
              onAdd={handleAddQuickTodo}
              text={newTodoText}
              setText={setNewTodoText}
              isAdding={isAddingTodo}
              onTabChange={onTabChange}
           />
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-8">
           <CampusLife events={events} onTabChange={onTabChange} />
           
           {recentActivities.length > 0 && (
             <section className="bg-surface-container border border-outline-variant rounded-2xl p-8 h-full">
                <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black text-on-surface tracking-tight">Recent Actions</h2>
                 <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
               </div>
               <div className="space-y-4">
                 {recentActivities.slice(0, 3).map((activity) => (
                   <div key={activity.id} className="flex gap-4 items-center p-3 rounded-xl bg-surface-container-low/50 border border-transparent hover:border-outline-variant transition-all cursor-pointer group" onClick={() => onTabChange('activity')}>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                       activity.status === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                     }`}>
                       {activity.type === 'planner' ? <Zap size={18} /> : activity.type === 'resources' ? <FileText size={18} /> : <Bell size={18} />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-on-surface truncate leading-none mb-1.5">{activity.title}</p>
                       <p className="text-[11px] text-on-surface-variant font-medium opacity-80 uppercase tracking-wider">
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
