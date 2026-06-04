import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, BookOpen, Download, FileText, Search } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

export function FeatureResources() {
  const navigate = useNavigate();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "UIU Question Bank & Resources",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": "United International University",
      "location": "Dhaka, Bangladesh"
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-lg text-on-surface">
      <SEO 
        title="UIU Question Bank, Notes & Academic Resources | StudentOS" 
        description="Access the largest repository of past UIU midterms, finals, class notes, and slides. Shared by United International University students, for students."
        schema={schema}
      />
      
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
            <BookOpen size={18} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">UIU Academic Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
            UIU Question Bank & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Study Resources</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Aces your exams with access to a crowd-sourced archive of previous midterm questions, final papers, lecture slides, and handwritten notes from UIU alumni and peers.
          </p>
          <button 
            onClick={() => navigate('/login?redirect=resources')}
            className="px-8 py-4 bg-primary text-on-primary rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            Access the Question Bank <ArrowRight size={20} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
              <FileText size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Past Question Papers</h3>
            <p className="text-on-surface-variant text-sm">Find midterms, finals, and class tests categorized by course code, department, and faculty member.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6">
              <Download size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Handwritten Notes</h3>
            <p className="text-on-surface-variant text-sm">Download PDFs of the best lecture notes from top-performing students across all sections.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <Search size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Instant Search</h3>
            <p className="text-on-surface-variant text-sm">Quickly search by course ID (e.g., CSE-115) to find all relevant resources in seconds.</p>
          </div>
        </div>
      </main>

      <footer className="w-full px-8 py-8 border-t border-outline-variant/30 bg-surface-container-lowest text-center">
        <p className="font-body-sm text-xs text-on-surface-variant">&copy; 2026 StudentOS. Developed for UIU Students.</p>
      </footer>
    </div>
  );
}
