import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Map, Calendar, ShoppingBag, Shield, Zap, Users, Globe } from 'lucide-react';
import './LandingPage.css';

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
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="logo">StudentOS</div>
        <div className="landing-nav-actions">
          {user ? (
            <button className="nav-btn primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <button className="nav-btn secondary" onClick={() => navigate('/login')}>Login</button>
              <button className="nav-btn primary" onClick={() => navigate('/register')}>Join StudentOS</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">The Quest for Excellence at UIU</div>
          <h1>Your Gateway to <span>UIU Success</span></h1>
          <p>The ultimate digital companion for UIU students. Resources, services, and campus life—tailored for the United International University community.</p>
          <div className="hero-btns">
            <button className="btn-main primary-gradient" onClick={handleStart}>
              Get Started
            </button>
            <button className="btn-main secondary-glass" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Explore Features</button>
          </div>
          </div>
        <div className="hero-visual">
          <div className="glass-orbit">
              <div className="feature-card-floating res">
                <BookOpen color="var(--aura-purple)" />
                <span>CSE 4165 Notes</span>
              </div>
              <div className="feature-card-floating srv">
                <Map color="#10b981" />
                <span>UIU Medical Center</span>
              </div>
              <div className="feature-card-floating mkt">
                <ShoppingBag color="var(--aura-pink)" />
                <span>UIU Bus Schedule</span>
              </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Unified Campus Experience</h2>
          <p>Designed to solve every student's daily challenges with speed and style.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item glass-card" onClick={() => navigate('/dashboard?tab=resources')}>
            <div className="feature-icon study-bg"><BookOpen /></div>
            <h3>Study Resources</h3>
            <p>Access notes, past papers, and study guides shared by your peers.</p>
          </div>
          <div className="feature-item glass-card" onClick={() => navigate('/dashboard?tab=services')}>
            <div className="feature-icon services-bg"><Map /></div>
            <h3>Campus Services</h3>
            <p>Find locations, operating hours, and live status of every campus facility.</p>
          </div>
          <div className="feature-item glass-card" onClick={() => navigate('/dashboard?tab=planner')}>
            <div className="feature-icon planner-bg"><Calendar /></div>
            <h3>Intelligent Planner</h3>
            <p>Stay on top of deadlines with an automated academic scheduler.</p>
          </div>
          <div className="feature-item glass-card" onClick={() => navigate('/dashboard?tab=market')}>
            <div className="feature-icon market-bg"><ShoppingBag /></div>
            <h3>Student Marketplace</h3>
            <p>Buy and sell books, electronics, and essentials within your campus network.</p>
          </div>
          <div className="feature-item glass-card" onClick={() => navigate('/dashboard?tab=lostfound')}>
            <div className="feature-icon safety-bg"><Shield /></div>
            <h3>Lost & Found</h3>
            <p>Recover lost items or help others find theirs with our community board.</p>
          </div>
          <div className="feature-item glass-card" onClick={() => navigate('/dashboard?tab=events')}>
            <div className="feature-icon global-bg"><Globe /></div>
            <h3>Global Network</h3>
            <p>Stay connected with real-time campus-wide announcements and notifications.</p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof">
        <div className="proof-content glass-card">
          <Users size={48} className="proof-icon" />
          <blockquote>"StudentOS is a lifesaver at UIU! From finding CSE 1110 notes to checking UIU bus schedules, it's the only app I need for campus life."</blockquote>
          <cite>— UIU CSE Student, Batch 241</cite>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">UIU StudentOS</div>
            <p>Empowering UIU Students with modern tools.</p>
            <p className="footer-address">United City, Madani Avenue, Badda, Dhaka</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Company</h4>
              <span onClick={() => navigate('/about')}>About Us</span>
              <span onClick={() => navigate('/privacy')}>Privacy</span>
              <span onClick={() => navigate('/terms')}>Terms</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 StudentOS Project. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
