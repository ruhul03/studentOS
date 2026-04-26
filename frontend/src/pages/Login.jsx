import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        login(data);
        navigate('/dashboard');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
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
      <main className="flex-1 flex items-center justify-center p-4 mt-16 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] bg-surface-container border border-outline-variant rounded-2xl p-8 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="font-h1 text-3xl font-bold text-on-surface mb-2">Welcome Back</h1>
            <p className="font-body-sm text-sm text-on-surface-variant">Sign in to continue to your academic dashboard.</p>
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
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-xs text-on-surface-variant">Email or Username</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">person</span>
                <input 
                  type="text" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="student@university.edu or username"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-xs text-on-surface-variant">Password</label>
                <Link to="/forgot-credentials" className="font-body-sm text-xs text-primary hover:text-primary-fixed transition-colors font-medium">Forgot Password?</Link>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant opacity-70">lock</span>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-sm"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-caps text-sm tracking-wider hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(192,193,255,0.1)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'LOGGING IN...' : 'LOG IN'}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-8 font-body-sm text-sm text-on-surface-variant">
            Don't have an account? <Link to="/register" className="text-primary font-semibold hover:text-primary-fixed transition-colors ml-1">Register here</Link>
          </div>
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
