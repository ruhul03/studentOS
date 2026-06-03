import { Camera } from 'lucide-react';

export function AccountSettings({ user, accountInfo, setAccountInfo }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-8 pb-10 border-b border-outline-variant/10">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img 
            src={user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnZ3E8X1IRNERQut9WUf356uZAIJpnr1PG42j8TaoX_XHzTZHXhT-KpQKE-dC6VTdwqkj-jbOibovk45uE_HizMCc70hdyAwcL2TidaO26m_sckadfC5J39QwCGNNSqdH0njMCmLQ9mk608iML0PMlEvoa2q3ryRLxyzpxtHj8GETUC-XI-o4xD0M6CpZZqoNJu1EjwSx_KGU1XdjwpJfvPC3ffuY1taAP__KYVI3yVrvy4K2LkWmd7gq3Pcuuvwmgd3jw0Bs-bnI"} 
            className="w-28 h-28 rounded-[2rem] object-cover border-4 border-surface shadow-2xl relative z-10"
            alt="Profile"
          />
          <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-2xl border-4 border-surface transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer">
            <Camera size={18} />
          </button>
        </div>
        <div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight">{user?.name || 'Student Name'}</h2>
          <p className="text-on-surface-variant text-base font-semibold opacity-70">{user?.email || 'email@uiu.ac.bd'}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {user?.role || 'STUDENT'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Verified Account
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Full Name</label>
          <input 
            type="text" 
            value={accountInfo.name}
            onChange={(e) => setAccountInfo({...accountInfo, name: e.target.value})}
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email (Immutable)</label>
          <input 
            type="email" 
            value={user?.email}
            disabled
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface-variant font-bold text-sm opacity-40 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Student ID</label>
          <input 
            type="text" 
            placeholder="0112xxxx"
            value={accountInfo.studentId}
            onChange={(e) => setAccountInfo({...accountInfo, studentId: e.target.value})}
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Phone Number</label>
          <input 
            type="tel" 
            placeholder="+880 1xxx xxxxxx"
            value={accountInfo.phone}
            onChange={(e) => setAccountInfo({...accountInfo, phone: e.target.value})}
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-5 py-4 text-on-surface font-bold text-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all"
          />
        </div>
      </div>
    </div>
  );
}
