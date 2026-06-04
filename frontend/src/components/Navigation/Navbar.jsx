import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Folder, Calendar, BookOpen, Search, 
  Store, CalendarDays, Star, Calculator, Settings, HelpCircle, 
  Shield, PlusCircle, LogOut, Sun, Moon, Inbox
} from 'lucide-react';
import { NotificationPanel } from '../Notifications/NotificationPanel';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NewEntryModal } from './NewEntryModal';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { playTabSound, playDeleteSound } from '../../utils/notificationSound';

export function Navbar({ activeTab, onNavigate, wsNotifications, onMessageClick, unreadDMCount }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  // Mapping site features to the side nav
  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inbox', icon: Inbox, label: 'Inbox' },
    { id: 'resources', icon: Folder, label: 'Resources' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'services', icon: BookOpen, label: 'Services' },
    { id: 'lostfound', icon: Search, label: 'Lost & Found' },
    { id: 'market', icon: Store, label: 'Market' },
    { id: 'events', icon: CalendarDays, label: 'Events' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'calculator', icon: Calculator, label: 'UIU Calc' }
  ];

  return (
    <>
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant transition-colors duration-300">
        <div className="flex items-center gap-4 min-w-[200px]">
          <span className="text-xl font-bold text-on-surface tracking-tight cursor-pointer" onClick={() => onNavigate('home')}>StudentOS</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <GlobalSearch onNavigate={onNavigate} />
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-1 border-r border-outline-variant pr-3">
            <button 
              className="md:hidden w-9 h-9 rounded-full bg-transparent text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-container-high hover:text-on-surface" 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              title="Search"
            >
              <Search size={20} strokeWidth={2} />
            </button>
            <button 
              className="w-9 h-9 rounded-full bg-transparent text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-container-high hover:text-on-surface" 
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
            </button>
            <div className="relative">
              <NotificationPanel 
                show={showNotificationPanel} 
                toggleShow={() => setShowNotificationPanel(!showNotificationPanel)} 
                wsNotifications={wsNotifications} 
                onNavigate={onNavigate} 
                onMessageClick={onMessageClick}
              />
            </div>
            <button 
              className="hidden md:flex w-9 h-9 rounded-full bg-transparent text-on-surface-variant items-center justify-center cursor-pointer transition-colors hover:bg-surface-container-high hover:text-on-surface" 
              onClick={() => onNavigate('settings')}
              title="Settings"
            >
              <Settings size={20} strokeWidth={2} />
            </button>
            <button 
              className="hidden md:flex w-9 h-9 rounded-full bg-transparent text-on-surface-variant items-center justify-center cursor-pointer transition-colors hover:bg-surface-container-high hover:text-on-surface" 
              onClick={() => onNavigate('help')}
              title="Help Center"
            >
              <HelpCircle size={20} strokeWidth={2} />
            </button>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer"
            onClick={() => onNavigate('profile')}
          >
            <img 
              alt="User avatar" 
              className="w-8 h-8 rounded-full border border-outline-variant object-cover hover:border-primary transition-all shadow-sm" 
              src={user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnZ3E8X1IRNERQut9WUf356uZAIJpnr1PG42j8TaoX_XHzTZHXhT-KpQKE-dC6VTdwqkj-jbOibovk45uE_HizMCc70hdyAwcL2TidaO26m_sckadfC5J39QwCGNNSqdH0njMCmLQ9mk608iML0PMlEvoa2q3ryRLxyzpxtHj8GETUC-XI-o4xD0M6CpZZqoNJu1EjwSx_KGU1XdjwpJfvPC3ffuY1taAP__KYVI3yVrvy4K2LkWmd7gq3Pcuuvwmgd3jw0Bs-bnI"} 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface"></div>
          </motion.div>
        </div>
      </nav>
      
      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 right-0 p-4 bg-surface/95 backdrop-blur-xl border-b border-outline-variant z-40"
          >
            <GlobalSearch onNavigate={(tab) => { onNavigate(tab); setShowMobileSearch(false); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SideNavBar */}
      <aside className="hidden md:flex fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-surface/50 backdrop-blur-md border-r border-outline-variant flex-col py-6 z-40 transition-colors duration-300">
        <div className="px-5 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">Main Menu</p>
        </div>
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto sidebar-nav">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-primary text-on-primary shadow-soft border-transparent' 
                    : 'text-on-surface-variant bg-transparent border-transparent hover:bg-surface-container-high hover:text-on-surface'
                }`}
                onClick={() => { onNavigate(item.id); playTabSound(); }}
              >
                <div className="relative">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.id === 'inbox' && unreadDMCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-error text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-surface shadow-sm">
                      {unreadDMCount > 9 ? '9+' : unreadDMCount}
                    </span>
                  )}
                </div>
                {item.label}
              </button>
            );
          })}

          {user?.role === 'ADMIN' && (
            <div className="mt-4 pt-4 border-t border-outline-variant/50">
              <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">Management</p>
              <button
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all border border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20 w-full"
                onClick={() => navigate('/admin')}
              >
                <Shield size={18} strokeWidth={2} />
                Admin Console
              </button>
            </div>
          )}
        </nav>
        
        <div className="px-4 mt-auto flex flex-col gap-3 pt-4">
          {activeTab === 'home' && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-on-primary py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-soft hover:shadow-glow transition-all" 
              onClick={() => { setIsNewEntryOpen(true); playTabSound(); }}
            >
              <PlusCircle size={18} strokeWidth={2} />
              New Entry
            </motion.button>
          )}
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all border border-outline-variant text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high hover:text-on-surface w-full" 
            onClick={() => { logout(); playDeleteSound(); }}
          >
            <LogOut size={18} strokeWidth={2} />
            Log Out
          </button>
        </div>
      </aside>

      <NewEntryModal isOpen={isNewEntryOpen} onClose={() => setIsNewEntryOpen(false)} onNavigate={onNavigate} />
    </>
  );
}
