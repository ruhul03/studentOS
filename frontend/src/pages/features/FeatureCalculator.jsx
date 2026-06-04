import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Calculator, Award, Wallet, CalendarClock } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

export function FeatureCalculator() {
  const navigate = useNavigate();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "UIU Tuition Fee Calculator & CGPA Predictor",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": "United International University",
      "location": "Dhaka, Bangladesh"
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-lg text-on-surface">
      <SEO 
        title="UIU Tuition Fee Calculator & CGPA Predictor | StudentOS" 
        description="Calculate your United International University (UIU) tuition fees, lab fees, retakes, and predict your CGPA accurately with the StudentOS Calculator."
        schema={schema}
      />
      
      {/* Top Header */}
      <header className="w-full px-8 py-4 flex items-center justify-between border-b border-outline-variant/30 backdrop-blur-md fixed top-0 z-50 bg-background/80">
        <div className="font-h3 text-xl font-bold tracking-tight text-primary cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
          <GraduationCap size={24} className="fill-current" />
          StudentOS
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 font-label-caps text-sm bg-primary text-on-primary hover:bg-primary-fixed rounded-xl transition-colors cursor-pointer"
        >
          Log In
        </button>
      </header>

      <main className="flex-1 flex flex-col pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Calculator size={18} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">UIU Student Tool</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
            UIU Tuition Fee <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Calculator & Predictor</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Stop guessing your trimester costs. Instantly calculate your United International University tuition fees including lab costs, retake discounts, and scholarships. Plus, map out your path to a 4.0 with the GPA predictor.
          </p>
          <button 
            onClick={() => navigate('/login?redirect=calculator')}
            className="px-8 py-4 bg-primary text-on-primary rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            Access Calculator Free <ArrowRight size={20} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
              <Wallet size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Accurate Tuition Costs</h3>
            <p className="text-on-surface-variant text-sm">Automatically calculates per-credit costs, 50% retake discounts, and waiver percentages specific to UIU.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Award size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">CGPA Predictor</h3>
            <p className="text-on-surface-variant text-sm">Input your current CGPA and expected grades to instantly see how your trimester will impact your overall standing.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <CalendarClock size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Installment Breakdown</h3>
            <p className="text-on-surface-variant text-sm">Generates a detailed breakdown of your pre-registration fees and upcoming installment deadlines.</p>
          </div>
        </div>
      </main>

      <footer className="w-full px-8 py-8 border-t border-outline-variant/30 bg-surface-container-lowest text-center">
        <p className="font-body-sm text-xs text-on-surface-variant">&copy; 2026 StudentOS. Developed for UIU Students.</p>
      </footer>
    </div>
  );
}
