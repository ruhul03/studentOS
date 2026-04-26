import React from 'react';
import { useNavigate } from 'react-router-dom';

export function About() {
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

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="text-center mb-16 md:mb-24">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-lg shadow-primary/5">
            <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">About StudentOS</h1>
          <p className="text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-3xl mx-auto">
            Built for students, by students. The ultimate companion for your university journey.
          </p>
        </header>

        {/* Mission Section */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            Our Mission
          </h2>
          <div className="space-y-6 text-lg text-on-surface-variant leading-relaxed">
            <p>
              StudentOS was born out of a simple observation: university life is complex. Between finding reliable study materials, 
              navigating campus services, and staying connected with the community, students often find themselves juggling 
              multiple fragmented platforms.
            </p>
            <p>
              Our mission is to unify the student experience in a single, high-performance workspace. We empower students 
              at United International University (UIU) with modern tools to succeed academically and socially.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 bg-surface-container-low border border-outline-variant rounded-3xl hover:bg-surface-container-high transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Focus</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Removing the noise so you can focus on what matters—your growth and learning.
            </p>
          </div>
          
          <div className="p-8 bg-surface-container-low border border-outline-variant rounded-3xl hover:bg-surface-container-high transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6 border border-tertiary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Trust</h3>
            <p className="text-on-surface-variant leading-relaxed">
              A community-driven platform where resources are shared transparently and safely.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20 p-12 bg-primary/5 border border-primary/10 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">The Team</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              We are a dedicated group of UIU students passionate about software engineering and user experience. 
              StudentOS is our contribution to the campus we call home.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 px-[5%] text-center border-t border-outline-variant bg-surface-container-low/30 text-on-surface-variant text-sm">
        <p>&copy; 2026 StudentOS Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
