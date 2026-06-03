import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentSection } from './CommentSection';
import { Star, Sparkles, ThumbsUp, MessageSquare, Pencil, Trash2 } from 'lucide-react';

export function ReviewCard({ review, user, onEdit, onDelete, onHelpful, onView }) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(review.commentCount || 0);

  const canManage = user && (user.id === review.reviewer?.id || user.role?.toUpperCase() === 'ADMIN');

  // Theme based on rating
  const getTheme = (rating) => {
    if (rating >= 4.5) return { accent: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    if (rating >= 3.5) return { accent: '#6366f1', bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
    if (rating >= 2.5) return { accent: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    return { accent: '#ef4444', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' };
  };

  const theme = getTheme(review.qualityRating || 0);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i} 
        size={12}
        strokeWidth={2.5}
        className={i < rating ? 'text-amber-500 fill-amber-500' : 'text-on-surface-variant/20'}
      />
    ));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-surface-container-low border border-outline-variant/30 rounded-[2.5rem] overflow-hidden flex flex-col transition-all hover:bg-surface-container hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99] cursor-pointer"
      style={{ borderLeft: `6px solid ${theme.accent}` }}
      onClick={onView}
    >
      {/* --- Zone 1: Header --- */}
      <div className="p-8 pb-4 flex justify-between items-start">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase border ${theme.bg} ${theme.text} ${theme.border}`}>
            {review.courseCode}
          </span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-xl text-[10px] font-black tracking-widest uppercase border border-outline-variant/50">
            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-surface-container-high/80 backdrop-blur-xl py-2 px-4 rounded-2xl border border-outline-variant/30 shadow-lg">
          <span className="text-lg font-black text-on-surface leading-none">
            {review.qualityRating?.toFixed(1)}
          </span>
          <Sparkles className="text-amber-500" size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* --- Zone 2: Content Body --- */}
      <div className="px-8 pb-6 flex-1">
        <h3 className="text-xl font-black text-on-surface tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">
          {review.courseName}
        </h3>
        <p className="text-xs font-black text-on-surface-variant/40 uppercase tracking-widest mb-6">
          Prof. {review.professor}
        </p>
        
        <div className="relative">
          <span className="absolute -left-2 -top-4 text-4xl text-primary/10 font-serif">"</span>
          <p className="text-sm text-on-surface-variant/80 leading-relaxed italic line-clamp-4 relative z-10">
            {review.reviewText}
          </p>
          <button 
            className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
            onClick={(e) => { e.stopPropagation(); onView(); }}
          >
            Read Full Experience
          </button>
        </div>
      </div>

      {/* --- Zone 3: Metadata & Actions --- */}
      <div className="px-8 py-6 bg-surface-container-high/30 border-t border-outline-variant/20" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-2xl ${theme.bg} flex items-center justify-center text-[11px] font-black ${theme.text} border ${theme.border} shadow-inner`}>
                {review.anonymous ? '?' : getInitials(review.reviewer?.name)}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-tight">By</span>
                <span className="text-xs font-bold text-on-surface truncate max-w-[100px]">
                  {review.anonymous ? 'Anonymous' : review.reviewer?.name}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container-high/50 p-1 rounded-2xl border border-outline-variant/30">
            <button 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                review.isHelpful ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
              onClick={() => onHelpful(review.id)}
              disabled={review.isHelpful}
            >
              <ThumbsUp size={16} className={review.isHelpful ? 'fill-current' : ''} />
              {review.helpfulVotes || 0}
            </button>
            
            <button 
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                showComments ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare size={18} className={showComments ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Difficulty indicator & Management */}
        <div className="mt-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Difficulty</span>
             <div className="flex gap-0.5">
               {renderStars(review.difficultyRating)}
             </div>
           </div>

           {canManage && (
            <div className="flex gap-2">
              <button 
                className="w-8 h-8 rounded-lg text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                onClick={() => onEdit(review)}
              >
                <Pencil size={16} />
              </button>
              <button 
                className="w-8 h-8 rounded-lg text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all flex items-center justify-center cursor-pointer"
                onClick={() => onDelete(review.id)}
              >
                <Trash2 size={16} />
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
            className="bg-surface-container-high/20 border-t border-outline-variant/10"
          >
            <div className="p-6">
              <CommentSection 
                reviewId={review.id} 
                user={user} 
                onUpdateCount={setCommentCount}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
