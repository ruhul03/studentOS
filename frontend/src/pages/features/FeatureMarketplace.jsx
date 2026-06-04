import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Store, ShieldCheck, Tag, Repeat } from 'lucide-react';
import SEO from '../../components/SEO/SEO';

export function FeatureMarketplace() {
  const navigate = useNavigate();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "UIU Student Marketplace",
    "applicationCategory": "BusinessApplication",
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
        title="UIU Student Marketplace | Buy & Sell Books and Gadgets" 
        description="The safest place for United International University (UIU) students to buy, sell, or trade used textbooks, calculators, and electronics exclusively on campus."
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Store size={18} className="text-secondary" />
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">UIU Student Economy</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
            UIU Exclusive <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Marketplace</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Stop buying overpriced new books. Buy, sell, and trade used textbooks, electronics, and campus essentials securely with other verified United International University students.
          </p>
          <button 
            onClick={() => navigate('/login?redirect=marketplace')}
            className="px-8 py-4 bg-secondary text-on-secondary rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            Enter Marketplace <ArrowRight size={20} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">100% Verified Students</h3>
            <p className="text-on-surface-variant text-sm">Every seller and buyer is authenticated via their @uiu.ac.bd email address ensuring a safe trading environment.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Tag size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Zero Commission</h3>
            <p className="text-on-surface-variant text-sm">Post listings for free and keep 100% of your money. Deal directly with buyers on campus.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6">
              <Repeat size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">Instant Messaging</h3>
            <p className="text-on-surface-variant text-sm">Chat in real-time with sellers using our built-in secure messaging system to negotiate prices and arrange meetups.</p>
          </div>
        </div>
      </main>

      <footer className="w-full px-8 py-8 border-t border-outline-variant/30 bg-surface-container-lowest text-center">
        <p className="font-body-sm text-xs text-on-surface-variant">&copy; 2026 StudentOS. Developed for UIU Students.</p>
      </footer>
    </div>
  );
}
