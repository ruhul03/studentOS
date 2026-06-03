import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export function PasswordCodeRequestForm({ email, setEmail, handleRequestResetCode, loading }) {
  return (
    <motion.form 
      key="password-step-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleRequestResetCode}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-xs text-on-surface-variant">Recovery Email</label>
        <div className="relative flex items-center">
          <Mail size={18} className="absolute left-3 text-on-surface-variant opacity-70" />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. student@uiu.ac.bd"
            className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
          />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-caps text-sm tracking-wider hover:bg-primary-fixed transition-colors flex items-center justify-center shadow-[0_4px_20px_rgba(192,193,255,0.1)] disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
      >
        {loading ? 'SENDING CODE...' : 'SEND RESET CODE'}
      </button>
    </motion.form>
  );
}
