import { motion } from 'framer-motion';

export function LostFoundItemCard({ item, user, onEdit, onDelete, onResolve, onProfileView, onPhotoClick }) {
  const getDaysAgo = (dateString) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBadgeInfo = (item) => {
    const days = getDaysAgo(item.reportedAt);
    if (item.type === 'LOST') {
      return {
        text: days === 0 ? 'Missing Today' : `Missing ${days} Days`,
        bgClass: 'bg-error/20 text-error border-error/20',
      };
    } else {
      return {
        text: days === 0 ? 'Just Found' : `Found ${days} Days Ago`,
        bgClass: 'bg-secondary/20 text-secondary border-secondary/20',
      };
    }
  };

  const badgeInfo = getBadgeInfo(item);
  const canManage = user && (user.id === item.reporter?.id || user.role === 'ADMIN');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col ${item.resolved ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="relative h-48 bg-surface-variant overflow-hidden flex items-center justify-center bg-gradient-to-br from-surface-variant to-background">
        {item.photos && item.photos.length > 0 ? (
          <img 
            src={item.photos[0]} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" 
            onClick={() => onPhotoClick && onPhotoClick(item.photos[0])}
          />
        ) : (
          <span className="material-symbols-outlined text-[64px] text-outline/30 group-hover:scale-110 transition-transform duration-500">
            {item.type === 'LOST' ? 'search' : 'inventory_2'}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent pointer-events-none"></div>
        
        <div className={`absolute top-3 left-3 ${badgeInfo.bgClass} border text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md`}>
          {item.resolved ? 'RESOLVED' : badgeInfo.text}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10 bg-surface-container-low">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-black text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'LOST' ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
            <span className="material-symbols-outlined text-[18px]">
              {item.type === 'LOST' ? 'help_center' : 'where_to_vote'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 font-medium opacity-80 leading-relaxed">
          {item.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between text-on-surface-variant text-[12px] font-bold uppercase tracking-wider opacity-70">
            <div className="flex items-center gap-2 truncate max-w-[65%]">
              <span className="material-symbols-outlined text-[16px] shrink-0 text-primary">location_on</span>
              <span className="truncate">{item.location}</span>
            </div>
            <span className="shrink-0">{new Date(item.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 truncate max-w-[60%] group/user cursor-pointer transition-all" 
              onClick={() => onProfileView && onProfileView(item.reporter?.id)}
            >
              <img 
                src={item.reporter?.profilePicture || "https://ui-avatars.com/api/?name=" + (item.reporter?.name || 'A')} 
                alt={item.reporter?.name} 
                className="w-6 h-6 rounded-lg border border-outline-variant/50 object-cover"
              />
              <span className="text-[12px] font-bold text-on-surface-variant group-hover/user:text-on-surface truncate">{item.reporter?.name || 'Anonymous'}</span>
            </div>

            <div className="flex gap-1">
              {canManage && !item.resolved && (
                <button 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => onResolve(item.id)}
                  title="Mark as Resolved"
                >
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </button>
              )}
              {canManage && (
                <>
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors"
                    onClick={() => onEdit(item)}
                    title="Edit Report"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
