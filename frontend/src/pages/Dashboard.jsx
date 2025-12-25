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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        api.get(`/teachers?campus=${user.campus}`),
        api.get(`/subjects?campus=${user.campus}`)
      ]);

      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 'N/A';
    
    const sum = reviews.reduce((acc, review) => {
      const ratings = Object.values(review.ratings);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return acc + avg;
    }, 0);
    
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loading}>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle} className="gradient-text">
            Campus {user.campus} Reviews
          </h1>
          <p style={styles.disclaimer}>
            All reviews are anonymous. Rate honestly and respectfully.
          </p>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('teachers')}
            style={{
              ...styles.tab,
              ...(activeTab === 'teachers' ? styles.activeTab : {})
            }}
          >
            Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            style={{
              ...styles.tab,
              ...(activeTab === 'subjects' ? styles.activeTab : {})
            }}
          >
            Elective Subjects ({subjects.length})
          </button>
        </div>

        {activeTab === 'teachers' ? (
          <div style={styles.grid}>
            {teachers.map((teacher, idx) => (
              <div
                key={teacher._id}
                style={{...styles.card, animationDelay: `${idx * 0.1}s`}}
                className="fade-in"
                onClick={() => navigate(`/teacher/${teacher._id}`)}
              >
                <div style={styles.cardBadge}>Campus {teacher.campus}</div>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{teacher.name}</h3>
                    <p style={styles.cardSubtitle}>{teacher.department}</p>
                  </div>
                  <div style={styles.ratingBadge}>
                    ⭐ {calculateAvgRating(teacher.reviews)}
                  </div>
                </div>
                <p style={styles.reviewCount}>
                  📝 {teacher.reviews?.length || 0} reviews
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.grid}>
            {subjects.map((subject, idx) => (
              <div
                key={subject._id}
                style={{...styles.card, animationDelay: `${idx * 0.1}s`}}
                className="fade-in"
                onClick={() => navigate(`/subject/${subject._id}`)}
              >
                <div style={styles.campusBadges}>
                  {subject.campus === 'both' ? (
                    <>
                      <span style={styles.cardBadge}>Campus 62</span>
                      <span style={styles.cardBadge}>Campus 128</span>
                    </>
                  ) : (
                    <span style={styles.cardBadge}>Campus {subject.campus}</span>
                  )}
                </div>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{subject.name}</h3>
                    <p style={styles.cardSubtitle}>{subject.department}</p>
                  </div>
                  <div style={styles.ratingBadge}>
                    ⭐ {calculateAvgRating(subject.reviews)}
                  </div>
                </div>
                <p style={styles.reviewCount}>
                  📝 {subject.reviews?.length || 0} reviews
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 2rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  pageTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem'
  },
  disclaimer: {
    color: 'var(--text-secondary)',
    fontSize: '1.125rem'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    padding: '3rem'
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '3rem'
  },
  tab: {
    padding: '0.875rem 2rem',
    background: 'var(--bg-primary)',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.938rem'
  },
  activeTab: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
    transform: 'translateY(-2px)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem'
  },
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2rem',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  },
  cardBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.875rem',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--primary)',
    borderRadius: '8px',
    fontSize: '0.813rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  campusBadges: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '1.375rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  },
  cardSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem'
  },
  ratingBadge: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1.125rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  reviewCount: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

export default Dashboard;