import { AdminTable } from './AdminTable';

export function TabMarketplace({ marketItems, onDeleteMarketItem }) {
  return (
    <AdminTable 
      title="Marketplace Listings" 
      description="Student-to-student commerce moderation."
      headers={['Listing Title', 'Price', 'Control']}
    >
      {marketItems.map(m => (
        <tr key={m.id} className="hover:bg-white/[0.03] transition-colors group">
          <td className="py-5 px-8">
              <div className="font-bold text-white text-sm">{m.title}</div>
              <div className="text-[10px] text-on-surface-variant opacity-60">{m.category}</div>
          </td>
          <td className="py-5 px-8 text-sm font-black text-emerald-500">{m.price} BDT</td>
          <td className="py-5 px-8 text-right">
            <button onClick={() => onDeleteMarketItem(m.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
