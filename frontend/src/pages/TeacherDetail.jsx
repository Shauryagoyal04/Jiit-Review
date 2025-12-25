import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import RatingSlider from "../components/RatingSlider";
import ReviewCard from "../components/ReviewCard";
import api from "../api/axios";

const TeacherDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [formData, setFormData] = useState({
    lateEntry: 3,
    taMarks: 3,
    clarity: 3,
    attendance: 3,
    textReview: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeacherData();
  }, [id]);

  // =========================
  // Fetch teacher + reviews
  // =========================
  const fetchTeacherData = async () => {
    try {
      // Fetch single teacher
      const teacherRes = await api.get(`/teachers/${id}`);
      setTeacher(teacherRes.data.data);

      // Fetch reviews
      const reviewsRes = await api.get(`/teachers/${id}/review`);
      const fetchedReviews = reviewsRes.data.data.reviews;
      setReviews(fetchedReviews);

      // Check if current user already reviewed
      const userReview = fetchedReviews.find((r) => r.userId === user?._id);
      setHasReviewed(!!userReview);

    } catch (err) {
      console.error("Failed to fetch teacher:", err);
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Handle rating changes
  // =========================
  const handleRatingChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // =========================
  // Submit review
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post(`/teachers/${id}/review`, {
        lateEntry: formData.lateEntry,
        taMarks: formData.taMarks,
        clarity: formData.clarity,
        attendance: formData.attendance,
        textReview: formData.textReview
      });

      setShowForm(false);
      fetchTeacherData(); // refresh reviews
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Loading or teacher not found
  // =========================
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Loading...</div>
      </>
    );
  }

  if (!teacher) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Teacher not found.</div>
      </>
    );
  }

  // =========================
  // Render UI
  // =========================
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{teacher.name}</h1>
            <p style={styles.department}>
              {teacher.department} • {teacher.designation}
            </p>
            <p>{teacher.highestQualification}</p>
          </div>

          {!hasReviewed && (
            <button
              onClick={() => setShowForm(true)}
              style={styles.reviewBtn}
            >
              Write Review
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={styles.formCard}>
            {error && <p style={styles.error}>{error}</p>}

            {["lateEntry", "taMarks", "clarity", "attendance"].map((key) => {
            const labels = {
              lateEntry: "Late Arrival Tolerance",
              taMarks: "TA Marks",
              clarity: "Clarity",
              attendance: "Attendance Strictness"
            };
            return (
              <RatingSlider
                key={key}
                name={key}
                value={formData[key]}
                onChange={handleRatingChange}
                label={labels[key]} // use custom label
              />
            );
          })}

            <textarea
              placeholder="Optional review"
              value={formData.textReview}
              onChange={(e) =>
                setFormData({ ...formData, textReview: e.target.value })
              }
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
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}

        <div style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p style={styles.noReviews}>
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review._id} review={review} type="teacher" />
            ))
          )}
        </div>
      </div>
    </>
  );
};

// =========================
// Styles (unchanged)
// =========================

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
    color: '#f0f0f0',
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

export default TeacherDetail;