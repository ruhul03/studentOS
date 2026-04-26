import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Register, 2: Verify
  const [verificationCode, setVerificationCode] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const isValidEmail = (email) => {
    // Restrict to *.uiu.ac.bd domains
    const regex = /^[\w-\.]+@([\w-]+\.)?uiu\.ac\.bd$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please use a valid UIU email address (e.g., student@bscse.uiu.ac.bd).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (response.ok) {
        setStep(2);
        setError('');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (response.ok) {
        navigate('/login', { state: { message: 'Verification successful! Please log in.' } });
      } else {
        const errorText = await response.text();
        setError(errorText || 'Invalid verification code.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-lg text-on-surface">
      {/* Top Header */}
      <header className="w-full px-8 py-4 flex items-center justify-between border-b border-outline-variant/30 backdrop-blur-md fixed top-0 z-50">
        <div className="font-h3 text-xl font-bold tracking-tight text-primary cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          StudentOS
        </div>
        <nav>
          <a href="#" className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors">Support</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 mt-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] bg-surface-container border border-outline-variant rounded-2xl p-8 shadow-2xl relative z-10 my-8"
        >
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              {step === 1 ? 'how_to_reg' : 'mark_email_read'}
            </span>
            <h1 className="font-h1 text-3xl font-bold text-on-surface mb-2">
              {step === 1 ? 'Join StudentOS' : 'Verify Email'}
            </h1>
            <p className="font-body-sm text-sm text-on-surface-variant">
              {step === 1 ? 'Create your academic workspace.' : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error font-body-sm text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} 
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-on-surface-variant">Full Name</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">person</span>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder="Jane Doe"
                      className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-on-surface-variant">Username</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">alternate_email</span>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                      placeholder="janedoe99"
                      className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-on-surface-variant">Email</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">mail</span>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="jane@uiu.ac.bd"
                      className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-on-surface-variant">Password</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">lock</span>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-caps text-sm tracking-wider hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(192,193,255,0.1)] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'REGISTERING...' : 'REGISTER'}
                    {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                  </button>
                  <div className="text-center mt-6">
                    <span className="font-body-sm text-sm text-on-surface-variant">Already have an account? </span>
                    <Link to="/login" className="text-primary font-semibold hover:text-primary-fixed transition-colors ml-1 text-sm">Log in</Link>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="verify-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify} 
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-on-surface-variant text-center">Verification Code</label>
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="text" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} 
                      required 
                      placeholder="000000"
                      maxLength={6}
                      className="w-full text-center bg-surface-container-highest border border-outline-variant rounded-lg py-4 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-2xl tracking-[0.5em]"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading || verificationCode.length !== 6} 
                    className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-label-caps text-sm tracking-wider hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(78,222,163,0.1)] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'VERIFYING...' : 'VERIFY ACCOUNT'}
                    {!loading && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                  </button>
                  <div className="text-center mt-6">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="font-body-sm text-sm text-primary hover:text-primary-fixed transition-colors font-medium bg-transparent border-none cursor-pointer"
                    >
                      Back to Registration
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-6 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto bg-surface-container-lowest z-10">
        <div className="font-body-sm text-xs text-on-surface-variant">
          © 2026 StudentOS Academic Systems
        </div>
        <nav className="flex gap-6 font-body-sm text-xs text-on-surface-variant">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <a href="#" className="hover:text-primary transition-colors">Accessibility</a>
        </nav>
      </footer>
    </div>
  );
}
