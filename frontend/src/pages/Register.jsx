import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { motion } from 'framer-motion';

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
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="auth-card"
      >
        <h2>{step === 1 ? 'Join StudentOS' : 'Verify Email'}</h2>
        <p>{step === 1 ? 'Create your university account' : `Enter the 6-digit code sent to ${email}`}</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="e.g. Ruhul Amin"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="e.g. ruhul03"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="e.g. student@bscse.uiu.ac.bd"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input 
                type="text" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                required 
                placeholder="000000"
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="text-btn" 
              style={{ marginTop: '1rem', width: '100%', opacity: 0.7, background: 'none', border: 'none', color: 'var(--aura-purple)', cursor: 'pointer' }}
            >
              Back to Registration
            </button>
          </form>
        )}
        
        <div className="auth-links">
          <span>Already have an account? </span>
          <a href="/login">Log in</a>
        </div>
      </motion.div>
    </div>
  );
}
