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
      navigate('/');
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
            <button className="nav-btn primary" onClick={() => navigate('/')}>Dashboard</button>
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
          <div className="hero-badge">New: Fall 2026 Academic Season is Live!</div>
          <h1>The Operating System for <span>University Life</span></h1>
          <p>Everything you need to survive and thrive on campus. Resources, services, planning, and marketplace—all in one premium platform.</p>
          <div className="hero-btns">
            <button className="btn-main primary-gradient" onClick={handleStart}>
              Get Started for Free
              <Zap size={20} className="icon-pulse" />
            </button>
            <button className="btn-main secondary-glass" onClick={() => navigate('/login')}>Explore Features</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">10k+</span>
              <span className="stat-label">Active Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">50k+</span>
              <span className="stat-label">Resources Shared</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">100+</span>
              <span className="stat-label">Campus Services</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="glass-orbit">
             <div className="feature-card-floating res">
               <BookOpen color="#6366f1" />
               <span>CSE 101 Notes</span>
             </div>
             <div className="feature-card-floating srv">
               <Map color="#10b981" />
               <span>Medical Center</span>
             </div>
             <div className="feature-card-floating mkt">
               <ShoppingBag color="#f59e0b" />
               <span>Scientific Calculator</span>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2>Unified Campus Experience</h2>
          <p>Designed to solve every student's daily challenges with speed and style.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item glass-card">
            <div className="feature-icon study-bg"><BookOpen /></div>
            <h3>Study Resources</h3>
            <p>Access notes, past papers, and study guides shared by your peers.</p>
          </div>
          <div className="feature-item glass-card">
            <div className="feature-icon services-bg"><Map /></div>
            <h3>Campus Services</h3>
            <p>Find locations, operating hours, and live status of every campus facility.</p>
          </div>
          <div className="feature-item glass-card">
            <div className="feature-icon planner-bg"><Calendar /></div>
            <h3>Intelligent Planner</h3>
            <p>Stay on top of deadlines with an automated academic scheduler.</p>
          </div>
          <div className="feature-item glass-card">
            <div className="feature-icon market-bg"><ShoppingBag /></div>
            <h3>Student Marketplace</h3>
            <p>Buy and sell books, electronics, and essentials within your campus network.</p>
          </div>
          <div className="feature-item glass-card">
            <div className="feature-icon safety-bg"><Shield /></div>
            <h3>Lost & Found</h3>
            <p>Recover lost items or help others find theirs with our community board.</p>
          </div>
          <div className="feature-item glass-card">
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
          <blockquote>"StudentOS completely changed how I manage my university life. From finding notes to checking cafe hours, it's my go-to app."</blockquote>
          <cite>— Alex Johnson, Computer Science Major</cite>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">StudentOS</div>
            <p>Empowering students with better tools.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Platform</h4>
              <span>Resources</span>
              <span>Services</span>
              <span>Planner</span>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <span>About Us</span>
              <span>Privacy</span>
              <span>Terms</span>
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
