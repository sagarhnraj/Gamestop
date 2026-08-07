import { Navigate } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const isValidToken = token && token !== "null" && token !== "undefined";
  const roleUpper = (role || "").toUpperCase();
  const isAdmin =
    !role || roleUpper === "ROLE_ADMIN" || roleUpper === "ADMIN";

  if (!isValidToken || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
