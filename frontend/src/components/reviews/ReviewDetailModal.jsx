import { motion, AnimatePresence } from 'framer-motion';
import { CommentSection } from './CommentSection';

export function ReviewDetailModal({ review, isOpen, onClose, user, onHelpful }) {
  if (!review) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span 
        key={i} 
        className={`material-symbols-outlined text-[16px] ${i < rating ? 'text-amber-500' : 'text-on-surface-variant/10'}`}
        style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
      >
        star
      </span>
    ));
  };

  const getTheme = (rating) => {
    if (rating >= 4.5) return { accent: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    if (rating >= 3.5) return { accent: '#6366f1', bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
    if (rating >= 2.5) return { accent: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    return { accent: '#ef4444', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' };
  };

  const theme = getTheme(review.qualityRating || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative z-10 w-full max-w-4xl bg-surface-container rounded-[3rem] border border-outline-variant/30 shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Review Info */}
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-outline-variant/20">
              <div className="flex items-center justify-between mb-8">
                <span className={`px-4 py-1.5 ${theme.bg} ${theme.text} ${theme.border} border rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase`}>
                  {review.courseCode}
                </span>
                <button onClick={onClose} className="md:hidden w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <h1 className="text-3xl font-black text-on-surface tracking-tight leading-none mb-4">{review.courseName}</h1>
              <p className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-10">Prof. {review.professor}</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-6 bg-surface-container-high/50 rounded-3xl border border-outline-variant/30">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Quality Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-on-surface">{review.qualityRating?.toFixed(1)}</span>
                    <span className="text-amber-500 mb-1.5 font-black text-xl">★</span>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-high/50 rounded-3xl border border-outline-variant/30">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Difficulty</p>
                  <div className="flex gap-1">
                    {renderStars(review.difficultyRating)}
                  </div>
                </div>
              </div>

              <div className="relative mb-10">
                <span className="absolute -left-4 -top-8 text-8xl text-primary/10 font-serif pointer-events-none">"</span>
                <p className="text-lg text-on-surface-variant/90 leading-relaxed font-medium italic relative z-10 whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-10 border-t border-outline-variant/20">
                 <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} ${theme.border} border flex items-center justify-center text-lg font-black shadow-inner`}>
                    {review.anonymous ? '?' : getInitials(review.reviewer?.name)}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-tight">Experience Shared By</p>
                    <p className="text-base font-bold text-on-surface">
                      {review.anonymous ? 'Anonymous Contributor' : review.reviewer?.name}
                    </p>
                    <p className="text-[10px] font-medium text-on-surface-variant/40 mt-1 uppercase tracking-widest">
                      Shared on {new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                 </div>
              </div>
            </div>

            {/* Right Column: Discussion Section */}
            <div className="flex-1 bg-surface-container-high/30 flex flex-col min-h-0">
               <div className="p-8 pb-4 flex justify-between items-center border-b border-outline-variant/20">
                  <h3 className="text-lg font-black text-on-surface tracking-tight">Discussion</h3>
                  <button onClick={onClose} className="hidden md:flex w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all">
                    <span className="material-symbols-outlined">close</span>
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <CommentSection 
                    reviewId={review.id} 
                    user={user} 
                  />
               </div>

               <div className="p-8 pt-4 border-t border-outline-variant/20 flex gap-4">
                 <button 
                    onClick={() => onHelpful(review.id)}
                    disabled={review.isHelpful}
                    className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      review.isHelpful ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: review.isHelpful ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
                    {review.isHelpful ? 'Helpful' : `Mark as Helpful (${review.helpfulVotes || 0})`}
                 </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </AnimatePresence>
  );
}
