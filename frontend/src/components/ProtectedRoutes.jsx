import { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../context/User-Context";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(UserContext);
  const token = localStorage.getItem("token");

  // No token => not authenticated
  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Access granted
  return children;
}