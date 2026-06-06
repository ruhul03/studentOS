export function AdminTable({ title, description, headers, children, action }) {
  return (
    <div className="bg-surface-container rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 border-b border-outline-variant/10 bg-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
          <p className="text-on-surface-variant text-xs mt-1">{description}</p>
        </div>
        {action && <div className="self-start sm:self-auto">{action}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] border-b border-outline-variant/10">
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className={`py-5 px-8 text-[10px] font-black text-on-surface-variant uppercase tracking-widest ${i === headers.length - 1 ? 'text-right' : ''}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
