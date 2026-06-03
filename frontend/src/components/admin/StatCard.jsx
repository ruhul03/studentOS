import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export function StatCard({ label, value, icon, color, textColor }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-surface-container border border-outline-variant rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-primary/30 transition-all shadow-2xl"
    >
      <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${color} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">{label}</span>
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${textColor}`}>
          <div className="text-[20px] flex items-center justify-center">{icon}</div>
        </div>
      </div>
      <div className="text-5xl font-black text-white relative z-10 tabular-nums tracking-tighter">
        {value}
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
          <TrendingUp size={12} />
          +12%
        </span>
        <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">vs last month</span>
      </div>
    </motion.div>
  );
}
