import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampusServiceModal } from './CampusServiceModal';
import { CafeteriaMenuModal } from './CafeteriaMenuModal';

export function CampusServicesDirectory() {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [menuModalService, setMenuModalService] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url = activeCategory === 'All' 
        ? `${import.meta.env.VITE_API_URL}/api/services` 
        : `${import.meta.env.VITE_API_URL}/api/services?category=${activeCategory}`;
        
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        if (search) {
          data = data.filter((s) => 
            s.name.toLowerCase().includes(search.toLowerCase()) || 
            s.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch campus services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, search]);

  const categories = ['All', 'Library', 'Medical', 'Food', 'Transport'];

  const getCategoryDisplay = (cat) => {
    switch(cat) {
      case 'All': return 'ALL SERVICES';
      case 'Library': return 'ACADEMIC';
      case 'Medical': return 'HEALTH';
      case 'Food': return 'DINING';
      case 'Transport': return 'TRANSPORT';
      default: return cat.toUpperCase();
    }
  };

  const getIconForCategory = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'library': return { icon: 'local_library', colorClass: 'text-primary', bgClass: 'bg-primary/10' };
      case 'medical': return { icon: 'medical_services', colorClass: 'text-error', bgClass: 'bg-error/10' };
      case 'food': return { icon: 'restaurant', colorClass: 'text-tertiary', bgClass: 'bg-tertiary/10' };
      case 'transport': return { icon: 'directions_bus', colorClass: 'text-secondary', bgClass: 'bg-secondary/10' };
      default: return { icon: 'business', colorClass: 'text-primary', bgClass: 'bg-primary/10' };
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header & Search Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Campus Directory</h1>
            <p className="text-base text-on-surface-variant">Find essential university facilities, their operating hours, and live status.</p>
          </div>
          
          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full bg-surface-container-high border border-outline-variant rounded-full py-3 pl-12 pr-4 text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-sm" 
              placeholder="Search campus services..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-4 border-b border-outline-variant/30 pb-4">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded text-xs font-bold tracking-wider transition-colors uppercase ${
                  activeCategory === cat 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'bg-transparent border border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                {getCategoryDisplay(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading && services.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-surface-container rounded-xl border border-outline-variant/30 p-6 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {services.map((service) => {
                const { icon, colorClass, bgClass } = getIconForCategory(service.category);
                const isOpen = service.status === 'Open' || service.status === 'Running';
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={service.id}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all hover:shadow-lg hover:shadow-black/20"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
                          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                            {service.name}
                          </h3>
                          <span className="text-xs font-semibold text-outline tracking-wider uppercase">
                            {service.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 flex items-center gap-1 rounded text-xs font-bold tracking-widest uppercase border ${
                        isOpen 
                          ? 'border-secondary/30 text-secondary bg-secondary/5' 
                          : 'border-outline-variant text-outline bg-surface-container-high'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-secondary' : 'bg-outline'}`}></div>
                        {service.status}
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">schedule</span>
                        <span className="text-sm font-medium text-on-surface-variant">
                          {service.operatingHours}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">location_on</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-on-surface-variant">
                            {service.location}
                          </span>
                          {service.description && (
                            <span className="text-xs text-outline uppercase tracking-wider mt-1 line-clamp-1">
                              {service.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-3 mt-auto border-t border-outline-variant/20 pt-4">
                      <button 
                        className="flex-1 px-4 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded font-bold text-xs tracking-wider transition-colors"
                        onClick={() => setSelectedService(service)}
                      >
                        DETAILS
                      </button>
                      
                      {(service.category?.toLowerCase() === 'food' || service.category?.toLowerCase() === 'dining') && (
                        <button 
                          className="flex-1 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-fixed rounded font-bold text-xs tracking-wider transition-colors"
                          onClick={() => setMenuModalService(service)}
                        >
                          MENU
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {services.length === 0 && !loading && (
          <div className="text-center p-12 border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No services found</h3>
            <p className="text-on-surface-variant">
              We couldn't find any campus services matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Pop-up Modals */}
      {selectedService && (
        <CampusServiceModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
      
      {menuModalService && (
        <CafeteriaMenuModal 
          service={menuModalService} 
          onClose={() => setMenuModalService(null)} 
        />
      )}
    </div>
  );
}
