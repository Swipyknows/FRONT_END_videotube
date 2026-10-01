import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '', // Your backend accepts username OR email here
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleTextChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };
  const { login } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Notice we are just sending standard JSON this time, not a FormData object
      const response = await axios.post('http://localhost:8000/api/v1/users/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        // This line is CRITICAL. It tells the browser to accept the cookies your backend sends.
        withCredentials: true 
      });
      
      console.log("Login successful:", response.data);
      
      const user = response.data?.data?.user;
      const token = response.data?.data?.accessToken;
      
      // Save user data and access token to memory/localStorage
      login(user, token);
      
      // Redirect to the Home page
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <input 
          type="text" 
          name="username" 
          placeholder="Username or Email" 
          value={formData.username}
          onChange={handleTextChange} 
          required 
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={handleTextChange} 
          required 
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}