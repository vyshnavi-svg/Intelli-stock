import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="app-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '32px' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Your account role <strong>({user?.role})</strong> is not authorized to access this page.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
