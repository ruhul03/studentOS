import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { CalendarStrip } from './CalendarStrip';
import { PlusCircle, Search, CalendarOff } from 'lucide-react';

export function EventsAnnouncements() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', category: '', datePart: '', timePart: '' });

  const API = `${import.meta.env.VITE_API_URL}/api/events`;
  const canManage = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchWithAuth(API);
      if (resp.ok) {
        const data = await resp.json();
        const sortedData = data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        setEvents(sortedData);
      }
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  }, [API, user?.token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || e.category === category;
      return matchSearch && matchCategory;
    });
  }, [events, search, category]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setForm({ title: '', description: '', location: '', category: '', datePart: '', timePart: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (event) => {
    const dt = new Date(event.eventDate);
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      category: event.category || 'Academic',
      datePart: !isNaN(dt.getTime()) ? dt.toISOString().split('T')[0] : '',
      timePart: !isNaN(dt.getTime()) ? dt.toTimeString().split(' ')[0].substring(0, 5) : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const resp = await fetchWithAuth(`${API}/${id}`, {
        method: 'DELETE',
        headers: { 
          'X-User-Id': user.id,
          'X-User-Role': user.role
        }
      });
      if (resp.ok) fetchEvents();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventDate = `${form.datePart}T${form.timePart}:00`;
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      category: form.category,
      eventDate,
      organizer: user?.name || 'Academic',
      uploaderId: user.id
    };

    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `${API}/${editingEvent.id}` : API;
      const resp = await fetchWithAuth(url, {
        method,
        headers: { 
          'X-User-Id': user.id,
          'X-User-Role': user.role
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setShowModal(false);
        fetchEvents();
      }
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Campus Ecosystem</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">Events & <span className="text-primary">Alerts</span></h1>
          <p className="text-on-surface-variant text-sm font-medium max-w-md">Stay updated with the latest happenings, academic deadlines, and social gatherings.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center xl:justify-end w-full xl:w-auto">
          <div className="w-full sm:w-auto overflow-hidden">
            <CalendarStrip />
          </div>
          {canManage && (
            <button 
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle size={20} strokeWidth={2.5} />
              New Event
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 shrink-0">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search events, announcements, organizers..." 
            className="w-full bg-surface-container border border-outline-variant/30 rounded-2xl pl-12 pr-4 py-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {['All', 'Academic', 'Social', 'Sports'].map(cat => (
            <button 
              key={cat}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                category === cat 
                  ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' 
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant border border-transparent hover:border-outline-variant'
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-surface-container-low rounded-2xl animate-pulse border border-outline-variant/20"></div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, idx) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  index={idx} 
                  canManage={canManage || (user.id === event.uploaderId)}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-container-high flex items-center justify-center text-outline-variant mb-6 shadow-inner">
              <CalendarOff size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">No Events Found</h3>
            <p className="text-on-surface-variant text-sm max-w-xs font-medium opacity-70">We couldn't find any events matching your current filters or search criteria.</p>
          </div>
        )}
      </div>

      <EventModal 
        show={showModal} 
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isEditing={!!editingEvent}
        form={form}
        setForm={setForm}
      />

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464554; }
      `}} />
    </div>
  );
}
