import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function EventsAnnouncements() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        // Sort events by date ascending
        const sortedData = data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        setEvents(sortedData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('');
    setDatePart('');
    setTimePart('');
    setIsEditing(false);
    setCurrentEventId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (event) => {
    setTitle(event.title);
    setDescription(event.description);
    setLocation(event.location);
    const date = new Date(event.eventDate);
    if (!isNaN(date.getTime())) {
      setDatePart(date.toISOString().split('T')[0]);
      setTimePart(date.toTimeString().slice(0, 5));
    }
    setCategory(event.organizer || '');
    setCurrentEventId(event.id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    
    let eventDate = '';
    if (datePart && timePart) {
      eventDate = new Date(`${datePart}T${timePart}`).toISOString();
    } else if (datePart) {
      eventDate = new Date(`${datePart}T00:00:00`).toISOString();
    }

    const eventData = {
        title,
        description,
        location,
        eventDate,
        organizer: category || 'General',
        uploaderId: user.id
    };

    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/events/${currentEventId}`
        : `${import.meta.env.VITE_API_URL}/api/events`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Role': user.role
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        resetForm();
        fetchEvents();
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': user.id,
          'X-User-Role': user.role
        }
      });
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const canManage = (event) => {
    return user?.role === 'ADMIN' || (user?.id != null && event?.uploaderId != null && user.id == event.uploaderId);
  };

  const getThemeStyles = (index) => {
    const themes = [
      { border: 'border-t-primary', bg: 'bg-primary/10', hover: 'group-hover:bg-primary/20', badgeBg: 'bg-primary/20', badgeText: 'text-primary-fixed', badgeBorder: 'border-primary/30', dateText: 'text-primary' },
      { border: 'border-t-secondary', bg: 'bg-secondary/10', hover: 'group-hover:bg-secondary/20', badgeBg: 'bg-secondary/20', badgeText: 'text-secondary-fixed', badgeBorder: 'border-secondary/30', dateText: 'text-secondary' },
      { border: 'border-t-tertiary', bg: 'bg-tertiary/10', hover: 'group-hover:bg-tertiary/20', badgeBg: 'bg-tertiary/20', badgeText: 'text-tertiary-fixed', badgeBorder: 'border-tertiary/30', dateText: 'text-tertiary' },
      { border: 'border-t-error', bg: 'bg-error/10', hover: 'group-hover:bg-error/20', badgeBg: 'bg-error/20', badgeText: 'text-error-container', badgeBorder: 'border-error/30', dateText: 'text-error' },
    ];
    return themes[index % themes.length];
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateDates();

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full flex flex-col h-full text-on-surface">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-on-background mb-2 tracking-tight">Campus Events</h1>
          <p className="text-on-surface-variant text-base">Discover and register for upcoming activities.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-high border border-outline-variant hover:border-outline text-on-surface px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
          <button 
            className="bg-primary hover:opacity-90 text-on-primary px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_4px_20px_rgba(73,75,214,0.3)] flex items-center gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="mb-8 overflow-x-auto pb-4 shrink-0 no-scrollbar">
        <div className="flex gap-4 min-w-max">
          {dates.map((date, index) => {
            const isToday = index === 0;
            return (
              <button 
                key={index} 
                className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all relative ${
                  isToday 
                    ? 'bg-primary/10 border border-primary text-primary shadow-[0_0_15px_rgba(73,75,214,0.15)]' 
                    : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-bold ${isToday ? 'text-on-surface' : ''}`}>
                  {date.getDate()}
                </span>
                {isToday && <div className="w-1 h-1 bg-primary rounded-full absolute bottom-2"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* New/Edit Event Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity cursor-pointer"
              onClick={resetForm}
            ></div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container rounded-2xl shadow-2xl border border-outline-variant z-50 overflow-hidden flex flex-col max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high shrink-0">
                <h2 className="text-xl font-bold text-on-surface">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
                <button 
                  className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-variant"
                  onClick={resetForm}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                <form id="event-form" onSubmit={handleCreateOrUpdateEvent} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block" htmlFor="eventName">Event Name</label>
                    <input 
                      id="eventName"
                      type="text" 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-colors" 
                      placeholder="e.g. Fall Tech Mixer" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block" htmlFor="category">Category</label>
                      <div className="relative">
                        <select 
                          id="category"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          required
                        >
                          <option disabled value="">Select category</option>
                          <option value="Academic">Academic</option>
                          <option value="Social">Social</option>
                          <option value="Sports">Sports</option>
                          <option value="Arts & Culture">Arts & Culture</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block" htmlFor="location">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                        </div>
                        <input 
                          id="location"
                          type="text" 
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-12 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-colors" 
                          placeholder="Building, Room..." 
                          value={location} 
                          onChange={e => setLocation(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block" htmlFor="date">Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        </div>
                        <input 
                          id="date"
                          type="date" 
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-12 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors [color-scheme:dark]" 
                          value={datePart} 
                          onChange={e => setDatePart(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block" htmlFor="time">Time</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">schedule</span>
                        </div>
                        <input 
                          id="time"
                          type="time" 
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-12 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors [color-scheme:dark]" 
                          value={timePart} 
                          onChange={e => setTimePart(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block" htmlFor="description">Description</label>
                    <textarea 
                      id="description"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-colors resize-none" 
                      placeholder="Briefly describe the event..." 
                      rows="4"
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      required 
                    ></textarea>
                  </div>

                  <div className="border-2 border-outline-variant rounded-xl p-6 text-center hover:bg-surface-variant/50 hover:border-primary transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors mb-2 text-[32px]">add_photo_alternate</span>
                    <p className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Click to upload cover image (optional)</p>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-high flex justify-end gap-3 items-center shrink-0">
                <button 
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="event-form"
                  className="px-6 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  {isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid Events */}
      {loading ? (
        <div className="flex justify-center items-center py-20 flex-1">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-outline-variant/30 rounded-2xl bg-surface-container-low flex-1">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">event_busy</span>
          <h3 className="text-2xl font-bold text-on-surface mb-2">No Upcoming Events</h3>
          <p className="text-on-surface-variant mb-8 max-w-sm">There are currently no events scheduled. Be the first to host one!</p>
          <button 
            className="bg-primary hover:opacity-90 text-on-primary px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <span className="material-symbols-outlined">add</span>
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          <AnimatePresence>
            {events.map((event, index) => {
              const theme = getThemeStyles(index);
              const eventDate = new Date(event.eventDate);
              const isFeatured = index === 0;
              
              if (isFeatured) {
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={event.id}
                    className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col sm:flex-row h-auto sm:h-72 border border-outline-variant shadow-sm"
                  >
                    <div className="w-full sm:w-2/5 h-48 sm:h-full relative overflow-hidden bg-surface-container-highest flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent z-10 sm:bg-gradient-to-r"></div>
                      <span className="material-symbols-outlined text-[120px] text-primary/10 group-hover:scale-110 transition-transform duration-700">event</span>
                      <span className="absolute top-4 left-4 z-20 bg-surface-container-lowest/60 backdrop-blur-md text-on-surface text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border border-outline-variant/50">Featured Event</span>
                    </div>
                    <div className="p-8 flex flex-col justify-between w-full sm:w-3/5 relative z-20">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border border-primary/20">
                            {event.organizer || 'General'}
                          </span>
                          <div className="text-right flex items-center gap-3 bg-surface-container-high p-2 rounded-xl border border-outline-variant/30">
                            <div className="text-xs font-bold text-on-surface-variant leading-none">{eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                            <div className="text-3xl font-black text-on-surface leading-none">{eventDate.getDate()}</div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                        <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-outline-variant/20">
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium">
                            <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                            {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium">
                            <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                            {event.location}
                          </div>
                        </div>
                        {canManage(event) && (
                          <div className="flex gap-2 relative z-30">
                            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); handleEditClick(event); }} title="Edit">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} title="Delete">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={event.id} 
                  className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 hover:bg-surface-container transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-between h-72 border-t-4 ${theme.border} shadow-sm`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} blur-3xl rounded-full -mr-10 -mt-10 ${theme.hover} transition-all`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`${theme.badgeBg} ${theme.badgeText} text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border ${theme.badgeBorder}`}>
                        {event.organizer || 'Event'}
                      </span>
                      <div className="text-right bg-surface-container-high p-2 rounded-xl border border-outline-variant/30">
                        <div className="text-xs font-bold text-on-surface-variant leading-none">{eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                        <div className={`text-2xl font-black ${theme.dateText} leading-none mt-1`}>{eventDate.getDate()}</div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/20 relative z-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-medium">
                        <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                        {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-medium">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        <span className="truncate max-w-[120px]">{event.location}</span>
                      </div>
                    </div>
                    
                    {canManage(event) && (
                      <div className="flex gap-1">
                        <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); handleEditClick(event); }} title="Edit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} title="Delete">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
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
