import { Calendar, Clock } from 'lucide-react';

export function EntryFormFields({
  entryType,
  title, setTitle,
  date, setDate,
  time, setTime,
  course, setCourse,
  description, setDescription,
  priority, setPriority,
  location, setLocation,
  organizer, setOrganizer
}) {
  return (
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
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none" />
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
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none" />
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
  );
}
