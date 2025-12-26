import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import RatingSlider from '../components/RatingSlider';
import ReviewCard from '../components/ReviewCard';
import api from '../api/axios';

const SubjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [formData, setFormData] = useState({
    difficulty: 3,
    content: 3,
    examPattern: 3,
    relativeMarks: 3,
    textReview: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  // Fetch reviews + subject
const fetchSubjectData = async () => {
  try {
    const subjectRes = await api.get(`/subjects/${id}`);
    setSubject(subjectRes.data.data.subject);

    const reviewsRes = await api.get(`/subjects/${id}/reviews`);
    const fetchedReviews = reviewsRes.data.data.reviews;
    setReviews(fetchedReviews);

    const userReview = fetchedReviews.find(
      r => r.userId && r.userId.toString() === user?._id.toString()
    );
    setHasReviewed(!!userReview);
  } catch (err) {
    console.error('Failed to fetch subject:', err);
    setSubject(null);
  } finally {
    setLoading(false);
  }
};

// Submit review
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  try {
    await api.post(`/subjects/${id}/reviews`, {
      difficulty: formData.difficulty,
      content: formData.content,
      examPattern: formData.examPattern,
      relativeMarks: formData.relativeMarks,
      textReview: formData.textReview
    });

    setShowForm(false);
    setHasReviewed(true);
    fetchSubjectData();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to submit review');
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Loading...</div>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Subject not found.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{subject.name}</h1>
            <p style={styles.department}>{subject.type}</p>
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
          </div>

          {!hasReviewed && !showForm && (
            <button onClick={() => setShowForm(true)} style={styles.reviewBtn}>
              Write Review
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={styles.formCard}>
            {error && <div style={styles.error}>{error}</div>}

            {['difficulty', 'content', 'examPattern', 'relativeMarks'].map((key) => (
              <RatingSlider
                key={key}
                name={key}
                value={formData[key]}
                onChange={handleRatingChange}
                label={key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              />
            ))}

            <textarea
              placeholder="Optional review"
              value={formData.textReview}
              onChange={(e) => setFormData({ ...formData, textReview: e.target.value })}
              style={styles.textarea}
            />

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        <div style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review._id} review={review} type="subject" />
            ))
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    padding: '3rem'
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    padding: '0.5rem 0',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid var(--border)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  },
  department: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem'
  },
  campusBadges: {
    display: 'flex',
    gap: '0.5rem'
  },
  campusBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--primary)',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  reviewBtn: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    fontSize: '0.938rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease'
  },
  formCard: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: 'var(--shadow-md)'
  },
  formTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  textAreaGroup: {
    marginTop: '1.5rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem'
  },
  textarea: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    transition: 'all 0.3s ease'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  cancelBtn: {
    flex: 1,
    background: 'var(--bg-secondary)',
    border: '2px solid var(--border)',
    color: 'var(--text-primary)',
    padding: '0.875rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    color: 'white',
    padding: '0.875rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease'
  },
  reviewsSection: {
    marginTop: '3rem'
  },
  reviewsTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem'
  },
  noReviews: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    padding: '3rem 1rem',
    background: 'var(--bg-secondary)',
    borderRadius: '16px',
    fontSize: '1rem'
  }
};

export default SubjectDetail;