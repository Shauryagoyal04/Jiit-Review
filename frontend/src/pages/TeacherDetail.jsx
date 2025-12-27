import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import RatingSlider from "../components/RatingSlider";
import ReviewCard from "../components/ReviewCard";
import AverageRatingCard from "../components/AverageRatingCard";
import api from "../api/axios";
import './TeacherDetail.css';

const TeacherDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [avgRatings, setAvgRatings] = useState(null);
  const [overallRating, setOverallRating] = useState(null);

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
      const teacherRes = await api.get(`/teachers/${id}`);
      setTeacher(teacherRes.data.data);

      const reviewsRes = await api.get(`/teachers/${id}/review`);
      const data = reviewsRes.data.data;

      setReviews(data.reviews);
      setAvgRatings(data.avgRatings);
      setOverallRating(data.overallRating);

      const userReview = data.reviews.find(
        (r) => r.userId && r.userId.toString() === user?._id?.toString()
      );
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
      setHasReviewed(true);
      fetchTeacherData();
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
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (!teacher) {
    return (
      <>
        <Navbar />
        <div className="loading">Teacher not found.</div>
      </>
    );
  }

  // =========================
  // Render UI
  // =========================
  return (
    <>
      <Navbar />
      <div className="container">
        <button onClick={() => navigate("/dashboard")} className="backBtn">
          ← Back
        </button>

        <div className="header">
          <div>
            <h1 className="title">{teacher.name}</h1>
            <p className="department">
              {teacher.department} • {teacher.designation}
            </p>
            <p>{teacher.highestQualification}</p>
          </div>

            {!hasReviewed && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="reviewBtn"
              >
                Write Review
              </button>
            )}
        </div>

        {/* ===== Average Ratings ===== */}
        {avgRatings && (
          <AverageRatingCard
            avgRatings={avgRatings}
            overallRating={overallRating}
            type="teacher"
          />
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="formCard">
            {error && <p className="error">{error}</p>}

            {["lateEntry", "taMarks", "clarity", "attendance"].map((key) => {
              const labels = {
                lateEntry: "Late Arrival Tolerance",
                taMarks: "Grading Fairness",
                clarity: "Teaching Clarity",
                attendance: "Attendance Strictness"
              };
              return (
                <RatingSlider
                  key={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleRatingChange}
                  label={labels[key]}
                />
              );
            })}

            <textarea
              placeholder="Optional review"
              value={formData.textReview}
              onChange={(e) =>
                setFormData({ ...formData, textReview: e.target.value })
              }
              className="textarea"
            />

            <div className="formActions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cancelBtn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="submitBtn"
                style={{
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}

        <div className="reviewsSection">
          <h2 className="reviewsTitle">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="noReviews">
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

export default TeacherDetail;
