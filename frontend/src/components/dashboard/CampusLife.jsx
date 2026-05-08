import { motion } from 'framer-motion';

export function CampusLife({ events, onTabChange }) {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-2xl p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight">Campus Life</h2>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">Trending Events</p>
        </div>
        <span className="material-symbols-outlined text-outline-variant">campaign</span>
      </div>

      <div className="space-y-8 flex-1">
        {events.length > 0 ? (
          events.map((event, index) => (
            <motion.article 
              key={event.id}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer flex flex-col gap-3"
              onClick={() => onTabChange('events')}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-highest border border-outline-variant shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container-high/50 backdrop-blur-sm z-0">
                   <span className="material-symbols-outlined text-4xl text-primary/30" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {index === 0 ? 'rocket_launch' : 'celebration'}
                   </span>
                </div>
                <div className="absolute bottom-3 left-3 z-20">
                   <span className="text-[10px] font-black text-on-primary bg-primary px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {event.organizer || 'CAMPUS EVENT'}
                   </span>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Soon'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {event.location?.split(',')[0] || 'TBA'}
                  </div>
                </div>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 grayscale opacity-40">
            <span className="material-symbols-outlined text-5xl mb-3">festival</span>
            <p className="text-xs font-bold uppercase tracking-widest text-center">No major events<br/>recorded yet</p>
          </div>
        )}
      </div>

      <button 
         onClick={() => onTabChange('events')}
         className="w-full mt-10 py-3 rounded-xl border border-outline-variant text-xs font-black text-on-surface-variant hover:bg-surface-container-high hover:text-primary hover:border-primary/30 transition-all active:scale-[0.98] uppercase tracking-widest"
      >
        BROWSE ALL EVENTS
      </button>
    </section>
  );
}
