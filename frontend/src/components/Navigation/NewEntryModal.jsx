import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
        let dueDate = null;
        if (date) {
          dueDate = time ? `${date}T${time}:00` : `${date}T23:59:00`;
        } else {
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
        const resourceData = {
          title: title.trim(),
          description: description.trim() || '',
          courseCode: course || 'General',
          courseTitle: '',
          fileUrl: description.trim() || 'https://example.com',
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden" onClick={handleClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface-container-high w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-2xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-outline-variant/50 bg-surface-container-highest/30">
              <h2 className="text-2xl font-bold text-on-surface leading-none">Create New Entry</h2>
              <button 
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-variant transition-colors"
                onClick={handleClose}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {/* Messages */}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/10 text-secondary border border-secondary/25 text-sm font-medium animate-in">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error border border-error/25 text-sm font-medium animate-in">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errorMsg}
                </div>
              )}

              {/* Entry Type Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Entry Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'task', label: 'Task', icon: 'assignment' },
                    { id: 'schedule', label: 'Schedule', icon: 'event' },
                    { id: 'resource', label: 'Resource', icon: 'bookmark' },
                    { id: 'event', label: 'Event', icon: 'campaign' }
                  ].map(type => (
                    <button 
                      key={type.id}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                        entryType === type.id 
                          ? 'bg-primary-container text-on-primary-container border-primary-container' 
                          : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => handleTypeChange(type.id)}
                    >
                      <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-title">Title</label>
                  <input 
                    id="entry-title" 
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all placeholder:text-outline" 
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-date">Date</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">calendar_month</span>
                      <input 
                        id="entry-date" 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all [color-scheme:dark]" 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-time">Time</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">schedule</span>
                      <input 
                        id="entry-time" 
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all [color-scheme:dark]" 
                        type="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-course">Course Code</label>
                  <input 
                    id="entry-course" 
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all placeholder:text-outline" 
                    placeholder="e.g., CSE 303"
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>

                {entryType === 'task' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-on-surface-variant">Priority</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'high', label: 'High', activeClass: 'bg-error/15 text-error border-error/40' },
                        { id: 'medium', label: 'Medium', activeClass: 'bg-primary-container text-on-primary-container border-primary-container' },
                        { id: 'low', label: 'Low', activeClass: 'bg-secondary/15 text-secondary border-secondary/40' }
                      ].map(p => (
                        <button 
                          key={p.id}
                          className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                            priority === p.id 
                              ? p.activeClass 
                              : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                          }`}
                          onClick={() => setPriority(p.id)}
                          type="button"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {entryType === 'event' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-location">Location</label>
                      <input 
                        id="entry-location" 
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all placeholder:text-outline" 
                        placeholder="e.g., Room 101, Science Building"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-organizer">Organizer</label>
                      <input 
                        id="entry-organizer" 
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all placeholder:text-outline" 
                        placeholder="e.g., CS Department"
                        type="text"
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-on-surface-variant" htmlFor="entry-desc">
                    {entryType === 'resource' ? 'Link / URL' : 'Description'}
                  </label>
                  <textarea 
                    id="entry-desc" 
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all placeholder:text-outline resize-none" 
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
            <div className="p-4 md:p-6 border-t border-outline-variant/50 bg-surface-container-highest/30 flex items-center justify-end gap-3 mt-auto">
              <button 
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors" 
                onClick={handleClose} 
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2 rounded-lg bg-inverse-primary text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" 
                onClick={handleSubmit} 
                disabled={isSubmitting || !!successMsg}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
