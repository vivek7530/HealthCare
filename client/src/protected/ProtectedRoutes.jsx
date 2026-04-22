import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ allowedRoles, disallowedRoles }) => {
  const { isLoggedIn, currentUser } = useSelector((state) => state.user);

  // Check if user is logged in first
  if (!isLoggedIn) {
    // If accessing patient-only route, redirect to patient login
    if (allowedRoles && allowedRoles.includes('patient')) {
      return <Navigate to="/patient-login" replace />;
    }
    // If accessing doctor-only route, redirect to doctor login
    if (allowedRoles && allowedRoles.includes('doctor')) {
      return <Navigate to="/doctor-login" replace />;
    }
    // Default redirect to login
    return <Navigate to="/patient-login" replace />;
  }

  // Check if user role is in disallowed roles
  if (disallowedRoles && currentUser && disallowedRoles.includes(currentUser.role)) {
    // Redirect based on user role
    if (currentUser.role === 'doctor') {
      return <Navigate to="/dashboard" replace />;
    } else if (currentUser.role === 'patient') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    // Redirect based on user role
    if (currentUser.role === 'doctor') {
      return <Navigate to="/dashboard" replace />;
    } else if (currentUser.role === 'patient') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
