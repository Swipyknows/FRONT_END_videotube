import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UploadVideo.css';

export default function UploadVideo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return <div className="upload-container">Please login to upload videos.</div>;
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/v1/videos/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload New Video</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="file-inputs">
          <label>
            Video File:
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </label>
          <label>
            Thumbnail Image:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading to Cloudinary...' : 'Publish Video'}
        </button>
      </form>
    </div>
  );
}