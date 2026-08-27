import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// * Guard component to restrict authenticated users from accessing auth-only pages (e.g., Login, Register)
const PublicOnlyRoute = () => {
  // ? Extract active authentication token from Redux state
  const { token } = useSelector((state) => state.auth);

  // ! Redirect logged-in users away from authentication views back to root route
  if (token) {
    return <Navigate to="/" replace />;
  }

  // * Render public guest route elements via Outlet when unauthenticated
  return <Outlet />;
};

export default PublicOnlyRoute;