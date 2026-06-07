import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UsernameRecoveryForm } from './auth/UsernameRecoveryForm';
import { PasswordCodeRequestForm } from './auth/PasswordCodeRequestForm';
import { PasswordResetForm } from './auth/PasswordResetForm';
import { GraduationCap, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export function ForgotCredentials() {
  const [activeTab, setActiveTab] = useState('username'); // 'username' or 'password'
  const [resetStep, setResetStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotUsername = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Your username is: ${data.username}`);
      } else {
        const errText = await response.text();
        setError(errText || 'Could not find username for this email.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Reset code sent!');
        setResetStep(2);
      } else {
        const errText = await response.text();
        setError(errText || 'Failed to send reset code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, code }),
      });

      if (response.ok) {
        setMessage('Password reset successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errText = await response.text();
        setError(errText || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveForm = () => {
    if (activeTab === 'username') {
      return <UsernameRecoveryForm email={email} setEmail={setEmail} handleForgotUsername={handleForgotUsername} loading={loading} />;
    }

    if (activeTab === 'password') {
      if (resetStep === 1) {
        return <PasswordCodeRequestForm email={email} setEmail={setEmail} handleRequestResetCode={handleRequestResetCode} loading={loading} />;
      }
      if (resetStep === 2) {
        return <PasswordResetForm code={code} setCode={setCode} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} handleResetPassword={handleResetPassword} setResetStep={setResetStep} loading={loading} />;
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-lg text-on-surface">
      {/* Top Header */}
      <header className="w-full px-8 py-4 flex items-center justify-between border-b border-outline-variant/30 backdrop-blur-md fixed top-0 z-50">
        <div className="font-h3 text-xl font-bold tracking-tight text-primary cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
          <GraduationCap size={24} className="fill-current" />
          StudentOS
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 mt-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none max-md:hidden"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] bg-surface-container border border-outline-variant rounded-2xl p-8 shadow-2xl relative z-10 my-8"
        >
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 font-body-sm text-sm text-on-surface-variant hover:text-primary transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

          <div className="mb-8">
            <h1 className="font-h1 text-3xl font-bold text-on-surface mb-2">Account Recovery</h1>
            <p className="font-body-sm text-sm text-on-surface-variant">Recover your username or reset your password</p>
          </div>

          <div className="flex bg-surface-container-highest p-1 rounded-lg mb-8">
            <button 
              className={`flex-1 py-2 font-label-caps text-xs rounded-md transition-all ${activeTab === 'username' ? 'bg-surface shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => { setActiveTab('username'); setError(''); setMessage(''); }}
            >
              FORGOT USERNAME
            </button>
            <button 
              className={`flex-1 py-2 font-label-caps text-xs rounded-md transition-all ${activeTab === 'password' ? 'bg-surface shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => { setActiveTab('password'); setResetStep(1); setError(''); setMessage(''); }}
            >
              FORGOT PASSWORD
            </button>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary font-body-sm text-sm flex items-center gap-2"
              >
                <CheckCircle size={18} />
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error font-body-sm text-sm flex items-center gap-2"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {renderActiveForm()}
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
        </nav>
      </footer>
    </div>
  );
}
