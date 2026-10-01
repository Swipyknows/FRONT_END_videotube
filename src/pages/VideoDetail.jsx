import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import CommentSection from '../components/CommentSection';
import './VideoDetail.css';

export default function VideoDetail() {
  const { videoId } = useParams();
  const { user } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Fetch video data
  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`http://localhost:8000/api/v1/videos/${videoId}`, {
          headers,
          withCredentials: true
        });

        const videoData = response.data?.data?.video || response.data?.data;
        setVideo(videoData);

        if (videoData) {
          setIsLiked(Boolean(videoData.isLiked));
          setLikesCount(videoData.likesCount || 0);

          const owner = videoData.owner || {};
          setIsSubscribed(Boolean(owner.isSubscribed));
          setSubscribersCount(owner.subscribersCount || 0);
        }
      } catch (err) {
        console.error('Error loading video:', err);
        setError(err.response?.data?.message || 'Failed to load video.');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetail();
    }
  }, [videoId]);

  // Toggle Like
  const handleToggleLike = async () => {
    if (!user) {
      alert('Please log in to like videos');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `http://localhost:8000/api/v1/likes/${videoId}`, {}
        , {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      // Optimistic or server response update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Toggle Subscription
  const handleToggleSubscribe = async () => {
    if (!user) {
      alert('Please log in to subscribe to channels');
      return;
    }

    const channelId = video?.owner?._id || video?.owner;
    if (!channelId) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `http://localhost:8000/api/v1/subscriptions/${channelId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      const newIsSubscribed = !isSubscribed;
      setIsSubscribed(newIsSubscribed);
      setSubscribersCount((prev) => (newIsSubscribed ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  };

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Loading video...</div>;
  if (error || !video) return <div style={{ padding: '30px', color: 'red' }}>{error || 'Video not found.'}</div>;

  const owner = video.owner || {};

  return (
    <div className="video-detail-container">
      <div className="video-detail-main">
        {/* Custom Player with video streaming */}
        <CustomVideoPlayer
          videoUrl={video.videoFile}
          poster={video.thumbnail}
        />

        {/* Video Title */}
        <h1 className="video-title">{video.title}</h1>

        {/* Owner & Actions Bar */}
        <div className="video-actions-bar">
          <div className="channel-info-group">
            <img
              src={owner.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
              alt={owner.username || 'Channel'}
              className="channel-avatar-lg"
            />
            <div className="channel-text-details">
              <span className="channel-fullname">{owner.fullname || owner.username || 'Channel'}</span>
              <span className="channel-subs-count">{subscribersCount} subscribers</span>
            </div>

            {/* Subscribe Button */}
            {user?._id !== owner._id && (
              <button
                onClick={handleToggleSubscribe}
                className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          <div className="video-interactive-buttons">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              className={`like-btn ${isLiked ? 'liked' : ''}`}
            >
              {isLiked ? '👍 Liked' : '👍 Like'} {likesCount > 0 && `(${likesCount})`}
            </button>
          </div>
        </div>

        {/* Video Description Box */}
        <div
          className="video-description-box"
          onClick={() => setShowFullDesc(!showFullDesc)}
        >
          <div className="video-stats-meta">
            {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
          </div>
          <div className="description-content">
            {showFullDesc || !video.description || video.description.length <= 150
              ? video.description
              : `${video.description.substring(0, 150)}...`}
          </div>
          {video.description && video.description.length > 150 && (
            <div className="description-toggle">
              {showFullDesc ? 'Show less' : 'Show more'}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentSection videoId={videoId} />
      </div>
    </div>
  );
}
