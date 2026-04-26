import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './NewEntryModal.css';

export function NewEntryModal({ isOpen, onClose, onNavigate }) {
  const { user } = useAuth();
  const [entryType, setEntryType] = useState('task');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Shared fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');

  // Task-specific
  const [priority, setPriority] = useState('medium');

  // Event-specific
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setCourse('');
    setDescription('');
    setPriority('medium');
    setLocation('');
    setOrganizer('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleTypeChange = (type) => {
    setEntryType(type);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    setEntryType('task');
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim()) {
      setErrorMsg('Title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const API = import.meta.env.VITE_API_URL;

      if (entryType === 'task') {
        // Build dueDate from date + time
        let dueDate = null;
        if (date) {
          dueDate = time ? `${date}T${time}:00` : `${date}T23:59:00`;
        } else {
          // Default to end of today
          const today = new Date().toISOString().split('T')[0];
          dueDate = `${today}T23:59:00`;
        }

        const resp = await fetch(`${API}/api/planner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            courseCode: course || 'General',
            type: priority === 'high' ? 'Assignment' : priority === 'medium' ? 'Project' : 'Reading',
            dueDate,
            userId: user.id,
          }),
        });

        if (!resp.ok) throw new Error('Failed to create task');
        setSuccessMsg('Task created successfully!');

      } else if (entryType === 'schedule') {
        // Create as a study task with type "Schedule"
        let dueDate = null;
        if (date) {
          dueDate = time ? `${date}T${time}:00` : `${date}T09:00:00`;
        } else {
          const today = new Date().toISOString().split('T')[0];
          dueDate = `${today}T09:00:00`;
        }

        const resp = await fetch(`${API}/api/planner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            courseCode: course || 'General',
            type: 'Schedule',
            dueDate,
            userId: user.id,
          }),
        });

        if (!resp.ok) throw new Error('Failed to create schedule entry');
        setSuccessMsg('Schedule entry created!');

      } else if (entryType === 'resource') {
        // Create resource - uses multipart form data
        const resourceData = {
          title: title.trim(),
          description: description.trim() || '',
          courseCode: course || 'General',
          courseTitle: '',
          fileUrl: description.trim() || 'https://example.com', // Use description as link
          type: 'Link',
          uploaderId: user.id,
          anonymous: false,
        };

        const formData = new FormData();
        formData.append('resource', new Blob([JSON.stringify(resourceData)], { type: 'application/json' }));

        const resp = await fetch(`${API}/api/resources`, {
          method: 'POST',
          body: formData,
        });

        if (!resp.ok) throw new Error('Failed to create resource');
        setSuccessMsg('Resource created successfully!');

      } else if (entryType === 'event') {
        let eventDate = null;
        if (date) {
          eventDate = time ? `${date}T${time}:00` : `${date}T12:00:00`;
        } else {
          const today = new Date().toISOString().split('T')[0];
          eventDate = `${today}T12:00:00`;
        }

        const resp = await fetch(`${API}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || title.trim(),
            location: location.trim() || 'TBD',
            eventDate,
            organizer: organizer.trim() || user.name || 'StudentOS User',
            uploaderId: user.id,
          }),
        });

        if (!resp.ok) throw new Error('Failed to create event');
        setSuccessMsg('Event created successfully!');
      }

      // Auto-close after success with a brief delay
      setTimeout(() => {
        const tabMap = { task: 'planner', schedule: 'planner', resource: 'resources', event: 'events' };
        const targetTab = tabMap[entryType];
        resetForm();
        setEntryType('task');
        onClose();
        if (onNavigate && targetTab) {
          onNavigate(targetTab);
        }
      }, 1200);

    } catch (err) {
      console.error('NewEntryModal submit error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Create New Entry</h2>
          <button className="close-button" onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Success / Error Messages */}
          {successMsg && (
            <div className="modal-toast modal-toast-success">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="modal-toast modal-toast-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}

          {/* Entry Type Selection */}
          <div className="form-group">
            <label className="form-label-caps">Entry Type</label>
            <div className="type-selection-grid">
              <button 
                className={`type-button ${entryType === 'task' ? 'active' : ''}`}
                onClick={() => handleTypeChange('task')}
              >
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                Task
              </button>
              <button 
                className={`type-button ${entryType === 'schedule' ? 'active' : ''}`}
                onClick={() => handleTypeChange('schedule')}
              >
                <span className="material-symbols-outlined text-[18px]">event</span>
                Schedule
              </button>
              <button 
                className={`type-button ${entryType === 'resource' ? 'active' : ''}`}
                onClick={() => handleTypeChange('resource')}
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                Resource
              </button>
              <button 
                className={`type-button ${entryType === 'event' ? 'active' : ''}`}
                onClick={() => handleTypeChange('event')}
              >
                <span className="material-symbols-outlined text-[18px]">campaign</span>
                Event
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="entry-title">Title</label>
              <input 
                id="entry-title" 
                className="form-input" 
                placeholder={
                  entryType === 'task' ? 'e.g., Complete Chapter 4 Reading' :
                  entryType === 'schedule' ? 'e.g., Data Structures Lecture' :
                  entryType === 'resource' ? 'e.g., OS Lecture Notes Week 5' :
                  'e.g., Tech Symposium 2026'
                }
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Date & Time Row */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="entry-date">Date</label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined icon-left">calendar_month</span>
                  <input 
                    id="entry-date" 
                    className="form-input has-icon-left" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="entry-time">Time</label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined icon-left">schedule</span>
                  <input 
                    id="entry-time" 
                    className="form-input has-icon-left" 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Course Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="entry-course">Course Code</label>
              <input 
                id="entry-course" 
                className="form-input" 
                placeholder="e.g., CSE 303"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            {/* Task Priority (Task type only) */}
            {entryType === 'task' && (
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="type-selection-grid">
                  <button 
                    className={`type-button ${priority === 'high' ? 'active priority-high' : ''}`}
                    onClick={() => setPriority('high')}
                    type="button"
                  >
                    High
                  </button>
                  <button 
                    className={`type-button ${priority === 'medium' ? 'active' : ''}`}
                    onClick={() => setPriority('medium')}
                    type="button"
                  >
                    Medium
                  </button>
                  <button 
                    className={`type-button ${priority === 'low' ? 'active priority-low' : ''}`}
                    onClick={() => setPriority('low')}
                    type="button"
                  >
                    Low
                  </button>
                </div>
              </div>
            )}

            {/* Event-specific fields */}
            {entryType === 'event' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="entry-location">Location</label>
                  <input 
                    id="entry-location" 
                    className="form-input" 
                    placeholder="e.g., Room 101, Science Building"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="entry-organizer">Organizer</label>
                  <input 
                    id="entry-organizer" 
                    className="form-input" 
                    placeholder="e.g., CS Department"
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="entry-desc">
                {entryType === 'resource' ? 'Link / URL' : 'Description'}
              </label>
              <textarea 
                id="entry-desc" 
                className="form-input resize-none" 
                placeholder={
                  entryType === 'resource' 
                    ? 'Paste a link to the resource...' 
                    : 'Add notes, links, or specific requirements...'
                }
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            className="btn-submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !!successMsg}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Creating...
              </>
            ) : successMsg ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                Done!
              </>
            ) : (
              <>
                Push to Dashboard
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
