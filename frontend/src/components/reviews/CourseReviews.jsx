import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CourseReviews.css';
import { Star, MessageSquare, ThumbsUp, Search, GraduationCap, Reply, User, MessageCircle } from 'lucide-react';

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
  const [editingRequest, setEditingRequest] = useState(null);

  // Comments State
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);
  const [showComments, setShowComments] = useState({});

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  const canManage = (ownerId) => {
    if (!user) return false;
    return user.id === ownerId || user.role?.toUpperCase() === 'ADMIN';
  };

  // Comments Functions
  const fetchComments = async (reviewId) => {
    try {
      // Try API first, fallback to localStorage for demo
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments`);
        if (response.ok) {
          const reviewComments = await response.json();
          setComments(prev => ({ ...prev, [reviewId]: reviewComments }));
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const savedComments = localStorage.getItem(`comments-${reviewId}`);
      if (savedComments) {
        const reviewComments = JSON.parse(savedComments);
        setComments(prev => ({ ...prev, [reviewId]: reviewComments }));
      } else {
        setComments(prev => ({ ...prev, [reviewId]: [] }));
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
      setComments(prev => ({ ...prev, [reviewId]: [] }));
    }
  };

  const handleCommentSubmit = async (reviewId, e) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      commenterId: user.id,
      commenter: { name: user.name },
      anonymous: isCommentAnonymous,
      createdAt: new Date().toISOString(),
      replies: []
    };

    try {
      // Try API first, fallback to localStorage for demo
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: commentText,
            commenterId: user.id,
            anonymous: isCommentAnonymous
          })
        });

        if (response.ok) {
          // Create notification for review author
          const review = reviews.find(r => r.id === reviewId);
          if (review && review.reviewer.id !== user.id) {
            createCommentNotification(review.reviewer.id, {
              reviewId,
              courseCode: review.courseCode,
              courseName: review.courseName,
              commenterName: user.name,
              isAnonymous: isCommentAnonymous
            });
          }
          
          setCommentText('');
          setIsCommentAnonymous(false);
          fetchComments(reviewId);
          fetchReviews(); // Refresh review card to update count from DB
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const existingComments = JSON.parse(localStorage.getItem(`comments-${reviewId}`) || '[]');
      const updatedComments = [...existingComments, newComment];
      localStorage.setItem(`comments-${reviewId}`, JSON.stringify(updatedComments));
      
      // Create notification for review author
      const review = reviews.find(r => r.id === reviewId);
      if (review && review.reviewer.id !== user.id) {
        createCommentNotification(review.reviewer.id, {
          reviewId,
          courseCode: review.courseCode,
          courseName: review.courseName,
          commenterName: user.name,
          isAnonymous: isCommentAnonymous
        });
      }
      
      setCommentText('');
      setIsCommentAnonymous(false);
      setComments(prev => ({ ...prev, [reviewId]: updatedComments }));
      // fetchReviews(); // REMOVED FROM HERE - it was outside the .ok block
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleReplySubmit = async (reviewId, commentId, e) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    const newReply = {
      id: Date.now().toString(),
      text: replyText.trim(),
      replierId: user.id,
      replier: { name: user.name },
      anonymous: isReplyAnonymous,
      createdAt: new Date().toISOString()
    };

    try {
      // Try API first, fallback to localStorage for demo
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/comments/${commentId}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: replyText,
            commenterId: user.id,
            anonymous: isReplyAnonymous
          })
        });

        if (response.ok) {
          // Create notification for original comment author
          const reviewComments = comments[reviewId] || [];
          const originalComment = reviewComments.find(c => c.id === commentId);
          if (originalComment && originalComment.commenterId !== user.id) {
            createReplyNotification(originalComment.commenterId, {
              reviewId,
              commentId,
              courseCode: reviews.find(r => r.id === reviewId)?.courseCode,
              replierName: user.name,
              isAnonymous: isReplyAnonymous
            });
          }
          
          setReplyText('');
          setIsReplyAnonymous(false);
          setReplyingTo(null);
          fetchComments(reviewId);
          fetchReviews(); // Refresh review card to update count from DB
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const existingComments = JSON.parse(localStorage.getItem(`comments-${reviewId}`) || '[]');
      const updatedComments = existingComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
      localStorage.setItem(`comments-${reviewId}`, JSON.stringify(updatedComments));
      
      // Create notification for original comment author
      const originalComment = existingComments.find(c => c.id === commentId);
      if (originalComment && originalComment.commenterId !== user.id) {
        createReplyNotification(originalComment.commenterId, {
          reviewId,
          commentId,
          courseCode: reviews.find(r => r.id === reviewId)?.courseCode,
          replierName: user.name,
          isAnonymous: isReplyAnonymous
        });
      }
      
      setReplyText('');
      setIsReplyAnonymous(false);
      setReplyingTo(null);
      setComments(prev => ({ ...prev, [reviewId]: updatedComments }));
      // fetchReviews(); // REMOVED FROM HERE - it was outside the .ok block
    } catch (err) {
      console.error('Failed to post reply', err);
    }
  };

  const toggleComments = (reviewId) => {
    setShowComments(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
    if (!showComments[reviewId]) {
      fetchComments(reviewId);
    }
  };

  const startReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
    setIsReplyAnonymous(false);
  };

  // Notification Functions
  const createNotification = async (requesterId, reviewData) => {
    const notification = {
      id: Date.now().toString(),
      type: 'review_posted',
      title: 'New Review Posted!',
      message: `Someone posted a review for ${reviewData.courseCode}: ${reviewData.courseName}`,
      recipientId: requesterId,
      senderId: user.id,
      senderName: user.name,
      data: {
        reviewId: reviewData.id,
        courseCode: reviewData.courseCode,
        courseName: reviewData.courseName,
        professor: reviewData.professor
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      // Try API first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
        if (response.ok) return;
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = [notification, ...existingNotifications];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      // Update state if this is for current user
      if (user && requesterId === user.id) {
        setNotifications(updatedNotifications);
      }
    } catch (err) {
      console.error('Failed to create notification', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      // Try API first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${user.id}`);
        if (response.ok) {
          const userNotifications = await response.json();
          setNotifications(userNotifications);
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const userNotifications = savedNotifications.filter(n => n.recipientId === user.id);
      setNotifications(userNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    try {
      // Try API first
      try {
        fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = savedNotifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const createCommentNotification = async (reviewAuthorId, commentData) => {
    const notification = {
      id: Date.now().toString(),
      type: 'comment_posted',
      title: 'New Comment on Your Review!',
      message: `${commentData.isAnonymous ? 'Someone' : commentData.commenterName} commented on your ${commentData.courseCode} review`,
      recipientId: reviewAuthorId,
      senderId: user.id,
      senderName: user.name,
      data: {
        reviewId: commentData.reviewId,
        courseCode: commentData.courseCode,
        courseName: commentData.courseName
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      // Try API first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
        if (response.ok) return;
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = [notification, ...existingNotifications];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      // Update state if this is for current user
      if (user && reviewAuthorId === user.id) {
        setNotifications(updatedNotifications);
      }
    } catch (err) {
      console.error('Failed to create comment notification', err);
    }
  };

  const createReplyNotification = async (commentAuthorId, replyData) => {
    const notification = {
      id: Date.now().toString(),
      type: 'reply_posted',
      title: 'New Reply to Your Comment!',
      message: `${replyData.isAnonymous ? 'Someone' : replyData.replierName} replied to your comment on ${replyData.courseCode}`,
      recipientId: commentAuthorId,
      senderId: user.id,
      senderName: user.name,
      data: {
        reviewId: replyData.reviewId,
        commentId: replyData.commentId,
        courseCode: replyData.courseCode
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      // Try API first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
        if (response.ok) return;
      } catch (apiErr) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = [notification, ...existingNotifications];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      // Update state if this is for current user
      if (user && commentAuthorId === user.id) {
        setNotifications(updatedNotifications);
      }
    } catch (err) {
      console.error('Failed to create reply notification', err);
    }
  };

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
    fetchNotifications();
  }, []);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Initialize comment counts when reviews are loaded
  useEffect(() => {
    reviews.forEach(review => {
      if (!comments[review.id]) {
        setComments(prev => ({ ...prev, [review.id]: [] }));
      }
    });
  }, [reviews]);

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
        const newReview = await response.json(); // Get the created review with ID
        
        // Check if this review matches any pending requests and create notifications
        reviewRequests.forEach(req => {
          if (req.courseCode.toLowerCase() === courseCode.toLowerCase() && 
              (!req.professor || req.professor.toLowerCase() === professor.toLowerCase())) {
            createNotification(req.requester.id, {
              id: newReview.id || Date.now().toString(),
              courseCode,
              courseName,
              professor
            });
          }
        });
        
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
      if (response.ok) {
        fetchReviews();
      } else {
        const errorData = await response.text();
        alert(`Delete failed: ${errorData || 'Unknown server error'}`);
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert("An error occurred while trying to delete the post.");
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
      const isEdit = !!editingRequest;
      const url = isEdit 
        ? `${import.meta.env.VITE_API_URL}/api/review-requests/${editingRequest.id}` 
        : `${import.meta.env.VITE_API_URL}/api/review-requests`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
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
        setEditingRequest(null);
        setShowRequestForm(false);
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to submit review request', err);
    }
  };

  const startRequestEdit = (req) => {
    setEditingRequest(req);
    setReqCourseCode(req.courseCode);
    setReqProfessor(req.professor || '');
    setIsReqAnonymous(req.anonymous || false);
    setShowRequestForm(true);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* Notifications Display */}
      {notifications.length > 0 && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <span className="notification-count">{notifications.filter(n => !n.read).length} new</span>
          </div>
          <div className="notifications-list">
            {notifications.slice(0, 5).map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="notification-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!notification.read && (
                  <div className="notification-indicator"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
          <h3>{editingRequest ? 'Edit Review Request' : 'Request a Review'}</h3>
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
          <button type="submit" className="submit-request-btn">
            {editingRequest ? 'Update Request' : 'Submit Request'}
          </button>
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
                  <span className="req-prof"> Requested for: {req.professor || 'Any Professor'}</span>
                </div>
                <div className="request-footer">
                  <span className="requester">
                    By {req.anonymous ? 'Anonymous' : req.requester.name}
                  </span>
                  <div className="req-actions">
                    {canManage(req.requester.id) && (
                      <div className="owner-actions">
                        <button className="edit-action-btn" onClick={() => startRequestEdit(req)}>Edit</button>
                        <button className="delete-req-btn" onClick={() => handleDeleteRequest(req.id)}>Remove</button>
                      </div>
                    )}
                    <button className="reply-btn" onClick={() => {
                      setCourseCode(req.courseCode);
                      setProfessor(req.professor || '');
                      setShowForm(true);
                      setShowRequestForm(false);
                      // Scroll to review form with smooth animation
                      setTimeout(() => {
                        const reviewForm = document.querySelector('.review-form');
                        if (reviewForm) {
                          reviewForm.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                          // Add highlight animation
                          reviewForm.classList.add('highlight');
                          setTimeout(() => {
                            reviewForm.classList.remove('highlight');
                          }, 2000);
                        }
                      }, 100);
                    }}>Write Review</button>
                  </div>
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
                {canManage(review.reviewer.id) && (
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
                
                <button 
                  className="comments-btn" 
                  onClick={() => {
                    console.log('Comments button clicked for review:', review.id);
                    toggleComments(review.id);
                  }}
                >
                  <MessageCircle size={16} /> 
                  Comments ({review.commentCount || 0})
                </button>
              </div>
            </div>
            
            {/* Comments Section */}
            {showComments[review.id] && (
              <div className="comments-section">
                {/* Comment Form */}
                {user && (
                  <form className="comment-form" onSubmit={(e) => {
                    console.log('Comment form submitted for review:', review.id);
                    handleCommentSubmit(review.id, e);
                  }}>
                    <div className="comment-input-wrapper">
                      <textarea 
                        placeholder="Share your thoughts on this review..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        rows={2}
                        className="comment-input"
                      />
                      <div className="comment-actions">
                        <label className="anonymous-comment-toggle">
                          <input 
                            type="checkbox" 
                            checked={isCommentAnonymous} 
                            onChange={e => setIsCommentAnonymous(e.target.checked)}
                          />
                          <span>Anonymous</span>
                        </label>
                        <button type="submit" className="comment-submit-btn" disabled={!commentText.trim()}>
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </form>
                )}
                
                {/* Comments List */}
                <div className="comments-list">
                  {comments[review.id]?.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="commenter-info">
                          <User size={16} className="commenter-avatar" />
                          <span className="commenter-name">
                            {comment.anonymous ? 'Anonymous Student' : comment.commenter.name}
                          </span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button 
                          className="reply-btn" 
                          onClick={() => {
                            console.log('Reply button clicked for comment:', comment.id);
                            startReply(comment.id);
                          }}
                        >
                          <Reply size={14} /> Reply
                        </button>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      
                      {/* Reply Form */}
                      {replyingTo === comment.id && user && (
                        <form className="reply-form" onSubmit={(e) => {
                          console.log('Reply form submitted for comment:', comment.id);
                          handleReplySubmit(review.id, comment.id, e);
                        }}>
                          <div className="reply-input-wrapper">
                            <textarea 
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              rows={2}
                              className="reply-input"
                              autoFocus
                            />
                            <div className="reply-actions">
                              <label className="anonymous-reply-toggle">
                                <input 
                                  type="checkbox" 
                                  checked={isReplyAnonymous} 
                                  onChange={e => setIsReplyAnonymous(e.target.checked)}
                                />
                                <span>Anonymous</span>
                              </label>
                              <div className="reply-buttons">
                                <button 
                                  type="button" 
                                  className="cancel-reply-btn" 
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit" 
                                  className="reply-submit-btn" 
                                  disabled={!replyText.trim()}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="replies-list">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-header">
                                <div className="replier-info">
                                  <User size={14} className="replier-avatar" />
                                  <span className="replier-name">
                                    {reply.anonymous ? 'Anonymous Student' : reply.commenter.name}
                                  </span>
                                  <span className="reply-date">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="reply-text">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!comments[review.id] || comments[review.id].length === 0) && (
                    <div className="no-comments">
                      <MessageCircle size={24} />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="empty-state">No reviews found. Be the first to write one!</div>
        )}
      </div>
    </div>
  );
}
