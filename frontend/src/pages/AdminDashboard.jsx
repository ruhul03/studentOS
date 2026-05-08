import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../api';

// Sub-components
import { TabOverview } from '../components/admin/TabOverview';
import { TabUsers } from '../components/admin/TabUsers';
import { TabResources } from '../components/admin/TabResources';
import { TabEvents } from '../components/admin/TabEvents';
import { TabServices } from '../components/admin/TabServices';
import { TabMarketplace } from '../components/admin/TabMarketplace';
import { TabAnalytics } from '../components/admin/TabAnalytics';
import { ServiceModal } from '../components/admin/ServiceModal';
import { DiagnosticsModal } from '../components/admin/DiagnosticsModal';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [message, setMessage] = useState(null);
  
  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState({
    traffic: [],
    growth: [],
    departments: [],
    contributors: []
  });

  // Modal States
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', category: 'General', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        { url: '/api/admin/stats', setter: setStats },
        { url: '/api/admin/health', setter: setHealth },
        { url: '/api/admin/users', setter: setUsers },
        { url: '/api/admin/resources', setter: setResources },
        { url: '/api/admin/marketplace', setter: setMarketItems },
        { url: '/api/admin/events', setter: setEvents },
        { url: '/api/services', setter: setServices },
        { url: '/api/admin/analytics/growth', setter: (data) => setAnalytics(prev => ({ ...prev, growth: data })) },
        { url: '/api/admin/analytics/departments', setter: (data) => setAnalytics(prev => ({ ...prev, departments: data })) },
        { url: '/api/admin/analytics/contributors', setter: (data) => setAnalytics(prev => ({ ...prev, contributors: data })) }
      ];

      await Promise.all(endpoints.map(async ({ url, setter }) => {
        try {
          const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}${url}`);
          if (res.ok) setter(await res.json());
        } catch (err) {
          console.error(`Failed to fetch from ${url}`, err);
        }
      }));
    } catch (err) {
      setMessage({ type: 'error', text: 'Critical system synchronization failure' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  // Generic Action Handler
  const handleAction = async (confirmMsg, url, method, successMsg, updateState) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}${url}`, { method });
      if (res.ok) {
        if (updateState) updateState(await res.json());
        setMessage({ type: 'success', text: successMsg });
        return true;
      }
      const err = await res.text();
      throw new Error(err);
    } catch (err) {
      setMessage({ type: 'error', text: `Operation failed: ${err.message || 'Unknown error'}` });
      return false;
    }
  };

  const handleToggleRole = (userId) => 
    handleAction(null, `/api/admin/users/${userId}/role`, 'PATCH', 'Role updated successfully', 
      (updated) => setUsers(users.map(u => u.id === userId ? updated : u)));

  const handleDeleteUser = (userId) => 
    handleAction('Purge user record? This action is irreversible.', `/api/admin/users/${userId}`, 'DELETE', 'User purged successfully', 
      () => setUsers(users.filter(u => u.id !== userId)));

  const handleDeleteResource = (id) => 
    handleAction('Remove resource?', `/api/admin/resources/${id}`, 'DELETE', 'Resource removed', 
      () => setResources(resources.filter(r => r.id !== id)));

  const handleDeleteEvent = (id) => 
    handleAction('Cancel this campus event?', `/api/admin/events/${id}`, 'DELETE', 'Event cancelled', 
      () => setEvents(events.filter(e => e.id !== id)));

  const handleDeleteService = (id) => 
    handleAction('Decommission this campus service?', `/api/services/${id}`, 'DELETE', 'Service decommissioned', 
      () => setServices(services.filter(s => s.id !== id)));

  const handleDeleteMarketItem = (id) => 
    handleAction('Remove marketplace listing?', `/api/admin/marketplace/${id}`, 'DELETE', 'Listing removed', 
      () => setMarketItems(marketItems.filter(m => m.id !== id)));

  const handleSaveService = async (e) => {
    e.preventDefault();
    const method = editingService ? 'PUT' : 'POST';
    const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
    
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}${url}`, {
        method,
        body: JSON.stringify({ ...serviceForm, adminName: user.name })
      });

      if (res.ok) {
        const saved = await res.json();
        setServices(editingService ? services.map(s => s.id === saved.id ? saved : s) : [saved, ...services]);
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

  const menuItems = [
    { id: 'stats', label: 'Overview', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'group' },
    { id: 'resources', label: 'Knowledge', icon: 'school' },
    { id: 'events', label: 'Campus Events', icon: 'event' },
    { id: 'services', label: 'Services', icon: 'storefront' },
    { id: 'marketplace', label: 'Market', icon: 'receipt_long' },
    { id: 'analytics', label: 'Intelligence', icon: 'monitoring' }
  ];

  return (
    <div className="bg-[#0a0a0c] text-on-surface min-h-screen flex selection:bg-primary/30">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full flex flex-col w-64 bg-surface-container/30 backdrop-blur-3xl border-r border-outline-variant/20 z-40">
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">StudentOS</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1 block">Admin Core</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {menuItems.map(item => (
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
              {user?.profilePicture ? <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-outline">shield_person</span>}
            </div>
          </div>
        </header>

        <div className="p-10 pt-28 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
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
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'stats' && <TabOverview stats={stats} health={health} onShowDiagnostics={() => setShowDiagnostics(true)} />}
              {activeTab === 'users' && <TabUsers users={users} onToggleRole={handleToggleRole} onDeleteUser={handleDeleteUser} />}
              {activeTab === 'resources' && <TabResources resources={resources} onDeleteResource={handleDeleteResource} />}
              {activeTab === 'events' && <TabEvents events={events} onDeleteEvent={handleDeleteEvent} />}
              {activeTab === 'services' && (
                <TabServices 
                  services={services} 
                  onAddService={() => { setEditingService(null); setServiceForm({ name: '', description: '', category: 'General', location: '', operatingHours: '08:00 AM - 05:00 PM', contactInfo: '' }); setShowServiceModal(true); }}
                  onEditService={(s) => { setEditingService(s); setServiceForm(s); setShowServiceModal(true); }}
                  onDeleteService={handleDeleteService}
                />
              )}
              {activeTab === 'marketplace' && <TabMarketplace marketItems={marketItems} onDeleteMarketItem={handleDeleteMarketItem} />}
              {activeTab === 'analytics' && <TabAnalytics growthData={analytics.growth} deptData={analytics.departments} topContributors={analytics.contributors} totalUsers={users.length} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ServiceModal 
        show={showServiceModal} 
        onClose={() => setShowServiceModal(false)} 
        onSave={handleSaveService}
        editingService={editingService}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
      />

      <DiagnosticsModal 
        show={showDiagnostics} 
        onClose={() => setShowDiagnostics(false)} 
        health={health}
      />
    </div>
  );
}
