import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/dashboard" style={styles.brand}>
          <div style={styles.logoIcon}>CR</div>
          <span style={styles.brandText}>Campus Reviews</span>
        </Link>

        {user && (
          <div style={styles.rightSection}>
            <div style={styles.campusBadge}>
              Campus {user.campus}
            </div>

            <div style={styles.userEmail}>
              <span>👤</span>
              <span>{user.email}</span>
            </div>

            <button onClick={toggleTheme} style={styles.themeToggle}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    width: '100%',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },

  /* 🔥 THIS IS THE FIX */
  inner: {
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'var(--text-primary)'
  },

  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold'
  },

  brandText: {
    fontWeight: 700,
    fontSize: '1.4rem'
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },

  campusBadge: {
    background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.85rem'
  },

  userEmail: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },

  themeToggle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '2px solid var(--border)',
    background: 'var(--bg-secondary)',
    cursor: 'pointer'
  },

  logoutBtn: {
    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    fontWeight: 600,
    cursor: 'pointer'
  }
};

export default Navbar;
