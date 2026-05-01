import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body-lg text-on-surface">
      {/* Top NavBar */}
      <nav className="w-full px-8 py-4 flex items-center justify-between border-b border-outline-variant/30 backdrop-blur-xl fixed top-0 z-50 bg-surface-lowest/80">
        <div className="flex items-center gap-2 cursor-pointer font-h3 text-xl font-bold tracking-tight text-primary" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          StudentOS
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/dashboard?tab=resources')} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors">Resources</button>
          <button onClick={() => navigate('/dashboard?tab=services')} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors">Services</button>
          <button onClick={() => navigate('/dashboard?tab=planner')} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors">Planner</button>
          <button onClick={() => navigate('/dashboard?tab=market')} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors">Marketplace</button>
          <button onClick={() => navigate('/dashboard?tab=lostfound')} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors">Lost & Found</button>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button className="px-4 py-2 font-label-caps text-xs border border-outline-variant hover:bg-surface-variant text-on-surface rounded-lg transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <button className="px-4 py-2 font-label-caps text-xs text-on-surface hover:bg-surface-variant rounded-lg transition-colors" onClick={() => navigate('/login')}>Login</button>
              <button className="px-4 py-2 font-label-caps text-xs bg-primary text-on-primary hover:bg-primary-fixed rounded-lg transition-colors shadow-[0_4px_14px_rgba(192,193,255,0.1)]" onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-24 pb-12 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative w-full max-w-[1200px] mx-auto px-8 flex flex-col items-center justify-center text-center min-h-[calc(100vh-96px)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center max-w-[800px] py-20"
          >
            <span className="px-3 py-1 font-label-caps text-xs bg-surface-container-high border border-outline-variant text-primary rounded-full mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Academic Precision Redefined
            </span>
            <h1 className="font-h1 text-5xl md:text-7xl font-bold text-on-surface mb-6 leading-tight tracking-tight">
              Your Unified <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Campus Experience</span>
            </h1>
            <p className="font-body-lg text-lg text-on-surface-variant mb-10 max-w-[600px] leading-relaxed">
              Centralize your academic life. From intelligent task management to campus services, StudentOS provides the focus you need to excel.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                className="px-8 py-4 font-label-caps text-sm bg-primary text-on-primary hover:bg-primary-fixed rounded-xl transition-colors shadow-[0_8px_30px_rgba(192,193,255,0.2)] flex items-center gap-2"
                onClick={handleStart}
              >
                Get Started for Free <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button 
                className="px-8 py-4 font-label-caps text-sm bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface rounded-xl transition-colors flex items-center gap-2"
                onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Modules <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid (Bento Style) */}
        <section id="modules" className="w-full max-w-[1200px] mx-auto px-8 py-20 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="font-h2 text-3xl font-bold text-on-surface mb-4">Core Modules</h2>
            <p className="font-body-lg text-on-surface-variant max-w-[500px]">Designed for high-performance student workflows.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Study Resources (Large) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-8 bg-surface-container border border-outline-variant rounded-2xl p-8 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/dashboard?tab=resources')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">Study Resources</h3>
                <p className="font-body-sm text-on-surface-variant max-w-[400px]">Centralized repository for notes, past papers, and academic materials. Search instantly and organize seamlessly.</p>
              </div>
            </motion.div>

            {/* Campus Services */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/dashboard?tab=services')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-[40px] group-hover:bg-secondary/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 border border-secondary/20">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">Campus Services</h3>
                <p className="font-body-sm text-on-surface-variant">Live status of library seating, cafeteria queues, and shuttle buses.</p>
              </div>
            </motion.div>

            {/* Intelligent Planner */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/dashboard?tab=planner')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-tertiary/10 rounded-full blur-[40px] group-hover:bg-tertiary/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6 border border-tertiary/20">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">Intelligent Planner</h3>
                <p className="font-body-sm text-on-surface-variant">Syllabus-aware task management that prioritizes deadlines automatically.</p>
              </div>
            </motion.div>

            {/* Student Marketplace */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/dashboard?tab=market')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-fixed mb-6 border border-primary/30">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">Student Marketplace</h3>
                <p className="font-body-sm text-on-surface-variant">Securely buy, sell, or trade textbooks and electronics on campus.</p>
              </div>
            </motion.div>

            {/* Lost & Found */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/dashboard?tab=lostfound')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-error/10 rounded-full blur-[40px] group-hover:bg-error/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error mb-6 border border-error/20">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>find_in_page</span>
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">Lost & Found</h3>
                <p className="font-body-sm text-on-surface-variant">Community-driven reporting network to quickly recover misplaced items.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-[1200px] mx-auto px-8 py-20 relative">
          <div className="bg-surface-container-high border border-outline-variant rounded-3xl p-12 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-[600px]">
              <h2 className="font-h1 text-3xl md:text-4xl font-bold text-on-surface mb-4">Ready to optimize your semester?</h2>
              <p className="font-body-lg text-on-surface-variant mb-8">Join thousands of students who have upgraded their academic workflow with StudentOS.</p>
              <button 
                className="px-8 py-4 font-label-caps text-sm bg-primary text-on-primary hover:bg-primary-fixed rounded-xl transition-colors shadow-[0_8px_30px_rgba(192,193,255,0.2)] flex items-center gap-2 mx-auto"
                onClick={handleStart}
              >
                Create Free Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-8 border-t border-outline-variant/30 bg-surface-container-lowest z-10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="font-h3 text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              StudentOS
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant">&copy; 2026 StudentOS. Engineered for Academic Excellence.</p>
          </div>
          <div className="flex gap-6 font-body-sm text-xs text-on-surface-variant">
            <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button>
            <button onClick={() => navigate('/status')} className="hover:text-primary transition-colors">API Status</button>
            <button onClick={() => navigate('/support')} className="hover:text-primary transition-colors">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

