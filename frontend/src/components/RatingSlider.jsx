import React from 'react';
import './RatingSlide.css';

const RatingSlider = ({ label, value, onChange, name }) => {
  return (
    <div className="rating-container">
      <div className="rating-header">
        <label className="rating-label">{label}</label>
        <span className="rating-value">{value}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(name, parseInt(e.target.value))}
        className="rating-slider"
      />
      <div className="rating-labels">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
};

export default RatingSlider;