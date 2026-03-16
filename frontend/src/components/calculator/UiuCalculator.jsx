import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './Calculator.css';
import { Calculator, Plus, Trash2, RotateCcw, GraduationCap, Info, ClipboardList, Wallet, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UIU_GRADES = {
  'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00,
  'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'C-': 1.67,
  'D+': 1.33, 'D': 1.00, 'F': 0.00
};

const WAIVERS = [0, 25, 50, 100];
const FIXED_TRIMESTER_FEE = 6500;

export function UiuCalculator() {
  const [activeTab, setActiveTab] = useState('gpa'); // 'gpa' or 'tuition'
  const [showModal, setShowModal] = useState(false);
  
  // GPA States
  const [courses, setCourses] = useState([
    { id: 1, name: '', credits: 3.0, grade: 'A', isRetake: false, previousGrade: 'F' }
  ]);
  const [currentStanding, setCurrentStanding] = useState({
    completedCredits: '',
    currentCgpa: ''
  });
  const [gpaResults, setGpaResults] = useState(null);

  // Tuition States
  const [tuitionData, setTuitionData] = useState({
    regularCredits: '',
    retakeCredits: '',
    feePerCredit: '',
    waiver: 0
  });
  const [tuitionResults, setTuitionResults] = useState(null);

  // Handlers for GPA
  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: '', credits: 3.0, grade: 'A', isRetake: false, previousGrade: 'F' }]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateGpa = () => {
    let semesterPoints = 0;
    let semesterCredits = 0;
    let retakeAdjustmentPoints = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits) || 0;
      const points = (UIU_GRADES[course.grade] || 0) * credits;
      semesterPoints += points;
      semesterCredits += credits;

      if (course.isRetake) {
        const prevPoints = (UIU_GRADES[course.previousGrade] || 0) * credits;
        retakeAdjustmentPoints += (points - prevPoints);
      }
    });

    if (semesterCredits === 0) return;

    const semesterGpa = (semesterPoints / semesterCredits).toFixed(2);
    
    let predictedCgpa = semesterGpa;
    const prevCgpa = parseFloat(currentStanding.currentCgpa);
    const prevCredits = parseInt(currentStanding.completedCredits);

    if (!isNaN(prevCgpa) && !isNaN(prevCredits) && prevCredits >= 0) {
      const totalPrevPoints = prevCgpa * prevCredits;
      const newCredits = courses.filter(c => !c.isRetake).reduce((acc, c) => acc + (parseFloat(c.credits) || 0), 0);
      const finalCredits = prevCredits + newCredits;
      const finalPoints = totalPrevPoints + (semesterPoints - courses.filter(c => c.isRetake).reduce((acc, c) => acc + ((UIU_GRADES[c.grade] || 0) * (parseFloat(c.credits) || 0)), 0)) + retakeAdjustmentPoints;
      
      // Simpler logic matching reference: 
      // New Points = (Old CGPA * Old Credits) + New Courses Points (excluding re-counting retake credits)
      // Reference logic usually does: (PrevPoints + FreshPoints + (NewRetakePoints - OldRetakePoints)) / (PrevCredits + FreshCredits)
      const freshPoints = courses.filter(c => !c.isRetake).reduce((acc, c) => acc + ((UIU_GRADES[c.grade] || 0) * (parseFloat(c.credits) || 0)), 0);
      const updatedTotalPoints = totalPrevPoints + freshPoints + retakeAdjustmentPoints;
      const updatedTotalCredits = prevCredits + newCredits;
      
      predictedCgpa = (updatedTotalPoints / Math.max(1, updatedTotalCredits)).toFixed(2);
      setGpaResults({
        semesterGpa,
        predictedCgpa,
        totalCredits: updatedTotalCredits
      });
    } else {
      setGpaResults({
        semesterGpa,
        predictedCgpa: semesterGpa,
        totalCredits: semesterCredits
      });
    }
    setShowModal(true);
  };

  // Handlers for Tuition
  const calculateTuition = () => {
    const feePerCredit = parseFloat(tuitionData.feePerCredit) || 0;
    const regCredits = parseFloat(tuitionData.regularCredits) || 0;
    const retCredits = parseFloat(tuitionData.retakeCredits) || 0;
    
    const regularTotal = regCredits * feePerCredit;
    const waiverAmount = regularTotal * (tuitionData.waiver / 100);
    const regularPayable = regularTotal - waiverAmount;
    
    const retakePayable = retCredits * (feePerCredit * 0.5); // 50% discount on retakes, no waiver
    const totalPayable = regularPayable + retakePayable + FIXED_TRIMESTER_FEE;

    setTuitionResults({
      regularTotal,
      waiverAmount,
      regularPayable,
      retakePayable,
      trimesterFee: FIXED_TRIMESTER_FEE,
      totalPayable,
      installments: [
        Math.round(totalPayable * 0.4),
        Math.round(totalPayable * 0.3),
        Math.round(totalPayable * 0.3)
      ]
    });
    setShowModal(true);
  };

  const resetAll = () => {
    setCourses([{ id: 1, name: '', credits: 3.0, grade: 'A', isRetake: false, previousGrade: 'F' }]);
    setCurrentStanding({ completedCredits: '', currentCgpa: '' });
    setTuitionData({ regularCredits: '', retakeCredits: '', feePerCredit: '', waiver: 0 });
    setGpaResults(null);
    setTuitionResults(null);
    setShowModal(false);
  };

  useEffect(() => {
    if (!showModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showModal]);

  return (
    <div className="calculator-container aura-theme">
      <div className="aura-bg-blobs">
        <div className="blob blob-primary"></div>
        <div className="blob blob-secondary"></div>
      </div>

      <div className="calculator-shell">
      <div className="calc-header-v2">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="title-stack"
        >
          <div className="badge-aura">Academic Intelligence</div>
          <h1>UIU <span>Unified</span> Calculator</h1>
          <p>GPA Prediction & Tuition Fee Estimation tailored for UIU students</p>
        </motion.div>

        <div className="tab-toggle-container glass-card">
          <button 
            className={`tab-btn ${activeTab === 'gpa' ? 'active' : ''}`}
            onClick={() => { setActiveTab('gpa'); setShowModal(false); }}
          >
            <GraduationCap size={18} /> GPA Predictor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tuition' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tuition'); setShowModal(false); }}
          >
            <Wallet size={18} /> Tuition Estimator
          </button>
          <motion.div 
            className="tab-indicator"
            animate={{ x: activeTab === 'gpa' ? 0 : '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      <div className={`calc-grid-v2 ${activeTab === 'tuition' ? 'single-col' : ''}`}>
        <div className="input-vertical-stack">
          {activeTab === 'gpa' ? (
            <>
              <section className="aura-card">
                <div className="card-header">
                  <div className="icon-box"><RotateCcw size={20} className="text-primary" /></div>
                  <div className="text">
                    <h3>Current Standing</h3>
                    <span className="subtitle">Your existing academic record</span>
                  </div>
                </div>
                <div className="form-row-v2">
                  <div className="input-field">
                    <label>Completed Credits</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 45"
                      className="no-spinner"
                      value={currentStanding.completedCredits}
                      onChange={(e) => setCurrentStanding({...currentStanding, completedCredits: e.target.value})}
                    />
                  </div>
                  <div className="input-field">
                    <label>Current CGPA</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 3.50"
                      className="no-spinner"
                      value={currentStanding.currentCgpa}
                      onChange={(e) => setCurrentStanding({...currentStanding, currentCgpa: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <section className="aura-card">
                <div className="card-header">
                  <div className="icon-box"><ClipboardList size={22} className="text-secondary" /></div>
                  <div className="text">
                    <h3>This Trimester</h3>
                    <span className="subtitle">List of courses you are taking</span>
                  </div>
                </div>
                <div className="course-rows-v2">
                  {courses.map((course) => (
                    <motion.div layout key={course.id} className={`row-v2 ${course.isRetake ? 'retake-active' : ''}`}>
                      <div className="row-main-inputs">
                        <div className="input-field name-field">
                          <label>Credits</label>
                          <select 
                            value={course.credits}
                            onChange={(e) => updateCourse(course.id, 'credits', parseFloat(e.target.value))}
                          >
                            <option value="1">1 Credit</option>
                            <option value="2">2 Credits</option>
                            <option value="3">3 Credits</option>
                            <option value="4">4 Credits</option>
                          </select>
                        </div>
                        <div className="input-field grade-field">
                          <label>Expected Grade</label>
                          <select 
                            value={course.grade}
                            onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                          >
                            {Object.keys(UIU_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div className="retake-toggle-container">
                           <label className="aura-switch">
                            <input 
                              type="checkbox" 
                              checked={course.isRetake}
                              onChange={(e) => updateCourse(course.id, 'isRetake', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span className="toggle-label">Retake</span>
                        </div>
                        <button className="del-btn-v2" onClick={() => removeCourse(course.id)}><X size={18} /></button>
                      </div>
                      
                      {course.isRetake && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="retake-fields">
                          <div className="input-field">
                            <label>Previous Grade</label>
                            <select 
                              value={course.previousGrade}
                              onChange={(e) => updateCourse(course.id, 'previousGrade', e.target.value)}
                            >
                              {Object.keys(UIU_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <button className="aura-btn-outline add-more" onClick={addCourse}>
                  <Plus size={18} /> Add Another Course
                </button>
              </section>
            </>
          ) : (
            <section className="aura-card">
              <div className="card-header">
                <div className="icon-box"><Calculator size={22} className="text-accent" /></div>
                <div className="text">
                  <h3>Fee Parameters</h3>
                  <span className="subtitle">Enter credits for automated estimation</span>
                </div>
              </div>
              <div className="tuition-form-grid">
                <div className="input-field">
                  <label>Fresh Credits</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 9"
                    className="no-spinner"
                    value={tuitionData.regularCredits}
                    onChange={(e) => setTuitionData({...tuitionData, regularCredits: e.target.value})}
                  />
                </div>
                <div className="input-field">
                  <label>Retake Credits</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 3"
                    className="no-spinner"
                    value={tuitionData.retakeCredits}
                    onChange={(e) => setTuitionData({...tuitionData, retakeCredits: e.target.value})}
                  />
                </div>
                <div className="input-field">
                  <label>Fee Per Credit (৳)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 6500"
                    className="no-spinner"
                    value={tuitionData.feePerCredit}
                    onChange={(e) => setTuitionData({...tuitionData, feePerCredit: e.target.value})}
                  />
                </div>
                <div className="input-field">
                  <label>Scholarship Waiver</label>
                  <select 
                    value={tuitionData.waiver}
                    onChange={(e) => setTuitionData({...tuitionData, waiver: parseInt(e.target.value)})}
                  >
                    {WAIVERS.map(w => <option key={w} value={w}>{w}%</option>)}
                  </select>
                </div>
              </div>
            </section>
          )}

          <div className="aura-actions">
            <button className="aura-btn-secondary" onClick={resetAll}><RotateCcw size={18} /> Reset All</button>
            <button 
              className="aura-btn-primary" 
              onClick={activeTab === 'gpa' ? calculateGpa : calculateTuition}
            >
              {activeTab === 'gpa' ? 'Predict My GPA' : 'Calculate Fees'}
            </button>
          </div>
        </div>

        {activeTab === 'gpa' && (
          <div className="results-vertical-stack">
            <div className="reference-card aura-card">
              <div className="card-header">
                <Info size={18} className="text-primary" />
                <h3>Grading Standards</h3>
              </div>
              <div className="aura-table">
                {Object.entries(UIU_GRADES).map(([g, p]) => (
                  <div key={g} className="table-row-v2">
                    <span className="grade">{g}</span>
                    <span className="points">{p.toFixed(2)} Points</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Modals */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="aura-modal-overlay" role="dialog" aria-modal="true">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="aura-modal-content glass-card"
              >
                <button className="close-modal" onClick={() => setShowModal(false)}><X size={20} /></button>
                
                {activeTab === 'gpa' && gpaResults && (
                  <div className="modal-result-view">
                    <div className="modal-header-aura">
                      <GraduationCap size={40} className="text-primary" />
                      <h2>Prediction Results</h2>
                    </div>
                    <div className="main-stat-badge">
                      <span className="label">Projected CGPA</span>
                      <span className="value highlight">{gpaResults.predictedCgpa}</span>
                    </div>
                    <div className="sub-stat-row">
                      <div className="sub-stat-box">
                        <span className="label">Semester GPA</span>
                        <span className="value">{gpaResults.semesterGpa}</span>
                      </div>
                      <div className="sub-stat-box">
                        <span className="label">Total Credits</span>
                        <span className="value">{gpaResults.totalCredits}</span>
                      </div>
                    </div>
                    <button className="aura-btn-primary full-width" onClick={() => setShowModal(false)}>Got it!</button>
                  </div>
                )}

                {activeTab === 'tuition' && tuitionResults && (
                  <div className="modal-result-view">
                    <div className="modal-header-aura">
                      <Wallet size={40} className="text-accent" />
                      <h2>Tuition Breakdown</h2>
                    </div>
                    <div className="fee-list">
                      <div className="fee-item">
                        <span>Fresh Credits Fee</span>
                        <span>৳{tuitionResults.regularTotal.toLocaleString()}</span>
                      </div>
                      <div className="fee-item waiver">
                        <span>Scholarship Discount</span>
                        <span>-৳{tuitionResults.waiverAmount.toLocaleString()}</span>
                      </div>
                      <div className="fee-item">
                        <span>Retake Fee (50% Off)</span>
                        <span>৳{tuitionResults.retakePayable.toLocaleString()}</span>
                      </div>
                      <div className="fee-item">
                        <span>Trimester Fee (Fixed)</span>
                        <span>৳{tuitionResults.trimesterFee.toLocaleString()}</span>
                      </div>
                      <div className="fee-total-row">
                        <span>Total Payable</span>
                        <span>৳{tuitionResults.totalPayable.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="installment-section">
                      <h3>Installment Plan</h3>
                      <div className="installment-grid">
                        <div className="inst-box">
                          <span className="label">1st (40%)</span>
                          <span className="value">৳{tuitionResults.installments[0].toLocaleString()}</span>
                        </div>
                        <div className="inst-box">
                          <span className="label">2nd (30%)</span>
                          <span className="value">৳{tuitionResults.installments[1].toLocaleString()}</span>
                        </div>
                        <div className="inst-box">
                          <span className="label">3rd (30%)</span>
                          <span className="value">৳{tuitionResults.installments[2].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="aura-btn-primary full-width" onClick={() => setShowModal(false)}>Close Breakdown</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
      </div>
    </div>
  );
}
