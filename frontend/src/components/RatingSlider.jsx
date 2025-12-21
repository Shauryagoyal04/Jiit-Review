import React from 'react';

const RatingSlider = ({ label, value, onChange, name }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>{label}</label>
        <span style={styles.value}>{value}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(name, parseInt(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.labels}>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '1.5rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  value: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    outline: 'none',
    background: '#e5e7eb',
    cursor: 'pointer'
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    color: '#6b7280'
  }
};

export default RatingSlider;