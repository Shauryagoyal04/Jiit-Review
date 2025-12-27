import React from "react";
import "./AverageRatingCardlight.css";

const AverageRatingCard = ({ avgRatings, overallRating, type }) => {
  if (!avgRatings) return null;

  // Different label mappings for teacher vs subject
  const labelMaps = {
    teacher: {
      lateEntry: "Late Arrival Tolerance",
      taMarks: "Grading Fairness",
      clarity: "Teaching Clarity",
      attendance: "Attendance Strictness"
    },
    subject: {
      difficulty: "Difficulty Level",
      content: "Content Quality",
      examPattern: "Exam Toughness",
      relativeMarks: "High Relative Marks"
    }
  };

  const labelMap = type === 'subject' ? labelMaps.subject : labelMaps.teacher;

  return (
    <div className="avg-card">
      <h2 className="avg-title">Overall Rating</h2>

      <div className="avg-overall">
        <div className="avg-ring">
            <span className="avg-score">{overallRating || 0}</span>
            <span className="avg-outof">/5</span>
        </div>
      </div>

      <div className="avg-grid">
        {Object.entries(avgRatings).map(([key, value]) => (
          <div key={key} className="avg-item">
            <span className="avg-label">
              {labelMap[key] || key.replace(/([A-Z])/g, " $1")}
            </span>
            <span className="avg-value">{value}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AverageRatingCard;