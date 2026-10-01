import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import axios from 'axios';
import './navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/v1/users/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
    } catch (error) {
      console.warn("Logout request returned error from server, clearing local session", error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <h2>YouTubeClone</h2>
        </Link>
      </div>

      <div className="navbar-center">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-profile">
            <Link to="/upload" className="upload-btn">➕ Upload</Link>
            <img src={user.avatar} alt="Avatar" className="avatar" />
            <span className="username">{user.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}