import { motion } from 'framer-motion';
import { PlusSquare, Check, Trash2, ListTodo } from 'lucide-react';

export function TodoQuickList({ todos, onToggle, onDelete, onAdd, text, setText, isAdding, onTabChange }) {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onAdd();
  };

  return (
    <section className="lg:col-span-8 bg-surface-container border border-outline-variant rounded-2xl p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight">Active To-Do</h2>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Quick Management</p>
        </div>
        <button 
          onClick={() => onTabChange('planner')}
          className="text-[10px] font-bold text-outline hover:text-on-surface transition-colors tracking-widest cursor-pointer"
        >
          VIEW ALL →
        </button>
      </div>

      <div className="relative flex items-center gap-3 mb-6 bg-surface-container-high p-2 rounded-xl border border-outline-variant/50 group focus-within:border-primary transition-all shadow-inner">
        <PlusSquare size={20} className="text-outline ml-2 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          className="flex-1 bg-transparent border-none text-sm text-on-surface placeholder:text-outline/70 focus:ring-0 py-2 outline-none"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAdding}
        />
        <button
          className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale cursor-pointer"
          onClick={onAdd}
          disabled={isAdding || !text.trim()}
        >
          {isAdding ? 'Adding...' : 'Add'}
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
                transition={{ delay: 0.05 * idx }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                  task.completed 
                    ? 'border-outline-variant/20 bg-surface-variant/10 opacity-60' 
                    : `border-${priority.color}/20 bg-${priority.color}/5 hover:bg-${priority.color}/10 hover:border-${priority.color}/40`
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button 
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      task.completed 
                        ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' 
                        : `border-2 border-${priority.color}/30 bg-surface group-hover:border-${priority.color}`
                    }`}
                    onClick={() => onToggle(task.id)}
                  >
                    {task.completed && <Check size={14} strokeWidth={3} />}
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-outline/50 hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-surface-variant/10 rounded-xl border border-outline-variant/30">
            <ListTodo size={32} className="text-outline-variant/50 mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm font-medium">Your checklist is empty.</p>
          </div>
        )}
      </div>
    </section>
  );
}
