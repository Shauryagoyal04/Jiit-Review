import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css'; // Create this CSS file

const Navbar = () => {
  const { user, logout } = useAuth();
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
          <div className="navbar-logo">CR</div>
          <span className="navbar-brand-text">Campus Reviews</span>
        </Link>

        {user && (
          <div className="navbar-right">
            <div className="navbar-campus">
              Campus {user.campus}
            </div>
            <div className="navbar-user">
              <span>👤</span>
              <span>{user.email}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="navbar-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="navbar-logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;