// src/Components/ProtectedRoutes.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";

export default function ProtectedRoutes({ children }) {
  const { user, loading } = useAuth();

  // MUST wait for initial session check
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-gray-500 font-medium">
        Verifying session...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}