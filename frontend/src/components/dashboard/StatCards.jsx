import { motion } from 'framer-motion';

export function StatCards({ stats, user, onTabChange }) {
  const items = [
    { label: 'Enrollment Batch', val: user?.batch || 'N/A', icon: 'badge', color: 'primary', tab: 'profile' },
    { label: 'Pending Tasks', val: stats.pendingTasks, icon: 'task_alt', color: 'secondary', tab: 'planner' },
    { label: 'Shared Files', val: stats.sharedResources, icon: 'folder_shared', color: 'tertiary', tab: 'resources' },
    { label: 'Completed', val: stats.completedTasks, icon: 'check_circle', color: 'error', tab: 'planner' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative overflow-hidden bg-surface-container border border-outline-variant rounded-2xl p-6 cursor-pointer group transition-all hover:shadow-xl hover:shadow-black/20`}
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
            {stat.val || 0}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
