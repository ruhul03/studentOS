import { motion } from 'framer-motion';
import { KeyRound, Lock } from 'lucide-react';

export function PasswordResetForm({ 
  code, setCode, 
  newPassword, setNewPassword, 
  confirmPassword, setConfirmPassword, 
  handleResetPassword, 
  setResetStep, 
  loading 
}) {
  return (
    <motion.form 
      key="password-step-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleResetPassword}
      className="flex flex-col gap-5"
    >
      {/* Hidden inputs to trick Chrome aggressive autofill */}
      <input type="text" style={{ display: 'none' }} aria-hidden="true" autoComplete="username" />
      <input type="password" style={{ display: 'none' }} aria-hidden="true" autoComplete="current-password" />
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-xs text-on-surface-variant">Verification Code</label>
        <div className="relative flex items-center">
          <KeyRound size={18} className="absolute left-3 text-on-surface-variant opacity-70" />
          <input type="password" style={{display: 'none'}} />
          <input 
            type="text" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="6-digit code"
            autoComplete="off"
            className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-xs text-on-surface-variant">New Password</label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-3 text-on-surface-variant opacity-70" />
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-xs text-on-surface-variant">Confirm New Password</label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-3 text-on-surface-variant opacity-70" />
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
          />
        </div>
      </div>
      
      <div className="pt-2">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-label-caps text-sm tracking-wider hover:bg-secondary-fixed transition-colors flex items-center justify-center shadow-[0_4px_20px_rgba(78,222,163,0.1)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'RESETTING...' : 'RESET PASSWORD'}
        </button>
        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => setResetStep(1)} 
            className="font-body-sm text-sm text-primary hover:text-primary-fixed transition-colors font-medium bg-transparent border-none cursor-pointer"
          >
            Back to request code
          </button>
        </div>
      </div>
    </motion.form>
  );
}
