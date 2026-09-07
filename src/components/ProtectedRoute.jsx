import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../cms/auth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
