import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Planner.css';
import { Plus, Trash2, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

export function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [type, setType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planner/user/${user.id}`);
      if (response.ok) {
        setTasks(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, courseCode, type, dueDate: dueDate || null, userId: user.id
        })
      });
      if (response.ok) {
        setShowAdd(false);
        setTitle(''); setDescription(''); setCourseCode(''); setType('Assignment'); setDueDate('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const toggleTask = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/planner/${id}/toggle`, { method: 'PUT' });
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/planner/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const calculateDaysLeft = (dateString) => {
    if (!dateString) return null;
    const due = new Date(dateString);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="planner-container">
      <div className="planner-header">
        <div>
          <h2>Study Planner</h2>
          <p>Track your assignments, reading, and exams.</p>
        </div>
        <button className="add-task-btn" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> {showAdd ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showAdd && (
        <form className="add-task-form glass-card" onSubmit={handleAddTask}>
          <div className="form-row">
            <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>Assignment</option>
              <option>Reading</option>
              <option>Project</option>
              <option>Exam</option>
            </select>
          </div>
          <div className="form-row">
            <input type="text" placeholder="Course Code (e.g. CSE 101)" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <textarea placeholder="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <button type="submit" className="submit-task-btn">Save Task</button>
        </form>
      )}

      <div className="tasks-layout">
        <div className="task-section">
          <h3>Upcoming Tasks</h3>
          <div className="task-list">
            {tasks.filter(t => !t.completed).map(task => {
              const daysLeft = calculateDaysLeft(task.dueDate);
              const isUrgent = daysLeft !== null && daysLeft <= 2 && daysLeft >= 0;
              const isOverdue = daysLeft !== null && daysLeft < 0;

              return (
                <div key={task.id} className={`task-card ${isUrgent ? 'urgent' : ''} ${isOverdue ? 'overdue' : ''}`}>
                  <button className="toggle-btn" onClick={() => toggleTask(task.id)}>
                    <Circle size={24} />
                  </button>
                  <div className="task-content">
                    <div className="task-title-row">
                      <h4>{task.title}</h4>
                      <span className="task-type-badge">{task.type}</span>
                    </div>
                    <span className="course-tag">{task.courseCode}</span>
                    
                    {task.dueDate && (
                      <div className={`due-date ${isUrgent ? 'text-urgent' : ''} ${isOverdue ? 'text-overdue' : ''}`}>
                        {isOverdue ? <AlertTriangle size={14}/> : <Clock size={14} />}
                        <span>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {daysLeft !== null && (
                            <span className="days-left">
                              ({isOverdue ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="empty-state">All caught up! No active tasks.</div>
            )}
          </div>
        </div>

        <div className="task-section">
          <h3>Completed</h3>
          <div className="task-list">
            {tasks.filter(t => t.completed).map(task => (
              <div key={task.id} className="task-card completed">
                <button className="toggle-btn" onClick={() => toggleTask(task.id)}>
                  <CheckCircle2 size={24} className="text-success" />
                </button>
                <div className="task-content">
                  <h4 className="line-through text-muted">{task.title}</h4>
                  <span className="course-tag">{task.courseCode}</span>
                </div>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {tasks.filter(t => t.completed).length === 0 && (
              <div className="empty-state-small">No completed tasks yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
