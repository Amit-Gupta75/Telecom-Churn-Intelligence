import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({ children, roles }) {

  const { user } = useAuth();


  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }


  // Role restriction
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }


  return children;
}