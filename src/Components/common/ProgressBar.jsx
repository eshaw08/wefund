import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ raisedAmount, goalAmount, style = 'linear' }) => {
  const percentage = goalAmount > 0 ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) : 0;

  if (style === 'circle') {
    const circumference = 2 * Math.PI * 48; // circle radius = 48
    const strokeDasharray = (percentage / 100) * circumference;

    return (
      <div className="progress-circle">
        <svg viewBox="0 0 120 120" className="progress-circle-svg">
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#4CAF50"
            strokeWidth="8"
            strokeDasharray={`${strokeDasharray} ${circumference}`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="progress-circle-text">
          <span className="percentage">{percentage}%</span>
          <span className="raised">₹{raisedAmount.toLocaleString('en-IN')}</span>
          <span className="goal">of ₹{goalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-stats">
        <span className="progress-text">₹{raisedAmount.toLocaleString('en-IN')} raised of ₹{goalAmount.toLocaleString('en-IN')}</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;