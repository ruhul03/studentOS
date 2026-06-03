import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { playSuccessSound, playErrorSound } from '../../utils/notificationSound';
import { PlusSquare, X, AlertCircle } from 'lucide-react';

export function PlannerModal({ isOpen, onClose, onTaskCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [type, setType] = useState('Assignment');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const taskTypes = ['Assignment', 'Exam', 'Project', 'Reading', 'Lecture', 'Lab'];

  const resetForm = () => {
    setTitle(''); setDescription(''); setCourseCode(''); setType('Assignment');
    setDate(''); setTime(''); setError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!date) { setError('Due date is required'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const dueDate = time ? `${date}T${time}:00` : `${date}T23:59:00`;
      const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/planner`, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          courseCode: courseCode.trim() || 'General',
          type,
          dueDate,
          userId: user?.id,
        }),
      });
      if (!resp.ok) throw new Error('Failed to create task');
      playSuccessSound();
      resetForm();
      onClose();
      onTaskCreated?.();
    } catch (err) {
      playErrorSound();
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-lg bg-surface-container rounded-[2.5rem] border border-outline-variant shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <PlusSquare size={20} strokeWidth={2} />
                </div>
                <h2 className="text-xl font-black text-on-surface tracking-tight">Create New Task</h2>
              </div>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
                onClick={handleClose}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 text-error rounded-2xl text-xs font-bold uppercase tracking-widest">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">Task Title</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30"
                  placeholder="e.g., Complete Chapter 4 Reading"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">Course Code</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30 uppercase font-bold"
                    placeholder="CSE 303"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">Task Type</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {taskTypes.map(t => <option key={t} value={t} className="bg-surface-container">{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">Due Date</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all color-scheme-dark"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">Time</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all color-scheme-dark"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 ml-1">Description</label>
                <textarea
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all min-h-[100px] resize-none placeholder:text-on-surface-variant/30"
                  placeholder="Optional notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  className="flex-1 bg-surface-container-high text-on-surface font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl border border-outline-variant/50 hover:bg-surface-variant transition-all cursor-pointer"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-on-primary font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
