import { AdminTable } from './AdminTable';

export function TabResources({ resources, onDeleteResource }) {
  return (
    <AdminTable 
      title="Knowledge Assets" 
      description="Shared study materials and resources."
      headers={['Asset Name', 'Course', 'Control']}
    >
      {resources.map(r => (
        <tr key={r.id} className="hover:bg-white/[0.03] transition-colors group">
          <td className="py-5 px-8">
              <div className="font-bold text-white text-sm">{r.title}</div>
              <div className="text-[10px] text-on-surface-variant opacity-60">ID: {r.id}</div>
          </td>
          <td className="py-5 px-8 text-xs font-bold text-primary">{r.courseCode}</td>
          <td className="py-5 px-8 text-right">
            <button onClick={() => onDeleteResource(r.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
