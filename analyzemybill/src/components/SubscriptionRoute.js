// src/components/SubscriptionRoute.js
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function SubscriptionRoute({ children }) {
  const { user, subscription } = useContext(AuthContext);

  if (!user) {
    // not even logged in
    return <Navigate to="/login" replace />;
  }
  if (!subscription?.active) {
    // logged in but not subscribed
    return <Navigate to="/pricing" replace />;
  }
  return children;
}
