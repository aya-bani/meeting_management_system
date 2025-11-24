import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return ;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return ;
  }

  return children;
}

export default ProtectedRoute;