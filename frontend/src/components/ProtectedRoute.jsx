import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // ✅ WAIT until auth is fully loaded
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // ❌ No user → go login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow access
  return children;
};

export default ProtectedRoute;