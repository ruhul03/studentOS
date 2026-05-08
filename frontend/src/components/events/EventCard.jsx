import { motion } from 'framer-motion';

export function EventCard({ event, index, canManage, onEdit, onDelete }) {
  const getThemeStyles = (idx) => {
    const themes = [
      { border: 'border-t-primary', bg: 'bg-primary/10', hover: 'group-hover:bg-primary/20', badgeBg: 'bg-primary/20', badgeText: 'text-primary-fixed', badgeBorder: 'border-primary/30', dateText: 'text-primary' },
      { border: 'border-t-secondary', bg: 'bg-secondary/10', hover: 'group-hover:bg-secondary/20', badgeBg: 'bg-secondary/20', badgeText: 'text-secondary-fixed', badgeBorder: 'border-secondary/30', dateText: 'text-secondary' },
      { border: 'border-t-tertiary', bg: 'bg-tertiary/10', hover: 'group-hover:bg-tertiary/20', badgeBg: 'bg-tertiary/20', badgeText: 'text-tertiary-fixed', badgeBorder: 'border-tertiary/30', dateText: 'text-tertiary' },
      { border: 'border-t-error', bg: 'bg-error/10', hover: 'group-hover:bg-error/20', badgeBg: 'bg-error/20', badgeText: 'text-error-container', badgeBorder: 'border-error/30', dateText: 'text-error' },
    ];
    return themes[idx % themes.length];
  };

  const theme = getThemeStyles(index);
  const eventDate = new Date(event.eventDate);
  const isFeatured = index === 0;

  if (isFeatured) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col sm:flex-row h-auto sm:h-72 border border-outline-variant shadow-sm"
      >
        <div className="w-full sm:w-2/5 h-48 sm:h-full relative overflow-hidden bg-surface-container-highest flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent z-10 sm:bg-gradient-to-r"></div>
          <span className="material-symbols-outlined text-[120px] text-primary/10 group-hover:scale-110 transition-transform duration-700">event</span>
          <span className="absolute top-4 left-4 z-20 bg-surface-container-lowest/60 backdrop-blur-md text-on-surface text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border border-outline-variant/50">Featured Event</span>
        </div>
        <div className="p-8 flex flex-col justify-between w-full sm:w-3/5 relative z-20">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border border-primary/20">
                {event.organizer || 'General'}
              </span>
              <div className="text-right flex items-center gap-3 bg-surface-container-high p-2 rounded-xl border border-outline-variant/30">
                <div className="text-xs font-bold text-on-surface-variant leading-none">{eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                <div className="text-3xl font-black text-on-surface leading-none">{eventDate.getDate()}</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
            <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-outline-variant/20">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium">
                <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium">
                <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                {event.location}
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2 relative z-30">
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); onEdit(event); }}>
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}>
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 hover:bg-surface-container transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-between h-72 border-t-4 ${theme.border} shadow-sm`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-opacity-20 transition-all`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <span className={`${theme.badgeBg} ${theme.badgeText} text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border ${theme.badgeBorder}`}>
            {event.organizer || 'Event'}
          </span>
          <div className="text-right bg-surface-container-high p-2 rounded-xl border border-outline-variant/30">
            <div className="text-xs font-bold text-on-surface-variant leading-none">{eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
            <div className={`text-2xl font-black ${theme.dateText} leading-none mt-1`}>{eventDate.getDate()}</div>
          </div>
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {event.title}
        </h3>
        <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed">{event.description}</p>
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/20 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-medium">
            <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
            {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-medium">
            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
            <span className="truncate max-w-[120px]">{event.location}</span>
          </div>
        </div>
        
        {canManage && (
          <div className="flex gap-1">
            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); onEdit(event); }}>
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}>
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
