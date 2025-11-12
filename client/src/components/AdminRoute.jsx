// src/components/AdminRoute.jsx

import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1. Si no hay token, al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay token, PERO el rol NO es "admin"...
  if (role !== "admin") {
    // ...lo mandamos al dashboard principal (la ruta "/")
    return <Navigate to="/" replace />;
  }

  // 3. Si hay token Y el rol SÍ es "admin", dejamos pasar
  return children;
};

export default AdminRoute;