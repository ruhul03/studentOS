import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Activity, Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'users'
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
      const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setMessage({ type: 'success', text: `Role updated for ${updatedUser.username}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: 'User deleted successfully' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="spinner"></div>
        <p>Initializing Secure Admin Interface...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="background-glows">
        <div className="glow glow-1"></div>
        <div className="glow glow-3"></div>
      </div>

      <header className="admin-header">
        <div className="header-left">
          <button className="icon-btn" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={20} />
            <span>Back to Hub</span>
          </button>
          <h1>System Control <span>Panel</span></h1>
        </div>
        <div className="admin-profile">
          <div className="role-badge admin">ADMIN ACCESS</div>
          <span>{user.name}</span>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <Activity size={18} />
          Analytics
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          User Directory
        </button>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`admin-message ${message.type}`}
            onAnimationComplete={() => setTimeout(() => setMessage(null), 3000)}
          >
            {message.text}
          </motion.div>
        )}

        {activeTab === 'stats' && stats && (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="admin-stats-grid"
          >
            <div className="stat-card glass-card">
              <h3>TOTAL CITIZENS</h3>
              <div className="stat-value">{stats.totalUsers}</div>
              <Users color="#fb923c" size={24} />
            </div>
            <div className="stat-card glass-card">
              <h3>KNOWLEDGE ASSETS</h3>
              <div className="stat-value">{stats.totalResources}</div>
              <Activity color="#a855f7" size={24} />
            </div>
            <div className="stat-card glass-card">
              <h3>MARKET LISTINGS</h3>
              <div className="stat-value">{stats.totalMarketplaceItems}</div>
              <Activity color="#10b981" size={24} />
            </div>
            <div className="stat-card glass-card">
              <h3>CAMPUS EVENTS</h3>
              <div className="stat-value">{stats.totalEvents}</div>
              <Activity color="#3b82f6" size={24} />
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="user-management-panel glass-card"
          >
            <table className="user-management-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Status/Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-mini">{u.name.charAt(0)}</div>
                        <div>
                          <div className="u-name">{u.name}</div>
                          <div className="u-handle">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="action-btn" 
                          onClick={() => handleToggleRole(u.id)}
                          title="Toggle Admin Rights"
                        >
                          <Shield size={16} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteUser(u.id)}
                          title="Revoke Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
