import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoCard from '../components/videocard';
import './Home.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/videos');
        
        const rawData = response.data?.data;
        const videoList = Array.isArray(rawData?.docs) 
          ? rawData.docs 
          : Array.isArray(rawData) 
            ? rawData 
            : Array.isArray(rawData?.videos) 
              ? rawData.videos 
              : [];
        
        setVideos(videoList);
        console.log('Fetched videos array:', videoList);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load videos. Make sure your backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container">
      <div className="video-grid">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))
        ) : (
          <div>No videos found.</div>
        )}
      </div>
    </div>
  );
}