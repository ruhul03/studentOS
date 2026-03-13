import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, ShieldCheck } from 'lucide-react';
import './CompanyPages.css';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="company-page-container">
      <nav className="company-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="logo" onClick={() => navigate('/')}>StudentOS</div>
      </nav>

      <main className="company-content">
        <header className="article-header">
          <div className="icon-badge study-bg"><Users size={32} /></div>
          <h1>About StudentOS</h1>
          <p className="lead">Built for students, by students. The ultimate companion for your university journey.</p>
        </header>

        <section className="article-section">
          <h2>Our Mission</h2>
          <p>
            StudentOS was born out of a simple observation: university life is complex. Between finding reliable study materials, 
            navigating campus services, and staying connected with the community, students often find themselves juggling 
            multiple fragmented platforms.
          </p>
          <p>
            Our mission is to unify the student experience in a single, high-performance workspace. We empower students 
            at United International University (UIU) with modern tools to succeed academically and socially.
          </p>
        </section>

        <section className="article-section grid-section">
          <div className="value-card glass-card">
            <Target className="value-icon" />
            <h3>Focus</h3>
            <p>Removing the noise so you can focus on what matters—your growth and learning.</p>
          </div>
          <div className="value-card glass-card">
            <ShieldCheck className="value-icon" />
            <h3>Trust</h3>
            <p>A community-driven platform where resources are shared transparently and safely.</p>
          </div>
        </section>

        <section className="article-section">
          <h2>The Team</h2>
          <p>
            We are a dedicated group of UIU students passionate about software engineering and user experience. 
            StudentOS is our contribution to the campus we call home.
          </p>
        </section>
      </main>

      <footer className="company-footer">
        <p>&copy; 2026 StudentOS Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
