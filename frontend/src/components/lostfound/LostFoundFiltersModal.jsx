import React, { useState, useEffect } from 'react';
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

  // Reset local state when opened with new props
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
    // We don't automatically apply on clear, user still has to click Apply
  };

  const toggleStatus = (val) => {
    // If clicking the currently active one, we could toggle it off to 'ALL'
    if (status === val) {
      setStatus('ALL');
    } else {
      setStatus(val);
    }
  };

  const toggleCategory = (val) => {
    if (category === val) {
      setCategory('All');
    } else {
      setCategory(val);
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Books & Materials',
    'Keys & Lanyards',
    'Wallets & IDs',
    'Other'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-outline-variant rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] w-full max-w-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="text-2xl font-bold text-on-surface">Filters</h2>
              <button 
                onClick={onClose}
                aria-label="Close modal" 
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 flex flex-col gap-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {/* Status Section */}
              <section>
                <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">inventory_2</span>
                  Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => toggleStatus('LOST')}
                    className={`px-4 py-2 rounded-full border text-[12px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${status === 'LOST' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-bright'}`}
                  >
                    {status === 'LOST' && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                    Lost
                  </button>
                  <button 
                    onClick={() => toggleStatus('FOUND')}
                    className={`px-4 py-2 rounded-full border text-[12px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${status === 'FOUND' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-bright'}`}
                  >
                    {status === 'FOUND' && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                    Found
                  </button>
                </div>
              </section>

              {/* Category Section */}
              <section>
                <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">category</span>
                  Item Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full border text-[12px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${category === cat ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-bright'}`}
                    >
                      {category === cat && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* Date Range Section */}
              <section>
                <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">calendar_today</span>
                  Date Reported
                </h3>
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'Last 24 hours', label: 'Last 24 hours' },
                    { id: 'Last 7 days', label: 'Last 7 days' },
                    { id: 'Last 30 days', label: 'Last 30 days' },
                    { id: 'All time', label: 'All time' }
                  ].map(option => (
                    <label 
                      key={option.id}
                      className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors border group ${dateRange === option.id ? 'bg-surface-container-high border-outline-variant' : 'hover:bg-surface-container-high border-transparent'}`}
                    >
                      <input 
                        type="radio" 
                        name="date_range"
                        checked={dateRange === option.id}
                        onChange={() => setDateRange(option.id)}
                        className="w-4 h-4 text-primary bg-surface-container-highest border-outline focus:ring-primary focus:ring-offset-surface focus:ring-offset-2" 
                      />
                      <span className={`text-sm transition-colors ${dateRange === option.id ? 'text-primary' : 'text-on-surface group-hover:text-primary-fixed'}`}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-outline-variant bg-surface-container-lowest">
              <button 
                onClick={handleClear}
                className="text-lg font-bold text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors px-4 py-2 rounded-lg flex items-center gap-2"
              >
                Clear All
              </button>
              <button 
                onClick={handleApply}
                className="text-lg font-bold bg-primary text-on-primary hover:bg-primary-fixed transition-colors px-6 py-3 rounded-lg shadow-[0_2px_10px_rgba(192,193,255,0.2)] flex items-center gap-2"
              >
                Apply Filters
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
