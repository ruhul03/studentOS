import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { playSuccessSound, playErrorSound } from '../utils/notificationSound';

export function useSettingsMutations() {
  const { user, updateUserData, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

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

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.settings?.twoFactorEnabled || false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await new Promise(r => setTimeout(r, 1000));
      updateUserData({
        ...accountInfo,
        settings: { notifications, privacy, twoFactorEnabled }
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

  return {
    user,
    accountInfo, setAccountInfo,
    notifications, setNotifications,
    privacy, setPrivacy,
    twoFactorEnabled, setTwoFactorEnabled,
    isSaving, saveStatus, handleSave,
    logout
  };
}
