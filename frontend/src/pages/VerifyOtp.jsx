import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      navigate('/register');
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/verify', {
        email,
        otp
      });

      localStorage.removeItem('pendingEmail');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      alert('OTP resent successfully');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Verify Email</h1>
        <p style={styles.subtitle}>
          We've sent a 6-digit OTP to<br />
          <strong>{email}</strong>
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError('');
              }}
              placeholder="123456"
              maxLength="6"
              required
              style={styles.otpInput}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              ...styles.button,
              opacity: (loading || otp.length !== 6) ? 0.6 : 1,
              cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button onClick={handleResend} style={styles.resendBtn}>
          Didn't receive? Resend OTP
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '1rem'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.5'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center'
  },
  otpInput: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1.5rem',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '0.5rem',
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '0.625rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '0.5rem'
  },
  resendBtn: {
    marginTop: '1rem',
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textDecoration: 'underline',
    width: '100%',
    padding: '0.5rem'
  }
};

export default VerifyOTP;