import React from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review, type }) => {
  const calculateOverall = (ratings) => {
    const values = Object.values(ratings);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderRatingItem = (label, value) => (
    <div className="rating-item">
      <span className="rating-label">{label}</span>
      <div className="rating-bar">
        <div 
          className="rating-fill" 
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="rating-value">{value}/5</span>
    </div>
  );

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-identity">
          <span className="review-anonymous">Verified Student</span>
          <span className="review-campus">(Campus {review.campus})</span>
        </div>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>

      <div className="review-overall">
        <span className="review-overall-label">Overall Rating:</span>
        <span className="review-overall-value">{calculateOverall(review.ratings)}/5</span>
      </div>

      <div className="review-ratings">
        {type === 'teacher' ? (
          <>
            {renderRatingItem('Late Entry Allowed', review.ratings.lateEntry)}
            {renderRatingItem('TA Marks Fairness', review.ratings.taMarks)}
            {renderRatingItem('Teaching Clarity', review.ratings.clarity)}
            {renderRatingItem('Attendance Strictness', review.ratings.attendance)}
          </>
        ) : (
          <>
            {renderRatingItem('Difficulty Level', review.ratings.difficulty)}
            {renderRatingItem('Course Content', review.ratings.content)}
            {renderRatingItem('Exam Pattern', review.ratings.examPattern)}
            {renderRatingItem('Relative Marking', review.ratings.relativeMarks)}
          </>
        )}
      </div>

      {review.textReview && (
        <div className="review-text-section">
          <p className="review-text">{review.textReview}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;