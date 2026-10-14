import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFinance } from '../../context/FinanceContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useFinance();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
