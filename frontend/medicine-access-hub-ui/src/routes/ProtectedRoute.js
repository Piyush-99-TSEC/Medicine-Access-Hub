import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.js';
import { ROLES } from '../mock/mockData';

const HOME_BY_ROLE = {
  [ROLES.PATIENT]: '/search',
  [ROLES.PHARMACY_OWNER]: '/pharmacy-dashboard/inventory',
  [ROLES.ADMIN]: '/admin/verification'
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />;
  }

  return children;
}
