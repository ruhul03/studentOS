import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, ShieldCheck, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO/SEO';

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, 5)].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (response.ok) {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Verification failed. Invalid or expired code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('A new verification code has been sent to your email.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to resend code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-lg text-on-surface">
      <SEO title="Verify Email | StudentOS" description="Verify your UIU email address." />
      
      <header className="w-full px-8 py-4 flex items-center justify-between border-b border-outline-variant/30 backdrop-blur-md fixed top-0 z-50">
        <div className="font-h3 text-xl font-bold tracking-tight text-primary cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
          <GraduationCap size={24} className="fill-current" />
          StudentOS
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 mt-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] bg-surface-container border border-outline-variant rounded-2xl p-8 shadow-2xl relative z-10 my-8"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <Mail size={32} />
          </div>

          <h1 className="font-h1 text-3xl font-bold text-on-surface mb-2">Check your email</h1>
          <p className="font-body-sm text-sm text-on-surface-variant mb-8">
            We've sent a 6-digit verification code to <strong className="text-on-surface">{email}</strong>.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error font-body-sm text-sm flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary font-body-sm text-sm flex items-start gap-2">
              <CheckCircle size={18} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center font-h2 text-2xl font-bold bg-surface-container-highest border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Verifying...' : 'Verify Email'} <ShieldCheck size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant font-body-sm mb-2">Didn't receive the code?</p>
            <button 
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-bold text-primary hover:text-primary-fixed transition-colors disabled:opacity-50"
            >
              Click to resend
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
