import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-logo">JR</div>
          <span className="navbar-brand-text">Jiit Reviews</span>
        </Link>

        <div className="navbar-right">
          {/* Campus pill + email removed */}
          <button
            onClick={handleLogout}
            className="navbar-logout"
          >
            Logout
          </button>

          <button
            onClick={toggleTheme}
            className="navbar-theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;