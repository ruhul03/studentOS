import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('account');

  const sections = [
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'privacy', label: 'Privacy', icon: 'lock' }
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface">
          System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Settings</span>
        </h1>
        <p className="text-on-surface-variant text-base mt-1">Manage your account preferences and platform experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="md:col-span-4 flex flex-col gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                activeSection === section.id 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
              {section.label}
              {activeSection === section.id && (
                <motion.div layoutId="active-settings" className="ml-auto w-1.5 h-1.5 rounded-full bg-on-primary" />
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="md:col-span-8 bg-surface-container rounded-3xl border border-outline-variant/30 p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'account' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-outline-variant/20">
                    <div className="relative group">
                      <img 
                        src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnZ3E8X1IRNERQut9WUf356uZAIJpnr1PG42j8TaoX_XHzTZHXhT-KpQKE-dC6VTdwqkj-jbOibovk45uE_HizMCc70hdyAwcL2TidaO26m_sckadfC5J39QwCGNNSqdH0njMCmLQ9mk608iML0PMlEvoa2q3ryRLxyzpxtHj8GETUC-XI-o4xD0M6CpZZqoNJu1EjwSx_KGU1XdjwpJfvPC3ffuY1taAP__KYVI3yVrvy4K2LkWmd7gq3Pcuuvwmgd3jw0Bs-bnI"} 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-xl"
                        alt="Profile"
                      />
                      <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg border-2 border-surface transition-transform hover:scale-110">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-on-surface">{user?.name || 'Student Name'}</h2>
                      <p className="text-on-surface-variant text-sm font-medium">{user?.email || 'email@uiu.ac.bd'}</p>
                      <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest">
                        Standard Account
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name}
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email}
                        disabled
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface-variant opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Student ID</label>
                      <input 
                        type="text" 
                        placeholder="0112xxxx"
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+880 1xxx xxxxxx"
                        className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold text-on-surface mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'email_tasks', label: 'Email Reminders for Tasks', desc: 'Get notified 24h before task deadlines.' },
                      { id: 'email_market', label: 'New Marketplace Messages', desc: 'Alert me when someone inquires about my listing.' },
                      { id: 'push_events', label: 'Campus Event Alerts', desc: 'Real-time notifications for upcoming university events.' },
                      { id: 'push_resources', label: 'Resource Updates', desc: 'Notify when new materials are shared for my courses.' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{item.label}</p>
                          <p className="text-xs text-on-surface-variant">{item.desc}</p>
                        </div>
                        <div className="w-10 h-6 rounded-full bg-primary/20 relative p-1 cursor-pointer">
                          <div className="w-4 h-4 rounded-full bg-primary ml-auto shadow-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold text-on-surface mb-6">Interface Customization</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-black border-2 border-primary flex flex-col items-center gap-3 cursor-pointer">
                      <span className="material-symbols-outlined text-primary text-3xl">dark_mode</span>
                      <p className="text-xs font-black text-primary tracking-widest uppercase">Dark Mode</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-outline-variant/30 flex flex-col items-center gap-3 cursor-pointer">
                      <span className="material-symbols-outlined text-slate-400 text-3xl">light_mode</span>
                      <p className="text-xs font-black text-slate-400 tracking-widest uppercase">Light Mode</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider ml-1">Accent Color</h3>
                    <div className="flex gap-4">
                      {['#6366f1', '#ec4899', '#10b981', '#f59e0b'].map((color) => (
                        <div key={color} className="w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110 shadow-lg" style={{ backgroundColor: color, border: color === '#6366f1' ? '3px solid white' : 'none' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security, Privacy placeholders would go here */}
              {(activeSection === 'security' || activeSection === 'privacy') && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">construction</span>
                  <h2 className="text-xl font-bold text-on-surface mb-2">{sections.find(s => s.id === activeSection).label} Center</h2>
                  <p className="text-on-surface-variant text-sm max-w-sm">These advanced settings are being optimized for the next StudentOS core update.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
