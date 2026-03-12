import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CourseReviews.css';
import { Star, MessageSquare, ThumbsUp, Search, GraduationCap } from 'lucide-react';

export function CourseReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  // Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [professor, setProfessor] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [qualityRating, setQualityRating] = useState(3);
  const [reviewText, setReviewText] = useState('');

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReviews();
    }, 500); // 500ms debounce on search
    return () => clearTimeout(delayDebounceFn);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode, courseName, professor, difficultyRating, qualityRating, reviewText, reviewerId: user.id
        })
      });
      if (response.ok) {
        setShowForm(false);
        setCourseCode(''); setCourseName(''); setProfessor(''); setDifficultyRating(3); setQualityRating(3); setReviewText('');
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  const handleHelpful = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/helpful`, { method: 'PUT' });
      fetchReviews(); // Re-fetch to update vote count
    } catch (err) {
      console.error('Failed to mark review helpful', err);
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
        <button className="write-review-btn" onClick={() => setShowForm(!showForm)}>
          <MessageSquare size={18} /> {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      <div className="reviews-controls">
        <div className="search-bar reviews-search">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Course Code (e.g. CSE 110)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <form className="review-form glass-card" onSubmit={handleSubmit}>
          <h3>Write a Course Review</h3>
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
          <button type="submit" className="submit-review-btn">Post Review</button>
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
              <span className="reviewer-name">Reviewed by {review.reviewer.name}</span>
              <button className="helpful-btn" onClick={() => handleHelpful(review.id)}>
                <ThumbsUp size={16} /> 
                Helpful ({review.helpfulVotes})
              </button>
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
