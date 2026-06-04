import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, MessageSquare, Star, ThumbsUp, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

export function FeatureReviews() {
  const navigate = useNavigate();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "UIU Faculty & Course Reviews",
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
        title="UIU Faculty & Course Reviews | StudentOS" 
        description="Read anonymous, honest reviews from United International University students about professors, courses, and grading schemes to plan your trimester perfectly."
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary/10 border border-tertiary/20 mb-6">
            <MessageSquare size={18} className="text-tertiary" />
            <span className="text-[10px] font-black text-tertiary uppercase tracking-widest">UIU Community Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
            UIU Faculty & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">Course Reviews</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Never enroll blindly again. Read verified, anonymous reviews from UIU students about teaching styles, grading leniency, and course workloads before you register for your next trimester.
          </p>
          <button 
            onClick={() => navigate('/login?redirect=reviews')}
            className="px-8 py-4 bg-tertiary text-on-tertiary rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-tertiary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            Read Faculty Reviews <ArrowRight size={20} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Star size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">5-Star Rating System</h3>
            <p className="text-on-surface-variant text-sm">See aggregated scores for teaching quality, grading fairness, and overall difficulty across all UIU departments.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
              <ThumbsUp size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Anonymous Feedback</h3>
            <p className="text-on-surface-variant text-sm">Provide and read 100% anonymous feedback safely. Help your juniors navigate their academic journey.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center text-error mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Red Flags & Tips</h3>
            <p className="text-on-surface-variant text-sm">Discover which courses require heavy assignments, mandatory attendance rules, or have difficult midterms.</p>
          </div>
        </div>
      </main>

      <footer className="w-full px-8 py-8 border-t border-outline-variant/30 bg-surface-container-lowest text-center">
        <p className="font-body-sm text-xs text-on-surface-variant">&copy; 2026 StudentOS. Developed for UIU Students.</p>
      </footer>
    </div>
  );
}
