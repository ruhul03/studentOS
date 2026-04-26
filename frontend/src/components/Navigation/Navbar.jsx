import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';
import { NotificationPanel } from '../Notifications/NotificationPanel';
import { useAuth } from '../../context/AuthContext';
import { NewEntryModal } from './NewEntryModal';

export function Navbar({ activeTab, onNavigate, wsNotifications }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  // Mapping site features to the side nav
  const navItems = [
    { id: 'home', icon: 'dashboard', label: 'Dashboard' },
    { id: 'resources', icon: 'folder', label: 'Resources' },
    { id: 'planner', icon: 'calendar_month', label: 'Planner' },
    { id: 'services', icon: 'menu_book', label: 'Services' },
    { id: 'lostfound', icon: 'search', label: 'Lost & Found' },
    { id: 'market', icon: 'storefront', label: 'Market' },
    { id: 'events', icon: 'event', label: 'Events' },
    { id: 'reviews', icon: 'rate_review', label: 'Reviews' },
    { id: 'calculator', icon: 'calculate', label: 'UIU Calc' }
  ];

  return (
    <>
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 grid grid-cols-3 items-center px-8 h-16 bg-background/95 backdrop-blur-md border-b border-surface-variant/30">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <span className="font-h2 text-xl font-black text-on-background tracking-tighter cursor-pointer" onClick={() => onNavigate('home')}>StudentOS</span>
        </div>

        {/* Center: Search */}
        <div className="flex justify-center">
          <div className="hidden lg:block w-full max-w-md">
            <GlobalSearch onNavigate={onNavigate} />
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-0 border-r border-surface-variant/30 pr-4">
            <NotificationPanel 
              show={showNotificationPanel} 
              toggleShow={() => setShowNotificationPanel(!showNotificationPanel)} 
              wsNotifications={wsNotifications} 
              onNavigate={onNavigate} 
            />
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-transparent border-none text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors hover:text-primary" 
              onClick={() => onNavigate('settings')}
              title="Settings"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(var(--secondary-rgb), 0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-transparent border-none text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors hover:text-secondary" 
              onClick={() => onNavigate('help')}
              title="Help Center"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>help</span>
            </motion.button>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <img 
              alt="User avatar" 
              className="w-9 h-9 rounded-xl border-2 border-surface-variant/50 object-cover cursor-pointer hover:border-primary transition-all shadow-md" 
              onClick={() => onNavigate('profile')}
              src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnZ3E8X1IRNERQut9WUf356uZAIJpnr1PG42j8TaoX_XHzTZHXhT-KpQKE-dC6VTdwqkj-jbOibovk45uE_HizMCc70hdyAwcL2TidaO26m_sckadfC5J39QwCGNNSqdH0njMCmLQ9mk608iML0PMlEvoa2q3ryRLxyzpxtHj8GETUC-XI-o4xD0M6CpZZqoNJu1EjwSx_KGU1XdjwpJfvPC3ffuY1taAP__KYVI3yVrvy4K2LkWmd7gq3Pcuuvwmgd3jw0Bs-bnI"} 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-full border-2 border-surface shadow-sm"></div>
          </motion.div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="hidden md:flex fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-surface-container border-r border-surface-variant flex-col py-8 z-40">
        <div className="px-8 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
          </div>
          <div>
            <h2 className="font-h3 text-sm font-bold text-on-surface m-0 leading-tight">Academic Year</h2>
            <p className="font-body-sm text-xs text-on-surface-variant m-0">2025-2026</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto sidebar-nav">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-r-4 border-r-primary border-t-transparent border-b-transparent border-l-transparent rounded-r-none' 
                    : 'text-on-surface-variant bg-transparent border-transparent hover:bg-surface-container-high hover:text-on-surface'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          {user?.role === 'ADMIN' && (
            <div className="mt-6 pt-6 border-t border-surface-variant/30">
              <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Management</p>
              <button
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl cursor-pointer transition-all border border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20 w-full"
                onClick={() => navigate('/admin')}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                Admin Console
              </button>
            </div>
          )}
        </nav>
        
        <div className="px-6 mt-auto flex flex-col gap-6 pt-4">
          {activeTab === 'home' && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="global-new-entry-btn" 
              className="w-full bg-gradient-to-tr from-primary to-[#A855F7] text-on-primary py-3 px-4 border-none rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" 
              onClick={() => setIsNewEntryOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              New Entry
            </motion.button>
          )}
          <button 
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded cursor-pointer transition-all border border-transparent text-on-surface-variant bg-transparent hover:bg-surface-container-high hover:text-on-surface w-full text-left" 
            onClick={logout}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
            Log Out
          </button>
        </div>
      </aside>

      <NewEntryModal isOpen={isNewEntryOpen} onClose={() => setIsNewEntryOpen(false)} onNavigate={onNavigate} />
    </>
  );
}
