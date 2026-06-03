import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, ListChecks, Plus, Trash2, Calculator } from 'lucide-react';

const UIU_GRADES = {
  'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00,
  'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'C-': 1.67,
  'D+': 1.33, 'D': 1.00, 'F': 0.00
};

export function GpaPredictor({ onCalculate }) {
  const [courses, setCourses] = useState([
    { id: 1, credits: 3, grade: 'A', isRetake: false, previousGrade: 'F' }
  ]);
  const [standing, setStanding] = useState({ credits: '', cgpa: '' });

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), credits: 3, grade: 'A', isRetake: false, previousGrade: 'F' }]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCalculate = () => {
    let semesterPoints = 0;
    let semesterCredits = 0;
    let retakeAdjustment = 0;

    courses.forEach(c => {
      const cr = parseFloat(c.credits) || 0;
      semesterPoints += UIU_GRADES[c.grade] * cr;
      semesterCredits += cr;
      if (c.isRetake) {
        retakeAdjustment += (UIU_GRADES[c.grade] - UIU_GRADES[c.previousGrade]) * cr;
      }
    });

    if (semesterCredits === 0) return;

    const semesterGpa = (semesterPoints / semesterCredits).toFixed(2);
    const prevCgpa = parseFloat(standing.cgpa) || 0;
    const prevCredits = parseInt(standing.credits) || 0;
    
    const newCredits = courses.filter(c => !c.isRetake).reduce((acc, c) => acc + (parseFloat(c.credits) || 0), 0);
    const totalPrevPoints = prevCgpa * prevCredits;
    const currentSemPoints = courses.filter(c => !c.isRetake).reduce((acc, c) => acc + (UIU_GRADES[c.grade] * (parseFloat(c.credits) || 0)), 0);
    
    const predictedCgpa = ((totalPrevPoints + currentSemPoints + retakeAdjustment) / (prevCredits + newCredits || 1)).toFixed(2);

    onCalculate({ semesterGpa, predictedCgpa, totalCredits: prevCredits + newCredits });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <LineChart size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Current Standing</h3>
            <p className="text-xs text-on-surface-variant font-medium opacity-70">Optional: Enter for CGPA prediction</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Credits Completed</label>
            <input 
              type="number" 
              placeholder="e.g. 45"
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary transition-all"
              value={standing.credits}
              onChange={e => setStanding({...standing, credits: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Current CGPA</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="e.g. 3.50"
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary transition-all"
              value={standing.cgpa}
              onChange={e => setStanding({...standing, cgpa: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
              <ListChecks size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Trimester Courses</h3>
              <p className="text-xs text-on-surface-variant font-medium opacity-70">Add your current load</p>
            </div>
          </div>
          <button 
            onClick={addCourse}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-secondary/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Course
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {courses.map((course, idx) => (
              <motion.div 
                layout
                key={course.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-5 bg-surface-container-low border border-outline-variant/20 rounded-2xl transition-all group"
              >
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex-1 min-w-[120px] space-y-2">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Course Grade</label>
                    <select 
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer"
                      value={course.grade}
                      onChange={e => updateCourse(course.id, 'grade', e.target.value)}
                    >
                      {Object.keys(UIU_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px] space-y-2">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Credits</label>
                    <select 
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer"
                      value={course.credits}
                      onChange={e => updateCourse(course.id, 'credits', parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4].map(c => <option key={c} value={c}>{c} Credits</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 h-[46px]">
                    <button 
                      onClick={() => updateCourse(course.id, 'isRetake', !course.isRetake)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${course.isRetake ? 'bg-error/10 border-error text-error' : 'border-outline-variant text-on-surface-variant hover:border-on-surface'}`}
                    >
                      {course.isRetake ? 'RETRIED' : 'RETAKE?'}
                    </button>
                    <button 
                      onClick={() => removeCourse(course.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {course.isRetake && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center gap-4">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Previous Grade:</label>
                        <select 
                          className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-1 text-xs font-bold"
                          value={course.previousGrade}
                          onChange={e => updateCourse(course.id, 'previousGrade', e.target.value)}
                        >
                          {Object.keys(UIU_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm tracking-wide hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Calculator size={20} />
        Predict GPA
      </button>
    </div>
  );
}
