import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Star, Zap } from 'lucide-react';

export function ReviewForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [courseCode, setCourseCode] = useState(initialData?.courseCode || '');
  const [courseName, setCourseName] = useState(initialData?.courseName || '');
  const [professor, setProfessor] = useState(initialData?.professor || '');
  const [difficultyRating, setDifficultyRating] = useState(initialData?.difficultyRating || 3);
  const [qualityRating, setQualityRating] = useState(initialData?.qualityRating || 3);
  const [reviewText, setReviewText] = useState(initialData?.reviewText || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.anonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = initialData && !initialData.requestId;

  useEffect(() => {
    if (isOpen) {
      setCourseCode(initialData?.courseCode || '');
      setCourseName(initialData?.courseName || '');
      setProfessor(initialData?.professor || '');
      setDifficultyRating(initialData?.difficultyRating || 3);
      setQualityRating(initialData?.qualityRating || 3);
      setReviewText(initialData?.reviewText || '');
      setIsAnonymous(initialData?.anonymous || false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({
      courseCode, courseName, professor, difficultyRating, qualityRating, reviewText, anonymous: isAnonymous
    });
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
            className="relative w-full max-w-2xl bg-surface-container-high border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <MessageSquare size={24} />
                </div>
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-on-surface">
                  {isEdit ? 'Edit Review' : 'Write a Review'}
                </h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-white/5 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Course Code *</label>
                    <input 
                      className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all uppercase"
                      placeholder="MATH 201"
                      value={courseCode}
                      onChange={e => setCourseCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Course Name *</label>
                    <input 
                      className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                      placeholder="Calculus II"
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Professor Name *</label>
                  <input 
                    className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Dr. John Doe"
                    value={professor}
                    onChange={e => setProfessor(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Quality Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num} 
                          type="button"
                          onClick={() => setQualityRating(num)}
                          className={`transition-all hover:scale-110 ${num <= qualityRating ? 'text-primary' : 'text-on-surface-variant/20'}`}
                        >
                          <Star size={24} className={num <= qualityRating ? 'fill-current' : ''} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Difficulty (1-5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num} 
                          type="button"
                          onClick={() => setDifficultyRating(num)}
                          className={`transition-all hover:scale-110 ${num <= difficultyRating ? 'text-error' : 'text-on-surface-variant/20'}`}
                        >
                          <Zap size={24} className={num <= difficultyRating ? 'fill-current' : ''} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Your Experience *</label>
                  <textarea 
                    className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all min-h-[150px] resize-none"
                    placeholder="How was the workload? Exams? Teaching style? Be honest!"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative w-10 h-5">
                      <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="sr-only peer" />
                      <div className="w-full h-full bg-white/10 rounded-full peer-checked:bg-primary transition-colors"></div>
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface transition-colors">Post Anonymously</span>
                  </label>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex gap-3 shrink-0">
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
                  {isSubmitting ? 'Syncing...' : (isEdit ? 'Update Review' : 'Publish Review')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
      `}} />
    </AnimatePresence>
  );
}
