import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CourseReviews.css';
import { Star, MessageSquare, ThumbsUp, Search, GraduationCap } from 'lucide-react';

export function CourseReviews({ onProfileView }) {
  const [reviews, setReviews] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const { user } = useAuth();

  // Form State - Review
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [professor, setProfessor] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [qualityRating, setQualityRating] = useState(3);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Form State - Request
  const [reqCourseCode, setReqCourseCode] = useState('');
  const [reqProfessor, setReqProfessor] = useState('');
  const [isReqAnonymous, setIsReqAnonymous] = useState(false);

  const fetchReviews = async () => {
    try {
      const url = search 
        ? `${import.meta.env.VITE_API_URL}/api/reviews?courseCode=${search}` 
        : `${import.meta.env.VITE_API_URL}/api/reviews`;
        
      const response = await fetch(url);
      if (response.ok) {
        setReviews(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/review-requests`);
      if (response.ok) {
        setReviewRequests(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch review requests', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const isEdit = !!editingReview;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/reviews/${editingReview.id}` 
        : `${import.meta.env.VITE_API_URL}/api/reviews`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode, courseName, professor, difficultyRating, qualityRating, reviewText, reviewerId: user.id, anonymous: isAnonymous
        })
      });

      if (response.ok) {
        setShowForm(false);
        setEditingReview(null);
        setCourseCode(''); setCourseName(''); setProfessor(''); setDifficultyRating(3); setQualityRating(3); setReviewText(''); setIsAnonymous(false);
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to save review', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) fetchReviews();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setCourseCode(review.courseCode);
    setCourseName(review.courseName);
    setProfessor(review.professor);
    setDifficultyRating(review.difficultyRating);
    setQualityRating(review.qualityRating);
    setReviewText(review.reviewText);
    setIsAnonymous(review.anonymous || false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpful = async (id) => {
    if (likedReviews.has(id)) return;
    try {
      setLikedReviews(prev => new Set(prev).add(id));
      await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/helpful`, { method: 'PUT' });
      fetchReviews();
    } catch (err) {
      console.error('Failed to mark review helpful', err);
      // Rollback if failed
      setLikedReviews(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/review-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: reqCourseCode,
          professor: reqProfessor,
          requesterId: user.id,
          anonymous: isReqAnonymous
        })
      });

      if (response.ok) {
        setReqCourseCode('');
        setReqProfessor('');
        setIsReqAnonymous(false);
        setShowRequestForm(false);
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to submit review request', err);
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/review-requests/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) fetchRequests();
    } catch (err) {
      console.error('Delete request failed', err);
    }
  };

  const renderStars = (rating, colorClass) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? colorClass : 'star-empty'} 
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <div>
          <h2>Course Reviews</h2>
          <p>Read what other students think before registering for classes.</p>
        </div>
        <div className="header-actions">
          <button className="write-review-btn" onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingReview(null);
              setCourseCode(''); setCourseName(''); setProfessor(''); setDifficultyRating(3); setQualityRating(3); setReviewText(''); setIsAnonymous(false);
            } else {
              setShowForm(true);
              setShowRequestForm(false);
            }
          }}>
            <MessageSquare size={18} /> {showForm ? 'Cancel' : 'Write a Review'}
          </button>
          <button className="request-review-btn" onClick={() => {
            if (showRequestForm) {
              setShowRequestForm(false);
            } else {
              setShowRequestForm(true);
              setShowForm(false);
            }
          }}>
            <Search size={18} /> {showRequestForm ? 'Cancel Request' : 'Ask for Review'}
          </button>
        </div>
      </div>

      <div className="reviews-controls">
        <div className="reviews-search-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search courses or professors..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {showRequestForm && (
        <form className="request-form glass-card animate-in" onSubmit={handleRequestSubmit}>
          <h3>Request a Review</h3>
          <p>Can't find a review for a course? Ask your fellow students!</p>
          <div className="form-row">
            <input type="text" placeholder="Course Code" value={reqCourseCode} onChange={e => setReqCourseCode(e.target.value)} required />
            <input type="text" placeholder="Professor Name (Optional)" value={reqProfessor} onChange={e => setReqProfessor(e.target.value)} />
          </div>
          <div className="anonymous-toggle">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isReqAnonymous} onChange={e => setIsReqAnonymous(e.target.checked)} />
              <span>Request Anonymously</span>
            </label>
          </div>
          <button type="submit" className="submit-request-btn">Submit Request</button>
        </form>
      )}

      {/* Review Requests Section */}
      {reviewRequests.length > 0 && (
        <div className="requests-section animate-in">
          <h3>Recent Review Requests</h3>
          <div className="requests-grid">
            {reviewRequests.map(req => (
              <div key={req.id} className="request-card glass-card">
                <div className="request-info">
                  <span className="req-course">{req.courseCode}</span>
                  <span className="req-prof">Requested for: {req.professor || 'Any Professor'}</span>
                </div>
                <div className="request-footer">
                  <span className="requester">
                    By {req.anonymous ? 'Anonymous' : req.requester.name}
                  </span>
                  {user?.id === req.requester.id && (
                    <button className="delete-req-btn" onClick={() => handleDeleteRequest(req.id)}>Remove</button>
                  )}
                  <button className="reply-btn" onClick={() => {
                    setCourseCode(req.courseCode);
                    setProfessor(req.professor || '');
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>Write Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form className="review-form glass-card" onSubmit={handleSubmit}>
          <h3>{editingReview ? 'Edit Course Review' : 'Write a Course Review'}</h3>
          <div className="form-row">
            <input type="text" placeholder="Course Code (e.g. MATH 201)" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
            <input type="text" placeholder="Course Name (e.g. Calculus II)" value={courseName} onChange={e => setCourseName(e.target.value)} required />
          </div>
          <input type="text" placeholder="Professor Name" value={professor} onChange={e => setProfessor(e.target.value)} required />
          
          <div className="rating-inputs form-row">
            <div className="rating-group">
              <label>Quality / Overall Rating</label>
              <div className="star-selector">
                {[1, 2, 3, 4, 5].map(num => (
                  <Star 
                    key={num} 
                    size={24} 
                    className={`cursor-pointer ${num <= qualityRating ? 'text-yellow-400' : 'text-gray-500'}`}
                    fill={num <= qualityRating ? 'currentColor' : 'none'}
                    onClick={() => setQualityRating(num)}
                  />
                ))}
              </div>
            </div>
            <div className="rating-group">
              <label>Difficulty (5 = Hardest)</label>
              <div className="star-selector">
                {[1, 2, 3, 4, 5].map(num => (
                  <Star 
                    key={num} 
                    size={24} 
                    className={`cursor-pointer ${num <= difficultyRating ? 'text-red-400' : 'text-gray-500'}`}
                    fill={num <= difficultyRating ? 'currentColor' : 'none'}
                    onClick={() => setDifficultyRating(num)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <textarea 
            placeholder="Write your honest review. How was the workload? Exams? Teaching style?" 
            value={reviewText} 
            onChange={e => setReviewText(e.target.value)} 
            rows={4}
            required 
          />
          
          <div className="anonymous-toggle">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={e => setIsAnonymous(e.target.checked)}
              />
              <span>Post Anonymously</span>
            </label>
          </div>

          <button type="submit" className="submit-review-btn">
            {editingReview ? 'Update Review' : 'Post Review'}
          </button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card glass-card">
            <div className="review-card-header">
              <div className="course-identifier">
                <GraduationCap size={24} className="course-icon" />
                <div>
                  <h3>{review.courseCode}: {review.courseName}</h3>
                  <span className="professor-name">Prof. {review.professor}</span>
                </div>
              </div>
              <div className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="ratings-display">
              <div className="rating-pill quality-pill">
                <span>Quality</span>
                <div className="stars">{renderStars(review.qualityRating, 'text-yellow-400')}</div>
              </div>
              <div className="rating-pill difficulty-pill">
                <span>Difficulty</span>
                <div className="stars">{renderStars(review.difficultyRating, 'text-red-400')}</div>
              </div>
            </div>
            
            <p className="review-text">{review.reviewText}</p>
            
            <div className="review-footer">
              <span className="reviewer-name" onClick={() => !review.anonymous && onProfileView(review.reviewer.id)} style={{ cursor: review.anonymous ? 'default' : 'pointer' }}>
                Reviewed by {review.anonymous ? 'Anonymous Student' : review.reviewer.name}
              </span>
              <div className="review-actions">
                {user?.id === review.reviewer.id && (
                  <div className="owner-actions">
                    <button className="edit-action-btn" onClick={() => startEdit(review)}>Edit</button>
                    <button className="delete-action-btn" onClick={() => handleDelete(review.id)}>Delete</button>
                  </div>
                )}
                
                <button 
                  className={`helpful-btn ${likedReviews.has(review.id) ? 'active' : ''}`} 
                  onClick={() => handleHelpful(review.id)}
                  disabled={likedReviews.has(review.id)}
                >
                  <ThumbsUp size={16} fill={likedReviews.has(review.id) ? 'currentColor' : 'none'} /> 
                  {likedReviews.has(review.id) ? 'Thank you!' : `Helpful (${review.helpfulVotes})`}
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="empty-state">No reviews found. Be the first to write one!</div>
        )}
      </div>
    </div>
  );
}
