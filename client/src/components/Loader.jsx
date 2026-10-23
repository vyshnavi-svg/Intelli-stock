import React from 'react';

const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: '20px',
    md: '36px',
    lg: '54px',
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '12px',
        width: '100%',
      }}
    >
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid #e2e8f0',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
