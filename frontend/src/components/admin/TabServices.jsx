import { AdminTable } from './AdminTable';

export function TabServices({ services, onAddService, onEditService, onDeleteService }) {
  const addAction = (
    <button 
      onClick={onAddService}
      className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary-fixed transition-all"
    >
      <span className="material-symbols-outlined text-[18px]">add</span> Add Service
    </button>
  );

  return (
    <AdminTable 
      title="Campus Services" 
      description="Official service catalog management."
      headers={['Service Name', 'Location', 'Actions']}
      action={addAction}
    >
      {services.map(s => (
        <tr key={s.id} className="hover:bg-white/[0.03] transition-colors group">
          <td className="py-5 px-8">
              <div className="font-bold text-white text-sm">{s.name}</div>
              <div className="text-[10px] text-on-surface-variant opacity-60">{s.category}</div>
          </td>
          <td className="py-5 px-8 text-xs font-medium text-on-surface-variant">{s.location}</td>
          <td className="py-5 px-8 text-right">
            <div className="flex justify-end gap-2 transition-opacity">
              <button 
                onClick={() => onEditService(s)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all shadow-sm"
                title="Edit Service"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button onClick={() => onDeleteService(s.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all shadow-sm" title="Decommission">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
