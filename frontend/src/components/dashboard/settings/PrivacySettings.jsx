import { motion } from 'framer-motion';
import { playToggleSound } from '../../../utils/notificationSound';

export function PrivacySettings({ privacy, setPrivacy }) {
  const privacyItems = [
    { id: 'publicProfile', label: 'Public Profile Visibility', desc: 'Allow other students to see your active marketplace listings and reviews.', state: privacy.publicProfile },
    { id: 'shareEmail', label: 'Contact Information Sharing', desc: 'Show your university email on your public profile cards.', state: privacy.shareEmail },
    { id: 'analytics', label: 'Anonymous Usage Analytics', desc: 'Help us improve StudentOS by sharing anonymous platform interaction data.', state: privacy.analytics }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-on-surface tracking-tight">Privacy Settings</h2>
        <p className="text-sm text-on-surface-variant font-medium opacity-70">Control your digital footprint and data sharing visibility.</p>
      </div>

      <div className="space-y-4">
          {privacyItems.map((item) => (
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
  );
}
