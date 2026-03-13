import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import './CompanyPages.css';

export function Privacy() {
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
          <div className="icon-badge safety-bg"><Shield size={32} /></div>
          <h1>Privacy Policy</h1>
          <p className="lead">How we protect your data at UIU StudentOS.</p>
        </header>

        <section className="article-section text-left">
          <p className="update-date">Last Updated: March 14, 2026</p>
          
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, upload resources, or 
            communicate with other students. This includes your name, university email, and academic preferences.
          </p>

          <h2>2. How We Use Your Data</h2>
          <p>
            Your data is used solely to provide and improve the StudentOS experience. We use your academic information 
            to personalize your dashboard and notification settings.
          </p>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your personal data. Your profile information is visible to other verified students 
            within the UIU network to facilitate collaboration and resource sharing.
          </p>

          <h2>4. Security</h2>
          <p>
            We implement industry-standard security measures to protect your information from unauthorized access 
            or disclosure.
          </p>
        </section>
      </main>

      <footer className="company-footer">
        <p>&copy; 2026 StudentOS Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
