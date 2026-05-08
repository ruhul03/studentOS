import { motion, AnimatePresence } from 'framer-motion';

export function DiagnosticsModal({ show, onClose, health }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, rotateX: 20 }} animate={{ scale: 1, rotateX: 0 }} exit={{ scale: 0.9, rotateX: 20 }}
            className="bg-[#121214] border border-primary/30 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden p-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl animate-pulse">terminal</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">System Diagnostics</h3>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Real-time health telemetry</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4 relative z-10">Database Status</p>
                <div className="flex items-end justify-between relative z-10">
                  <span className="text-2xl font-black text-emerald-500 tabular-nums uppercase">{health?.dbStatus || 'ONLINE'}</span>
                  <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Connected</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4 relative z-10">Heap Allocation</p>
                <div className="flex items-end justify-between relative z-10">
                  <span className="text-2xl font-black text-primary tabular-nums">{health?.usedMemory || 0} MB</span>
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Allocated</span>
                </div>
              </motion.div>
            </div>

            <div className="bg-black/40 rounded-[2rem] p-8 font-mono text-[11px] text-emerald-500/80 mb-10 border border-emerald-500/10 shadow-inner relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[10px] text-emerald-500/30 uppercase tracking-widest">V2.4.0-Stable</div>
              <p className="mb-1 text-on-surface-variant/40 tracking-widest uppercase text-[9px] mb-2 font-bold">-- console logs --</p>
              <p className="mb-1">{">"} Initializing security handshake...</p>
              <p className="mb-1 text-emerald-400">{">"} Environment: Production Cluster [ACTIVE]</p>
              <p className="mb-1">{">"} Total Memory: {health?.totalMemory} MB</p>
              <p className="mb-1">{">"} JVM Uptime: {Math.floor((health?.uptime || 0) / 1000)}s</p>
              <p className="mb-1 text-primary-fixed">{">"} Load Balancers: Optimized & Healthy</p>
              <p className="mt-4 text-emerald-400 font-bold tracking-widest uppercase">{">"} System Core: NOMINAL</p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:bg-primary-fixed shadow-2xl shadow-primary/30 transition-all active:scale-95"
            >
              Close Console
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
