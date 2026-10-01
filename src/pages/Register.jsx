import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleTextChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submitData = new FormData();
    submitData.append('username', formData.username);
    submitData.append('email', formData.email);
    submitData.append('fullName', formData.fullName);
    submitData.append('password', formData.password);
    
    if (avatar) submitData.append('avatar', avatar);
    if (coverImage) submitData.append('coverImage', coverImage);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/users/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log(response.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <input 
          type="text" 
          name="fullName" 
          placeholder="Full Name" 
          value={formData.fullName}
          onChange={handleTextChange} 
          required 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          value={formData.email}
          onChange={handleTextChange} 
          required 
        />
        
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
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
        
        <div>
          <label>Avatar (Required): </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setAvatar(e.target.files[0])} 
            required 
          />
        </div>

        <div>
          <label>Cover Image (Optional): </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setCoverImage(e.target.files[0])} 
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}