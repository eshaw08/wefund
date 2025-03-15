import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ raisedAmount, goalAmount, style = 'linear', size = 'medium', showText = true }) => {
  // Calculate percentage with validation and limits
  const calculatePercentage = React.useCallback(() => {
    if (!goalAmount || goalAmount <= 0) return 0;
    const raised = typeof raisedAmount === 'string' ? parseFloat(raisedAmount.replace(/[^0-9.-]+/g, '')) : parseFloat(raisedAmount) || 0;
    const goal = typeof goalAmount === 'string' ? parseFloat(goalAmount.replace(/[^0-9.-]+/g, '')) : parseFloat(goalAmount);
    if (isNaN(raised) || isNaN(goal)) return 0;
    return Math.min(100, Math.round((raised / goal) * 100));
  }, [raisedAmount, goalAmount]);

  const percentage = React.useMemo(() => calculatePercentage(), [calculatePercentage]);

  // Format currency amounts
  const formatAmount = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  if (style === 'circle') {
    // SVG circle parameters
    const radius = size === 'small' ? 24 : size === 'large' ? 60 : 48;
    const strokeWidth = size === 'small' ? 4 : size === 'large' ? 8 : 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = (percentage / 100) * circumference;
    const viewBoxSize = radius * 2.5;

    return (
      <div className={`progress-circle progress-circle-${size}`}>
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="progress-circle-svg"
        >
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="#27AE60"
            strokeWidth={strokeWidth}
            strokeDasharray={`${strokeDasharray} ${circumference}`}
            strokeDashoffset="0"
            transform={`rotate(-90 ${viewBoxSize / 2} ${viewBoxSize / 2})`}
          />
        </svg>
        {showText && (
          <div className="progress-circle-text">
            <span className="percentage">{percentage}%</span>
            <span className="raised">{formatAmount(raisedAmount)}</span>
            <span className="goal">of {formatAmount(goalAmount)}</span>
          </div>
        )}
      </div>
    );
  }

  // Linear progress bar
  return (
    <div className={`progress-bar-container progress-bar-${size}`}>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="progress-stats">
          <span className="progress-text">
            {formatAmount(raisedAmount)} raised of {formatAmount(goalAmount)}
          </span>
          <span className="progress-percentage">{percentage}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;