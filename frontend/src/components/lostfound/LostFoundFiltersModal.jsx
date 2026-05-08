import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LostFoundFiltersModal({ 
  isOpen, 
  onClose, 
  currentFilters,
  onApplyFilters 
}) {
  const [status, setStatus] = useState(currentFilters.status || 'ALL');
  const [category, setCategory] = useState(currentFilters.category || 'All');
  const [dateRange, setDateRange] = useState(currentFilters.dateRange || 'All time');

  useEffect(() => {
    if (isOpen) {
      setStatus(currentFilters.status || 'ALL');
      setCategory(currentFilters.category || 'All');
      setDateRange(currentFilters.dateRange || 'All time');
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({ status, category, dateRange });
    onClose();
  };

  const handleClear = () => {
    setStatus('ALL');
    setCategory('All');
    setDateRange('All time');
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Keys',
    'Other'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface-container-high border border-outline-variant rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant bg-surface-container/50">
              <div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">Filters</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 mt-1">Refine your search</p>
              </div>
              <button 
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant w-10 h-10 flex items-center justify-center rounded-xl transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 flex flex-col gap-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {/* Status Section */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 mb-4">Report Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'LOST', 'FOUND'].map(val => (
                    <button 
                      key={val}
                      onClick={() => setStatus(val)}
                      className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                        status === val 
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline'
                      }`}
                    >
                      {val === 'ALL' ? 'Everything' : val}
                    </button>
                  ))}
                </div>
              </section>

              {/* Category Section */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 mb-4">Item Category</h3>
                <div className="flex flex-wrap gap-2">
                  {['All', ...categories].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                        category === cat 
                          ? 'bg-secondary text-on-secondary border-secondary shadow-lg shadow-secondary/20' 
                          : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-outline'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* Date Range Section */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 mb-4">Date Reported</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Last 24 hours',
                    'Last 7 days',
                    'Last 30 days',
                    'All time'
                  ].map(option => (
                    <button 
                      key={option}
                      onClick={() => setDateRange(option)}
                      className={`flex items-center justify-between px-5 py-4 rounded-xl transition-all border ${
                        dateRange === option 
                          ? 'bg-surface-container-lowest border-primary text-primary' 
                          : 'bg-transparent border-outline-variant/30 text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">{option}</span>
                      {dateRange === option && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-outline-variant bg-surface-container/50">
              <button 
                onClick={handleClear}
                className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all"
              >
                Reset
              </button>
              <button 
                onClick={handleApply}
                className="px-8 py-3 rounded-xl bg-primary text-on-primary text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                Apply Filters
                <span className="material-symbols-outlined text-[18px]">done_all</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
