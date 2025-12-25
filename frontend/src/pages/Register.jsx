import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    campus: '62'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        campus: formData.campus
      });

      localStorage.setItem('pendingEmail', formData.email);
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgImage}></div>
      <div style={styles.bgOverlay}></div>
      
      <div style={styles.bgShapes}>
        <div style={{...styles.shape, ...styles.shape1}}></div>
        <div style={{...styles.shape, ...styles.shape2}}></div>
        <div style={{...styles.shape, ...styles.shape3}}></div>
      </div>

      <button onClick={toggleTheme} style={styles.themeToggleAbs}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div style={styles.registerContainer}>
        <div style={styles.registerCard} className="slide-up">
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>CR</div>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Register with your college email</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>College Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@college.edu"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Campus</label>
              <select
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="62">Campus 62</option>
                <option value="128">Campus 128</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.registerBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden'
  },
  bgImage: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(https://i1.wp.com/skilloutlook.com/wp-content/uploads/2020/12/JIIT-Noida-scaled.jpg?fit=2560%2C1184&ssl=1)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.6,
    zIndex: 0
  },
  bgOverlay: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.65) 0%, rgba(118, 75, 162, 0.65) 100%)',
    zIndex: 0
  },
  bgShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
    pointerEvents: 'none'
  },
  shape: {
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%'
  },
  shape1: {
    width: '80px',
    height: '80px',
    top: '10%',
    left: '10%',
    animation: 'float 20s infinite'
  },
  shape2: {
    width: '120px',
    height: '120px',
    top: '70%',
    left: '80%',
    animation: 'float 20s infinite 2s'
  },
  shape3: {
    width: '60px',
    height: '60px',
    top: '40%',
    left: '70%',
    animation: 'float 20s infinite 4s'
  },
  themeToggleAbs: {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.5rem',
    transition: 'all 0.3s ease',
    zIndex: 10,
    color: 'white'
  },
  registerContainer: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '420px'
  },
  registerCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3rem 2.5rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  logoIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '2rem',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
    marginBottom: '1rem'
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '2rem',
    marginBottom: '0.5rem',
    fontWeight: '700'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.938rem'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    marginBottom: '0.5rem'
  },
  label: {
    display: 'block',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'var(--bg-secondary)',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '0.938rem',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  registerBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem'
  },
  footerLink: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Register;