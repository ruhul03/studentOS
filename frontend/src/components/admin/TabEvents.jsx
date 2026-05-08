import { AdminTable } from './AdminTable';

export function TabEvents({ events, onDeleteEvent }) {
  return (
    <AdminTable 
      title="Campus Events" 
      description="Live announcements and scheduled events."
      headers={['Event Title', 'Category', 'Actions']}
    >
      {events.map(e => (
        <tr key={e.id} className="hover:bg-white/[0.03] transition-colors group">
          <td className="py-5 px-8">
              <div className="font-bold text-white text-sm">{e.title}</div>
              <div className="text-[10px] text-on-surface-variant opacity-60">{new Date(e.date).toLocaleDateString()}</div>
          </td>
          <td className="py-5 px-8">
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-bold text-on-surface-variant border border-outline-variant/30">{e.category}</span>
          </td>
          <td className="py-5 px-8 text-right">
            <button onClick={() => onDeleteEvent(e.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
