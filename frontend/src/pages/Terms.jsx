import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col font-inter">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-[5%] py-6 border-b border-outline-variant bg-surface-container-low/50 backdrop-blur-xl sticky top-0 z-[100]">
        <button 
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-semibold transition-colors group" 
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          Back
        </button>
        <div 
          className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-opacity text-primary" 
          onClick={() => navigate('/')}
        >
          StudentOS
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="text-center mb-16 md:mb-20">
          <div className="w-20 h-20 rounded-[2rem] bg-secondary/10 flex items-center justify-center mx-auto mb-8 border border-secondary/20 shadow-lg shadow-secondary/5">
            <span className="material-symbols-outlined text-[40px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">Terms of Service</h1>
          <p className="text-xl text-on-surface-variant leading-relaxed">
            Guidelines for using the StudentOS platform.
          </p>
        </header>

        <section className="bg-surface-container-low border border-outline-variant rounded-[2.5rem] p-8 md:p-12">
          <p className="text-sm font-medium text-on-surface-variant/60 italic mb-10 border-b border-outline-variant/30 pb-6">
            Last Updated: March 14, 2026
          </p>

          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                1. Acceptance of Terms
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                By accessing UIU StudentOS, you agree to comply with these terms and our university's code of conduct.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                2. Academic Integrity
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Resource sharing must comply with your course policies. Do not upload materials that violate 
                the academic integrity of United International University.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-tertiary rounded-full"></span>
                3. User Conduct
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                The platform is for academic and campus life purposes. Harassment, spam, or sharing of 
                inappropriate content is strictly prohibited.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-error rounded-full"></span>
                4. Termination
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                We reserve the right to suspend accounts that violate these terms or university policies.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-[5%] text-center border-t border-outline-variant bg-surface-container-low/30 text-on-surface-variant text-sm">
        <p>&copy; 2026 StudentOS Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
