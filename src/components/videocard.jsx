import { Link } from 'react-router-dom';
import './videocard.css';

export default function VideoCard({ video }) {
  return (
    <div className="video-card">
      <Link to={`/video/${video._id}`}>
        <img src={video.thumbnail} alt={video.title} className="thumbnail" />
      </Link>
      <div className="video-info">
        <div className="video-text">
          <Link to={`/video/${video._id}`} className="video-title-link">
            <h4>{video.title}</h4>
          </Link>
          <p className="channel-name">{video.owner?.username || "Channel"}</p>
          <p className="views">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}