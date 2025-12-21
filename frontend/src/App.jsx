import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOtp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherDetail from './pages/TeacherDetail';
import SubjectDetail from './pages/SubjectDetail';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-otp" 
            element={
              <PublicRoute>
                <VerifyOTP />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/:id" 
            element={
              <ProtectedRoute>
                <TeacherDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subject/:id" 
            element={
              <ProtectedRoute>
                <SubjectDetail />
              </ProtectedRoute>
            } 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '1.125rem',
    color: '#6b7280'
  }
};

export default App;