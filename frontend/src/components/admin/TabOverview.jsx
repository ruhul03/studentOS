import { motion } from 'framer-motion';
import { StatCard } from './StatCard';

export function TabOverview({ stats, health, onShowDiagnostics }) {
  if (!stats) {
    return (
      <div className="rounded-3xl border border-outline-variant bg-surface-container p-10 text-on-surface-variant shadow-lg">
        <p className="text-sm font-medium">Loading admin statistics… Please wait a moment.</p>
      </div>
    );
  }

  const statusMetrics = [
    { label: 'System Memory', value: `${health?.usedMemory || 0} MB`, percent: health?.memoryUsage || 0, color: 'bg-primary' },
    { label: 'CPU Load', value: `${health?.cpuLoad || 0}%`, percent: health?.cpuLoad || 0, color: 'bg-amber-500' },
    { label: 'Database Status', value: health?.dbStatus || 'OFFLINE', percent: health?.dbStatus === 'CONNECTED' ? 100 : 0, color: 'bg-emerald-500' },
    { label: 'Active Sessions', value: health?.activeSessions || 0, percent: Math.min((health?.activeSessions || 0) * 10, 100), color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value={stats.totalUsers} 
          icon="groups" 
          color="from-blue-500/20 to-indigo-600/20" 
          textColor="text-indigo-400" 
        />
        <StatCard 
          label="Active Events" 
          value={stats.totalEvents} 
          icon="event" 
          color="from-pink-500/20 to-rose-600/20" 
          textColor="text-rose-400" 
        />
        <StatCard 
          label="Resource Assets" 
          value={stats.totalResources} 
          icon="auto_stories" 
          color="from-emerald-500/20 to-teal-600/20" 
          textColor="text-emerald-400" 
        />
        <StatCard 
          label="Market Volume" 
          value={stats.totalMarketplaceItems} 
          icon="payments" 
          color="from-amber-500/20 to-orange-600/20" 
          textColor="text-amber-400" 
        />
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">System Status Intelligence</h3>
            <p className="text-on-surface-variant text-sm mt-1">Real-time health telemetry from the production cluster.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Core Nominal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
          {statusMetrics.map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{item.label}</span>
                  <div className="text-2xl font-black text-white tabular-nums">{item.value}</div>
                </div>
                <div className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                  {i === 2 ? 'Stable' : 'Capacity'}
                </div>
              </div>
              <div className="h-3 w-full bg-surface-container-highest/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                  className={`h-full ${item.color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)]`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Server Uptime</span>
              <span className="text-sm font-bold text-white">{Math.floor((health?.uptime || 0) / 3600000)}h {Math.floor(((health?.uptime || 0) % 3600000) / 60000)}m</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/20"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Total Memory</span>
              <span className="text-sm font-bold text-white">{health?.totalMemory || 0} MB</span>
            </div>
          </div>
          <button 
            onClick={onShowDiagnostics} 
            className="px-8 py-4 bg-white/5 border border-outline-variant/30 rounded-2xl text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white hover:border-primary/50 transition-all active:scale-[0.98]"
          >
            Open Full Diagnostics Console
          </button>
        </div>
      </div>
    </div>
  );
}
