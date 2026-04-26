import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  const renderStars = (rating, colorClass) => {
    return [...Array(5)].map((_, i) => (
      <span 
        key={i} 
        className={`material-symbols-outlined text-sm ${i < rating ? colorClass : 'text-outline'}`}
        style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
      >
        star
      </span>
    ));
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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
        // Fallback to localStorage
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

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto flex flex-col gap-8 text-on-surface">
      {/* Notifications Display */}
      {notifications.length > 0 && (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-h3 text-h3 text-white">Notifications</h3>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{notifications.filter(n => !n.read).length} new</span>
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {notifications.slice(0, 5).map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${notification.read ? 'bg-surface/50 opacity-70' : 'bg-surface hover:bg-surface-bright'}`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="mt-1 text-primary">
                  <span className="material-symbols-outlined text-sm">message</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-white">{notification.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{notification.message}</p>
                  <span className="text-[10px] text-outline mt-2 block">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Course Reviews</h1>
          <p className="text-slate-400">Real insights from students to help you build the perfect schedule. Read, write, and share academic experiences.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button 
            className="px-4 py-2 rounded-lg border border-outline-variant text-primary hover:bg-surface-container-high transition-colors text-sm font-semibold flex items-center gap-2"
            onClick={() => {
              if (showRequestForm) {
                setShowRequestForm(false);
              } else {
                setShowRequestForm(true);
                setShowForm(false);
              }
            }}
          >
            <span className="material-symbols-outlined text-sm">mail</span>
            Ask for Review
          </button>
          <button 
            className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity text-sm font-semibold flex items-center gap-2 shadow-[0_4px_20px_rgba(192,193,255,0.2)]"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingReview(null);
                setCourseCode(''); setCourseName(''); setProfessor(''); setDifficultyRating(3); setQualityRating(3); setReviewText(''); setIsAnonymous(false);
              } else {
                setShowForm(true);
                setShowRequestForm(false);
              }
            }}
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Write a Review
          </button>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input 
            type="text"
            className="w-full bg-surface border border-outline-variant text-white rounded-lg pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline focus:ring-1 focus:ring-primary" 
            placeholder="Search courses or professors..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[180px]">
          <select className="w-full appearance-none bg-surface border border-outline-variant text-white rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer">
            <option value="">All Departments</option>
            <option value="cs">Computer Science</option>
            <option value="math">Mathematics</option>
            <option value="phy">Physics</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
        </div>
        <div className="relative min-w-[180px]">
          <select className="w-full appearance-none bg-surface border border-outline-variant text-white rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer">
            <option value="">Any Professor</option>
            <option value="smith">Dr. Smith</option>
            <option value="jones">Prof. Jones</option>
            <option value="davis">Dr. Davis</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
        </div>
      </section>

      {/* Modals via AnimatePresence */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setShowRequestForm(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container rounded-xl shadow-2xl border border-outline-variant z-50 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high">
                <h2 className="text-xl font-bold text-white">{editingRequest ? 'Edit Review Request' : 'Request a Review'}</h2>
                <button className="text-outline hover:text-white transition-colors" onClick={() => setShowRequestForm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleRequestSubmit} className="flex flex-col">
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-400">Can't find a review for a course? Ask your fellow students!</p>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                      placeholder="Course Code" 
                      value={reqCourseCode} 
                      onChange={e => setReqCourseCode(e.target.value)} 
                      required 
                    />
                    <input 
                      type="text" 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                      placeholder="Professor Name (Optional)" 
                      value={reqProfessor} 
                      onChange={e => setReqProfessor(e.target.value)} 
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm text-slate-300">
                    <input 
                      type="checkbox" 
                      className="rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-background"
                      checked={isReqAnonymous} 
                      onChange={e => setIsReqAnonymous(e.target.checked)} 
                    />
                    <span>Request Anonymously</span>
                  </label>
                </div>
                <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-highest flex justify-end gap-3">
                  <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:bg-surface-variant transition-colors" onClick={() => setShowRequestForm(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
                    {editingRequest ? 'Update Request' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setShowForm(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container rounded-xl shadow-2xl border border-outline-variant z-50 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high shrink-0">
                <h2 className="text-xl font-bold text-white">{editingReview ? 'Edit Course Review' : 'Write a Course Review'}</h2>
                <button className="text-outline hover:text-white transition-colors" onClick={() => setShowForm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Code</label>
                      <input type="text" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. MATH 201" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Name</label>
                      <input type="text" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Calculus II" value={courseName} onChange={e => setCourseName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professor Name</label>
                    <input type="text" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Professor Name" value={professor} onChange={e => setProfessor(e.target.value)} required />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface p-4 rounded-lg border border-outline-variant">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Quality / Overall Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <span 
                            key={num} 
                            className={`material-symbols-outlined cursor-pointer text-2xl ${num <= qualityRating ? 'text-tertiary-container' : 'text-outline'}`}
                            style={{ fontVariationSettings: num <= qualityRating ? "'FILL' 1" : "'FILL' 0" }}
                            onClick={() => setQualityRating(num)}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Difficulty (5 = Hardest)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <span 
                            key={num} 
                            className={`material-symbols-outlined cursor-pointer text-2xl ${num <= difficultyRating ? 'text-error' : 'text-outline'}`}
                            style={{ fontVariationSettings: num <= difficultyRating ? "'FILL' 1" : "'FILL' 0" }}
                            onClick={() => setDifficultyRating(num)}
                          >
                            bolt
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Content</label>
                    <textarea 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[120px]" 
                      placeholder="Write your honest review. How was the workload? Exams? Teaching style?" 
                      value={reviewText} 
                      onChange={e => setReviewText(e.target.value)} 
                      rows={4}
                      required 
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input type="checkbox" className="rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-background" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                    <span>Post Anonymously</span>
                  </label>
                </div>

                <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-highest flex justify-end gap-3 shrink-0">
                  <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:bg-surface-variant transition-colors" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_4px_20px_rgba(192,193,255,0.2)]">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 600" }}>check</span>
                    {editingReview ? 'Update Review' : 'Post Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Requests Section */}
      {reviewRequests.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white">Recent Review Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewRequests.map(req => (
              <div key={req.id} className="bg-surface-container rounded-xl border border-outline-variant p-4 flex flex-col gap-3 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-primary">{req.courseCode}</span>
                  <span className="text-xs text-slate-400">Req. for {req.professor || 'Any'}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">By {req.anonymous ? 'Anonymous' : req.requester.name}</span>
                  <div className="flex gap-2">
                    {canManage(req.requester.id) && (
                      <>
                        <button className="text-xs text-outline hover:text-white" onClick={() => startRequestEdit(req)}>Edit</button>
                        <button className="text-xs text-outline hover:text-error" onClick={() => handleDeleteRequest(req.id)}>Remove</button>
                      </>
                    )}
                    <button 
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded text-xs font-medium transition-colors"
                      onClick={() => {
                        setCourseCode(req.courseCode);
                        setProfessor(req.professor || '');
                        setShowForm(true);
                        setShowRequestForm(false);
                      }}
                    >Write</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Reviews Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Trending Reviews</h2>
        </div>
        
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-outline-variant/30 rounded-xl bg-surface-container-low">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">rate_review</span>
            <h3 className="text-xl font-bold text-white mb-2">No Reviews Found</h3>
            <p className="text-slate-400 mb-6">There are currently no reviews. Be the first to share your experience!</p>
            <button 
              className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-bold shadow-[0_4px_20px_rgba(192,193,255,0.2)] hover:opacity-90 transition-opacity"
              onClick={() => setShowForm(true)}
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reviews.map((review, index) => {
              const colors = [
                { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
                { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
                { bg: 'bg-tertiary/10', text: 'text-tertiary', border: 'border-tertiary/20' },
              ];
              const theme = colors[index % colors.length];

              return (
                <article key={review.id} className="bg-surface-container rounded-xl border border-outline-variant p-6 flex flex-col gap-4 hover:bg-surface-container-high transition-colors hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 ${theme.bg} ${theme.text} rounded text-xs font-bold tracking-wider uppercase border ${theme.border}`}>
                          {review.courseCode}
                        </span>
                        <span className="text-sm text-slate-400">{new Date(review.createdAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{review.courseName}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-surface py-1 px-2 rounded border border-outline-variant shrink-0">
                      <span className="text-lg font-bold text-white">{review.qualityRating.toFixed(1)}</span>
                      <span className="material-symbols-outlined text-tertiary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </div>
                  
                  {/* Difficulty rating added to match original */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="uppercase font-bold tracking-wider">Difficulty</span>
                    <div className="flex gap-0.5">
                      {renderStars(review.difficultyRating, 'text-error')}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 flex-1 line-clamp-4">
                    "{review.reviewText}"
                  </p>
                  
                  <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-lg">person</span>
                      <span className="text-sm text-white font-medium">Prof. {review.professor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${likedReviews.has(review.id) ? 'text-primary' : 'text-outline hover:text-white'}`}
                        onClick={() => handleHelpful(review.id)}
                        disabled={likedReviews.has(review.id)}
                      >
                        <span className="material-symbols-outlined text-base" style={likedReviews.has(review.id) ? {fontVariationSettings: "'FILL' 1"} : {}}>thumb_up</span>
                        <span>{review.helpfulVotes || 0}</span>
                      </button>
                      
                      {canManage(review.reviewer.id) && (
                        <div className="flex gap-2">
                          <button className="text-outline hover:text-white transition-colors text-xs" onClick={() => startEdit(review)}>Edit</button>
                          <button className="text-outline hover:text-error transition-colors text-xs" onClick={() => handleDelete(review.id)}>Del</button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Comments Toggle & Area */}
                  <div className="mt-2 pt-2 border-t border-outline-variant/50">
                    <button 
                      className="w-full text-center text-sm text-outline hover:text-white transition-colors py-1 flex items-center justify-center gap-2"
                      onClick={() => toggleComments(review.id)}
                    >
                      <span className="material-symbols-outlined text-base">forum</span> 
                      {showComments[review.id] ? 'Hide Comments' : `Comments (${review.commentCount || 0})`}
                    </button>
                    
                    <AnimatePresence>
                      {showComments[review.id] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 flex flex-col gap-4"
                        >
                          {user && (
                            <form className="flex flex-col gap-2 bg-surface p-3 rounded-lg border border-outline-variant" onSubmit={(e) => handleCommentSubmit(review.id, e)}>
                              <textarea 
                                placeholder="Share your thoughts..."
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                rows={2}
                                className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none"
                              />
                              <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                                  <input type="checkbox" className="rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-background" checked={isCommentAnonymous} onChange={e => setIsCommentAnonymous(e.target.checked)} />
                                  Anonymous
                                </label>
                                <button type="submit" disabled={!commentText.trim()} className="px-3 py-1 bg-primary/20 text-primary rounded text-xs font-medium hover:bg-primary/30 disabled:opacity-50 transition-colors">
                                  Post Comment
                                </button>
                              </div>
                            </form>
                          )}
                          
                          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {comments[review.id]?.map(comment => (
                              <div key={comment.id} className="bg-surface rounded-lg p-3 border border-outline-variant/50 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                                      <span className="material-symbols-outlined text-sm">person</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">{comment.anonymous ? 'Anonymous' : comment.commenter.name}</span>
                                    <span className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <button className="text-xs text-outline hover:text-white flex items-center gap-1" onClick={() => startReply(comment.id)}>
                                    <span className="material-symbols-outlined text-sm">reply</span> Reply
                                  </button>
                                </div>
                                <p className="text-sm text-slate-300 ml-8">{comment.text}</p>
                                
                                {/* Reply Form */}
                                {replyingTo === comment.id && user && (
                                  <form className="ml-8 mt-2 bg-surface-container-low p-2 rounded border border-outline-variant flex flex-col gap-2" onSubmit={(e) => handleReplySubmit(review.id, comment.id, e)}>
                                    <textarea 
                                      placeholder="Write a reply..."
                                      value={replyText}
                                      onChange={e => setReplyText(e.target.value)}
                                      rows={1}
                                      className="w-full bg-surface border border-outline-variant rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-primary resize-none"
                                      autoFocus
                                    />
                                    <div className="flex justify-between items-center">
                                      <label className="flex items-center gap-2 text-[10px] text-slate-400 cursor-pointer">
                                        <input type="checkbox" className="rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-background" checked={isReplyAnonymous} onChange={e => setIsReplyAnonymous(e.target.checked)} />
                                        Anon
                                      </label>
                                      <div className="flex gap-2">
                                        <button type="button" className="px-2 py-1 text-[10px] text-slate-400 hover:text-white" onClick={() => setReplyingTo(null)}>Cancel</button>
                                        <button type="submit" disabled={!replyText.trim()} className="px-2 py-1 bg-primary/20 text-primary rounded text-[10px] font-medium hover:bg-primary/30 disabled:opacity-50">Reply</button>
                                      </div>
                                    </div>
                                  </form>
                                )}
                                
                                {/* Replies List */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="ml-8 flex flex-col gap-2 border-l-2 border-outline-variant/30 pl-3">
                                    {comment.replies.map(reply => (
                                      <div key={reply.id} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-300">{reply.anonymous ? 'Anonymous' : reply.commenter.name}</span>
                                          <span className="text-[10px] text-slate-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{reply.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {(!comments[review.id] || comments[review.id].length === 0) && (
                              <div className="text-center text-xs text-outline py-4 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-2xl">forum</span>
                                No comments yet.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
