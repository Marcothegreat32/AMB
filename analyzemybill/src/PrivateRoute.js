// src/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // While we’re checking auth, don’t redirect anywhere
  if (loading) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  // If logged out, send to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the protected page
  return children;
}
