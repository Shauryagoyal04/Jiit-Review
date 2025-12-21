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
          <h1 style={styles.pageTitle}>Campus {user.campus} Reviews</h1>
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
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                style={styles.card}
                onClick={() => navigate(`/teacher/${teacher._id}`)}
              >
                <h3 style={styles.cardTitle}>{teacher.name}</h3>
                <p style={styles.department}>{teacher.department}</p>
                <div style={styles.ratingBadge}>
                  <span style={styles.ratingLabel}>Avg Rating:</span>
                  <span style={styles.ratingValue}>
                    {calculateAvgRating(teacher.reviews)}/5
                  </span>
                </div>
                <p style={styles.reviewCount}>
                  {teacher.reviews?.length || 0} reviews
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.grid}>
            {subjects.map((subject) => (
              <div
                key={subject._id}
                style={styles.card}
                onClick={() => navigate(`/subject/${subject._id}`)}
              >
                <h3 style={styles.cardTitle}>{subject.name}</h3>
                <p style={styles.department}>{subject.department}</p>
                <div style={styles.campusBadges}>
                  {subject.campus === 'both' ? (
                    <>
                      <span style={styles.campusBadge}>Campus 62</span>
                      <span style={styles.campusBadge}>Campus 128</span>
                    </>
                  ) : (
                    <span style={styles.campusBadge}>Campus {subject.campus}</span>
                  )}
                </div>
                <div style={styles.ratingBadge}>
                  <span style={styles.ratingLabel}>Avg Rating:</span>
                  <span style={styles.ratingValue}>
                    {calculateAvgRating(subject.reviews)}/5
                  </span>
                </div>
                <p style={styles.reviewCount}>
                  {subject.reviews?.length || 0} reviews
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    marginBottom: '2rem'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  disclaimer: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.125rem',
    color: '#6b7280',
    padding: '3rem'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e5e7eb'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px'
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)'
    }
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  department: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem'
  },
  campusBadges: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  campusBadge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '0.25rem',
    fontWeight: '500'
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  ratingLabel: {
    fontSize: '0.875rem',
    color: '#4b5563'
  },
  ratingValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  reviewCount: {
    fontSize: '0.75rem',
    color: '#9ca3af'
  }
};

export default Dashboard;