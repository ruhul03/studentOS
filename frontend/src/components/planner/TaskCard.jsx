import { motion } from 'framer-motion';
import { Trash2, AlertCircle, Clock } from 'lucide-react';

export function TaskCard({ task, isOverdue, isUrgent, daysLeft, onToggle, onDelete, onEdit, courseColor }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`group relative bg-surface-container-high/50 rounded-2xl border transition-all hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] ${
        isOverdue ? 'border-error/50' : isUrgent ? 'border-secondary/50' : 'border-outline-variant/30'
      }`}
    >
      <div className="p-4 flex gap-4">
        <div className="pt-0.5">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggle(task.id)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
              isOverdue ? 'border-error bg-error/10' : isUrgent ? 'border-secondary bg-secondary/10' : 'border-outline-variant hover:border-primary'
            }`}
          >
            <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </motion.button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h4 className="text-sm font-bold text-on-surface leading-tight">{task.title}</h4>
            <div className="flex gap-1 transition-all">
              <button
                onClick={() => onEdit(task)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 shrink-0 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 shrink-0 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${courseColor}`}>
              {task.courseCode || 'GENERAL'}
            </span>

            <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
              isOverdue ? 'text-error' : isUrgent ? 'text-secondary' : 'text-on-surface-variant opacity-60'
            }`}>
              {isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />}
              {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft} Days Left`}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
