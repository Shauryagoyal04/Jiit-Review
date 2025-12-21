import React from 'react';

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
    <div style={styles.ratingItem}>
      <span style={styles.ratingLabel}>{label}</span>
      <div style={styles.ratingBar}>
        <div style={{...styles.ratingFill, width: `${(value / 5) * 100}%`}} />
      </div>
      <span style={styles.ratingValue}>{value}/5</span>
    </div>
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.identity}>
          <span style={styles.anonymous}>Verified Student</span>
          <span style={styles.campus}>(Campus {review.campus})</span>
        </div>
        <span style={styles.date}>{formatDate(review.createdAt)}</span>
      </div>

      <div style={styles.overallRating}>
        <span style={styles.overallLabel}>Overall Rating:</span>
        <span style={styles.overallValue}>{calculateOverall(review.ratings)}/5</span>
      </div>

      <div style={styles.ratings}>
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
        <div style={styles.textReview}>
          <p style={styles.reviewText}>{review.textReview}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  anonymous: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  campus: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  date: {
    fontSize: '0.75rem',
    color: '#9ca3af'
  },
  overallRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem'
  },
  overallLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  overallValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  ratings: {
    marginBottom: '1rem'
  },
  ratingItem: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr 50px',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  ratingLabel: {
    fontSize: '0.875rem',
    color: '#4b5563'
  },
  ratingBar: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  ratingFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s ease'
  },
  ratingValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right'
  },
  textReview: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem'
  },
  reviewText: {
    fontSize: '0.875rem',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: 0
  }
};

export default ReviewCard;