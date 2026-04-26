import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function PlannerModal({ isOpen, onClose, onTaskCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [type, setType] = useState('Assignment');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const taskTypes = ['Assignment', 'Exam', 'Project', 'Reading', 'Lecture', 'Lab'];

  const resetForm = () => {
    setTitle(''); setDescription(''); setCourseCode(''); setType('Assignment');
    setDate(''); setTime(''); setError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!date) { setError('Due date is required'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const dueDate = time ? `${date}T${time}:00` : `${date}T23:59:00`;
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          courseCode: courseCode.trim() || 'General',
          type,
          dueDate,
          userId: user.id,
        }),
      });
      if (!resp.ok) throw new Error('Failed to create task');
      resetForm();
      onClose();
      onTaskCreated?.();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--inverse-primary)' }}>add_task</span>
            New Task
          </h2>
          <button style={styles.closeBtn} onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.body}>
          {error && (
            <div style={styles.error}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Title *</label>
            <input style={styles.input} placeholder="e.g., Complete Chapter 4 Reading" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Course Code</label>
              <input style={styles.input} placeholder="e.g., CSE 303" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Type</label>
              <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
                {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Due Date *</label>
              <input style={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Time</label>
              <input style={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, minHeight: 70, resize: 'vertical' }} placeholder="Optional notes..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={handleClose}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem',
  },
  container: {
    backgroundColor: 'var(--surface-container-high)', width: '100%', maxWidth: '480px',
    borderRadius: '12px', border: '1px solid var(--outline-variant)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden',
    animation: 'zoomIn 0.2s ease-out forwards',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid rgba(70,69,84,0.5)',
    background: 'rgba(52,52,61,0.3)',
  },
  headerTitle: {
    fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', margin: 0,
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  closeBtn: {
    color: 'var(--on-surface-variant)', background: 'transparent', border: 'none',
    padding: '4px', borderRadius: '50%', cursor: 'pointer', display: 'flex',
  },
  body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 500 },
  input: {
    width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)',
    borderRadius: '8px', padding: '10px 12px', fontSize: '0.9rem', color: 'var(--on-surface)',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  row: { display: 'flex', gap: '12px' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' },
  cancelBtn: {
    padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
    color: 'var(--on-surface-variant)', background: 'transparent', border: 'none', cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
    backgroundColor: 'var(--inverse-primary)', color: 'white', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(73,75,214,0.2)',
  },
  error: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px',
    borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
    backgroundColor: 'rgba(239,68,68,0.12)', color: '#ffb4ab', border: '1px solid rgba(239,68,68,0.25)',
  },
};
