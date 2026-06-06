import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '../../api';
import { playSuccessSound, playDeleteSound, playErrorSound } from '../../utils/notificationSound';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { ReviewRequestForm } from './ReviewRequestForm';
import { ReviewDetailModal } from './ReviewDetailModal';
import { Search, X, MessageSquare } from 'lucide-react';

export function CourseReviews() {
  const [reviews, setReviews] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReviews = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews`);
      if (response.ok) setReviews(await response.json());
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/review-requests`);
      if (response.ok) setReviewRequests(await response.json());
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchRequests();
  }, []);

  const filteredReviews = useMemo(() => {
    const s = search.toLowerCase();
    return reviews.filter(r => 
      r.courseCode?.toLowerCase().includes(s) || 
      r.courseName?.toLowerCase().includes(s) || 
      r.professor?.toLowerCase().includes(s)
    );
  }, [reviews, search]);

  const handleReviewSubmit = async (data) => {
    try {
      const isEdit = !!editingReview?.id;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/reviews/${editingReview.id}` 
        : `${import.meta.env.VITE_API_URL}/api/reviews`;

      const response = await fetchWithAuth(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({ ...data, reviewerId: user?.id })
      });

      if (response.ok) {
        playSuccessSound();
        fetchReviews();
        fetchRequests();
        setEditingReview(null);
      } else {
        const err = await response.text();
        playErrorSound();
        console.error('Review save failed:', response.status, err);
      }
    } catch (err) {
      playErrorSound();
      console.error('Failed to save review', err);
    }
  };

  const handleRequestSubmit = async (data) => {
    try {
      const isEdit = !!editingRequest;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/review-requests/${editingRequest.id}` 
        : `${import.meta.env.VITE_API_URL}/api/review-requests`;

      const response = await fetchWithAuth(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({ ...data, requesterId: user?.id })
      });

      if (response.ok) {
        playSuccessSound();
        fetchRequests();
        setEditingRequest(null);
      } else {
        const err = await response.text();
        playErrorSound();
        console.error('Request save failed:', response.status, err);
      }
    } catch (err) {
      playErrorSound();
      console.error('Failed to save request', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews/${id}?userId=${user?.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        playDeleteSound();
        fetchReviews();
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleHelpful = async (id) => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/helpful`, {
        method: 'POST'
      });
      if (response.ok) {
        playSuccessSound();
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to mark helpful', err);
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowDetail(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Remove this request?")) return;
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/review-requests/${id}?userId=${user?.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        playDeleteSound();
        fetchRequests();
      }
    } catch (err) {
      console.error('Delete request failed', err);
    }
  };

  return (
    <div className="w-full md:h-full md:overflow-y-auto custom-scrollbar relative">
      <div className="max-w-6xl mx-auto space-y-12 max-md:space-y-6 pb-20 max-md:pb-32 max-md:px-4">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-on-surface mb-2 tracking-tight">Course Reviews</h1>
              <p className="text-base text-on-surface-variant/60">Real insights from students to help you build the perfect schedule.</p>
            </div>
            <div className="flex items-center gap-3 max-md:hidden">
              <button 
                onClick={() => setShowRequestForm(true)}
                className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all"
              >
                Ask for Review
              </button>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-primary text-on-primary rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Write a Review
              </button>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
            <input 
              className="w-full bg-surface-container-high border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-all text-sm shadow-sm" 
              placeholder="Search for courses, professors, or keywords..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Requests Horizontal Scroll */}
        <AnimatePresence>
          {reviewRequests.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Pending Requests</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {reviewRequests.map(req => (
                  <div key={req.id} className="min-w-[300px] bg-surface-container-low/40 backdrop-blur-xl border border-white/[0.03] rounded-3xl p-6 flex flex-col gap-4 relative group">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">{req.courseCode}</span>
                      {user && (user.id === req.requester?.id || user.role === 'ADMIN') && (
                        <button onClick={() => handleDeleteRequest(req.id)} className="text-on-surface-variant/20 hover:text-error transition-colors cursor-pointer">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Review requested for Prof. {req.professor || 'Any'}</p>
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mt-1">Requested by {req.anonymous ? 'Anonymous' : req.requester?.name}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingReview({ courseCode: req.courseCode, courseName: req.courseName || '', professor: req.professor || '', requestId: req.id });
                        setShowForm(true);
                      }}
                      className="mt-2 w-full py-2 bg-white/5 hover:bg-primary hover:text-on-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Write Review
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Reviews Grid */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-1">Latest Experiences</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface-container-low/40 rounded-[2rem] animate-pulse" />)}
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-md:gap-4">
              {filteredReviews.map((review, idx) => {
                const themes = [
                  { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
                  { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
                  { bg: 'bg-tertiary/10', text: 'text-tertiary', border: 'border-tertiary/20' }
                ];
                return (
                  <ReviewCard 
                    key={review.id}
                    review={review}
                    user={user}
                    theme={themes[idx % 3]}
                    onEdit={(r) => { setEditingReview(r); setShowForm(true); }}
                    onDelete={handleDeleteReview}
                    onHelpful={handleHelpful}
                    onView={() => handleViewReview(review)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <MessageSquare className="text-on-surface-variant/20" size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">No reviews found</h3>
              <p className="text-sm text-on-surface-variant/40 max-w-xs mx-auto">
                {search ? `We couldn't find any reviews matching "${search}".` : "Be the first to share your academic experience!"}
              </p>
            </div>
          )}
        </section>

        {/* Mobile FABs */}
        <div className="md:hidden fixed bottom-24 right-4 left-4 z-40 flex gap-3">
          <button 
            onClick={() => setShowRequestForm(true)}
            className="flex-1 py-4 bg-surface-container-high border border-outline-variant/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-on-surface shadow-xl active:scale-95 transition-transform backdrop-blur-xl"
          >
            Ask Review
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex-1 py-4 bg-primary text-on-primary rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-transform"
          >
            Write Review
          </button>
        </div>

        {/* Forms */}
        <ReviewForm 
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditingReview(null); }}
          onSubmit={handleReviewSubmit}
          initialData={editingReview}
        />
        
        <ReviewRequestForm 
          isOpen={showRequestForm}
          onClose={() => { setShowRequestForm(false); setEditingRequest(null); }}
          onSubmit={handleRequestSubmit}
          initialData={editingRequest}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #34343d; border-radius: 10px; }
      `}} />
      <ReviewDetailModal 
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        review={selectedReview}
        user={user}
        onHelpful={handleHelpful}
      />
    </div>
  );
}
