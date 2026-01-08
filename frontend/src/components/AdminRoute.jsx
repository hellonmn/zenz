// components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function AdminRoute({ children }) {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}