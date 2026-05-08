import { motion, AnimatePresence } from 'framer-motion';

export function ServiceModal({ show, onClose, onSave, editingService, serviceForm, setServiceForm }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-surface-container rounded-3xl border border-outline-variant/30 w-full max-w-xl shadow-2xl overflow-hidden"
          >
            <form onSubmit={onSave}>
              <div className="p-8 border-b border-outline-variant/10">
                <h3 className="text-xl font-black text-white">{editingService ? 'Edit Campus Service' : 'Add New Service'}</h3>
                <p className="text-xs text-on-surface-variant mt-1">Configure service visibility and operational details.</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Service Name</label>
                    <input required className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Category</label>
                    <select className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})}>
                      <option value="Library">Library</option>
                      <option value="Medical">Medical</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Admin">Admin</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
                  <textarea required className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none h-20" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</label>
                    <input required className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.location} onChange={e => setServiceForm({...serviceForm, location: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Operating Hours</label>
                    <input required placeholder="HH:MM AM - HH:MM PM" className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.operatingHours} onChange={e => setServiceForm({...serviceForm, operatingHours: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Contact / Website URL</label>
                  <input className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.contactInfo} onChange={e => setServiceForm({...serviceForm, contactInfo: e.target.value})} />
                </div>
              </div>
              <div className="p-8 bg-white/5 flex justify-end gap-4 border-t border-outline-variant/10">
                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-fixed shadow-lg shadow-primary/20">Save Service</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
