export function ContactInfoFields({ formData, setFormData }) {
  return (
    <section className="space-y-4">
      <h3 className="font-label-caps text-xs font-semibold tracking-wider text-secondary border-b border-outline-variant/30 pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>contact_mail</span>
        CONTACT INFORMATION
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="font-body-sm text-sm text-on-surface-variant block">University Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-10 pr-4 text-on-surface-variant font-body-sm cursor-not-allowed opacity-70" 
              readOnly
              title="Email cannot be changed"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-body-sm text-sm text-on-surface-variant block">Date of Birth</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">calendar_month</span>
            <input 
              type="date" 
              value={formData.dateOfBirth} 
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            />
          </div>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="font-body-sm text-sm text-on-surface-variant block">Phone / WhatsApp</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">call</span>
            <input 
              type="tel" 
              value={formData.phoneNumber} 
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
