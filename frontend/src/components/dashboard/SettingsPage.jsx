import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTabSound } from '../../utils/notificationSound';
import { useSettingsMutations } from '../../hooks/useSettingsMutations';

import { AccountSettings } from './settings/AccountSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { PrivacySettings } from './settings/PrivacySettings';
import { User, Bell, Shield, Lock, CheckCircle } from 'lucide-react';

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const {
    user,
    accountInfo, setAccountInfo,
    notifications, setNotifications,
    privacy, setPrivacy,
    twoFactorEnabled, setTwoFactorEnabled,
    isSaving, saveStatus, handleSave, logout
  } = useSettingsMutations();

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];

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
              <CheckCircle size={18} className="shrink-0" />
              Changes Saved Successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="md:col-span-4 flex flex-col gap-2 max-md:flex-row max-md:overflow-x-auto max-md:pb-4 no-scrollbar max-md:-mx-4 max-md:px-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); playTabSound(); }}
              className={`flex shrink-0 items-center gap-4 px-5 max-md:px-4 py-4 max-md:py-3 rounded-2xl max-md:rounded-xl transition-all font-bold text-sm group ${
                activeSection === section.id 
                  ? 'bg-primary text-on-primary shadow-xl shadow-primary/30' 
                  : 'text-on-surface-variant hover:bg-surface-container max-md:hover:bg-transparent hover:text-on-surface'
              }`}
            >
              <section.icon size={22} className={`${activeSection === section.id ? 'fill-current' : ''}`} />
              {section.label}
              {activeSection === section.id && (
                <motion.div layoutId="active-settings" className="ml-auto w-1.5 h-1.5 rounded-full bg-on-primary shadow-sm" />
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="md:col-span-8 bg-surface-container max-md:bg-transparent border border-outline-variant/30 max-md:border-none rounded-[2.5rem] max-md:rounded-none p-8 max-md:p-0 min-h-[550px] max-md:min-h-0 shadow-2xl max-md:shadow-none relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 max-md:hidden"></div>
          
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
                  <AccountSettings user={user} accountInfo={accountInfo} setAccountInfo={setAccountInfo} />
                )}
                {activeSection === 'notifications' && (
                  <NotificationSettings notifications={notifications} setNotifications={setNotifications} />
                )}
                {activeSection === 'security' && (
                  <SecuritySettings twoFactorEnabled={twoFactorEnabled} setTwoFactorEnabled={setTwoFactorEnabled} logout={logout} />
                )}
                {activeSection === 'privacy' && (
                  <PrivacySettings privacy={privacy} setPrivacy={setPrivacy} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-10 max-md:pt-6 mt-auto flex max-md:flex-col items-center justify-between gap-4 border-t border-outline-variant/10 max-md:border-t-0 relative z-10">
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
