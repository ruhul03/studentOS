import { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Building2, Calendar, User, 
  Calculator, Inbox, Search, Store, CalendarDays, Star, Menu, X,
  Settings, HelpCircle, Shield, PlusCircle, LogOut
} from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { playTabSound, playDeleteSound } from '../../utils/notificationSound';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NewEntryModal } from './NewEntryModal';

export function MobileNav({ activeTab, onNavigate, unreadDMCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (tab) => {
    playTabSound();
    onNavigate(tab);
    setIsMenuOpen(false);
  };

  const getTabClass = (tabId) => {
    return `flex flex-col items-center gap-1 bg-transparent border-none font-medium text-[10px] cursor-pointer transition-colors duration-200 relative ${
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-outline-variant flex justify-around py-3 px-2 z-[1000] pb-safe">
        <button className={getTabClass('home')} onClick={() => handleNavigate('home')}>
          <LayoutDashboard size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span>Home</span>
        </button>
        <button className={getTabClass('inbox')} onClick={() => handleNavigate('inbox')}>
          <div className="relative">
            <Inbox size={20} strokeWidth={activeTab === 'inbox' ? 2.5 : 2} />
            {unreadDMCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-surface shadow-sm">
                {unreadDMCount > 9 ? '9+' : unreadDMCount}
              </span>
            )}
          </div>
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
        <button className={`flex flex-col items-center gap-1 bg-transparent border-none font-medium text-[10px] cursor-pointer transition-colors duration-200 ${isMenuOpen ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => { playTabSound(); setIsMenuOpen(!isMenuOpen); }}>
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
            className="md:hidden fixed inset-0 z-[900] bg-surface/95 backdrop-blur-xl pt-16 pb-24 px-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-xl font-bold text-on-surface">More Options</h2>
              <button onClick={() => { playTabSound(); setIsMenuOpen(false); }} className="p-2 bg-surface-container rounded-full text-on-surface">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6 px-2">
               <GlobalSearch onNavigate={(tab) => { handleNavigate(tab); setIsMenuOpen(false); }} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
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

            <div className="flex flex-col gap-3 px-2">
              {user?.role === 'ADMIN' && (
                <button
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all border border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20 w-full"
                  onClick={() => { playTabSound(); setIsMenuOpen(false); navigate('/admin'); }}
                >
                  <Shield size={18} strokeWidth={2} />
                  Admin Console
                </button>
              )}
              
              {activeTab === 'home' && (
                <button 
                  className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-soft hover:shadow-glow transition-all" 
                  onClick={() => { playTabSound(); setIsMenuOpen(false); setIsNewEntryOpen(true); }}
                >
                  <PlusCircle size={18} strokeWidth={2} />
                  New Entry
                </button>
              )}
              
              <div className="flex gap-3">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all border border-outline-variant text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high hover:text-on-surface" 
                  onClick={() => handleNavigate('settings')}
                >
                  <Settings size={18} strokeWidth={2} />
                  Settings
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all border border-outline-variant text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high hover:text-on-surface" 
                  onClick={() => handleNavigate('help')}
                >
                  <HelpCircle size={18} strokeWidth={2} />
                  Help
                </button>
              </div>

              <button 
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all border border-error/30 text-error bg-error/10 hover:bg-error/20 w-full mt-2" 
                onClick={() => { playDeleteSound(); logout(); }}
              >
                <LogOut size={18} strokeWidth={2} />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NewEntryModal isOpen={isNewEntryOpen} onClose={() => setIsNewEntryOpen(false)} onNavigate={onNavigate} />
    </>
  );
}
