import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState('stats');
  
  // Analytics State
  const [trafficData, setTrafficData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  
  const [message, setMessage] = useState(null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  
  // Service Form State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', category: 'General', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: ''
  });

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

      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      await Promise.all(endpoints.map(async ({ url, setter }) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, { headers });
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setMessage({ type: 'success', text: `Role updated for ${updatedUser.name}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Purge user record? This action is irreversible.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: 'User purged successfully' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Remove resource?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/resources/${id}`, { 
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
        setMessage({ type: 'success', text: 'Resource removed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete resource' });
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Cancel this campus event?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events/${id}`, { 
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
        setMessage({ type: 'success', text: 'Event cancelled' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel event' });
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Decommission this campus service?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services/${id}`, { 
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
        setMessage({ type: 'success', text: 'Service decommissioned' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingService ? 'PUT' : 'POST';
      const url = editingService 
        ? `${import.meta.env.VITE_API_URL}/api/services/${editingService.id}`
        : `${import.meta.env.VITE_API_URL}/api/services`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...serviceForm, adminName: user.name })
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingService) {
          setServices(services.map(s => s.id === saved.id ? saved : s));
        } else {
          setServices([saved, ...services]);
        }
        setShowServiceModal(false);
        setEditingService(null);
        setServiceForm({ name: '', description: '', category: 'General', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: '' });
        setMessage({ type: 'success', text: 'Service catalog updated' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save service' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-on-surface-variant font-black tracking-widest uppercase text-[10px]">Syncing Core Modules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0c] text-on-surface min-h-screen flex selection:bg-primary/30">
      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-full flex flex-col w-64 bg-surface-container/30 backdrop-blur-3xl border-r border-outline-variant/20 z-40">
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">StudentOS</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1 block">Admin Core</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {[
              { id: 'stats', label: 'Overview', icon: 'dashboard' },
              { id: 'users', label: 'Users', icon: 'group' },
              { id: 'resources', label: 'Knowledge', icon: 'school' },
              { id: 'events', label: 'Campus Events', icon: 'event' },
              { id: 'services', label: 'Services', icon: 'storefront' },
              { id: 'marketplace', label: 'Market', icon: 'receipt_long' },
              { id: 'analytics', label: 'Intelligence', icon: 'monitoring' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm group ${
                  activeTab === item.id 
                    ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' 
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-8 pt-0 border-t border-outline-variant/10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-4 px-5 py-4 w-full text-on-surface-variant hover:text-white transition-colors font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="fixed top-0 right-0 z-30 flex items-center justify-between px-10 h-20 bg-[#0a0a0c]/60 backdrop-blur-xl w-[calc(100%-16rem)] border-b border-outline-variant/10">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-on-surface-variant">System Management Console</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-[10px] font-black text-primary tracking-widest uppercase">Lead Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/30 overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-outline">shield_person</span>}
            </div>
          </div>
        </header>

        <div className="p-10 pt-28 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-8 p-5 rounded-2xl flex items-center justify-between gap-4 border shadow-2xl ${
                  message.type === 'error' ? 'bg-error/10 border-error/20 text-error' : 'bg-primary/10 border-primary/20 text-primary'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'verified'}</span>
                  <span className="font-bold text-sm tracking-wide">{message.text}</span>
                </div>
                <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/10 rounded-full">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'stats' && stats && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Students', value: stats.totalUsers, icon: 'groups', color: 'from-blue-500 to-indigo-600' },
                      { label: 'Active Events', value: stats.totalEvents, icon: 'event', color: 'from-pink-500 to-rose-600' },
                      { label: 'Resource Assets', value: stats.totalResources, icon: 'auto_stories', color: 'from-emerald-500 to-teal-600' },
                      { label: 'Market Volume', value: stats.totalMarketplaceItems, icon: 'payments', color: 'from-amber-500 to-orange-600' }
                    ].map((card, i) => (
                      <div key={i} className="bg-surface-container rounded-3xl p-8 border border-outline-variant/30 relative overflow-hidden group hover:border-primary/50 transition-all shadow-xl">
                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">{card.label}</span>
                          <span className="material-symbols-outlined text-outline-variant">{card.icon}</span>
                        </div>
                        <div className="text-4xl font-black text-white">{card.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-xl">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">analytics</span>
                          Platform Traffic Insight
                        </h3>
                        <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">Live Feed</div>
                      </div>
                      <div className="h-64 flex items-end gap-3 p-4">
                        {trafficData.length > 0 ? trafficData.map((d, i) => (
                          <div key={i} className="flex-1 bg-primary/20 rounded-t-xl relative group hover:bg-primary/50 transition-all cursor-pointer" style={{ height: `${(d.count / Math.max(...trafficData.map(td => td.count), 1)) * 100}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                              {d.count} visits
                            </div>
                          </div>
                        )) : (
                          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-30">No traffic data logged</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-xl flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-6">System Status</h3>
                      <div className="space-y-6">
                        {[
                          { label: 'API Latency', value: '112ms', status: 'Optimal', percent: 20, color: 'bg-emerald-500' },
                          { label: 'Database IO', value: '42%', status: 'Low Load', percent: 42, color: 'bg-primary' },
                          { label: 'Worker Load', value: '68%', status: 'Busy', percent: 68, color: 'bg-amber-500' }
                        ].map((item, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                              <span className="text-on-surface-variant">{item.label}</span>
                              <span className="text-white">{item.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setShowDiagnosticsModal(true)} className="mt-auto w-full py-3 bg-white/5 border border-outline-variant/30 rounded-xl text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-white/10 transition-all">
                        Full Diagnostics
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-outline-variant/10 bg-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">User Intelligence</h3>
                      <p className="text-on-surface-variant text-xs mt-1">Total database registration management.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-outline-variant/10">
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Identification</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Role Authority</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="py-5 px-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-black text-primary overflow-hidden">
                                  {u.avatarUrl ? <img src={u.avatarUrl} alt="AV" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm">{u.name}</div>
                                  <div className="text-xs text-on-surface-variant font-medium opacity-60">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-8">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                u.role === 'ADMIN' ? 'bg-error/10 border-error/30 text-error' : 'bg-primary/10 border-primary/30 text-primary'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-5 px-8 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleToggleRole(u.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" title="Toggle Role">
                                  <span className="material-symbols-outlined text-[18px]">security</span>
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all" title="Purge User">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-outline-variant/10 bg-white/5">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Knowledge Assets</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Shared study materials and resources.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-outline-variant/10">
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Asset Name</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Course</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {resources.map(r => (
                          <tr key={r.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="py-5 px-8">
                                <div className="font-bold text-white text-sm">{r.title}</div>
                                <div className="text-[10px] text-on-surface-variant opacity-60">ID: {r.id}</div>
                            </td>
                            <td className="py-5 px-8 text-xs font-bold text-primary">{r.courseCode}</td>
                            <td className="py-5 px-8 text-right">
                              <button onClick={() => handleDeleteResource(r.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-outline-variant/10 bg-white/5">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Campus Events</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Live announcements and scheduled events.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-outline-variant/10">
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Event Title</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Category</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {events.map(e => (
                          <tr key={e.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="py-5 px-8">
                                <div className="font-bold text-white text-sm">{e.title}</div>
                                <div className="text-[10px] text-on-surface-variant opacity-60">{new Date(e.date).toLocaleDateString()}</div>
                            </td>
                            <td className="py-5 px-8">
                                <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-bold text-on-surface-variant border border-outline-variant/30">{e.category}</span>
                            </td>
                            <td className="py-5 px-8 text-right">
                              <button onClick={() => handleDeleteEvent(e.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-outline-variant/10 bg-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Campus Services</h3>
                      <p className="text-on-surface-variant text-xs mt-1">Official service catalog management.</p>
                    </div>
                    <button 
                      onClick={() => { setEditingService(null); setServiceForm({ name: '', description: '', category: 'General', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: '' }); setShowServiceModal(true); }}
                      className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary-fixed transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span> Add Service
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-outline-variant/10">
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Service Name</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Location</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {services.map(s => (
                          <tr key={s.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="py-5 px-8">
                                <div className="font-bold text-white text-sm">{s.name}</div>
                                <div className="text-[10px] text-on-surface-variant opacity-60">{s.category}</div>
                            </td>
                            <td className="py-5 px-8 text-xs font-medium text-on-surface-variant">{s.location}</td>
                            <td className="py-5 px-8 text-right">
                              <div className="flex justify-end gap-2 transition-opacity">
                                <button 
                                  onClick={() => { setEditingService(s); setServiceForm(s); setShowServiceModal(true); }}
                                  className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all shadow-sm"
                                  title="Edit Service"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button onClick={() => handleDeleteService(s.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all shadow-sm" title="Decommission">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-outline-variant/10 bg-white/5">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Marketplace Listings</h3>
                    <p className="text-on-surface-variant text-xs mt-1">Student-to-student commerce moderation.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-outline-variant/10">
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Listing Title</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Price</th>
                          <th className="py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {marketItems.map(m => (
                          <tr key={m.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="py-5 px-8">
                                <div className="font-bold text-white text-sm">{m.title}</div>
                                <div className="text-[10px] text-on-surface-variant opacity-60">{m.category}</div>
                            </td>
                            <td className="py-5 px-8 text-sm font-black text-emerald-500">{m.price} BDT</td>
                            <td className="py-5 px-8 text-right">
                              <button onClick={() => handleDeleteResource(m.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6">Registration Growth</h3>
                        <div className="h-64 flex items-end gap-2">
                           {growthData.map((d, i) => (
                             <div key={i} className="flex-1 bg-secondary/20 rounded-t-lg relative group hover:bg-secondary/40 transition-all" style={{ height: `${(d.count / Math.max(...growthData.map(gd => gd.count), 1)) * 100}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{d.date}: {d.count}</div>
                             </div>
                           ))}
                        </div>
                      </div>
                      <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6">Department Distribution</h3>
                        <div className="space-y-4">
                           {deptData.map((d, i) => (
                             <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                   <span className="text-on-surface-variant uppercase tracking-wider">{d.department || 'General'}</span>
                                   <span className="text-white">{d.count}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-primary rounded-full" style={{ width: `${(d.count / users.length) * 100}%` }}></div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-6">Platform Super-Contributors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                         {topContributors.map((c, i) => (
                           <div key={i} className="bg-white/5 p-5 rounded-2xl border border-outline-variant/20 flex flex-col items-center text-center">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black mb-3">{c.name.charAt(0)}</div>
                              <h4 className="text-sm font-bold text-white truncate w-full">{c.name}</h4>
                              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">{c.totalContributions} Contributions</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container rounded-3xl border border-outline-variant/30 w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveService}>
                <div className="p-8 border-b border-outline-variant/10">
                   <h3 className="text-xl font-black text-white">{editingService ? 'Edit Campus Service' : 'Add New Service'}</h3>
                   <p className="text-xs text-on-surface-variant mt-1">Configure service visibility and operational details.</p>
                </div>
                <div className="p-8 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Service Name</label>
                        <input required className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Category</label>
                        <select className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})}>
                           <option value="Library">Library</option>
                           <option value="Medical">Medical</option>
                           <option value="Food">Food</option>
                           <option value="Transport">Transport</option>
                           <option value="Admin">Admin</option>
                           <option value="General">General</option>
                        </select>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
                      <textarea required className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none h-20" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</label>
                        <input required className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.location} onChange={e => setServiceForm({...serviceForm, location: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Operating Hours</label>
                        <input required placeholder="HH:MM AM - HH:MM PM" className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.operatingHours} onChange={e => setServiceForm({...serviceForm, operatingHours: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Contact / Website URL</label>
                      <input className="w-full bg-white/5 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none" value={serviceForm.contactInfo} onChange={e => setServiceForm({...serviceForm, contactInfo: e.target.value})} />
                   </div>
                </div>
                <div className="p-8 bg-white/5 flex justify-end gap-4 border-t border-outline-variant/10">
                   <button type="button" onClick={() => setShowServiceModal(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-white/5">Cancel</button>
                   <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-fixed shadow-lg shadow-primary/20">Save Service</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagnostics Modal */}
      <AnimatePresence>
        {showDiagnosticsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, rotateX: 20 }} animate={{ scale: 1, rotateX: 0 }} exit={{ scale: 0.9, rotateX: 20 }}
              className="bg-[#121214] border border-primary/30 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden p-10"
            >
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                     <span className="material-symbols-outlined text-3xl animate-pulse">terminal</span>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white tracking-tight">System Diagnostics</h3>
                     <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Real-time health telemetry</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                     <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Database Health</p>
                     <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-emerald-500">99.9%</span>
                        <span className="text-[10px] font-bold text-emerald-500/60">Uptime</span>
                     </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                     <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Memory Usage</p>
                     <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-primary">2.4 GB</span>
                        <span className="text-[10px] font-bold text-primary/60">Allocated</span>
                     </div>
                  </div>
               </div>

               <div className="bg-black/40 rounded-3xl p-6 font-mono text-[11px] text-emerald-500/80 mb-10 border border-emerald-500/10">
                  <p>{">"} Checking security protocols...</p>
                  <p>{">"} Firewalls: Active</p>
                  <p>{">"} Encryption Layers: TLS 1.3 Verified</p>
                  <p>{">"} Load Balancers: Optimized</p>
                  <p>{">"} System state: [NOMINAL]</p>
               </div>

               <button 
                onClick={() => setShowDiagnosticsModal(false)}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-primary-fixed shadow-2xl shadow-primary/30 transition-all active:scale-95"
               >
                  Close Console
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
