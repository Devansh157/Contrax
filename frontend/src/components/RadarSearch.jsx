import React from 'react';

const RadarSearch = ({ title = "Finding Nearest Contractors", subtitle = "Your request has been dispatched. Waiting for acceptance..." }) => {
  return (
    <div className="radar-overlay glass-panel">
      <div className="radar-circle">
        <div className="radar-scanner"></div>
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: '#06b6d4',
          borderRadius: '50%',
          boxShadow: '0 0 10px #06b6d4',
          zIndex: 2
        }}></div>
      </div>
      <h3 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>{subtitle}</p>
    </div>
  );
};

export default RadarSearch;
