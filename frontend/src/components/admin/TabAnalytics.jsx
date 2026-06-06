import { motion } from 'framer-motion';
import { TrendingUp, PieChart } from 'lucide-react';

export function TabAnalytics({ growthData, deptData, topContributors, totalUsers }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container border border-outline-variant rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-8 relative z-10">Registration Growth</h3>
          <div className="h-64 flex items-end gap-2 relative z-10">
            {growthData.length > 0 ? growthData.map((d, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / Math.max(...growthData.map(gd => gd.count), 1)) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className="flex-1 bg-secondary opacity-60 rounded-t-lg relative group hover:opacity-100 transition-all cursor-pointer"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-outline-variant text-[10px] font-black text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-20">
                  {d.date}: {d.count} users
                </div>
              </motion.div>
            )) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-30">
                <TrendingUp size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting growth metrics...</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-8 relative z-10">Department Distribution</h3>
          <div className="space-y-6 relative z-10 overflow-y-auto max-h-64 pr-2 sidebar-nav">
            {deptData.length > 0 ? deptData.map((d, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-on-surface-variant">{d.department || 'General'}</span>
                  <span className="text-white">{d.count} Students</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.count / (totalUsers || 1)) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(0,0,0,0.2)]"
                  />
                </div>
              </div>
            )) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-30 pt-10">
                <PieChart size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest">No distribution data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
        <div className="flex flex-col items-center text-center mb-12 relative z-10">
          <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Platform Super-Contributors</h3>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-[0.3em]">The heart of our academic community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          {topContributors.map((c, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center group/card transition-all hover:bg-white/[0.05] hover:border-primary/30 shadow-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl mb-4 group-hover/card:rotate-6 transition-transform shadow-inner border border-primary/20">
                {c.name.charAt(0)}
              </div>
              <h4 className="text-base font-black text-white truncate w-full mb-1">{c.name}</h4>
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{c.totalContributions} Contributions</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
