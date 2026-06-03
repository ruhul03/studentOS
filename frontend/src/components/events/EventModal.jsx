import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

export function EventModal({ 
  show, 
  onClose, 
  onSubmit, 
  isEditing, 
  form, 
  setForm 
}) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-surface-container rounded-2xl shadow-2xl border border-outline-variant z-50 overflow-hidden flex flex-col max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high shrink-0">
            <h2 className="text-xl font-bold text-on-surface">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-variant" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
            <form id="event-form" onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Event Name</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors" 
                  placeholder="e.g. Fall Tech Mixer" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Category</label>
                  <select 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface cursor-pointer"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Location</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface" 
                    placeholder="Building, Room..." 
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface [color-scheme:dark]" 
                    value={form.datePart} 
                    onChange={e => setForm({...form, datePart: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface [color-scheme:dark]" 
                    value={form.timePart} 
                    onChange={e => setForm({...form, timePart: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Description</label>
                <textarea 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface resize-none" 
                  placeholder="Briefly describe the event..." 
                  rows="4"
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  required 
                ></textarea>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-high flex justify-end gap-3 items-center shrink-0">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              form="event-form"
              className="px-6 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Check size={18} />
              {isEditing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
