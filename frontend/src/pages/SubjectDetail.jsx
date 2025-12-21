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

  const fetchSubjectData = async () => {
    try {
      const [subjectRes, reviewsRes] = await Promise.all([
        api.get(`/subjects/${id}`),
        api.get(`/reviews/subject/${id}`)
      ]);

      setSubject(subjectRes.data);
      setReviews(reviewsRes.data);
      
      const userReview = reviewsRes.data.find(r => r.userId === user._id);
      setHasReviewed(!!userReview);
      
    } catch (err) {
      console.error('Failed to fetch subject:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/reviews/subject/${id}`, {
        ratings: {
          difficulty: formData.difficulty,
          content: formData.content,
          examPattern: formData.examPattern,
          relativeMarks: formData.relativeMarks
        },
        textReview: formData.textReview
      });

      alert('Review submitted successfully!');
      setShowForm(false);
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
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{subject.name}</h1>
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
          </div>
          
          {!hasReviewed && !showForm && (
            <button onClick={() => setShowForm(true)} style={styles.reviewBtn}>
              Write Review
            </button>
          )}
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Submit Your Review</h2>
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <RatingSlider
                label="Difficulty Level"
                value={formData.difficulty}
                onChange={handleRatingChange}
                name="difficulty"
              />
              <RatingSlider
                label="Course Content Usefulness"
                value={formData.content}
                onChange={handleRatingChange}
                name="content"
              />
              <RatingSlider
                label="Exam Pattern Difficulty"
                value={formData.examPattern}
                onChange={handleRatingChange}
                name="examPattern"
              />
              <RatingSlider
                label="Relative Marking Advantage"
                value={formData.relativeMarks}
                onChange={handleRatingChange}
                name="relativeMarks"
              />
              
              <div style={styles.textAreaGroup}>
                <label style={styles.label}>Your Review (Optional)</label>
                <textarea
                  value={formData.textReview}
                  onChange={(e) => setFormData({...formData, textReview: e.target.value})}
                  placeholder="Share your experience with this subject..."
                  rows="4"
                  style={styles.textarea}
                />
              </div>

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
          </div>
        )}

        <div style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>
            Reviews ({reviews.length})
          </h2>
          
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
    color: '#6b7280',
    padding: '3rem'
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#3b82f6',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    padding: '0.5rem 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #e5e7eb'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  department: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '0.75rem'
  },
  campusBadges: {
    display: 'flex',
    gap: '0.5rem'
  },
  campusBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  reviewBtn: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  formCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '2rem',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1.5rem'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  textAreaGroup: {
    marginTop: '1.5rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    color: '#374151',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    border: 'none',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  reviewsSection: {
    marginTop: '2rem'
  },
  reviewsTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1.5rem'
  },
  noReviews: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '3rem 1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem'
  }
};

export default SubjectDetail;