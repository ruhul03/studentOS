import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const UIU_GRADES = {
  'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00,
  'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'C-': 1.67,
  'D+': 1.33, 'D': 1.00, 'F': 0.00
};

const WAIVERS = [0, 25, 50, 100];

export function UiuCalculator() {
  const [activeTab, setActiveTab] = useState('gpa'); // 'gpa' or 'tuition'
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  
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
    programType: 'TRIMESTER_BSBGE', 
    regularCredits: '',
    retakeCredits: '',
    perCreditFee: '',
    waiver: 0,
    isAfterBatch251: true
  });
  const [tuitionResults, setTuitionResults] = useState(null);

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
      const updatedTotalPoints = totalPrevPoints + courses.filter(c => !c.isRetake).reduce((acc, c) => acc + ((UIU_GRADES[c.grade] || 0) * (parseFloat(c.credits) || 0)), 0) + retakeAdjustmentPoints;
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

  const calculateTuition = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const totalCredits = (parseFloat(tuitionData.regularCredits) || 0) + (parseFloat(tuitionData.retakeCredits) || 0);
        const backendRequest = {
          ...tuitionData,
          creditsTaken: totalCredits
        };
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tuition-fees/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendRequest)
        });

        if (response.ok) {
          const result = await response.json();
          setTuitionResults(result);
          setShowModal(true);
          return;
        }
      }
      
      // Fallback
      const regularCredits = parseFloat(tuitionData.regularCredits) || 0;
      const retakeCredits = parseFloat(tuitionData.retakeCredits) || 0;
      const perCreditFee = parseFloat(tuitionData.perCreditFee) || 0;
      const totalCredits = regularCredits + retakeCredits;
      
      const regularTuitionFee = regularCredits * perCreditFee;
      const waiverAmount = regularTuitionFee * (tuitionData.waiver / 100);
      const regularPayable = regularTuitionFee - waiverAmount;
      const retakeDiscountAmount = retakeCredits * (perCreditFee * 0.5);
      const tuitionFeeAmount = regularPayable - retakeDiscountAmount; 
      
      let baseFee = 0;
      let labFee = 0;
      if (tuitionData.programType.includes('TRIMESTER')) {
        baseFee = 6500;
        if (tuitionData.programType === 'TRIMESTER_BSBGE') labFee = 2000;
      } else {
        baseFee = 9750;
        labFee = 5000;
      }
      
      const totalFee = tuitionFeeAmount + baseFee + labFee;
      const installmentAmount = tuitionData.isAfterBatch251 ? Math.max(0, totalFee - 20000) : totalFee;
      
      const paymentSchedule = {
        preRegistrationPayment: tuitionData.isAfterBatch251 ? 20000 : 0,
        totalInstallments: installmentAmount,
        installment1: 0, installment2: 0, installment3: 0, installment4: 0
      };
      
      if (tuitionData.programType.includes('TRIMESTER')) {
        paymentSchedule.installment1 = installmentAmount * 0.40;
        paymentSchedule.installment2 = installmentAmount * 0.30;
        paymentSchedule.installment3 = installmentAmount * 0.30;
      } else {
        const installment = installmentAmount * 0.25;
        paymentSchedule.installment1 = paymentSchedule.installment2 = paymentSchedule.installment3 = paymentSchedule.installment4 = installment;
      }
      
      setTuitionResults({
        programType: tuitionData.programType,
        regularCredits, retakeCredits, creditsTaken: totalCredits, perCreditFee,
        waiver: tuitionData.waiver, regularTuitionFee, waiverAmount, regularPayable,
        retakeDiscountAmount, tuitionFee: tuitionFeeAmount, baseFee, labFee, totalFee,
        isAfterBatch251: tuitionData.isAfterBatch251, paymentSchedule
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error calculating tuition:', error);
    }
  };

  const resetAll = () => {
    setCourses([{ id: 1, name: '', credits: 3.0, grade: 'A', isRetake: false, previousGrade: 'F' }]);
    setCurrentStanding({ completedCredits: '', currentCgpa: '' });
    setTuitionData({ programType: 'TRIMESTER_BSBGE', regularCredits: '', retakeCredits: '', perCreditFee: '', waiver: 0, isAfterBatch251: true });
    setGpaResults(null);
    setTuitionResults(null);
    setShowModal(false);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8 text-on-surface relative">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <span className="px-3 py-1 font-label-caps text-[10px] bg-surface-container-high border border-outline-variant text-primary rounded-full tracking-widest">
            Academic Intelligence
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface tracking-tight">
            UIU <span className="text-primary">Unified</span> Calculator
          </h1>
          <p className="text-on-surface-variant max-w-xl text-sm md:text-base">
            GPA Prediction & Tuition Fee Estimation tailored for UIU students
          </p>

          {/* Tab Toggle */}
          <div className="flex bg-surface-container border border-outline-variant rounded-xl p-1 relative w-full max-w-md mt-4">
            <button 
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === 'gpa' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => { setActiveTab('gpa'); setShowModal(false); }}
            >
              <span className="material-symbols-outlined text-[18px]">school</span> GPA Predictor
            </button>
            <button 
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === 'tuition' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => { setActiveTab('tuition'); setShowModal(false); }}
            >
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Tuition Estimator
            </button>
            <motion.div 
              className="absolute top-1 bottom-1 bg-primary rounded-lg shadow-lg"
              initial={false}
              animate={{ 
                left: activeTab === 'gpa' ? '4px' : 'calc(50% + 2px)',
                right: activeTab === 'gpa' ? 'calc(50% + 2px)' : '4px'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className={`grid grid-cols-1 gap-8 ${activeTab === 'gpa' ? 'lg:grid-cols-3' : ''}`}>
          <div className="lg:col-span-2 flex flex-col gap-6">
            {activeTab === 'gpa' ? (
              <>
                {/* GPA Current Standing */}
                <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Current Standing</h3>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Your existing academic record</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Completed Credits</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 45"
                        className="bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                        value={currentStanding.completedCredits}
                        onChange={(e) => setCurrentStanding({...currentStanding, completedCredits: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Current CGPA</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g. 3.50"
                        className="bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                        value={currentStanding.currentCgpa}
                        onChange={(e) => setCurrentStanding({...currentStanding, currentCgpa: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* GPA Courses */}
                <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                      <span className="material-symbols-outlined">list_alt</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">This Trimester</h3>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">List of courses you are taking</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {courses.map((course) => (
                      <motion.div layout key={course.id} className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl flex flex-col gap-4 transition-colors hover:border-outline-variant/60">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex-1 min-w-[100px] flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-on-surface-variant uppercase">Credits</label>
                            <select 
                              className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
                              value={course.credits}
                              onChange={(e) => updateCourse(course.id, 'credits', parseFloat(e.target.value))}
                            >
                              <option value="1">1 Credit</option>
                              <option value="2">2 Credits</option>
                              <option value="3">3 Credits</option>
                              <option value="4">4 Credits</option>
                            </select>
                          </div>
                          <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-on-surface-variant uppercase">Expected Grade</label>
                            <select 
                              className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
                              value={course.grade}
                              onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                            >
                              {Object.keys(UIU_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-3 pt-5">
                            <button 
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${course.isRetake ? 'bg-secondary/20 border-secondary text-secondary' : 'border-outline-variant text-on-surface-variant hover:text-on-surface'}`}
                              onClick={() => updateCourse(course.id, 'isRetake', !course.isRetake)}
                            >
                              Retake
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-all" onClick={() => removeCourse(course.id)}>
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {course.isRetake && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 mt-1 border-t border-outline-variant/20 flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-on-surface-variant uppercase">Previous Grade</label>
                                <select 
                                  className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors max-w-[120px]"
                                  value={course.previousGrade}
                                  onChange={(e) => updateCourse(course.id, 'previousGrade', e.target.value)}
                                >
                                  {Object.keys(UIU_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    className="w-full py-3 border-2 border-outline-variant rounded-xl text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                    onClick={addCourse}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Another Course
                  </button>
                </div>
              </>
            ) : (
              /* Tuition Estimator */
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Fee Parameters</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Select your program and enter details</p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Program Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        { id: 'TRIMESTER_BSBGE', label: 'BSBGE (Trimester)' },
                        { id: 'TRIMESTER_OTHER', label: 'Other (Trimester)' },
                        { id: 'SEMESTER_BPHARM', label: 'B.Pharm (Semester)' }
                      ].map(type => (
                        <button 
                          key={type.id}
                          className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all ${tuitionData.programType === type.id ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:text-on-surface'}`}
                          onClick={() => setTuitionData({...tuitionData, programType: type.id})}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Regular Credits</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 12"
                        className="bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                        value={tuitionData.regularCredits}
                        onChange={(e) => setTuitionData({...tuitionData, regularCredits: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Retake Credits</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 3"
                        className="bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                        value={tuitionData.retakeCredits}
                        onChange={(e) => setTuitionData({...tuitionData, retakeCredits: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fee Per Credit (৳)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 4000"
                        className="bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-medium text-sm"
                        value={tuitionData.perCreditFee}
                        onChange={(e) => setTuitionData({...tuitionData, perCreditFee: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Scholarship Waiver</label>
                      <select 
                        className="bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors font-medium text-sm cursor-pointer"
                        value={tuitionData.waiver}
                        onChange={(e) => setTuitionData({...tuitionData, waiver: parseInt(e.target.value)})}
                      >
                        {WAIVERS.map(w => <option key={w} value={w}>{w}% Waiver</option>)}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl cursor-pointer group hover:bg-surface-container-high transition-all">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-outline-variant bg-surface text-primary focus:ring-primary cursor-pointer"
                        checked={tuitionData.isAfterBatch251}
                        onChange={(e) => setTuitionData({...tuitionData, isAfterBatch251: e.target.checked})}
                      />
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                      Batch after 251 (Tk. 20,000 pre-registration payment)
                    </span>
                  </label>

                  {/* Quick Info */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-col gap-3">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">info</span> Fee Structure Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">Base Fee</span>
                        <span className="text-sm font-bold text-on-surface">৳{tuitionData.programType.includes('TRIMESTER') ? '6,500' : '9,750'}</span>
                      </div>
                      {tuitionData.programType === 'TRIMESTER_BSBGE' && (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase">Lab Fee</span>
                          <span className="text-sm font-bold text-on-surface">৳2,000</span>
                        </div>
                      )}
                      {tuitionData.programType === 'SEMESTER_BPHARM' && (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase">Lab Fee</span>
                          <span className="text-sm font-bold text-on-surface">৳5,000</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">Retake</span>
                        <span className="text-sm font-bold text-secondary">50% Off</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button 
                className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all flex items-center gap-2 text-xs font-bold"
                onClick={resetAll}
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset
              </button>
              <button 
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
                onClick={activeTab === 'gpa' ? calculateGpa : calculateTuition}
              >
                {activeTab === 'gpa' ? 'PREDICT MY GPA' : 'CALCULATE FEES'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Sidebar / References */}
          {activeTab === 'gpa' && (
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h3 className="font-bold text-base">Grading Standards</h3>
                </div>
                <div className="flex flex-col border border-outline-variant/30 rounded-xl overflow-hidden">
                  {Object.entries(UIU_GRADES).map(([g, p], index) => (
                    <div key={g} className={`flex justify-between items-center px-4 py-2.5 text-[11px] ${index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container'}`}>
                      <span className="font-black text-primary w-8">{g}</span>
                      <span className="text-on-surface-variant font-medium">{p.toFixed(2)} Points</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Modals */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setShowModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-surface-container border border-outline-variant rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                
                <button className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setShowModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
                
                {activeTab === 'gpa' && gpaResults && (
                  <div className="flex flex-col items-center text-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span className="material-symbols-outlined text-[40px]">school</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-2xl font-bold">Prediction Results</h2>
                      <p className="text-xs text-on-surface-variant font-medium">Based on your current standing and projected grades</p>
                    </div>

                    <div className="w-full bg-surface-container-highest border border-outline-variant rounded-2xl p-6 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Projected CGPA</span>
                      <span className="text-6xl font-black text-white tracking-tighter">{gpaResults.predictedCgpa}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">Trimester GPA</span>
                        <span className="text-xl font-bold">{gpaResults.semesterGpa}</span>
                      </div>
                      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase">Total Credits</span>
                        <span className="text-xl font-bold">{gpaResults.totalCredits}</span>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all tracking-wider" onClick={() => setShowModal(false)}>
                      GREAT, GOT IT!
                    </button>
                  </div>
                )}

                {activeTab === 'tuition' && tuitionResults && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                        <span className="material-symbols-outlined text-[32px]">account_balance_wallet</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Tuition Breakdown</h2>
                        <p className="text-xs text-on-surface-variant font-medium">Estimated costs for your registration</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-low">
                      <div className="px-5 py-4 border-b border-outline-variant/30 flex flex-col gap-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Regular Credits ({tuitionResults.regularCredits} × ৳{tuitionResults.perCreditFee})</span>
                          <span className="font-bold font-mono">৳{tuitionResults.regularTuitionFee?.toLocaleString()}</span>
                        </div>
                        {tuitionResults.waiver > 0 && (
                          <div className="flex justify-between text-xs text-secondary">
                            <span className="font-medium">Scholarship Discount ({tuitionResults.waiver}%)</span>
                            <span className="font-bold font-mono">-৳{tuitionResults.waiverAmount?.toLocaleString()}</span>
                          </div>
                        )}
                        {tuitionResults.retakeCredits > 0 && (
                          <div className="flex justify-between text-xs text-secondary">
                            <span className="font-medium">Retake Discount (50% Off)</span>
                            <span className="font-bold font-mono">-৳{tuitionResults.retakeDiscountAmount?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{tuitionResults.programType.includes('TRIMESTER') ? 'Trimester Fee' : 'Semester Fee'}</span>
                          <span className="font-bold font-mono">৳{tuitionResults.baseFee?.toLocaleString()}</span>
                        </div>
                        {tuitionResults.labFee > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Laboratory Fee</span>
                            <span className="font-bold font-mono">৳{tuitionResults.labFee?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-4 bg-surface-container-highest flex justify-between items-center">
                        <span className="font-bold text-base">Total Estimated Fee</span>
                        <span className="text-2xl font-black text-white font-mono">৳{tuitionResults.totalFee?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span> Payment Schedule
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tuitionResults.isAfterBatch251 && (
                          <div className="col-span-full p-4 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center">
                            <span className="text-xs font-bold text-primary">Pre-registration Payment</span>
                            <span className="font-mono font-bold text-sm">৳{tuitionResults.paymentSchedule.preRegistrationPayment.toLocaleString()}</span>
                          </div>
                        )}
                        {[1, 2, 3, 4].map(num => {
                          const amount = tuitionResults.paymentSchedule[`installment${num}`];
                          if (!amount || amount <= 0) return null;
                          const perc = tuitionResults.programType.includes('TRIMESTER') 
                            ? (num === 1 ? '40%' : '30%') 
                            : '25%';
                          return (
                            <div key={num} className="p-3 bg-surface-container-highest/30 border border-outline-variant/20 rounded-xl flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-on-surface-variant uppercase">Installment {num} ({perc})</span>
                              <span className="font-bold font-mono text-sm">৳{amount.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button className="w-full py-3 bg-surface-container-highest border border-outline-variant rounded-xl font-bold hover:bg-surface-variant transition-all mt-2 text-xs tracking-wide" onClick={() => setShowModal(false)}>
                      CLOSE BREAKDOWN
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
