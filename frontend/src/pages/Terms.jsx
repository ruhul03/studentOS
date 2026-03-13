import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import './CompanyPages.css';

export function Terms() {
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
          <div className="icon-badge global-bg"><FileText size={32} /></div>
          <h1>Terms of Service</h1>
          <p className="lead">Guidelines for using the StudentOS platform.</p>
        </header>

        <section className="article-section text-left">
          <p className="update-date">Last Updated: March 14, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing UIU StudentOS, you agree to comply with these terms and our university's code of conduct.
          </p>

          <h2>2. Academic Integrity</h2>
          <p>
            Resource sharing must comply with your course policies. Do not upload materials that violate 
            the academic integrity of United International University.
          </p>

          <h2>3. User Conduct</h2>
          <p>
            The platform is for academic and campus life purposes. Harassment, spam, or sharing of 
            inappropriate content is strictly prohibited.
          </p>

          <h2>4. Termination</h2>
          <p>
            We reserve the right to suspend accounts that violate these terms or university policies.
          </p>
        </section>
      </main>

      <footer className="company-footer">
        <p>&copy; 2026 StudentOS Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
