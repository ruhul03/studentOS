import { motion } from 'framer-motion';
import { X, Headphones, BookOpen, Armchair, Shirt, Tag, Store, Clock, MapPin, ShieldCheck, Send, Heart } from 'lucide-react';

export function MarketplaceItemModal({ show, item, onClose, onProfileView }) {
  if (!show || !item) return null;

  let photos = [];
  try { photos = item.photosJson ? JSON.parse(item.photosJson) : []; } catch(e) {}
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getConditionStyles = (cond) => {
    switch (cond) {
      case 'New': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'Good': return 'text-tertiary bg-tertiary/10 border-tertiary/20';
      case 'Fair': return 'text-error bg-error/10 border-error/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative z-50 bg-surface-container w-full max-w-5xl rounded-[2.5rem] border border-outline-variant shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high w-12 h-12 flex items-center justify-center rounded-2xl transition-all z-20 bg-background/20 backdrop-blur-md border border-outline-variant/10"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Left: Image Section */}
        <div className="w-full md:w-1/2 bg-surface-container-lowest relative min-h-[400px] md:min-h-full border-b md:border-b-0 md:border-r border-outline-variant flex items-center justify-center overflow-hidden group">
          <div className="absolute top-8 left-8 z-10 bg-primary/20 backdrop-blur-xl border border-primary/20 px-5 py-2 rounded-2xl flex items-center gap-3">
            <div className="text-[20px] text-primary">
              {item.category === 'Electronics' ? <Headphones size={20} /> : 
               item.category === 'Books' ? <BookOpen size={20} /> : 
               item.category === 'Furniture' ? <Armchair size={20} /> : 
               item.category === 'Clothing' ? <Shirt size={20} /> : <Tag size={20} />}
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-on-surface uppercase">{item.category}</span>
          </div>
          
          {photos.length > 0 ? (
            <img 
              src={photos[0]} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
            />
          ) : (
            <Store size={160} className="text-outline/20" strokeWidth={1} />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-90 pointer-events-none"></div>
          
          {item.sold && (
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-error text-on-error font-black px-12 py-4 rounded-3xl text-3xl transform -rotate-12 border-4 border-outline-variant shadow-2xl tracking-widest">SOLD</span>
            </div>
          )}
        </div>

        {/* Right: Content Section */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-surface-container/50">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-on-surface mb-3 tracking-tighter leading-tight">{item.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-[12px] font-bold uppercase tracking-widest opacity-60">
                <span className="flex items-center gap-2"><Clock size={18} /> Listed {getTimeAgo(item.listedAt)}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-outline/40"></span>
                <span className="flex items-center gap-2"><MapPin size={18} /> Campus Hub</span>
              </div>
            </div>

            <div className="flex items-center gap-8 py-8 border-y border-outline-variant/30">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 mb-2">Asking Price</span>
                <span className="text-5xl font-black text-primary leading-none tracking-tighter tabular-nums">৳{Number(item.price).toFixed(2)}</span>
              </div>
              <div className="w-px h-12 bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 mb-2">Condition</span>
                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${getConditionStyles(item.condition)} shadow-sm`}>
                  <ShieldCheck size={16} className="fill-current text-on-surface" />
                  {item.condition === 'New' ? 'Like New' : item.condition}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Description</h3>
              <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            <div className="p-6 bg-surface-container-high/50 border border-outline-variant/50 rounded-3xl flex items-center gap-6 transition-all hover:bg-surface-container-high group">
              <img 
                src={item.seller?.profilePicture || "https://ui-avatars.com/api/?name=" + (item.seller?.name || 'S')} 
                alt={item.seller?.name} 
                className="w-14 h-14 rounded-2xl border-2 border-outline-variant/50 object-cover shadow-lg group-hover:scale-105 transition-transform"
                onClick={() => { onClose(); onProfileView && onProfileView(item.seller?.id); }}
              />
              <div className="flex flex-col">
                <span className="text-lg font-black text-on-surface cursor-pointer hover:text-primary transition-colors" onClick={() => { onClose(); onProfileView && onProfileView(item.seller?.id); }}>{item.seller?.name || 'Anonymous'}</span>
                <span className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase opacity-60 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Verified Seller
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-outline-variant/30">
            <button 
              className="flex-1 bg-primary text-on-primary font-black text-xs uppercase tracking-widest px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = `mailto:${item.contactInfo}`}
            >
              <Send size={20} />
              Inquire Now
            </button>
            <button className="flex-1 sm:flex-none border-2 border-outline-variant hover:bg-surface-container-high text-on-surface font-black text-xs uppercase tracking-widest px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all group">
              <Heart size={20} className="text-outline group-hover:text-on-surface transition-colors" />
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
