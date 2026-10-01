import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CommentSection.css';

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments for video
  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/comments/${videoId}`);
      const rawData = response.data?.data;
      const commentList = Array.isArray(rawData?.docs) 
        ? rawData.docs 
        : Array.isArray(rawData) 
          ? rawData 
          : [];
      setComments(commentList);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  // Submit a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://localhost:8000/api/v1/comments/${videoId}`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      setNewComment('');
      // Refresh list or prepend newly created comment
      const created = response.data?.data;
      if (created) {
        setComments((prev) => [created, ...prev]);
      } else {
        fetchComments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment. Make sure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8000/api/v1/comments/c/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <span>💬 Comments ({comments.length})</span>
      </div>

      {user ? (
        <form onSubmit={handleAddComment} className="add-comment-form">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input-box"
            required
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="comment-submit-btn"
          >
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </form>
      ) : (
        <p style={{ color: '#606060', fontSize: '0.9rem' }}>
          Please log in to add comments.
        </p>
      )}

      {error && <div style={{ color: 'red', fontSize: '0.85rem' }}>{error}</div>}

      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => {
              const author = comment.owner || comment.user || {};
              const isOwner = user && (user._id === author._id || user._id === comment.owner);

              return (
                <div key={comment._id} className="comment-card">
                  <img
                    src={author.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
                    alt={author.username || 'User'}
                    className="comment-avatar"
                  />
                  <div className="comment-body">
                    <div className="comment-meta">
                      <span className="comment-author">
                        {author.fullname || author.username || 'User'}
                      </span>
                      <span className="comment-time">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="comment-delete-btn"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: '#777', fontSize: '0.9rem' }}>
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
