import { LayoutDashboard, BookOpen, Building2, Calendar, User, Calculator } from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch/GlobalSearch';

export function MobileNav({ activeTab, onNavigate }) {
  const getTabClass = (tabId) => {
    return `flex flex-col items-center gap-1 bg-transparent border-none font-medium text-[10px] cursor-pointer transition-colors duration-200 ${
      activeTab === tabId ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
    }`;
  };

  return (
    <>
      <div className="md:hidden px-4 py-2 bg-surface/90 backdrop-blur-md border-b border-outline-variant w-full fixed top-0 z-50">
         <GlobalSearch onNavigate={onNavigate} />
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-outline-variant flex justify-around py-3 px-2 z-[1000] pb-safe">
        <button className={getTabClass('home')} onClick={() => onNavigate('home')}>
          <LayoutDashboard size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span>Home</span>
        </button>
        <button className={getTabClass('resources')} onClick={() => onNavigate('resources')}>
          <BookOpen size={20} strokeWidth={activeTab === 'resources' ? 2.5 : 2} />
          <span>Study</span>
        </button>
        <button className={getTabClass('services')} onClick={() => onNavigate('services')}>
          <Building2 size={20} strokeWidth={activeTab === 'services' ? 2.5 : 2} />
          <span>Services</span>
        </button>
        <button className={getTabClass('planner')} onClick={() => onNavigate('planner')}>
          <Calendar size={20} strokeWidth={activeTab === 'planner' ? 2.5 : 2} />
          <span>Plan</span>
        </button>
        <button className={getTabClass('profile')} onClick={() => onNavigate('profile')}>
          <User size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span>Profile</span>
        </button>
        <button className={getTabClass('calculator')} onClick={() => onNavigate('calculator')}>
          <Calculator size={20} strokeWidth={activeTab === 'calculator' ? 2.5 : 2} />
          <span>UIU Calc</span>
        </button>
      </nav>
    </>
  );
}
