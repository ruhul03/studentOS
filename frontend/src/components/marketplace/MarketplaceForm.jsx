import { motion, AnimatePresence } from 'framer-motion';

export function MarketplaceForm({ show, onClose, onSubmit, editingItem, form, setForm, error }) {
  if (!show) return null;

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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative z-50 bg-surface-container-high w-full max-w-2xl rounded-[2.5rem] border border-outline-variant shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-7 border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
          <div>
            <h3 className="text-2xl font-black text-on-surface tracking-tight">
              {editingItem ? 'Update Listing' : 'New Listing'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 mt-1">
              Reach thousands of students instantly
            </p>
          </div>
          <button 
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant w-12 h-12 flex items-center justify-center rounded-2xl transition-all"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {error && (
            <div className="bg-error/10 text-error p-5 rounded-2xl mb-8 flex items-center gap-4 border border-error/20">
              <span className="material-symbols-outlined text-[20px]">error_outline</span>
              <span className="text-sm font-black uppercase tracking-widest">{error}</span>
            </div>
          )}

          <form id="marketplace-form" onSubmit={onSubmit} className="space-y-8">
            {/* Photo Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Visual Assets</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.photoPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant group shadow-xl">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      className="absolute top-2 right-2 bg-error text-white w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg" 
                      onClick={() => removePhoto(index)}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
                {form.photoPreviews.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all group">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary text-[32px] transition-transform group-hover:scale-110">add_photo_alternate</span>
                    <span className="text-[9px] font-black text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">Add Media</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                  </label>
                )}
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Listing Title</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-on-surface text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-inner" 
                  placeholder="What are you selling?" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Asking Price</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-black text-sm">$</span>
                  <input 
                    type="number" 
                    className="w-full bg-surface-container border border-outline-variant rounded-2xl py-4 pl-10 pr-5 text-on-surface text-sm font-black tabular-nums focus:outline-none focus:border-primary transition-all shadow-inner" 
                    placeholder="0.00" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Category</label>
                <select 
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-on-surface text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all shadow-inner appearance-none" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Condition</label>
                <div className="flex bg-surface-container border border-outline-variant rounded-2xl p-1 overflow-hidden h-[54px]">
                  {['New', 'Used'].map(cond => (
                    <button 
                      key={cond}
                      type="button"
                      className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.condition === cond ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setForm({...form, condition: cond})}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Contact Information</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-on-surface text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-inner" 
                  placeholder="Email or Phone number" 
                  value={form.contactInfo} 
                  onChange={e => setForm({...form, contactInfo: e.target.value})} 
                  required 
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Detailed Description</label>
                <textarea 
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-on-surface text-sm font-medium focus:outline-none focus:border-primary transition-all shadow-inner resize-none min-h-[120px]" 
                  placeholder="Mention technical specs, defects, or why you're selling..." 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  required 
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-7 border-t border-outline-variant flex justify-end gap-4 bg-surface-container/50">
          <button 
            type="button"
            className="px-8 py-4 rounded-2xl border-2 border-outline-variant text-on-surface text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-variant transition-all"
            onClick={onClose}
          >
            Discard
          </button>
          <button 
            type="submit" 
            form="marketplace-form"
            className="px-10 py-4 rounded-2xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20"
          >
            {editingItem ? 'Save Changes' : 'Publish Listing'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
