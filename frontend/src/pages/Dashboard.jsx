import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tRes, sRes] = await Promise.all([
        api.get(`/teachers?campus=${user.campus}`),
        api.get(`/subjects?campus=${user.campus}`)
      ]);

      const teachersData = Array.isArray(tRes.data)
        ? tRes.data
        : tRes.data?.teachers || tRes.data?.data || [];

      const subjectsData = Array.isArray(sRes.data)
        ? sRes.data
        : sRes.data?.subjects || sRes.data?.data || [];

      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 'N/A';

    const total = reviews.reduce((sum, r) => {
      const values = Object.values(r.ratings || {});
      if (!values.length) return sum;
      return sum + values.reduce((a, b) => a + b, 0) / values.length;
    }, 0);

    return (total / reviews.length).toFixed(1);
  };

  const list =
    activeTab === 'teachers'
      ? (Array.isArray(teachers) ? teachers : [])
      : (Array.isArray(subjects) ? subjects : []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.center}>Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.center}>
          {error}
          <button style={styles.retry} onClick={fetchData}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Campus {user.campus} Reviews</h1>
          <p style={styles.subtitle}>
            All reviews are anonymous. Rate honestly and respectfully.
          </p>
        </header>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'teachers' && styles.activeTab) }}
            onClick={() => setActiveTab('teachers')}
          >
            Teachers ({teachers.length})
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'subjects' && styles.activeTab) }}
            onClick={() => setActiveTab('subjects')}
          >
            Elective Subjects ({subjects.length})
          </button>
        </div>

        <div style={styles.grid}>
          {list.length === 0 && (
            <div style={styles.empty}>No data available</div>
          )}

          {list.map((item) => (
            <div
              key={item._id}
              style={styles.card}
              onClick={() =>
                navigate(`/${activeTab.slice(0, -1)}/${item._id}`)
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={styles.badge}>
                Campus {item.campus || user.campus}
              </span>

              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{item.name}</h3>
                  <p style={styles.cardSub}>{item.department}</p>
                </div>
                <div style={styles.rating}>
                  ⭐ {avgRating(item.reviews)}
                </div>
              </div>

              <p style={styles.count}>
                📝 {item.reviews?.length || 0} reviews
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: 'clamp(1rem, 3vw, 2rem)'
  },

  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },

  title: {
    fontSize: 'clamp(1.6rem, 4vw, 3rem)',
    fontWeight: 800
  },

  subtitle: {
    marginTop: '0.5rem',
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
  },

  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '2rem'
  },

  tab: {
    flex: '1 1 150px',
    maxWidth: '220px',
    padding: '0.75rem',
    borderRadius: '12px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    background: 'var(--bg-primary)',
    cursor: 'pointer',
    fontWeight: 600
  },

  activeTab: {
    background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    color: '#fff',
    borderColor: 'transparent'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem'
  },

  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: '0.3s'
  },

  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '8px',
    background: 'rgba(59,130,246,0.1)',
    marginBottom: '1rem'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem'
  },

  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700
  },

  cardSub: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },

  rating: {
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff',
    padding: '0.4rem 0.7rem',
    borderRadius: '10px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },

  count: {
    marginTop: '0.75rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },

  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '2rem'
  },

  center: {
    padding: '3rem',
    textAlign: 'center'
  },

  retry: {
    marginTop: '1rem',
    padding: '0.6rem 1.4rem',
    borderRadius: '10px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer'
  }
};

export default Dashboard;
