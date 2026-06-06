import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, ChevronDown, BookOpen, Landmark, Calendar, Store, FileSearch, Sun, Moon } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
          <GraduationCap size={24} className="fill-current" />
          StudentOS
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button className="px-4 py-2 font-label-caps text-xs border border-outline-variant hover:bg-surface-variant text-on-surface rounded-lg transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <button className="px-4 py-2 font-label-caps text-xs text-on-surface hover:bg-surface-variant rounded-lg transition-colors" onClick={() => navigate('/login')}>Login</button>
              <button className="px-4 py-2 font-label-caps text-xs bg-primary text-on-primary hover:bg-primary-fixed rounded-lg transition-colors shadow-[0_4px_14px_rgba(129,140,248,0.1)]" onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
          
          <button 
            onClick={toggleTheme} 
            className="p-2 ml-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors flex items-center justify-center border border-outline-variant/30 shadow-sm"
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-24 pb-12 max-md:pt-16 max-md:pb-6 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative w-full max-w-[1200px] mx-auto px-8 max-md:px-4 flex flex-col items-center justify-center text-center min-h-[calc(100vh-96px)] max-md:min-h-[85vh]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none max-md:hidden"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center max-w-[800px] py-20 max-md:py-10"
          >
            <span className="px-3 py-1 font-label-caps text-xs bg-surface-container-high border border-outline-variant text-primary rounded-full mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Academic Precision Redefined
            </span>
            <h1 className="font-h1 text-5xl md:text-7xl font-bold text-on-surface mb-6 leading-tight tracking-tight max-md:text-4xl">
              United International <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">University (UIU) Dashboard</span>
            </h1>
            <p className="font-body-lg text-lg max-md:text-base text-on-surface-variant mb-10 max-md:mb-8 max-w-[600px] leading-relaxed">
              Centralize your UIU academic life. From intelligent task management to campus services, StudentOS provides the focus you need to excel at UIU.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
              <button 
                className="w-full sm:w-auto px-8 py-4 font-label-caps text-sm bg-primary text-on-primary hover:bg-primary-fixed rounded-xl transition-colors shadow-[0_8px_30px_rgba(129,140,248,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                onClick={handleStart}
              >
                Get Started for Free <ArrowRight size={18} />
              </button>
              <button 
                className="w-full sm:w-auto px-8 py-4 font-label-caps text-sm bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}
              >
                Explore UIU Tools <ChevronDown size={18} />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid (Bento Style) */}
        <section id="modules" className="w-full max-w-[1200px] mx-auto px-8 max-md:px-4 py-20 max-md:py-10 relative z-10">
          <div className="flex flex-col items-center text-center mb-16 max-md:mb-10">
            <h2 className="font-h2 text-3xl max-md:text-2xl font-bold text-on-surface mb-4">Core UIU Modules</h2>
            <p className="font-body-lg max-md:text-base text-on-surface-variant max-w-[500px]">Designed specifically for high-performance UIU student workflows.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-md:gap-4">
            {/* Study Resources (Large) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-8 bg-surface-container border border-outline-variant rounded-2xl p-8 max-md:p-6 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/features/resources')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors max-md:hidden"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                  <BookOpen size={24} className="fill-current" />
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">UIU Question Bank & Notes</h3>
                <p className="font-body-sm text-on-surface-variant max-w-[400px]">Access past UIU midterms, finals, class notes, and slides shared by alumni and peers. Search instantly and organize seamlessly.</p>
              </div>
            </motion.div>

            {/* Campus Services */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 max-md:p-6 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/login')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-[40px] group-hover:bg-secondary/20 transition-colors max-md:hidden"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 border border-secondary/20">
                  <Landmark size={24} className="fill-current" />
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">UIU Campus Services</h3>
                <p className="font-body-sm text-on-surface-variant">Live status of library seating, cafeteria queues, and shuttle buses.</p>
              </div>
            </motion.div>

            {/* Intelligent Planner */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 max-md:p-6 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/features/calculator')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-tertiary/10 rounded-full blur-[40px] group-hover:bg-tertiary/20 transition-colors max-md:hidden"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6 border border-tertiary/20">
                  <Calendar size={24} className="fill-current" />
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">UIU Tuition Calculator</h3>
                <p className="font-body-sm text-on-surface-variant">Accurately calculate your trimester fees and predict your CGPA.</p>
              </div>
            </motion.div>

            {/* Student Marketplace */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 max-md:p-6 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/features/marketplace')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-colors max-md:hidden"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-fixed mb-6 border border-primary/30">
                  <Store size={24} className="fill-current" />
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">UIU Marketplace</h3>
                <p className="font-body-sm text-on-surface-variant">Securely buy, sell, or trade textbooks and electronics on campus.</p>
              </div>
            </motion.div>

            {/* Course Reviews */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-1 md:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-8 max-md:p-6 hover:bg-surface-container-high transition-all cursor-pointer relative overflow-hidden group"
              onClick={() => navigate('/features/reviews')}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-error/10 rounded-full blur-[40px] group-hover:bg-error/20 transition-colors max-md:hidden"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error mb-6 border border-error/20">
                  <FileSearch size={24} className="fill-current" />
                </div>
                <h3 className="font-h3 text-xl font-bold text-on-surface mb-3">UIU Faculty Reviews</h3>
                <p className="font-body-sm text-on-surface-variant">Read anonymous student reviews of UIU faculty and courses before you enroll.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-[1200px] mx-auto px-8 max-md:px-4 py-20 max-md:py-10 relative">
          <div className="bg-surface-container-high border border-outline-variant max-md:border-none rounded-3xl max-md:rounded-2xl p-12 max-md:p-8 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-[600px]">
              <h2 className="font-h1 text-3xl md:text-4xl font-bold text-on-surface mb-4">Ready to optimize your semester?</h2>
              <p className="font-body-lg max-md:text-base text-on-surface-variant mb-8 max-md:mb-6">Join thousands of students who have upgraded their academic workflow with StudentOS.</p>
              <button 
                className="w-full sm:w-auto px-8 py-4 font-label-caps text-sm bg-primary text-on-primary hover:bg-primary-fixed rounded-xl transition-colors shadow-[0_8px_30px_rgba(129,140,248,0.2)] flex items-center justify-center gap-2 mx-auto"
                onClick={handleStart}
              >
                Create Free Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 max-md:px-4 py-8 max-md:py-6 border-t border-outline-variant/30 bg-surface-container-lowest z-10 pb-safe">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 max-md:gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 max-md:gap-2 text-center md:text-left">
            <span className="font-h3 text-lg font-bold text-primary flex items-center justify-center gap-2">
              <GraduationCap size={24} className="fill-current" />
              StudentOS
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant">&copy; 2026 StudentOS. Engineered for Academic Excellence.</p>
          </div>
          <div className="flex justify-center gap-6 font-body-sm text-xs text-on-surface-variant">
            <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

