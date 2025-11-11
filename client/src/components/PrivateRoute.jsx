import React from 'react';
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles = ["admin", "user"] }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // No hay token → enviar al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no está permitido → enviar al dashboard
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Si todo bien, mostrar el contenido
  return children;
}
