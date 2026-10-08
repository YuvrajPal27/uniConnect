import { Navigate, Outlet } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center text-white">
        <p className="text-xl">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;