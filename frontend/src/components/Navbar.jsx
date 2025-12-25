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
      <div style={styles.container}>
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
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1280px',
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
    color: 'var(--text-primary)',
    transition: 'transform 0.3s ease'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.125rem',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
  },
  brandText: {
    fontWeight: '700',
    fontSize: '1.5rem'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  campusBadge: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
    animation: 'pulse 2s infinite'
  },
  userEmail: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  themeToggle: {
    background: 'var(--bg-secondary)',
    border: '2px solid var(--border)',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    transition: 'all 0.3s ease'
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.3s ease'
  }
};

export default Navbar;