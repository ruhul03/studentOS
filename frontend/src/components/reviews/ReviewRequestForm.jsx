import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X } from 'lucide-react';

export function ReviewRequestForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [courseCode, setCourseCode] = useState(initialData?.courseCode || '');
  const [courseName, setCourseName] = useState(initialData?.courseName || '');
  const [professor, setProfessor] = useState(initialData?.professor || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.anonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCourseCode(initialData?.courseCode || '');
      setCourseName(initialData?.courseName || '');
      setProfessor(initialData?.professor || '');
      setIsAnonymous(initialData?.anonymous || false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ courseCode, courseName, professor, anonymous: isAnonymous });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container-high border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <Mail size={24} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-on-surface">
                  {initialData ? 'Edit Request' : 'Ask for Review'}
                </h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-white/5 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <p className="text-xs text-on-surface-variant/60 leading-relaxed px-1">
                Can't find a review for a course? Ask your fellow students! They'll be notified when someone shares their experience.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Course Code *</label>
                  <input 
                    className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all uppercase"
                    placeholder="e.g., CSE 422"
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Course Title (Optional)</label>
                  <input 
                    className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="e.g., Artificial Intelligence"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Professor Name (Optional)</label>
                <input 
                  className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Who taught this course?"
                  value={professor}
                  onChange={e => setProfessor(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative w-10 h-5">
                    <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="sr-only peer" />
                    <div className="w-full h-full bg-white/10 rounded-full peer-checked:bg-primary transition-colors"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface transition-colors">Request Anonymously</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] py-4 rounded-2xl bg-primary text-on-primary text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Syncing...' : (initialData ? 'Update Request' : 'Post Request')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
