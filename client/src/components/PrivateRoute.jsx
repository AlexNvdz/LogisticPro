import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ allowedRoles = ["admin", "user"], children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔐 No hay token → redirigir al login
  if (!token) return <Navigate to="/login" replace />;

  // 🚫 Rol no permitido → dashboard
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  // ✅ Renderizar hijos o <Outlet />
  return children || <Outlet />;
}