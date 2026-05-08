import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentSection } from './CommentSection';

export function ReviewCard({ review, user, onEdit, onDelete, onHelpful, theme }) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(review.commentCount || 0);

  const canManage = user && (user.id === review.reviewer?.id || user.role?.toUpperCase() === 'ADMIN');

  const renderStars = (rating, colorClass) => {
    return [...Array(5)].map((_, i) => (
      <span 
        key={i} 
        className={`material-symbols-outlined text-[14px] ${i < rating ? colorClass : 'text-on-surface-variant/20'}`}
        style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
      >
        star
      </span>
    ));
  };

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-surface-container-low/40 backdrop-blur-xl border border-white/[0.03] rounded-[2rem] p-8 flex flex-col group hover:bg-surface-container-high/50 transition-all shadow-2xl hover:shadow-primary/5`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 ${theme.bg} ${theme.text} rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border ${theme.border}`}>
              {review.courseCode}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
              {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h3 className="text-xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{review.courseName}</h3>
        </div>
        
        <div className="flex items-center gap-2 bg-surface/50 backdrop-blur-xl py-2 px-4 rounded-2xl border border-white/5 shadow-lg shrink-0">
          <span className="text-lg font-black text-on-surface">{review.qualityRating?.toFixed(1)}</span>
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-white/[0.02] py-2 px-4 rounded-xl border border-white/5 w-fit">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">Difficulty</span>
        <div className="flex gap-0.5">
          {renderStars(review.difficultyRating, 'text-error')}
        </div>
      </div>

      <p className="text-sm text-on-surface-variant/80 leading-relaxed line-clamp-4 mb-8 italic">
        "{review.reviewText}"
      </p>

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-[11px] font-black text-primary border border-white/5">
            {review.anonymous ? '?' : (review.reviewer?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U')}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface opacity-80">Prof. {review.professor}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">
              By {review.anonymous ? 'Anonymous' : review.reviewer?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${review.isHelpful ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10'}`}
            onClick={() => onHelpful(review.id)}
            disabled={review.isHelpful}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: review.isHelpful ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
            {review.helpfulVotes || 0}
          </button>
          
          <button 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showComments ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10'}`}
            onClick={() => setShowComments(!showComments)}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: showComments ? "'FILL' 1" : "'FILL' 0" }}>forum</span>
          </button>

          {canManage && (
            <div className="flex gap-2">
              <button 
                className="w-10 h-10 rounded-xl bg-white/5 text-on-surface-variant hover:text-primary hover:bg-white/10 transition-all flex items-center justify-center"
                onClick={() => onEdit(review)}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button 
                className="w-10 h-10 rounded-xl bg-error/10 text-error hover:bg-error hover:text-on-error transition-all flex items-center justify-center shadow-lg shadow-error/5"
                onClick={() => onDelete(review.id)}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CommentSection 
              reviewId={review.id} 
              user={user} 
              onUpdateCount={setCommentCount}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
