import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../app/auth/views/Login.js';
import Register from '../app/auth/views/Register.js';
import MapView from '../map/views/MapView.js';
import SearchResults from '../medicine/views/SearchResults.js';
import MyReservations from '../reservations/views/MyReservations.js';
import Checkout from '../reservations/views/Checkout.js';
import PharmacyDashboard from '../pharmacy-dashboard/views/PharmacyDashboard.js';
import AdminDashboard from '../admin/views/AdminDashboard.js';
import ProtectedRoute from './ProtectedRoute.js';
import { useApp } from '../context/AppContext.js';
import { ROLES } from '../mock/mockData';

const HOME_BY_ROLE = {
  [ROLES.PATIENT]: '/search',
  [ROLES.PHARMACY_OWNER]: '/pharmacy-dashboard/inventory',
  [ROLES.ADMIN]: '/admin/verification'
};

export default function AppRoutes() {
  const { isAuthenticated, role } = useApp();
  const fallback = isAuthenticated ? HOME_BY_ROLE[role] || '/login' : '/login';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to={fallback} replace />} />

      <Route
        path="/search"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
            <SearchResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
            <MapView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
            <MyReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations/checkout"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharmacy-dashboard/:tab"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PHARMACY_OWNER]}>
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/pharmacy-dashboard" element={<Navigate to="/pharmacy-dashboard/inventory" replace />} />

      <Route
        path="/admin/:tab"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/verification" replace />} />

      <Route path="*" element={<Navigate to={fallback} replace />} />
    </Routes>
  );
}
