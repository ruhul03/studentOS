import { GraduationCap, User as UserIcon, CreditCard, Building2, Users } from 'lucide-react';

export function AcademicIdentityFields({ formData, setFormData }) {
  return (
    <section className="space-y-4">
      <h3 className="font-label-caps text-xs font-semibold tracking-wider text-primary border-b border-outline-variant/30 pb-2 flex items-center gap-2">
        <GraduationCap size={16} />
        ACADEMIC IDENTITY
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="font-body-sm text-sm text-on-surface-variant block">Username</label>
          <div className="relative">
            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-body-sm text-sm text-on-surface-variant block">Student ID</label>
          <div className="relative">
            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              value={formData.studentId} 
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-body-sm text-sm text-on-surface-variant block">Department</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              value={formData.department} 
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g. Computer Science"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-body-sm text-sm text-on-surface-variant block">Batch / Cohort</label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              value={formData.batch} 
              onChange={(e) => setFormData({...formData, batch: e.target.value})}
              placeholder="e.g. Class of 2025"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
