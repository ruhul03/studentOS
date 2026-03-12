import { useState, useEffect } from 'react';
import './EventsAnnouncements.css';

interface CampusEvent {
  id: number;
  title: String;
  description: String;
  location: String;
  eventDate: String;
  organizer: String;
}

export function EventsAnnouncements() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [organizer, setOrganizer] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/events');
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent = {
        title,
        description,
        location,
        eventDate,
        organizer
    };

    try {
      const response = await fetch('http://localhost:8081/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      
      if (response.ok) {
        setShowAddForm(false);
        setTitle('');
        setDescription('');
        setLocation('');
        setEventDate('');
        setOrganizer('');
        fetchEvents(); // Refresh
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <div>
          <h2>Campus Events & Announcements</h2>
          <p>Stay updated with what's happening around campus</p>
        </div>
        <button className="add-event-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-event-form" onSubmit={handleCreateEvent}>
          <h3>Post a New Event</h3>
          
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

          <button type="submit" className="submit-btn">Post Event</button>
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
               <div key={event.id} className="event-card">
                 <div className="event-date-badge">
                   <div className="month">{new Date(event.eventDate.toString()).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                   <div className="day">{new Date(event.eventDate.toString()).getDate()}</div>
                 </div>
                 <div className="event-details">
                   <h3>{event.title}</h3>
                   <div className="event-meta">
                     <span className="location">📍 {event.location}</span>
                     <span className="time">⏰ {new Date(event.eventDate.toString()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <p className="description">{event.description}</p>
                   <div className="organizer">Organized by: <strong>{event.organizer}</strong></div>
                 </div>
               </div>
             ))
          )}
        </div>
      )}
    </div>
  );
}
