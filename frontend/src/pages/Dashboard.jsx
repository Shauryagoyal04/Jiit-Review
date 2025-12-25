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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teachers');

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0';
      document.head.appendChild(meta);
    }

    // Add global styles for responsive design
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      * {
        box-sizing: border-box;
      }
      body {
        overflow-x: hidden;
      }
      @media (min-width: 640px) {
        .responsive-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 1.5rem !important;
        }
        .responsive-title {
          font-size: 2.25rem !important;
        }
        .responsive-card {
          padding: 1.5rem !important;
        }
        .responsive-card-title {
          font-size: 1.25rem !important;
        }
      }
      @media (min-width: 1024px) {
        .responsive-grid {
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 2rem !important;
        }
        .responsive-title {
          font-size: 3rem !important;
        }
        .responsive-card {
          padding: 2rem !important;
        }
        .responsive-card-title {
          font-size: 1.375rem !important;
        }
        .responsive-tabs {
          gap: 1rem !important;
        }
        .responsive-tab {
          padding: 0.875rem 2rem !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [teachersRes, subjectsRes] = await Promise.all([
        api.get(`/teachers?campus=${user.campus}`),
        api.get(`/subjects?campus=${user.campus}`)
      ]);

      // Handle different response structures
      const teachersData = Array.isArray(teachersRes.data) 
        ? teachersRes.data 
        : teachersRes.data.teachers || teachersRes.data.data || [];
      
      const subjectsData = Array.isArray(subjectsRes.data)
        ? subjectsRes.data
        : subjectsRes.data.subjects || subjectsRes.data.data || [];

      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
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

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.error}>
            {error}
            <button onClick={fetchData} style={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle} className="gradient-text responsive-title">
            Campus {user.campus} Reviews
          </h1>
          <p style={styles.disclaimer}>
            All reviews are anonymous. Rate honestly and respectfully.
          </p>
        </div>

        <div style={styles.tabs} className="responsive-tabs">
          <button
            onClick={() => setActiveTab('teachers')}
            style={{
              ...styles.tab,
              ...(activeTab === 'teachers' ? styles.activeTab : {})
            }}
            className="responsive-tab"
          >
            Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            style={{
              ...styles.tab,
              ...(activeTab === 'subjects' ? styles.activeTab : {})
            }}
            className="responsive-tab"
          >
            Elective Subjects ({subjects.length})
          </button>
        </div>

        {activeTab === 'teachers' ? (
          <div style={styles.grid} className="responsive-grid">
            {teachers.length === 0 ? (
              <div style={styles.emptyState}>
                No teachers found for Campus {user.campus}
              </div>
            ) : (
              teachers.map((teacher, idx) => (
                <div
                  key={teacher._id}
                  style={{...styles.card, animationDelay: `${idx * 0.1}s`}}
                  className="fade-in responsive-card"
                  onClick={() => navigate(`/teacher/${teacher._id}`)}
                >
                  <div style={styles.cardBadge}>Campus {teacher.campus}</div>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTitle} className="responsive-card-title">{teacher.name}</h3>
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
              ))
            )}
          </div>
        ) : (
          <div style={styles.grid} className="responsive-grid">
            {subjects.length === 0 ? (
              <div style={styles.emptyState}>
                No subjects found for Campus {user.campus}
              </div>
            ) : (
              subjects.map((subject, idx) => (
                <div
                  key={subject._id}
                  style={{...styles.card, animationDelay: `${idx * 0.1}s`}}
                  className="fade-in responsive-card"
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
                      <h3 style={styles.cardTitle} className="responsive-card-title">{subject.name}</h3>
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
              ))
            )}
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
    padding: '1.5rem 1rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    padding: '0 0.5rem'
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginBottom: '1rem',
    lineHeight: '1.2',
    wordBreak: 'break-word'
  },
  disclaimer: {
    color: 'var(--text-secondary)',
    fontSize: '0.938rem',
    padding: '0 0.5rem',
    lineHeight: '1.5'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    padding: '2rem 1rem'
  },
  error: {
    textAlign: 'center',
    fontSize: '1rem',
    color: '#ef4444',
    padding: '2rem 1rem'
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'transform 0.2s ease',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '2rem 1rem',
    color: 'var(--text-secondary)',
    fontSize: '1rem'
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    padding: '0 0.5rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  tab: {
    padding: '0.75rem 1rem',
    background: 'var(--bg-primary)',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    flex: '1 1 auto',
    minWidth: '0',
    maxWidth: '200px'
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
    gridTemplateColumns: '1fr',
    gap: '1rem',
    padding: '0',
    width: '100%',
    boxSizing: 'border-box'
  },
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    width: '100%',
    boxSizing: 'border-box'
  },
  cardBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--primary)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  campusBadges: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '0.75rem'
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
    lineHeight: '1.3',
    wordBreak: 'break-word'
  },
  cardSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.813rem',
    lineHeight: '1.4'
  },
  ratingBadge: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  reviewCount: {
    color: 'var(--text-secondary)',
    fontSize: '0.813rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

export default Dashboard;