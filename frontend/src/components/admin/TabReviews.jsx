import { AdminTable } from './AdminTable';
import { Trash2 } from 'lucide-react';

export function TabReviews({ reviews, onDeleteReview }) {
  return (
    <AdminTable 
      title="Course Reviews" 
      description="Manage all course reviews."
      headers={['Review Details', 'Course', 'Rating', 'Control']}
    >
      {reviews.map(r => (
        <tr key={r.id} className="hover:bg-white/[0.03] transition-colors group">
          <td className="py-5 px-8">
              <div className="font-bold text-white text-sm line-clamp-1">{r.reviewText || "No comment"}</div>
              <div className="text-[10px] text-on-surface-variant opacity-60">ID: {r.id} | By: {r.anonymous ? 'Anonymous' : (r.reviewer?.name || 'Unknown')}</div>
          </td>
          <td className="py-5 px-8 text-xs font-bold text-primary">{r.courseCode}</td>
          <td className="py-5 px-8 text-xs font-bold text-white">Q: {r.qualityRating}/5 | D: {r.difficultyRating}/5</td>
          <td className="py-5 px-8 text-right">
            <button onClick={() => onDeleteReview(r.id)} className="w-9 h-9 rounded-xl bg-white/5 border border-outline-variant/30 flex items-center justify-center hover:bg-error/20 hover:text-error transition-all ml-auto">
              <Trash2 size={18} />
            </button>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
