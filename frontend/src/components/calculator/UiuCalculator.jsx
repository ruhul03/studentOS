import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GpaPredictor } from './GpaPredictor';
import { TuitionEstimator } from './TuitionEstimator';
import { GraduationCap, Banknote, X, Award, Wallet, CalendarClock } from 'lucide-react';

export function UiuCalculator() {
  const [activeTab, setActiveTab] = useState('gpa');
  const [modalData, setModalData] = useState(null);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Academic Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-3">
          UIU <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Unified</span> Calculator
        </h1>
        <p className="text-on-surface-variant max-w-xl text-sm font-medium opacity-80">
          Tailored precision tools for GPA prediction and tuition fee estimation.
        </p>

        {/* Tab Switcher */}
        <div className="flex bg-surface-container border border-outline-variant/30 rounded-2xl p-1.5 relative w-full max-w-md mt-10 shadow-inner">
          <button 
            className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all relative z-10 uppercase tracking-widest ${activeTab === 'gpa' ? 'text-on-primary' : 'text-on-surface-variant'}`}
            onClick={() => setActiveTab('gpa')}
          >
            <GraduationCap size={20} /> GPA Predictor
          </button>
          <button 
            className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all relative z-10 uppercase tracking-widest ${activeTab === 'tuition' ? 'text-on-primary' : 'text-on-surface-variant'}`}
            onClick={() => setActiveTab('tuition')}
          >
            <Banknote size={20} /> Fee Estimator
          </button>
          <motion.div 
            className="absolute inset-y-1.5 bg-primary rounded-xl shadow-xl shadow-primary/20"
            animate={{ 
              left: activeTab === 'gpa' ? '6px' : 'calc(50% + 3px)',
              right: activeTab === 'gpa' ? 'calc(50% + 3px)' : '6px'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
        </div>
      </div>

      {/* Calculator Body */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'gpa' ? (
              <GpaPredictor onCalculate={(res) => setModalData({ type: 'gpa', ...res })} />
            ) : (
              <TuitionEstimator onCalculate={(res) => setModalData({ type: 'tuition', ...res })} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Result Modal Overlay */}
      {modalData && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setModalData(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-xl bg-surface-container border border-outline-variant/30 rounded-[3rem] p-10 shadow-2xl z-10 overflow-hidden"
          >
            <button className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setModalData(null)}>
              <X size={24} />
            </button>

            {modalData.type === 'gpa' ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                  <Award size={40} />
                </div>
                <h2 className="text-3xl font-black text-on-surface mb-2">Projected Performance</h2>
                <p className="text-sm text-on-surface-variant font-medium opacity-70 mb-10">Academic prediction for your current load</p>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl p-8 flex flex-col items-center gap-2 shadow-inner">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Projected CGPA</span>
                    <span className="text-6xl font-black text-on-surface tracking-tighter tabular-nums">{modalData.predictedCgpa}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Trimester GPA</span>
                      <span className="text-2xl font-black text-on-surface tabular-nums">{modalData.semesterGpa}</span>
                    </div>
                    <div className="flex-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Total Credits</span>
                      <span className="text-2xl font-black text-on-surface tabular-nums">{modalData.totalCredits}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setModalData(null)}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Confirm Analysis
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                    <Wallet size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-on-surface leading-tight">Tuition Breakdown</h2>
                    <p className="text-xs text-on-surface-variant font-black uppercase tracking-widest opacity-60">Estimated Registration Costs</p>
                  </div>
                </div>

                <div className="bg-surface-container-high border border-outline-variant/20 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant font-medium">Credits ({modalData.regularCredits} Reg + {modalData.retakeCredits} Retake)</span>
                      <span className="font-bold text-on-surface">৳{(modalData.regularTuition + modalData.retakeCredits * modalData.perCreditFee).toLocaleString()}</span>
                    </div>
                    {modalData.waiverAmount > 0 && (
                      <div className="flex justify-between items-center text-sm text-emerald-500 font-bold">
                        <span>Waiver Discount ({modalData.waiver}%)</span>
                        <span>-৳{modalData.waiverAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {modalData.retakeDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm text-emerald-500 font-bold">
                        <span>Retake Discount (50% Off)</span>
                        <span>-৳{modalData.retakeDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant font-medium">Base & Lab Fees</span>
                      <span className="font-bold text-on-surface">৳{(modalData.baseFee + modalData.labFee).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 border-t border-primary/20 px-8 py-6 flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-widest text-primary">Total Estimated Payable</span>
                    <span className="text-3xl font-black text-primary tabular-nums">৳{modalData.totalFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                    <CalendarClock size={14} /> Installment Strategy
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {modalData.schedule.preRegistration > 0 && (
                      <div className="col-span-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Pre-Registration</span>
                        <span className="font-black text-emerald-600 text-sm">৳{modalData.schedule.preRegistration.toLocaleString()}</span>
                      </div>
                    )}
                    {modalData.schedule.installments.map((amt, i) => (
                      <div key={i} className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Inst. {i+1}</span>
                        <span className="font-black text-on-surface text-sm">৳{Math.round(amt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
