import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Trash2, ImagePlus, Send } from 'lucide-react';

export function LostFoundForm({ show, onClose, onSubmit, editingItem, form, setForm, error }) {
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({
          ...prev,
          photoPreviews: [...prev.photoPreviews, reader.result],
          itemPhotos: [...prev.itemPhotos, file]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photoPreviews: prev.photoPreviews.filter((_, i) => i !== index),
      itemPhotos: prev.itemPhotos.filter((_, i) => i !== index)
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-surface-container-high w-full max-w-2xl rounded-3xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
          <div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight">
              {editingItem ? 'Update Report' : 'Report Item'}
            </h2>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60 mt-1">
              Help us help you find what's missing
            </p>
          </div>
          <button 
            type="button"
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant w-10 h-10 flex items-center justify-center rounded-xl transition-all"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {error && (
            <div className="bg-error/10 text-error p-4 rounded-2xl mb-6 flex items-center gap-3 border border-error/20">
              <AlertCircle size={20} />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <form id="report-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Item Name</label>
              <input 
                type="text" 
                className="bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-inner" 
                placeholder="e.g., MacBook Pro, Blue Water Bottle" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Report Type</label>
              <select 
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all shadow-inner appearance-none" 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value})}
              >
                <option value="LOST">Lost Item</option>
                <option value="FOUND">Found Item</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Category</label>
              <select 
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all shadow-inner appearance-none" 
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                required
              >
                <option value="" disabled>Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing & Accessories</option>
                <option value="Books">Books & Documents</option>
                <option value="Keys">Keys & IDs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Date</label>
              <input 
                type="date" 
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all shadow-inner" 
                style={{ colorScheme: 'dark' }}
                value={form.dateLost}
                onChange={e => setForm({...form, dateLost: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Contact Info</label>
              <input 
                type="text" 
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all shadow-inner" 
                placeholder="Phone or Email" 
                value={form.contactInfo} 
                onChange={e => setForm({...form, contactInfo: e.target.value})} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Location</label>
              <input 
                type="text" 
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all shadow-inner" 
                placeholder="e.g., Library 2nd Floor" 
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Description</label>
              <textarea 
                className="bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-all shadow-inner resize-none" 
                placeholder="Describe identifying marks, brand names, etc." 
                rows="3"
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                required 
              ></textarea>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Photos</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.photoPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant group shadow-md">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      className="absolute top-2 right-2 bg-error text-white w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-center hover:bg-surface-variant/20 hover:border-primary transition-all cursor-pointer group">
                  <ImagePlus size={24} className="text-outline group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase tracking-tighter">Add Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container/50">
          <button 
            type="button"
            className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface text-xs font-black uppercase tracking-widest hover:bg-surface-variant transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="report-form"
            className="px-8 py-3 rounded-xl bg-primary text-on-primary text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
          >
            {editingItem ? 'Update Report' : 'Submit Report'}
            <Send size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
