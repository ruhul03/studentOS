import { useNavigate } from 'react-router-dom';

export function SecuritySettings({ twoFactorEnabled, setTwoFactorEnabled, logout }) {
  const navigate = useNavigate();
  return (
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
  );
}
