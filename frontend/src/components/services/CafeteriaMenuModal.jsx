export function CafeteriaMenuModal({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Modal Container */}
      <div 
        className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-surface-container rounded-xl border border-outline-variant shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50 bg-surface-container-low/95 backdrop-blur z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-on-surface leading-tight tracking-tight">{service.name || 'Main Cafeteria'}</h2>
            <p className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider font-semibold">Today's Menu Offerings • Open until 9:00 PM</p>
          </div>
          <button 
            className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center border border-transparent"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body Scrollable Area */}
        <div className="overflow-y-auto p-5 flex flex-col gap-8 bg-surface custom-scrollbar">
          {/* Daily Specials (Featured Card) */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-lg border border-outline-variant bg-surface-container-high overflow-hidden shadow-md">
              <div className="md:col-span-1 h-32 md:h-auto relative">
                <img 
                  alt="Daily Special" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent md:bg-gradient-to-r"></div>
              </div>
              <div className="md:col-span-2 p-5 flex flex-col justify-center relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">DAILY SPECIAL</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold text-on-surface mb-1">Roasted Herb Salmon</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Fresh Atlantic salmon roasted with dill and lemon, served with a side of wild rice quinoa blend and steamed farm-fresh asparagus.</p>
                  </div>
                  <div className="text-xl font-bold text-primary-fixed-dim whitespace-nowrap">$14.50</div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breakfast */}
            <div className="flex flex-col gap-3">
              <div className="border-b border-outline-variant pb-1.5 flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-tertiary text-[18px]">bakery_dining</span>
                <h3 className="text-base font-bold text-on-surface">Breakfast</h3>
              </div>
              
              {[
                { name: 'Avocado Toast', desc: 'Sourdough, poached egg, chili flakes', price: '$7.25' },
                { name: 'Steel-Cut Oatmeal', desc: 'Mixed berries, toasted almonds', price: '$5.50' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors border border-outline-variant/30 hover:border-outline-variant flex justify-between items-start group">
                  <div className="pr-2">
                    <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                  <div className="text-xs font-bold text-on-surface whitespace-nowrap">{item.price}</div>
                </div>
              ))}
            </div>

            {/* Lunch */}
            <div className="flex flex-col gap-3">
              <div className="border-b border-outline-variant pb-1.5 flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary text-[18px]">lunch_dining</span>
                <h3 className="text-base font-bold text-on-surface">Lunch</h3>
              </div>
              
              {[
                { name: 'Artisan Turkey Club', desc: 'Smoked turkey, bacon, avocado', price: '$9.75', new: true },
                { name: 'Quinoa Power Salad', desc: 'Roasted chickpeas, kale, feta', price: '$8.50' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors border border-outline-variant/30 hover:border-outline-variant flex justify-between items-start group">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</div>
                      {item.new && <span className="bg-secondary-container/20 text-secondary border border-secondary/30 text-[9px] px-1 py-0.5 rounded-sm uppercase tracking-wider font-bold">New</span>}
                    </div>
                    <div className="text-[11px] text-on-surface-variant leading-snug">{item.desc}</div>
                  </div>
                  <div className="text-xs font-bold text-on-surface whitespace-nowrap">{item.price}</div>
                </div>
              ))}
            </div>

            {/* Dinner */}
            <div className="flex flex-col gap-3">
              <div className="border-b border-outline-variant pb-1.5 flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-error text-[18px]">restaurant</span>
                <h3 className="text-base font-bold text-on-surface">Dinner</h3>
              </div>
              
              {[
                { name: 'Braised Short Rib', desc: 'Slow-cooked beef, mashed potatoes', price: '$16.00' },
                { name: 'Eggplant Parmesan', desc: 'Crispy breaded eggplant, marinara', price: '$12.50' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors border border-outline-variant/30 hover:border-outline-variant flex justify-between items-start group">
                  <div className="pr-2">
                    <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{item.name}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                  <div className="text-xs font-bold text-on-surface whitespace-nowrap">{item.price}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/50 bg-surface-container-low flex justify-between items-center shrink-0">
          <p className="text-[10px] text-on-surface-variant italic">Prices and availability are subject to change. Pre-ordering is available via the UIU Eats app.</p>
          <button 
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm"
            onClick={() => alert('Redirecting to UIU Eats for pre-ordering...')}
          >
            Pre-order Now
          </button>
        </div>
      </div>
    </div>
  );
}
