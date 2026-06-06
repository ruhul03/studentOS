import { motion } from 'framer-motion';
import { FileText, FileQuestion, BookOpen, File, Link, Trash2, ThumbsUp, Download, Edit2, MessageCircle } from 'lucide-react';

const typeConfig = {
  'Notes':      { icon: FileText,   label: 'Lecture Notes', accent: '#6750A4', border: 'border-l-[#6750A4]', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'Exam Paper': { icon: FileQuestion,          label: 'Exam Paper',    accent: '#E8622A', border: 'border-l-[#E8622A]', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  'Study Guide':{ icon: BookOpen,     label: 'Study Guide',   accent: '#2DA44E', border: 'border-l-[#2DA44E]', badge: 'bg-green-500/10 text-green-400 border-green-500/20'  },
  'Textbook':   { icon: File,label: 'Textbook',      accent: '#0969DA', border: 'border-l-[#0969DA]', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'    },
  'Link':       { icon: Link,          label: 'Link',          accent: '#8250DF', border: 'border-l-[#8250DF]', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'},
};

const getInitials = (name) => {
  if (!name) return 'U';
  try { return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }
  catch (e) { return 'U'; }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
};

export function ResourceCard({ 
  res, 
  idx, 
  canManageResource, 
  handleDeleteResource,
  handleEditResource,
  onProfileView,
  onMessageClick,
  currentUser,
  handleUpvote, 
  userUpvotes 
}) {
  if (!res || !res.id) return null;
  const cfg = typeConfig[res.type] || typeConfig['Notes'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.04, duration: 0.3 }}
      className={`group flex flex-col bg-surface-container max-md:bg-transparent border border-outline-variant/50 border-l-4 ${cfg.border} rounded-2xl max-md:rounded-none max-md:border-x-0 max-md:border-t-0 max-md:border-b max-md:border-b-outline-variant/30 max-md:border-l-4 overflow-hidden hover:border-outline hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 max-md:hover:shadow-none max-md:hover:-translate-y-0`}
    >
      {/* ── Card Header: Type + Actions ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${cfg.badge}`}>
          <cfg.icon size={14} strokeWidth={2.5} />
          {cfg.label}
        </span>

        {canManageResource(res.uploader?.id) && (
          <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); handleEditResource(res); }}
              className="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Edit resource"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteResource(res.id); }}
              className="w-7 h-7 rounded-lg bg-error/10 text-error/70 hover:bg-error hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Delete resource"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Card Body: Course + Title + Description ── */}
      <div className="flex-1 px-5 pb-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-on-surface bg-surface-container-high border border-outline-variant/60 px-2 py-0.5 rounded-md tracking-wider">
            {res.courseCode || 'GENERAL'}
          </span>
          {res.courseTitle && (
            <span className="text-[11px] text-on-surface-variant truncate max-w-[160px]" title={res.courseTitle}>
              {res.courseTitle}
            </span>
          )}
        </div>

        <h3 className="text-[16px] font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {res.title || 'Untitled Resource'}
        </h3>

        <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-3">
          {res.description || 'No description provided.'}
        </p>
      </div>

      {/* ── Card Footer: Author + Upvote + Download ── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-outline-variant/30 bg-surface-container-low/50">
        <div 
          className={`flex items-center gap-2.5 min-w-0 ${!res.anonymous && onProfileView ? 'cursor-pointer group/author' : ''}`}
          onClick={() => {
            if (!res.anonymous && onProfileView && res.uploader?.id) {
              onProfileView(res.uploader.id);
            }
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 border border-primary/20 group-hover/author:bg-primary group-hover/author:text-white transition-colors">
            {res.anonymous ? '?' : getInitials(res.uploader?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-on-surface leading-none truncate group-hover/author:text-primary transition-colors">
              {res.anonymous ? 'Anonymous' : (res.uploader?.name || 'User')}
            </p>
            {res.uploadedAt && (
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-none">
                {formatDate(res.uploadedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!res.anonymous && res.uploader?.id && currentUser?.id !== res.uploader?.id && onMessageClick && (
            <button
              onClick={() => onMessageClick(res.uploader.id)}
              className="flex items-center justify-center w-[28px] h-[28px] rounded-lg bg-surface-container-high text-on-surface-variant border border-outline-variant/60 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
              title="Message Author"
            >
              <MessageCircle size={14} />
            </button>
          )}
          <button
            onClick={() => handleUpvote(res.id)}
            disabled={!!userUpvotes[res.id]}
            className={`flex items-center justify-center gap-1.5 px-2.5 h-[28px] rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
              userUpvotes[res.id]
                ? 'bg-primary text-on-primary shadow-md shadow-primary/30'
                : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/60 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
            }`}
            title={userUpvotes[res.id] ? 'Upvoted' : 'Upvote'}
          >
            <ThumbsUp size={14} className={userUpvotes[res.id] ? 'fill-current' : ''} />
            <span>{res.upvotes || 0}</span>
          </button>

          <a
            href={res.fileUrl?.startsWith('http') ? res.fileUrl : `${import.meta.env.VITE_API_URL}${res.fileUrl || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 h-[28px] rounded-lg text-[11px] font-semibold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
            download
            title="Download resource"
          >
            <Download size={14} />
            <span>Get</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
