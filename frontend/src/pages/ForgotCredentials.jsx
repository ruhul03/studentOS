import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Key, User, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import './Auth.css';

export function ForgotCredentials() {
  const [activeTab, setActiveTab] = useState('username'); // 'username' or 'password'
  const [email, setEmail] = useState('');
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
        body: JSON.stringify({ email, newPassword }),
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

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card forgot-card"
      >
        <button className="back-btn" onClick={() => navigate('/login')}>
          <ArrowLeft size={18} /> Back to Login
        </button>

        <h2>Account Recovery</h2>
        <p>Recover your username or reset your password</p>

        <div className="recovery-tabs">
          <button 
            className={`tab-btn ${activeTab === 'username' ? 'active' : ''}`}
            onClick={() => { setActiveTab('username'); setError(''); setMessage(''); }}
          >
            Forgot Username
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password'); setError(''); setMessage(''); }}
          >
            Forgot Password
          </button>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="recovery-message success"
            >
              <CheckCircle size={18} /> {message}
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="recovery-message error"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'username' ? (
          <form onSubmit={handleForgotUsername} key="username-form">
            <div className="form-group">
              <label><Mail size={16} /> Recovery Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. student@uiu.ac.bd"
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Recovering...' : 'Show Username'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} key="password-form">
            <div className="form-group">
              <label><Mail size={16} /> Recovery Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. student@uiu.ac.bd"
              />
            </div>
            <div className="form-group">
              <label><Key size={16} /> New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label><Key size={16} /> Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
