import React from 'react';

export function CampusServiceModal({ service, onClose }) {
  if (!service) return null;

  // Derive some conditional styles based on category
  const isMedical = service.category?.toLowerCase() === 'medical' || service.category?.toLowerCase() === 'health';
  const isOpen = service.status === 'Open' || service.status === 'Running';
  
  // Default values if not provided by backend
  const heroImage = isMedical 
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAKJX7vsC5MbxarhJVwGOC7uyr5FvMWrnllEhS3xlk2ZjTPsim7o31x63qP97ArV_VI4X2NYPfrx9HGNPQ4Lug1j_ZHXSCfrvOZa95azSVAVuNuyT9CjTcP0vAyRGoD4mxX0655NzcQVoITrlGFR3-NKzhPGCGoApbdpiYARXVQWA2ndqzjfM1pgLYRE6ovdV9EFLAKmAFkH6ynObIzcoYCiQCRqknQIgZgX60Y5FE_ZUSiZH28a8Su_A3Zr3_HK0ZEmHMWuTZBfw0"
    : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
    
  const icon = isMedical ? "local_hospital" : (service.category?.toLowerCase() === 'library' ? 'local_library' : 'business');
  
  const availableServices = isMedical ? [
    { name: "General Checkup", icon: "medical_services", colorClass: "text-primary" },
    { name: "First Aid & Minor Trauma", icon: "healing", colorClass: "text-tertiary" },
    { name: "Mental Health Counseling", icon: "psychology", colorClass: "text-secondary" }
  ] : [
    { name: "General Access", icon: "door_open", colorClass: "text-primary" },
    { name: "Information Desk", icon: "info", colorClass: "text-tertiary" }
  ];

  return (
    <div className="fixed inset-0 bg-surface-container-lowest/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <main 
        className="bg-surface border border-outline-variant rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col relative transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (Floating) */}
        <button 
          onClick={onClose}
          aria-label="Close modal" 
          className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-surface-container/50 backdrop-blur-sm border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>

        {/* Hero/Header Banner */}
        <div className="h-20 relative bg-surface-container-high border-b border-outline-variant overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10"></div>
          <img 
            alt={`${service.name} Hero`} 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity" 
            src={heroImage}
          />
        </div>

        {/* Content Area */}
        <div className="px-5 pb-5 flex flex-col gap-4 -mt-6 relative z-20 overflow-y-auto custom-scrollbar">
          {/* Title & Status */}
          <div className="flex justify-between items-end">
            <div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center mb-2 shadow-lg">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
              </div>
              <h2 className="text-xl font-bold text-on-surface leading-tight tracking-tight">{service.name}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider font-semibold">{service.category || 'Campus Facility'}</p>
            </div>
            <div className="mb-0.5">
              {isOpen ? (
                <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_5px_#4edea3]"></span> 
                  {service.status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-outline border border-outline-variant px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> 
                  {service.status}
                </span>
              )}
            </div>
          </div>

          {/* Contact Box */}
          <div className={`${isMedical ? 'bg-error/5 border-error/20' : 'bg-surface-container-low border-outline-variant'} border rounded-lg p-3 flex items-center gap-3 mt-1`}>
            <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 border ${isMedical ? 'bg-error/20 border-error/30 text-error' : 'bg-surface-container-high border-outline-variant text-primary'}`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isMedical ? "'FILL' 1" : "'FILL' 0" }}>{isMedical ? 'emergency' : 'language'}</span>
            </div>
            <div className="flex-1">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isMedical ? 'text-error' : 'text-on-surface-variant'}`}>{isMedical ? 'Emergency Contact' : 'Official Portal'}</p>
              <p className={`text-base font-black tracking-tight ${isMedical ? 'text-error' : 'text-on-surface'} truncate w-48`}>{service.contactInfo || 'Not Available'}</p>
            </div>
            {service.contactInfo && (
              <button 
                onClick={() => {
                  const info = service.contactInfo.toLowerCase();
                  if (info.includes('www') || info.includes('http') || info.includes('.bd')) {
                    window.open(info.startsWith('http') ? info : `https://${info}`, '_blank');
                  } else {
                    window.location.href = `tel:${service.contactInfo}`;
                  }
                }}
                className={`${isMedical ? 'bg-error text-on-error' : 'bg-primary text-on-primary'} px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20`}
              >
                {isMedical ? 'Call' : 'Visit'}
              </button>
            )}
          </div>

          {/* Info Rows */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] text-outline">schedule</span>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Operating Hours</p>
                <p className="text-sm text-on-surface">{service.operatingHours}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Location</p>
                <p className="text-sm text-on-surface">{service.location}</p>
              </div>
            </div>
            {service.description && (
              <div className="bg-surface-container-lowest/50 p-2.5 rounded-lg border border-outline-variant/30">
                <p className="text-xs text-on-surface-variant leading-relaxed">{service.description}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2.5 pt-1 mt-auto">
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/UIU+${encodeURIComponent(service.name)}`, '_blank')}
              className="flex-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">directions</span>
              Directions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
