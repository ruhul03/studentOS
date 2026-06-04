import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { PlannerModal } from './PlannerModal';
import { playTabSound } from '../../utils/notificationSound';
import { useStudyTasks } from '../../hooks/useStudyTasks';
import { WeeklyCalendarView } from './WeeklyCalendarView';
import { FocusList } from './FocusList';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import { Plus } from 'lucide-react';

export function StudyPlanner() {
  const { user } = useAuth();
  const { tasks, isLoading, error, toggleTask, deleteTask, refetch } = useStudyTasks(user?.id);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'course' | 'type'
  const [weekOffset, setWeekOffset] = useState(0);

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
    return (Array.isArray(tasks) ? tasks : []).filter(t => {
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
      'bg-primary text-on-primary shadow-md',
      'bg-secondary text-on-secondary shadow-md',
      'bg-tertiary text-on-tertiary shadow-md',
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
    const p = (Array.isArray(tasks) ? tasks : []).filter(t => !t.completed);
    if (sortBy === 'course') return [...p].sort((a, b) => (a.courseCode || '').localeCompare(b.courseCode || ''));
    if (sortBy === 'type') return [...p].sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    return [...p].sort((a, b) => daysLeft(a.dueDate) - daysLeft(b.dueDate));
  }, [tasks, sortBy]);

  const completedTasks = (Array.isArray(tasks) ? tasks : []).filter(t => t.completed);

  const calcDaysLeft = (ds) => {
    if (!ds) return null;
    return Math.ceil((new Date(ds) - new Date()) / 864e5);
  };

  if (isLoading) return <LoadingState message="Loading study tasks..." />;
  if (error) return <ErrorState message="Failed to load your study planner." onRetry={refetch} />;

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-8 animate-fade-in max-md:pb-24 max-md:overflow-y-auto custom-scrollbar">
      {/* Left: Weekly Calendar */}
      <WeeklyCalendarView 
        weekData={weekData}
        formatWeekRange={formatWeekRange}
        setWeekOffset={setWeekOffset}
        playTabSound={playTabSound}
        isToday={isToday}
        dayNames={dayNames}
        timeSlots={timeSlots}
        calendarTasks={calendarTasks}
        getTaskPosition={getTaskPosition}
        getCourseColor={getCourseColor}
        weekOffset={weekOffset}
        onEditTask={handleEditTask}
      />

      {/* Right: Action Items */}
      <FocusList 
        pendingTasks={pendingTasks}
        completedTasks={completedTasks}
        sortBy={sortBy}
        setSortBy={setSortBy}
        playTabSound={playTabSound}
        calcDaysLeft={calcDaysLeft}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        getCourseColor={getCourseColor}
        tasks={tasks}
        onEditTask={handleEditTask}
      />

      {/* Modern Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-12 right-12 z-[60] w-16 h-16 bg-primary text-on-primary rounded-[2rem] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center transition-all group overflow-hidden cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </motion.button>

      <PlannerModal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setEditingTask(null); }} 
        onTaskCreated={refetch} 
        initialTask={editingTask}
      />
    </div>
  );
}
