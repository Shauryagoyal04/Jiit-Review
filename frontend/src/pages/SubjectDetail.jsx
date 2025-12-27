import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import RatingSlider from '../components/RatingSlider';
import ReviewCard from '../components/ReviewCard';
import AverageRatingCard from '../components/AverageRatingCard';
import api from '../api/axios';
import './SubjectDetail.css';

const SubjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRatings, setAvgRatings] = useState(null);
  const [overallRating, setOverallRating] = useState(null);
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
      const subjectRes = await api.get(`/subjects/${id}`);
      setSubject(subjectRes.data.data.subject);

      const reviewsRes = await api.get(`/subjects/${id}/reviews`);
      const data = reviewsRes.data.data;
      
      setReviews(data.reviews);
      setAvgRatings(data.avgRatings);
      setOverallRating(data.overallRating);

      const userReview = data.reviews.find(
        r => r.userId && r.userId.toString() === user?._id?.toString()
      );
      setHasReviewed(!!userReview);
    } catch (err) {
      console.error('Failed to fetch subject:', err);
      setSubject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

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
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <Navbar />
        <div className="loading">Subject not found.</div>
      </>
    );
  }

  // Label mapping for better display names
  const labelMap = {
    difficulty: "Difficulty Level",
    content: "Content Quality",
    examPattern: "Exam Pattern",
    relativeMarks: "Relative Marks"
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <button onClick={() => navigate('/dashboard')} className="backBtn">
          ← Back
        </button>

        <div className="header">
          <div>
            <h1 className="title">{subject.name}</h1>
            <p className="department">{subject.type}</p>
            <div className="campusBadges">
              {subject.campus === 'both' ? (
                <>
                  <span className="campusBadge">Campus 62</span>
                  <span className="campusBadge">Campus 128</span>
                </>
              ) : (
                <span className="campusBadge">Campus {subject.campus}</span>
              )}
            </div>
          </div>

          {!hasReviewed && !showForm && (
            <button onClick={() => setShowForm(true)} className="reviewBtn">
              Write Review
            </button>
          )}
        </div>

        {avgRatings && (
          <AverageRatingCard
            avgRatings={avgRatings}
            overallRating={overallRating}
            type="subject"
          />
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="formCard">
            {error && <div className="error">{error}</div>}

            {['difficulty', 'content', 'examPattern', 'relativeMarks'].map((key) => (
              <RatingSlider
                key={key}
                name={key}
                value={formData[key]}
                onChange={handleRatingChange}
                label={labelMap[key]}
              />
            ))}

            <textarea
              placeholder="Optional review"
              value={formData.textReview}
              onChange={(e) => setFormData({ ...formData, textReview: e.target.value })}
              className="textarea"
            />

            <div className="formActions">
              <button type="button" onClick={() => setShowForm(false)} className="cancelBtn">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="submitBtn"
                style={{
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        <div className="reviewsSection">
          <h2 className="reviewsTitle">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="noReviews">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SubjectDetail;