import { motion } from 'framer-motion';
import { Store, Clock, Pencil, CheckCircle, Trash2, Phone } from 'lucide-react';

export function MarketplaceItemCard({ item, user, onEdit, onDelete, onMarkAsSold, onProfileView, onOpenModal }) {
  let photos = [];
  try { photos = item.photosJson ? JSON.parse(item.photosJson) : []; } catch(e) {}
  const mainPhoto = photos.length > 0 ? photos[0] : null;

  const getConditionStyles = (cond) => {
    switch (cond) {
      case 'New': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'Good': return 'text-tertiary bg-tertiary/10 border-tertiary/20';
      case 'Fair': return 'text-error bg-error/10 border-error/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isOwner = user?.id === item.seller?.id || user?.role === 'ADMIN';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col ${item.sold ? 'opacity-50 grayscale' : ''}`}
    >
      <div 
        className="relative h-48 w-full bg-surface-container-highest cursor-pointer flex items-center justify-center overflow-hidden"
        onClick={() => onOpenModal(item)}
      >
        {mainPhoto ? (
          <img src={mainPhoto} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <Store className="text-outline/30 group-hover:scale-110 transition-transform duration-500" size={64} strokeWidth={1} />
        )}
        
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md text-primary text-sm font-black px-3 py-1.5 rounded-xl border border-primary/20 shadow-lg">
          ৳{Number(item.price).toFixed(0)}
        </div>
        
        {item.sold && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-error text-on-error font-black px-6 py-2 rounded-xl text-lg transform -rotate-12 border-2 border-outline-variant shadow-2xl tracking-widest">SOLD</span>
          </div>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-on-surface text-[10px] font-black px-2.5 py-1 rounded-lg border border-outline-variant/50">
            +{photos.length - 1} PHOTOS
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-surface-container-low">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-black text-on-surface line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => onOpenModal(item)}>{item.title}</h3>
        </div>
        
        <p className="text-sm text-on-surface-variant mb-6 flex-1 line-clamp-2 font-medium opacity-80 leading-relaxed">
          {item.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em] text-on-surface-variant opacity-70">
            <div className={`px-2.5 py-1 rounded-lg border ${getConditionStyles(item.condition)}`}>
              {item.condition === 'New' ? 'Like New' : item.condition}
            </div>
            <span className="flex items-center gap-1.5">
              <Clock size={16} className="text-primary" /> 
              {getTimeAgo(item.listedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 truncate max-w-[60%] group/user cursor-pointer transition-all" 
              onClick={() => onProfileView && onProfileView(item.seller?.id)}
            >
              <img 
                src={item.seller?.profilePicture || "https://ui-avatars.com/api/?name=" + (item.seller?.name || 'S')} 
                alt={item.seller?.name} 
                className="w-6 h-6 rounded-lg border border-outline-variant/50 object-cover"
              />
              <span className="text-[12px] font-bold text-on-surface-variant group-hover/user:text-on-surface truncate">{item.seller?.name || 'Anonymous'}</span>
            </div>

            <div className="flex gap-1">
              {isOwner ? (
                <>
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer" 
                    onClick={() => onEdit(item)} 
                    title="Edit Listing"
                  >
                    <Pencil size={18} />
                  </button>
                  {!item.sold && (
                    <button 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" 
                      onClick={() => onMarkAsSold(item.id)} 
                      title="Mark as Sold"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors cursor-pointer" 
                    onClick={() => onDelete(item.id)} 
                    title="Delete Listing"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-black text-on-surface-variant border border-outline-variant/50 rounded-lg px-2.5 py-1 bg-surface-container-high transition-all hover:border-primary/30">
                  <Phone size={14} className="text-primary" />
                  {item.contactInfo}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
