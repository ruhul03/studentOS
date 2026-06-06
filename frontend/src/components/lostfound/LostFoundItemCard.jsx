import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, CheckCircle2, Package, MapPin, Edit3, Trash2, Loader2 } from 'lucide-react';

export function LostFoundItemCard({ item, user, onEdit, onDelete, onResolve, onProfileView, onPhotoClick }) {
  const [isResolving, setIsResolving] = useState(false);
  const getDaysAgo = (dateString) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBadgeInfo = (item) => {
    const days = getDaysAgo(item.reportedAt);
    const isLost = item.type === 'LOST';
    return {
      text: isLost 
        ? (days === 0 ? 'Missing Today' : `Missing ${days} Days`)
        : (days === 0 ? 'Just Found' : `Found ${days} Days Ago`),
      color: isLost ? 'text-error' : 'text-secondary',
      bgColor: isLost ? 'bg-error/10' : 'bg-secondary/10',
      icon: isLost ? <Search size={14} /> : <CheckCircle size={14} />
    };
  };

  const badgeInfo = getBadgeInfo(item);
  const canManage = user && (user.id === item.reporter?.id || user.role === 'ADMIN');
  const isLost = item.type === 'LOST';

  let photos = [];
  try { photos = item.photosJson ? JSON.parse(item.photosJson) : []; } catch(e) {}
  const mainPhoto = photos.length > 0 ? photos[0] : null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ 
        y: -6,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5), 0 0 20px -5px var(--md-sys-color-primary-fixed-dim, rgba(129, 140, 248, 0.1))"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-surface-container border border-outline-variant/20 rounded-2xl max-md:rounded-none max-md:border-x-0 max-md:border-t-0 max-md:border-b-outline-variant/40 overflow-hidden flex flex-col transition-colors duration-300 hover:border-primary/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] max-md:shadow-none ${item.resolved ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-surface-container-high flex items-center justify-center overflow-hidden">
        {mainPhoto ? (
          <img 
            src={mainPhoto} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer" 
            onClick={() => onPhotoClick && onPhotoClick(mainPhoto)}
          />
        ) : (
          <div className="text-outline/20">
            {isLost ? <Search size={64} strokeWidth={1} /> : <Package size={64} strokeWidth={1} />}
          </div>
        )}
        
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full border border-current backdrop-blur-sm flex items-center gap-2 ${badgeInfo.bgColor} ${badgeInfo.color}`}>
          <div className="flex items-center justify-center">
            {item.resolved ? <CheckCircle2 size={14} /> : badgeInfo.icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{item.resolved ? 'Resolved' : badgeInfo.text}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-black text-on-surface line-clamp-1">{item.title}</h3>
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${isLost ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
            {item.type}
          </div>
        </div>
        
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 font-medium leading-relaxed opacity-70">
          {item.description}
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <MapPin size={16} className="text-primary" />
              <span className="truncate">{item.location}</span>
            </div>
            <span>{new Date(item.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="h-px bg-outline-variant/10 w-full" />

          <div className="flex items-center justify-between">
            <button 
              className="flex items-center gap-2 hover:opacity-70 transition-opacity truncate" 
              onClick={() => onProfileView && onProfileView(item.reporter?.id)}
            >
              <img 
                src={item.reporter?.profilePicture || "https://ui-avatars.com/api/?name=" + (item.reporter?.name || 'A') + "&background=random"} 
                alt={item.reporter?.name} 
                className="w-7 h-7 rounded-lg border border-outline-variant/30 object-cover"
              />
              <span className="text-xs font-bold text-on-surface-variant truncate">{item.reporter?.name || 'Anonymous'}</span>
            </button>

            {canManage && (
              <div className="flex gap-1 bg-surface-container-high/50 p-1 rounded-lg">
                <button 
                  className="w-7 h-7 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => onEdit(item)}
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  className="w-7 h-7 rounded-md flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {canManage && !item.resolved && (
            <motion.button
              whileHover={!isResolving ? { scale: 1.02 } : {}}
              whileTap={!isResolving ? { scale: 0.98 } : {}}
              onClick={async () => {
                if (isResolving) return;
                setIsResolving(true);
                try {
                  await onResolve(item.id);
                } finally {
                  setIsResolving(false);
                }
              }}
              disabled={isResolving}
              className={`mt-4 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${
                isResolving 
                  ? 'bg-secondary text-on-secondary border-secondary cursor-wait opacity-80' 
                  : 'bg-secondary/10 hover:bg-secondary text-secondary hover:text-on-secondary border-secondary/20'
              }`}
            >
              {isResolving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Mark as Resolved
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
