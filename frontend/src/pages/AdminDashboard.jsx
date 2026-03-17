import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Activity, Trash2, UserPlus, ArrowLeft, MapPin, Plus, Edit2, Save, X, Phone, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'resources', 'marketplace', 'events', 'services' or 'analytics'
  const [trafficData, setTrafficData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [message, setMessage] = useState(null);
  
  // New/Edit State for Services
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', category: 'Library', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: ''
  });

  // User View Modal State
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

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
      const endpoints = [
        { url: '/api/admin/stats', setter: setStats },
        { url: '/api/admin/users', setter: setUsers },
        { url: '/api/admin/resources', setter: setResources },
        { url: '/api/admin/marketplace', setter: setMarketItems },
        { url: '/api/admin/events', setter: setEvents },
        { url: '/api/services', setter: setServices },
        { url: '/api/admin/traffic', setter: setTrafficData },
        { url: '/api/admin/analytics/growth', setter: setGrowthData },
        { url: '/api/admin/analytics/departments', setter: setDeptData },
        { url: '/api/admin/analytics/contributors', setter: setTopContributors }
      ];

      await Promise.all(endpoints.map(async ({ url, setter }) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`);
          if (res.ok) setter(await res.json());
        } catch (err) {
          console.error(`Failed to fetch from ${url}`, err);
        }
      }));
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
    if (!window.confirm('Are you sure you want to delete this user? ALL THEIR CONTENT will be removed. This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: 'User and all associated data purged successfully' });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errorData.message || 'Deletion failed due to integrity constraints' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to communicate with purge service' });
    }
  };

  const fetchUserActivity = async (userId) => {
    setModalLoading(true);
    setShowUserModal(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/activity`);
      if (res.ok) {
        setSelectedUserActivity(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch user activity', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const method = editingService ? 'PUT' : 'POST';
    const url = editingService 
      ? `${import.meta.env.VITE_API_URL}/api/services/${editingService.id}`
      : `${import.meta.env.VITE_API_URL}/api/services`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...serviceForm, adminName: user.name })
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingService) {
          setServices(services.map(s => s.id === saved.id ? saved : s));
          setMessage({ type: 'success', text: 'Service updated' });
        } else {
          setServices([...services, saved]);
          setMessage({ type: 'success', text: 'Service created' });
        }
        setEditingService(null);
        setServiceForm({ name: '', description: '', category: 'Library', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save service' });
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${serviceId}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter(s => s.id !== serviceId));
        setMessage({ type: 'success', text: 'Service removed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource asset?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
        setMessage({ type: 'success', text: 'Knowledge asset removed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete resource' });
    }
  };

  const handleDeleteMarketItem = async (id) => {
    if (!window.confirm('Remove this marketplace listing?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/marketplace/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMarketItems(marketItems.filter(m => m.id !== id));
        setMessage({ type: 'success', text: 'Listing removed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to remove listing' });
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Cancel this campus event?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
        setMessage({ type: 'success', text: 'Event cancelled' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel event' });
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

      <header className="admin-header glass-card">
        <div className="header-left">
          <button className="back-link-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            <span>Back to Hub</span>
          </button>
          <h1>System Control <span>Panel</span></h1>
        </div>
        <div className="admin-profile-section">
          <div className="admin-info-pill">
            <div className="role-badge admin">ADMIN ACCESS</div>
            <span className="admin-name">{user.name}</span>
          </div>
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
          Citizens
        </button>
        <button 
          className={`admin-tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <Shield size={18} />
          Knowledge
        </button>
        <button 
          className={`admin-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <Plus size={18} />
          Market
        </button>
        <button 
          className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Clock size={18} />
          Events
        </button>
          <button 
            className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <MapPin size={18} />
            Services
          </button>
          <button 
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Activity size={18} />
            Advanced Analytics
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
            <div className="stat-card glass-card clickable" onClick={() => setActiveTab('users')}>
              <h3>TOTAL CITIZENS</h3>
              <div className="stat-value">{stats.totalUsers}</div>
              <Users color="var(--aura-pink)" size={24} />
            </div>
            <div className="stat-card glass-card clickable" onClick={() => setActiveTab('resources')}>
              <h3>KNOWLEDGE ASSETS</h3>
              <div className="stat-value">{stats.totalResources}</div>
              <Activity color="#a855f7" size={24} />
            </div>
            <div className="stat-card glass-card clickable" onClick={() => setActiveTab('marketplace')}>
              <h3>MARKET LISTINGS</h3>
              <div className="stat-value">{stats.totalMarketplaceItems}</div>
              <Activity color="#10b981" size={24} />
            </div>
            <motion.div className="stat-card clickable" whileHover={{ y: -5 }} onClick={() => setActiveTab('events')}>
            <div className="stat-icon"><Activity /></div>
            <div className="stat-info">
              <h3>Campus Events</h3>
              <p className="stat-value">{stats?.totalEvents || 0}</p>
            </div>
          </motion.div>

          <motion.div className="stat-card clickable traffic" whileHover={{ y: -5 }} onClick={() => setActiveTab('analytics')}>
            <div className="stat-icon"><Activity /></div>
            <div className="stat-info">
              <h3>System Insights</h3>
              <p className="stat-value">{trafficData.reduce((acc, curr) => acc + curr.count, 0)} hits</p>
              <span className="stat-label">Active Monitoring</span>
            </div>
          </motion.div>
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
                          onClick={() => fetchUserActivity(u.id)}
                          title="View In-depth Profile"
                        >
                          <Activity size={16} />
                        </button>
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

        {activeTab === 'resources' && (
          <motion.div 
            key="resources"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="user-management-panel glass-card"
          >
            <table className="user-management-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Uploader</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="item-info-cell">
                        <div className="u-name">{r.title}</div>
                        <div className="u-handle">{r.courseCode}</div>
                      </div>
                    </td>
                    <td>{r.uploader?.name || 'Unknown'}</td>
                    <td><span className="cat-badge">{r.type}</span></td>
                    <td>
                      <button className="action-btn delete" onClick={() => handleDeleteResource(r.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'marketplace' && (
          <motion.div 
            key="marketplace"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="user-management-panel glass-card"
          >
            <table className="user-management-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Price</th>
                  <th>Seller</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketItems.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div className="item-info-cell">
                        <div className="u-name">{m.title}</div>
                        <div className="u-handle">{m.category}</div>
                      </div>
                    </td>
                    <td>{m.price} BDT</td>
                    <td>{m.sellerName}</td>
                    <td>
                      <button className="action-btn delete" onClick={() => handleDeleteMarketItem(m.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div 
            key="events"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="user-management-panel glass-card"
          >
            <table className="user-management-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="item-info-cell">
                        <div className="u-name">{e.title}</div>
                        <div className="u-handle">{e.location}</div>
                      </div>
                    </td>
                    <td>{e.organizerName}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>
                      <button className="action-btn delete" onClick={() => handleDeleteEvent(e.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div 
            key="services"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="service-management-panel"
          >
            <div className="management-layout">
                {/* Service Form */}
                <div className="glass-card management-form">
                    <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                    <form onSubmit={handleServiceSubmit}>
                        <div className="form-group-admin">
                            <label>Service Name</label>
                            <input 
                                type="text" 
                                value={serviceForm.name} 
                                onChange={e => setServiceForm({...serviceForm, name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group-admin">
                            <label>Category</label>
                            <select 
                                value={serviceForm.category} 
                                onChange={e => setServiceForm({...serviceForm, category: e.target.value})}
                                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                            >
                                <option style={{ background: '#1a1a2e', color: 'white' }}>Library</option>
                                <option style={{ background: '#1a1a2e', color: 'white' }}>Medical</option>
                                <option style={{ background: '#1a1a2e', color: 'white' }}>Food</option>
                                <option style={{ background: '#1a1a2e', color: 'white' }}>Transport</option>
                                <option style={{ background: '#1a1a2e', color: 'white' }}>Cafeteria</option>
                            </select>
                        </div>
                        <div className="form-group-admin">
                            <label>Location</label>
                            <input 
                                type="text" 
                                value={serviceForm.location} 
                                onChange={e => setServiceForm({...serviceForm, location: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group-admin">
                            <label>Operating Hours (HH:MM AM - HH:MM PM)</label>
                            <input 
                                type="text" 
                                value={serviceForm.operatingHours} 
                                onChange={e => setServiceForm({...serviceForm, operatingHours: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group-admin">
                            <label>Description</label>
                            <textarea 
                                value={serviceForm.description} 
                                onChange={e => setServiceForm({...serviceForm, description: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group-admin">
                            <label>Contact (Optional)</label>
                            <input 
                                type="text" 
                                value={serviceForm.contactInfo} 
                                onChange={e => setServiceForm({...serviceForm, contactInfo: e.target.value})} 
                            />
                        </div>
                        <div className="form-actions-admin">
                            <button type="submit" className="save-btn">
                                <Save size={18} /> {editingService ? 'Update' : 'Create'}
                            </button>
                            {editingService && (
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setEditingService(null);
                                    setServiceForm({ name: '', description: '', category: 'Library', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: '' });
                                }}>
                                    <X size={18} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Service List */}
                <div className="services-list-admin">
                    {services.map(s => (
                        <div key={s.id} className="glass-card service-admin-item">
                            <div className="service-info">
                                <h4>{s.name}</h4>
                                <span className="cat-badge">{s.category}</span>
                                <div className="audit-info">
                                    <Clock size={12} />
                                    <span>Last change by <strong>{s.lastModifiedBy || 'System'}</strong> at {s.lastModifiedAt ? new Date(s.lastModifiedAt).toLocaleString() : 'Initial'}</span>
                                </div>
                            </div>
                            <div className="action-btns">
                                <button className="action-btn" onClick={() => {
                                    setEditingService(s);
                                    setServiceForm({
                                        name: s.name, description: s.description, category: s.category,
                                        location: s.location, operatingHours: s.operatingHours, contactInfo: s.contactInfo || ''
                                    });
                                }}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteService(s.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="management-panel"
          >
            <div className="panel-header">
              <h2>Advanced Platform Analytics</h2>
              <p>Comprehensive insights into traffic, growth, and community engagement</p>
            </div>

            <div className="analytics-grid">
              {/* Traffic Chart */}
              <div className="analytics-card glass-card">
                <h3>API Traffic (Last 7 Days)</h3>
                <div className="chart-container">
                  <svg viewBox="0 0 400 200" className="viz-svg">
                    {trafficData.map((d, i) => {
                      const max = Math.max(...trafficData.map(td => td.count), 1);
                      const h = (d.count / max) * 150;
                      const x = 40 + (i * 50);
                      return (
                        <g key={i}>
                          <motion.rect initial={{height:0, y:170}} animate={{height:h, y:170-h}} x={x} width="30" rx="3" fill="var(--primary)" opacity="0.8" />
                          <text x={x+15} y="190" textAnchor="middle" fontSize="10" fill="var(--text-dim)">{new Date(d.date).getDate()}</text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="analytics-card glass-card">
                <h3>User Registrations (Last 30 Days)</h3>
                <div className="chart-container">
                  <svg viewBox="0 0 400 200" className="viz-svg">
                    <polyline
                      fill="none"
                      stroke="var(--aura-pink)"
                      strokeWidth="3"
                      points={growthData.map((d, i) => {
                        const max = Math.max(...growthData.map(gd => gd.count), 1);
                        const x = 20 + (i * (360 / (growthData.length || 1)));
                        const y = 170 - (d.count / max * 150);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {growthData.map((d, i) => (
                      <circle key={i} cx={20 + (i * (360 / (growthData.length || 1)))} cy={170 - (d.count / Math.max(...growthData.map(gd => gd.count), 1) * 150)} r="4" fill="white" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="analytics-card glass-card">
                <h3>Departmental Distribution</h3>
                <div className="chart-container">
                   <div className="dept-bars">
                      {deptData.slice(0, 5).map((dept, i) => (
                        <div key={i} className="dept-row">
                          <span className="dept-label">{dept.label}</span>
                          <div className="dept-progress-bg">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(dept.value / stats.totalUsers) * 100}%` }}
                              className="dept-progress-fill"
                            />
                          </div>
                          <span className="dept-value">{dept.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Top Contributors */}
              <div className="analytics-card glass-card">
                <h3>Top Contributors</h3>
                <div className="contributors-list">
                  {topContributors.map((c, i) => (
                    <div key={i} className="contributor-item">
                      <div className="rank">#{i+1}</div>
                      <div className="c-info">
                        <strong>{c.name}</strong>
                        <span>@{c.username}</span>
                      </div>
                      <div className="c-score">
                        <Star size={14} fill="gold" color="gold" />
                        {c.totalContributions} posts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUserModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-modal-overlay"
            onClick={() => { setShowUserModal(false); setSelectedUserActivity(null); }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="admin-modal-content glass-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Citizen Comprehensive Insights</h2>
                <button className="close-modal" onClick={() => { setShowUserModal(false); setSelectedUserActivity(null); }}>
                  <X size={20} />
                </button>
              </div>

              {modalLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Aggregating user behavior data...</p>
                </div>
              ) : selectedUserActivity ? (
                <div className="user-details-body">
                  <div className="details-grid">
                    <div className="info-section">
                      <h3>Identity Info</h3>
                      <p><strong>Full Name:</strong> {selectedUserActivity.user.name}</p>
                      <p><strong>Handle:</strong> @{selectedUserActivity.user.username}</p>
                      <p><strong>Email:</strong> {selectedUserActivity.user.email}</p>
                      <p><strong>Joined:</strong> {new Date(selectedUserActivity.user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="info-section">
                      <h3>Academic Context</h3>
                      <p><strong>Dept:</strong> {selectedUserActivity.user.department || 'Not Provided'}</p>
                      <p><strong>Batch:</strong> {selectedUserActivity.user.batch || 'Not Provided'}</p>
                      <p><strong>Student ID:</strong> {selectedUserActivity.user.studentId || 'Not Provided'}</p>
                    </div>
                  </div>

                  <div className="activity-tracking">
                    <h3>Recent Evidence (Uploads & Logs)</h3>
                    <div className="activity-lists">
                      <div className="activity-group">
                        <h4>Knowledge Assets ({selectedUserActivity.resources.length})</h4>
                        <ul>
                          {selectedUserActivity.resources.slice(0, 5).map(r => <li key={r.id}>{r.title} ({r.courseCode})</li>)}
                          {!selectedUserActivity.resources.length && <li>No assets uploaded.</li>}
                        </ul>
                      </div>
                      <div className="activity-group">
                        <h4>Marketplace Presence ({selectedUserActivity.marketplace.length})</h4>
                        <ul>
                          {selectedUserActivity.marketplace.slice(0, 5).map(m => <li key={m.id}>{m.title} - {m.price} BDT</li>)}
                          {!selectedUserActivity.marketplace.length && <li>No active listings.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Telemetry data unavailable.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
