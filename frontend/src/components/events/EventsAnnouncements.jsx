import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, MapPin, Clock as ClockIcon, Calendar as CalendarIcon, X } from 'lucide-react';
import './EventsAnnouncements.css';

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
  const [eventDate, setEventDate] = useState('');
  const [organizer, setOrganizer] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
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
    setEventDate('');
    setOrganizer('');
    setIsEditing(false);
    setCurrentEventId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (event) => {
    setTitle(event.title);
    setDescription(event.description);
    setLocation(event.location);
    // Format date for datetime-local input
    const date = new Date(event.eventDate);
    const formattedDate = date.toISOString().slice(0, 16);
    setEventDate(formattedDate);
    setOrganizer(event.organizer);
    setCurrentEventId(event.id);
    setIsEditing(true);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    
    const eventData = {
        title,
        description,
        location,
        eventDate,
        organizer,
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

  return (
    <div className="events-container">
      <div className="events-header">
        <div>
          <h2>Campus Events & Announcements</h2>
          <p>Stay updated with what's happening around campus</p>
        </div>
        <button className={`add-event-btn ${showAddForm ? 'cancel' : ''}`} onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}>
          {showAddForm ? <X size={18} /> : '+ New Event'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-event-form glass-card animate-in" onSubmit={handleCreateOrUpdateEvent}>
          <h3>{isEditing ? 'Edit Event' : 'Post a New Event'}</h3>
          
          <div className="form-group">
            <label>Event Title</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Tech Symposium Spring 2026"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this event about?"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Date & Time</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={eventDate} 
                  onChange={e => setEventDate(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  required 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g., Main Auditorium"
                />
            </div>
          </div>

          <div className="form-group">
            <label>Organizer (Club/Department)</label>
            <input 
              type="text" 
              required 
              value={organizer} 
              onChange={e => setOrganizer(e.target.value)}
              placeholder="e.g., Computer Science Club"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">{isEditing ? 'Update Event' : 'Post Event'}</button>
            {isEditing && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : (
        <div className="events-grid">
          {events.length === 0 ? (
             <div className="empty-state">No upcoming events found. Be the first to post one!</div>
          ) : (
             events.map(event => (
               <div key={event.id} className="event-card glass-card">
                 <div className="event-date-badge">
                   <div className="month">{new Date(event.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                   <div className="day">{new Date(event.eventDate).getDate()}</div>
                 </div>
                 
                 <div className="event-details">
                   <div className="event-title-row">
                     <h3>{event.title}</h3>
                     {canManage(event) && (
                       <div className="management-actions">
                         <button className="edit-btn" onClick={() => handleEditClick(event)} title="Edit Event">
                           <Edit2 size={16} />
                         </button>
                         <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)} title="Delete Event">
                           <Trash2 size={16} />
                         </button>
                       </div>
                     )}
                   </div>
                   
                   <div className="event-meta">
                     <span className="location"><MapPin size={14} /> {event.location}</span>
                     <span className="time"><ClockIcon size={14} /> {new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   
                   <p className="description">{event.description}</p>
                   
                   <div className="event-footer">
                     <div className="organizer">Organized by: <strong>{event.organizer}</strong></div>
                     {event.uploaderId === user.id && <span className="your-post-badge">Your Post</span>}
                   </div>
                 </div>
               </div>
             ))
          )}
        </div>
      )}
    </div>
  );
}
