import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';

export function CommentSection({ reviewId, user, onUpdateCount }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        onUpdateCount?.(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          text: commentText.trim(),
          commenterId: user?.id,
          anonymous: isAnonymous
        })
      });

      if (response.ok) {
        setCommentText('');
        setIsAnonymous(false);
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments/${commentId}/replies`, {
        method: 'POST',
        body: JSON.stringify({
          text: replyText.trim(),
          commenterId: user?.id,
          anonymous: isReplyAnonymous
        })
      });

      if (response.ok) {
        setReplyText('');
        setIsReplyAnonymous(false);
        setReplyingTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post reply', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-6 pt-6 border-t border-white/[0.03]">
      {user && (
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea 
            className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all min-h-[80px] resize-none"
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-8 h-4">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="sr-only peer" />
                <div className="w-full h-full bg-white/10 rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface transition-colors">Anonymous</span>
            </label>
            <button 
              type="submit" 
              disabled={!commentText.trim()}
              className="px-6 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:hover:bg-primary/10 disabled:hover:text-primary"
            >
              Post Comment
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="flex flex-col gap-3 py-4">
            {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="space-y-3">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.04]">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-[9px] font-black text-primary border border-white/5">
                      {comment.anonymous ? '?' : (comment.commenter?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U')}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface opacity-80">{comment.anonymous ? 'Anonymous' : comment.commenter?.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed pl-11">
                  {comment.text}
                </p>
              </div>

              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={(e) => handleReplySubmit(comment.id, e)}
                    className="ml-11 space-y-3 overflow-hidden"
                  >
                    <textarea 
                      className="w-full bg-surface border border-white/5 rounded-2xl p-4 text-sm text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all min-h-[60px] resize-none"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative w-8 h-4">
                          <input type="checkbox" checked={isReplyAnonymous} onChange={e => setIsReplyAnonymous(e.target.checked)} className="sr-only peer" />
                          <div className="w-full h-full bg-white/10 rounded-full peer-checked:bg-primary transition-colors"></div>
                          <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface transition-colors">Anonymous</span>
                      </label>
                      <button 
                        type="submit" 
                        className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all"
                      >
                        Reply
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {comment.replies?.length > 0 && (
                <div className="ml-11 space-y-3 border-l border-white/5 pl-4">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-surface-container-highest flex items-center justify-center text-[8px] font-black text-primary/60 border border-white/5">
                          {reply.anonymous ? '?' : (reply.commenter?.name?.split(' ').map(n => n[0]).join('').substring(0, 1).toUpperCase() || 'U')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-on-surface opacity-60">{reply.anonymous ? 'Anonymous' : reply.commenter?.name}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/20">{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant/70 leading-relaxed pl-9">
                        {reply.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant/20 mb-2">forum</span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/20">No comments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
