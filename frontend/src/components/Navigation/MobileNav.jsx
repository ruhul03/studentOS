import { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Building2, Calendar, User, 
  Calculator, Inbox, Search, Store, CalendarDays, Star, Menu, X
} from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav({ activeTab, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (tab) => {
    onNavigate(tab);
    setIsMenuOpen(false);
  };

  const getTabClass = (tabId) => {
    return `flex flex-col items-center gap-1 bg-transparent border-none font-medium text-[10px] cursor-pointer transition-colors duration-200 ${
      activeTab === tabId ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
    }`;
  };

  const menuItems = [
    { id: 'services', icon: Building2, label: 'Services' },
    { id: 'lostfound', icon: Search, label: 'Lost & Found' },
    { id: 'market', icon: Store, label: 'Market' },
    { id: 'events', icon: CalendarDays, label: 'Events' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'calculator', icon: Calculator, label: 'UIU Calc' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <>
      <div className="md:hidden px-4 py-2 bg-surface/90 backdrop-blur-md border-b border-outline-variant w-full fixed top-0 z-50">
         <GlobalSearch onNavigate={onNavigate} />
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-outline-variant flex justify-around py-3 px-2 z-[1000] pb-safe">
        <button className={getTabClass('home')} onClick={() => handleNavigate('home')}>
          <LayoutDashboard size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span>Home</span>
        </button>
        <button className={getTabClass('inbox')} onClick={() => handleNavigate('inbox')}>
          <Inbox size={20} strokeWidth={activeTab === 'inbox' ? 2.5 : 2} />
          <span>Inbox</span>
        </button>
        <button className={getTabClass('resources')} onClick={() => handleNavigate('resources')}>
          <BookOpen size={20} strokeWidth={activeTab === 'resources' ? 2.5 : 2} />
          <span>Study</span>
        </button>
        <button className={getTabClass('planner')} onClick={() => handleNavigate('planner')}>
          <Calendar size={20} strokeWidth={activeTab === 'planner' ? 2.5 : 2} />
          <span>Plan</span>
        </button>
        <button className={`flex flex-col items-center gap-1 bg-transparent border-none font-medium text-[10px] cursor-pointer transition-colors duration-200 ${isMenuOpen ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={20} strokeWidth={isMenuOpen ? 2.5 : 2} />
          <span>Menu</span>
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-[900] bg-surface/95 backdrop-blur-xl pt-20 pb-24 px-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-xl font-bold text-on-surface">More Options</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-surface-container rounded-full text-on-surface">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border ${
                      isActive 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
