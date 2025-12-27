import './ReviewCard.css';
console.log('ReviewCard CSS loaded');

const ReviewCard = ({ review }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-anonymous">Verified Student</span>
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>

      {review.textReview ? (
        <p className="review-text">{review.textReview}</p>
      ) : (
        <p className="review-text muted">No written comment</p>
      )}
    </div>
  );
};

export default ReviewCard;
