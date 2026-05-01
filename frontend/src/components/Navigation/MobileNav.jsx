import { GlobalSearch } from '../GlobalSearch/GlobalSearch';

export function MobileNav({ activeTab, onNavigate }) {
  const getTabClass = (tabId) => {
    return `flex flex-col items-center gap-1 bg-transparent border-none font-medium text-[11px] cursor-pointer transition-all ${
      activeTab === tabId ? 'text-primary' : 'text-on-surface-variant'
    }`;
  };

  return (
    <>
      <div className="md:hidden px-4 py-2 bg-background/50 border-b border-outline-variant/30 animate-fade-in w-full fixed top-0 z-50">
         <GlobalSearch onNavigate={onNavigate} />
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-lowest/90 backdrop-blur-xl border-t border-outline-variant/30 flex justify-around py-3 px-2 z-[1000]">
        <button className={getTabClass('home')} onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
          <span>Home</span>
        </button>
        <button className={getTabClass('resources')} onClick={() => onNavigate('resources')}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'resources' ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
          <span>Study</span>
        </button>
        <button className={getTabClass('services')} onClick={() => onNavigate('services')}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'services' ? "'FILL' 1" : "'FILL' 0" }}>account_balance</span>
          <span>Services</span>
        </button>
        <button className={getTabClass('planner')} onClick={() => onNavigate('planner')}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'planner' ? "'FILL' 1" : "'FILL' 0" }}>calendar_month</span>
          <span>Plan</span>
        </button>
        <button className={getTabClass('profile')} onClick={() => onNavigate('profile')}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span>Profile</span>
        </button>
        <button className={getTabClass('calculator')} onClick={() => onNavigate('calculator')}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'calculator' ? "'FILL' 1" : "'FILL' 0" }}>calculate</span>
          <span>UIU Calc</span>
        </button>
      </nav>
    </>
  );
}
