import React from 'react';
import { Activity, BookOpen, Map, ClipboardList, User, Calculator } from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';

export function MobileNav({ activeTab, onNavigate }) {
  return (
    <>
      <div className="mobile-header mobile-only animate-in">
         <GlobalSearch onNavigate={onNavigate} />
      </div>

      <nav className="mobile-nav mobile-only">
        <button className={`mobile-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
          <Activity size={20} />
          <span>Home</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => onNavigate('resources')}>
          <BookOpen size={20} />
          <span>Study</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => onNavigate('services')}>
          <Map size={20} />
          <span>Services</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => onNavigate('planner')}>
          <ClipboardList size={20} />
          <span>Plan</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}>
          <User size={20} />
          <span>Profile</span>
        </button>
        <button className={`mobile-tab ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => onNavigate('calculator')}>
          <Calculator size={20} />
          <span>UIU Calc</span>
        </button>
      </nav>
    </>
  );
}
