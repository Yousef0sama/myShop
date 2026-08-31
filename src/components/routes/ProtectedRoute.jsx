import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// * Advanced guard component for authentication and role-based access control (RBAC)
const ProtectedRoute = ({ allowedRoles }) => {
  // ? Extract authentication token and user role data from Redux state
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // ! 1. Redirect unauthenticated users to login and preserve the target location state
  if (!token || user?.isDeleted || user?.isRestricted) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ! 2. Restrict access if the user's role is not included in the allowedRoles array
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // * 3. Render matched child route elements via Outlet when authorized
  return <Outlet />;
};

export default ProtectedRoute;
