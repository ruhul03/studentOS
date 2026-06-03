import { motion } from 'framer-motion';
import { Trash2, AlertCircle, Clock } from 'lucide-react';

export function TaskCard({ task, isOverdue, isUrgent, daysLeft, onToggle, onDelete, courseColor }) {
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
            <button
              onClick={() => onDelete(task.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10 transition-all shrink-0 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
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
