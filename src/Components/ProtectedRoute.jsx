// En src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
}