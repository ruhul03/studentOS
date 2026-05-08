import { AdminTable } from './AdminTable';

export function TabUsers({ users, onToggleRole, onDeleteUser }) {
  return (
    <AdminTable 
      title="User Intelligence" 
      description="Total database registration management."
      headers={['Identification', 'Role Authority', 'Actions']}
    >
      {users.map(u => (
        <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
          <td className="py-5 px-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-black text-primary overflow-hidden">
                {u.profilePicture ? <img src={u.profilePicture} alt="AV" className="w-full h-full object-cover" /> : u.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{u.name}</div>
                <div className="text-xs text-on-surface-variant font-medium opacity-60">{u.email}</div>
              </div>
            </div>
          </td>
          <td className="py-5 px-8">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
              u.role === 'ADMIN' ? 'bg-error/10 border-error/30 text-error' : 'bg-primary/10 border-primary/30 text-primary'
            }`}>
              {u.role}
            </span>
          </td>
          <td className="py-5 px-8 text-right">
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onToggleRole(u.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" title="Toggle Role">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </button>
              <button onClick={() => onDeleteUser(u.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all" title="Purge User">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
