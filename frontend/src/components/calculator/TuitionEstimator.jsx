import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Wallet } from 'lucide-react';

export function TuitionEstimator({ onCalculate }) {
  const [data, setData] = useState({
    programType: 'TRIMESTER_BSBGE', 
    regularCredits: '',
    retakeCredits: '',
    perCreditFee: '',
    waiver: 0,
    isAfterBatch251: true
  });

  const handleCalculate = () => {
    const regularCr = parseFloat(data.regularCredits) || 0;
    const retakeCr = parseFloat(data.retakeCredits) || 0;
    const feePerCr = parseFloat(data.perCreditFee) || 0;
    
    if (feePerCr === 0 && regularCr + retakeCr > 0) return;

    const regularTuition = regularCr * feePerCr;
    const waiverAmount = regularTuition * (data.waiver / 100);
    const regularPayable = regularTuition - waiverAmount;
    const retakeDiscount = retakeCr * (feePerCr * 0.5);
    const tuitionFee = regularPayable + (retakeCr * feePerCr) - retakeDiscount; 
    
    let baseFee = 6500;
    let labFee = 0;
    
    if (data.programType === 'TRIMESTER_BSBGE') labFee = 2000;
    else if (data.programType === 'SEMESTER_BPHARM') {
      baseFee = 9750;
      labFee = 5000;
    } else if (data.programType === 'SEMESTER_OTHER') {
      baseFee = 9750;
    }

    const totalFee = tuitionFee + baseFee + labFee;
    const remainingAfterPre = data.isAfterBatch251 ? Math.max(0, totalFee - 20000) : totalFee;
    
    const schedule = {
      preRegistration: data.isAfterBatch251 ? 20000 : 0,
      installments: data.programType.includes('TRIMESTER') 
        ? [remainingAfterPre * 0.4, remainingAfterPre * 0.3, remainingAfterPre * 0.3]
        : [remainingAfterPre * 0.25, remainingAfterPre * 0.25, remainingAfterPre * 0.25, remainingAfterPre * 0.25]
    };

    onCalculate({
      ...data,
      regularTuition, waiverAmount, regularPayable, retakeDiscount,
      tuitionFee, baseFee, labFee, totalFee, schedule
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Banknote size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Fee Parameters</h3>
            <p className="text-xs text-on-surface-variant font-medium opacity-70">Program details and credits</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Program Enrollment</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'TRIMESTER_BSBGE', label: 'BSBGE' },
                { id: 'TRIMESTER_OTHER', label: 'Other (Tri)' },
                { id: 'SEMESTER_BPHARM', label: 'B.Pharm' },
                { id: 'SEMESTER_OTHER', label: 'Other (Sem)' }
              ].map(p => (
                <button 
                  key={p.id}
                  onClick={() => setData({...data, programType: p.id})}
                  className={`py-3 px-2 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all ${data.programType === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Regular Credits</label>
              <input 
                type="number" placeholder="e.g. 12"
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary transition-all"
                value={data.regularCredits}
                onChange={e => setData({...data, regularCredits: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Retake Credits</label>
              <input 
                type="number" placeholder="e.g. 3"
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary transition-all"
                value={data.retakeCredits}
                onChange={e => setData({...data, retakeCredits: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Fee Per Credit (৳)</label>
              <input 
                type="number" placeholder="e.g. 4500"
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary transition-all"
                value={data.perCreditFee}
                onChange={e => setData({...data, perCreditFee: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Scholarship Waiver</label>
              <select 
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer"
                value={data.waiver}
                onChange={e => setData({...data, waiver: parseInt(e.target.value)})}
              >
                {[0, 25, 50, 75, 100].map(w => <option key={w} value={w}>{w}% Waiver</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-4 p-5 bg-surface-container-high/50 border border-outline-variant/20 rounded-2xl cursor-pointer group hover:bg-surface-container-high transition-all">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-outline-variant bg-surface text-primary focus:ring-primary cursor-pointer"
              checked={data.isAfterBatch251}
              onChange={e => setData({...data, isAfterBatch251: e.target.checked})}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Batch After 251</span>
              <span className="text-[10px] text-on-surface-variant font-medium opacity-70 italic tracking-tight">Requires ৳20,000 pre-registration payment</span>
            </div>
          </label>
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        className="w-full py-5 bg-secondary text-on-secondary rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-secondary/30 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        Estimate Total Fees
        <Wallet size={20} />
      </button>
    </div>
  );
}
