import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { motion } from 'framer-motion';

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
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="auth-card"
      >
        <h2>Welcome Back</h2>
        <p>Log in to your StudentOS account</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Username</label>
            <input 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="student@university.edu or username"
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
            />
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-links">
          <span>Don't have an account? </span>
          <a href="/register">Register here</a>
          <div style={{ marginTop: '1rem' }}>
            <a href="/forgot-credentials" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Forgot Username or Password?</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
