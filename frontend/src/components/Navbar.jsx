import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.brand}>
          Campus Reviews
        </Link>
        
        {user && (
          <div style={styles.rightSection}>
            <span style={styles.campusBadge}>Campus {user.campus}</span>
            <span style={styles.email}>{user.email}</span>
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
    backgroundColor: '#1f2937',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  campusBadge: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  email: {
    color: '#d1d5db',
    fontSize: '0.875rem'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  }
};

export default Navbar;