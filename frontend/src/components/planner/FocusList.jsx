import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { ListTodo, Check, Trash2, CheckSquare } from 'lucide-react';

export function FocusList({
  pendingTasks,
  completedTasks,
  sortBy,
  setSortBy,
  playTabSound,
  calcDaysLeft,
  toggleTask,
  deleteTask,
  getCourseColor,
  tasks
}) {
  return (
    <section className="flex-1 bg-surface-container-low border border-outline-variant rounded-3xl flex flex-col h-full relative overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-outline-variant/30 bg-surface-container-high/30 backdrop-blur-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-on-surface tracking-tight">Focus List</h2>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60 mt-1">{pendingTasks.length} PENDING TASKS</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ListTodo size={20} strokeWidth={2} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-background/50 rounded-xl border border-outline-variant/30">
          {['date', 'course', 'type'].map(s => (
            <button
              key={s}
              onClick={() => { setSortBy(s); playTabSound(); }}
              className={`flex-1 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all cursor-pointer ${sortBy === s ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
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
              <TaskCard
                key={task.id}
                task={task}
                isOverdue={isOverdue}
                isUrgent={isUrgent}
                daysLeft={dl}
                onToggle={toggleTask}
                onDelete={deleteTask}
                courseColor={getCourseColor(task.courseCode)}
              />
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
                  <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shrink-0 cursor-pointer">
                    <Check size={14} strokeWidth={3} className="text-on-primary" />
                  </button>
                  <span className="text-xs font-medium text-on-surface line-through truncate flex-1">{task.title}</span>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {tasks?.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
            <div className="w-20 h-20 rounded-[2.5rem] bg-surface-container-highest flex items-center justify-center mb-6">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-lg font-black text-on-surface mb-2">Clean Slate!</h3>
            <p className="text-xs font-medium">No pending tasks found. Enjoy your free time or add a new goal.</p>
          </div>
        )}
      </div>
    </section>
  );
}
