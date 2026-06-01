import { motion } from 'framer-motion';

export function UsernameRecoveryForm({ email, setEmail, handleForgotUsername, loading }) {
  return (
    <motion.form 
      key="username-form"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleForgotUsername}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label className="font-label-caps text-xs text-on-surface-variant">Recovery Email</label>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">mail</span>
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
        className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-caps text-sm tracking-wider hover:bg-primary-fixed transition-colors flex items-center justify-center shadow-[0_4px_20px_rgba(192,193,255,0.1)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {loading ? 'RECOVERING...' : 'SHOW USERNAME'}
      </button>
    </motion.form>
  );
}
