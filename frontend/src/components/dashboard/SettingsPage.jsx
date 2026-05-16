import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playToggleSound, playSuccessSound, playErrorSound, playTabSound } from '../../utils/notificationSound';

export function SettingsPage() {
  const { user, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.settings?.twoFactorEnabled || false);

  // Local state for settings
  const [accountInfo, setAccountInfo] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    phone: user?.phone || ''
  });

  const [notifications, setNotifications] = useState(user?.settings?.notifications || {
    email_tasks: true,
    email_market: true,
    push_events: false,
    push_resources: true
  });



  const [privacy, setPrivacy] = useState(user?.settings?.privacy || {
    publicProfile: true,
    shareEmail: false,
    analytics: true
  });

  const sections = [
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'privacy', label: 'Privacy', icon: 'lock' }
  ];



  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      updateUserData({
        ...accountInfo,
        settings: {
          notifications,
          privacy,
          twoFactorEnabled
        }
      });
      setSaveStatus('success');
      playSuccessSound();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      playErrorSound();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Settings</span>
          </h1>
          <p className="text-on-surface-variant text-base mt-1 font-medium opacity-80">Manage your account preferences and platform experience.</p>
        </div>
        
        <AnimatePresence>
          {saveStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Changes Saved Successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="md:col-span-4 flex flex-col gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); playTabSound(); }}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm group ${
                activeSection === section.id 
                  ? 'bg-primary text-on-primary shadow-xl shadow-primary/30' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activeSection === section.id ? "'FILL' 1" : "'FILL' 0" }}>{section.icon}</span>
              {section.label}
              {activeSection === section.id && (
                <motion.div layoutId="active-settings" className="ml-auto w-1.5 h-1.5 rounded-full bg-on-primary shadow-sm" />
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="md:col-span-8 bg-surface-container border border-outline-variant/30 rounded-[2.5rem] p-8 min-h-[550px] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          
          <div className="flex-1 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'account' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-8 pb-10 border-b border-outline-variant/10">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                          src={user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnZ3E8X1IRNERQut9WUf356uZAIJpnr1PG42j8TaoX_XHzTZHXhT-KpQKE-dC6VTdwqkj-jbOibovk45uE_HizMCc70hdyAwcL2TidaO26m_sckadfC5J39QwCGNNSqdH0njMCmLQ9mk608iML0PMlEvoa2q3ryRLxyzpxtHj8GETUC-XI-o4xD0M6CpZZqoNJu1EjwSx_KGU1XdjwpJfvPC3ffuY1taAP__KYVI3yVrvy4K2LkWmd7gq3Pcuuvwmgd3jw0Bs-bnI"} 
                          className="w-28 h-28 rounded-[2rem] object-cover border-4 border-surface shadow-2xl relative z-10"
                          alt="Profile"
                        />
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-2xl border-4 border-surface transition-all hover:scale-110 active:scale-95 z-20">
                          <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        </button>
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-on-surface tracking-tight">{user?.name || 'Student Name'}</h2>
                        <p className="text-on-surface-variant text-base font-semibold opacity-70">{user?.email || 'email@uiu.ac.bd'}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {user?.role || 'STUDENT'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Verified Account
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input 
                          type="text" 
                          value={accountInfo.name}
                          onChange={(e) => setAccountInfo({...accountInfo, name: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email (Immutable)</label>
                        <input 
                          type="email" 
                          value={user?.email}
                          disabled
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface-variant font-bold text-sm opacity-40 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Student ID</label>
                        <input 
                          type="text" 
                          placeholder="0112xxxx"
                          value={accountInfo.studentId}
                          onChange={(e) => setAccountInfo({...accountInfo, studentId: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="+880 1xxx xxxxxx"
                          value={accountInfo.phone}
                          onChange={(e) => setAccountInfo({...accountInfo, phone: e.target.value})}
                          className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-on-surface tracking-tight">Notification Channels</h2>
                      <p className="text-sm text-on-surface-variant font-medium opacity-70">Define how the system communicates critical updates.</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { id: 'email_tasks', label: 'Email Reminders for Tasks', desc: 'Get notified 24h before task deadlines.' },
                        { id: 'email_market', label: 'New Marketplace Messages', desc: 'Alert me when someone inquires about my listing.' },
                        { id: 'push_events', label: 'Campus Event Alerts', desc: 'Real-time notifications for upcoming university events.' },
                        { id: 'push_resources', label: 'Resource Updates', desc: 'Notify when new materials are shared for my courses.' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/30 transition-all group">
                          <div>
                            <p className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{item.label}</p>
                            <p className="text-xs text-on-surface-variant font-medium opacity-80">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => { setNotifications({...notifications, [item.id]: !notifications[item.id]}); playToggleSound(); }}
                            className={`w-12 h-7 rounded-full relative p-1 transition-all flex items-center ${
                              notifications[item.id] ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/30'
                            }`}
                          >
                            <motion.div 
                              layout
                              className={`w-5 h-5 rounded-full shadow-lg ${notifications[item.id] ? 'bg-on-primary ml-auto' : 'bg-outline-variant'}`} 
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {activeSection === 'security' && (
                  <div className="space-y-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-on-surface tracking-tight">Security Center</h2>
                      <p className="text-sm text-on-surface-variant font-medium opacity-70">Enhance your account protection and access controls.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-surface-container-high border border-outline-variant/20 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <span className="material-symbols-outlined">password</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-on-surface">Change Password</p>
                              <p className="text-xs text-on-surface-variant font-medium">Update your account authentication credentials.</p>
                            </div>
                          </div>
                          <button onClick={() => navigate('/forgot-credentials')} className="px-5 py-2.5 bg-white/5 border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface hover:bg-white/10 transition-all">Update</button>
                        </div>
                        
                        <div className="border-t border-outline-variant/10 pt-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                              <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-on-surface">Two-Factor Authentication</p>
                              <p className="text-xs text-on-surface-variant font-medium">Add an extra layer of security to your account.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className={`px-5 py-2.5 ${twoFactorEnabled ? 'bg-error text-on-error shadow-error/20' : 'bg-emerald-500 text-on-primary shadow-emerald-500/20'} rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all`}
                          >
                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-error/5 border border-error/20 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
                              <span className="material-symbols-outlined">heart_broken</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-error">Terminate All Sessions</p>
                              <p className="text-xs text-error/60 font-medium">Force logout from all other devices and browsers.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                               logout();
                               navigate('/login');
                            }}
                            className="px-5 py-2.5 bg-error text-on-error rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-error/20"
                          >
                            Purge Sessions
                          </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'privacy' && (
                  <div className="space-y-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-on-surface tracking-tight">Privacy Settings</h2>
                      <p className="text-sm text-on-surface-variant font-medium opacity-70">Control your digital footprint and data sharing visibility.</p>
                    </div>

                    <div className="space-y-4">
                       {[
                         { id: 'publicProfile', label: 'Public Profile Visibility', desc: 'Allow other students to see your active marketplace listings and reviews.', state: privacy.publicProfile },
                         { id: 'shareEmail', label: 'Contact Information Sharing', desc: 'Show your university email on your public profile cards.', state: privacy.shareEmail },
                         { id: 'analytics', label: 'Anonymous Usage Analytics', desc: 'Help us improve StudentOS by sharing anonymous platform interaction data.', state: privacy.analytics }
                       ].map((item) => (
                         <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-surface-container-high border border-outline-variant/20">
                           <div className="max-w-[75%]">
                             <p className="text-sm font-black text-on-surface">{item.label}</p>
                             <p className="text-xs text-on-surface-variant font-medium opacity-80">{item.desc}</p>
                           </div>
                           <button 
                             onClick={() => { setPrivacy({...privacy, [item.id]: !item.state}); playToggleSound(); }}
                             className={`w-12 h-7 rounded-full relative p-1 transition-all flex items-center ${
                               item.state ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/30'
                             }`}
                           >
                             <motion.div 
                               layout
                               className={`w-5 h-5 rounded-full shadow-lg ${item.state ? 'bg-on-primary ml-auto' : 'bg-outline-variant'}`} 
                             />
                           </button>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-10 mt-auto flex items-center justify-between border-t border-outline-variant/10 relative z-10">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Last synchronized: {new Date().toLocaleTimeString()}</p>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-10 py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3`}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  Saving Updates...
                </>
              ) : (
                'Save All Changes'
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
